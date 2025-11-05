<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Guest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreInvitationRequest;
use App\Http\Requests\UpdateInvitationRequest;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class InvitationController extends Controller
{
    /**
     * Display a listing of invitations
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Build query based on user role
        $query = Invitation::with(['guests']);
        
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->user_id ?? $user->id);
        }
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('wedding_name', 'like', "%{$search}%")
                  ->orWhere('groom_name', 'like', "%{$search}%")
                  ->orWhere('bride_name', 'like', "%{$search}%")
                  ->orWhere('wedding_venue', 'like', "%{$search}%");
            });
        }
        
        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);
        
        // Pagination
        $invitations = $query->paginate(10)->withQueryString();
        
        // Add guest counts and stats to each invitation
        $invitations->getCollection()->transform(function ($invitation) {
            $guestStats = $invitation->guests->groupBy('guest_attendance_status');
            
            return array_merge($invitation->toArray(), [
                'guests_count' => $invitation->guests->count(),
                'confirmed_count' => $guestStats->get('confirmed', collect())->count(),
                'attended_count' => $guestStats->get('attended', collect())->count(),
                'pending_count' => $guestStats->get('-', collect())->count(),
                'total_wishes' => $invitation->wishes()->count(),
                'total_payments' => $invitation->payments()->where('payment_status', 'completed')->sum('gross_amount'),
            ]);
        });
        
        return Inertia::render('invitations/index', [
            'invitations' => $invitations,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }
    
    /**
     * Show the form for creating a new invitation
     */
    public function create(): Response
    {
        return Inertia::render('invitations/create');
    }
    
    /**
     * Store a newly created invitation
     */
    public function store(StoreInvitationRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        // Handle image uploads
        if ($request->hasFile('wedding_image')) {
            $validated['wedding_image'] = $request->file('wedding_image')->store('wedding-images', 'public');
        }
        if ($request->hasFile('groom_image')) {
            $validated['groom_image'] = $request->file('groom_image')->store('wedding-images', 'public');
        }
        if ($request->hasFile('bride_image')) {
            $validated['bride_image'] = $request->file('bride_image')->store('wedding-images', 'public');
        }
        
        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = $this->generateUniqueSlug($validated['wedding_name']);
        }
        
        // Add user_id
        $validated['user_id'] = $request->user()->user_id ?? $request->user()->id;
        
        $invitation = Invitation::create($validated);
        
        return redirect()->route('invitations.show', $invitation->invitation_id)
                        ->with('success', 'Invitation created successfully!');
    }
    
    /**
     * Display the specified invitation
     */
    public function show(Request $request, $id): Response
    {
        $user = $request->user();
        
        $query = Invitation::with(['guests', 'wishes.guest', 'payments.guest']);
        
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->user_id ?? $user->id);
        }
        
        $invitation = $query->findOrFail($id);
        
        // Calculate statistics
        $guestStats = $invitation->guests->groupBy('guest_attendance_status');
        $paymentStats = $invitation->payments->groupBy('payment_status');
        
        $stats = [
            'total_guests' => $invitation->guests->count(),
            'confirmed_guests' => $guestStats->get('confirmed', collect())->count(),
            'attended_guests' => $guestStats->get('attended', collect())->count(),
            'pending_guests' => $guestStats->get('-', collect())->count(),
            'total_wishes' => $invitation->wishes->count(),
            'total_payments' => $paymentStats->get('completed', collect())->sum('gross_amount'),
            'pending_payments' => $paymentStats->get('pending', collect())->count(),
        ];
        
        return Inertia::render('invitations/show', [
            'invitation' => $invitation,
            'stats' => $stats,
        ]);
    }
    
    /**
     * Show the form for editing the specified invitation
     */
    public function edit(Request $request, $id): Response
    {
        $user = $request->user();
        
        $query = Invitation::query();
        
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->user_id ?? $user->id);
        }
        
        $invitation = $query->findOrFail($id);
        
        return Inertia::render('invitations/edit', [
            'invitation' => $invitation,
        ]);
    }
    
    /**
     * Update the specified invitation
     */
    public function update(UpdateInvitationRequest $request, $id): RedirectResponse
    {
        $user = $request->user();
        
        $query = Invitation::query();
        
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->user_id ?? $user->id);
        }
        
        $invitation = $query->findOrFail($id);
        
        $validated = $request->validated();
        
        // Handle image upload
        if ($request->hasFile('wedding_image')) {
            if ($invitation->wedding_image) {
                Storage::disk('public')->delete($invitation->wedding_image);
            }
            $validated['wedding_image'] = $request->file('wedding_image')->store('wedding-images', 'public');
        }
        if ($request->hasFile('groom_image')) {
            if ($invitation->groom_image) {
                Storage::disk('public')->delete($invitation->groom_image);
            }
            $validated['groom_image'] = $request->file('groom_image')->store('wedding-images', 'public');
        }
        if ($request->hasFile('bride_image')) {
            if ($invitation->bride_image) {
                Storage::disk('public')->delete($invitation->bride_image);
            }
            $validated['bride_image'] = $request->file('bride_image')->store('wedding-images', 'public');
        }
        
        // Generate slug if not provided and wedding name changed
        if (empty($validated['slug']) && $invitation->wedding_name !== $validated['wedding_name']) {
            $validated['slug'] = $this->generateUniqueSlug($validated['wedding_name'], $invitation->invitation_id);
        }
        
        $invitation->update($validated);
        
        return redirect()->route('invitations.show', $invitation->invitation_id)
                        ->with('success', 'Invitation updated successfully!');
    }
    
    /**
     * Remove the specified invitation
     */
    public function destroy(Request $request, $id): RedirectResponse
    {
        $user = $request->user();
        
        $query = Invitation::query();
        
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->user_id ?? $user->id);
        }
        
        $invitation = $query->findOrFail($id);
        
        // Delete associated image
        if ($invitation->wedding_image) {
            Storage::disk('public')->delete($invitation->wedding_image);
        }
        
        $invitation->delete();
        
        return redirect()->route('invitations.index')
                        ->with('success', 'Invitation deleted successfully!');
    }
    
    /**
     * Generate unique slug for invitation
     */
    private function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;
        
        $query = Invitation::where('slug', $slug);
        if ($excludeId) {
            $query->where('invitation_id', '!=', $excludeId);
        }
        
        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
            
            $query = Invitation::where('slug', $slug);
            if ($excludeId) {
                $query->where('invitation_id', '!=', $excludeId);
            }
        }
        
        return $slug;
    }
    
    /**
     * Duplicate an invitation
     */
    public function duplicate(Request $request, $id): RedirectResponse
    {
        $user = $request->user();
        
        $query = Invitation::query();
        
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }
        
        $originalInvitation = $query->findOrFail($id);
        
        // Create duplicate
        $duplicateData = $originalInvitation->toArray();
        unset($duplicateData['invitation_id'], $duplicateData['created_at'], $duplicateData['updated_at']);
        
        // Generate new slug
        $duplicateData['slug'] = $this->generateUniqueSlug($duplicateData['wedding_name'] . ' Copy');
        $duplicateData['wedding_name'] = $duplicateData['wedding_name'] . ' (Copy)';
        
        // Copy image if exists
        if ($originalInvitation->wedding_image) {
            $extension = pathinfo($originalInvitation->wedding_image, PATHINFO_EXTENSION);
            $newImagePath = 'wedding-images/' . Str::random(40) . '.' . $extension;
            Storage::disk('public')->copy($originalInvitation->wedding_image, $newImagePath);
            $duplicateData['wedding_image'] = $newImagePath;
        }
        
        $newInvitation = Invitation::create($duplicateData);
        
        return redirect()->route('invitations.edit', $newInvitation->invitation_id)
                        ->with('success', 'Invitation duplicated successfully!');
    }
}
