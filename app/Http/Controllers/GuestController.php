<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Guest;
use Inertia\Response;
use App\Models\Invitation;
use Illuminate\Http\Request;
use App\Services\GuestService;
use App\Services\QrCodeService;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\StoreGuestRequest;
use App\Http\Requests\UpdateGuestRequest;

class GuestController extends Controller
{
    public function __construct(
        private GuestService $guestService,
        private QrCodeService $qrCodeService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Build query based on user role - show invitations instead of guests
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
            ]);
        });
        
        return Inertia::render('guests/index', [
            'invitations' => $invitations,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    public function show(Request $request, $invitationId): Response
    {
        $user = $request->user();
        
        // Get invitation with user access check
        $invitationQuery = Invitation::with(['guests']);
        if ($user->role !== 'admin') {
            $invitationQuery->where('user_id', $user->user_id ?? $user->id);
        }
        $invitation = $invitationQuery->findOrFail($invitationId);
        
        // Get guests with filtering and sorting
        $q = (string) $request->query('q', '');
        $perPage = (int) $request->integer('per_page', 10);
        $sort = $request->query('sort', 'guest_name');
        $dir = $request->query('dir', 'asc');
        $guestCategory = $request->query('guest_category');
        $attendanceStatus = $request->query('attendance_status');
        $invitationStatus = $request->query('invitation_status');

        $sortable = ['guest_id', 'guest_name', 'guest_category', 'guest_contact', 'guest_attendance_status', 'guest_invitation_status'];
        if (!in_array($sort, $sortable, true)) {
            $sort = 'guest_name';
        }
        $dir = strtolower($dir) === 'desc' ? 'desc' : 'asc';

        $guestsQuery = Guest::where('invitation_id', $invitationId);

        // Search functionality
        if ($q !== '') {
            $guestsQuery->where(function ($qb) use ($q) {
                $qb->where('guest_name', 'like', "%{$q}%")
                   ->orWhere('guest_contact', 'like', "%{$q}%")
                   ->orWhere('guest_address', 'like', "%{$q}%");
            });
        }

        // Filter by guest category
        if ($guestCategory !== null && $guestCategory !== '') {
            $guestsQuery->where('guest_category', $guestCategory);
        }

        // Filter by attendance status
        if ($attendanceStatus !== null && $attendanceStatus !== '') {
            $guestsQuery->where('guest_attendance_status', $attendanceStatus);
        }

        // Filter by invitation status
        if ($invitationStatus !== null && $invitationStatus !== '') {
            $guestsQuery->where('guest_invitation_status', $invitationStatus);
        }

        $guests = $guestsQuery->orderBy($sort, $dir)
                             ->paginate($perPage)
                             ->withQueryString();
        
        // Get statistics and options using service
        $stats = $this->guestService->getGuestStatistics($invitation);
        $availableCategories = $this->guestService->getAvailableCategories($invitationId);
        $statusOptions = $this->guestService->getStatusOptions();

        return Inertia::render('guests/show', [
            'invitation' => $invitation,
            'guests' => $guests,
            'stats' => $stats,
            'filters' => [
                'q' => $q,
                'per_page' => $perPage,
                'sort' => $sort,
                'dir' => $dir,
                'guest_category' => $guestCategory,
                'attendance_status' => $attendanceStatus,
                'invitation_status' => $invitationStatus,
            ],
            'categories' => $availableCategories,
            'attendanceStatuses' => $statusOptions['attendanceStatuses'],
            'invitationStatuses' => $statusOptions['invitationStatuses']
        ]);
    }

    public function create(Request $request, $invitationId): Response
    {
        $user = $request->user();
        
        // Check invitation ownership and existence
        $invitationQuery = Invitation::query();
        if ($user->role !== 'admin') {
            $invitationQuery->where('user_id', $user->user_id ?? $user->id);
        }
        
        // Pastikan invitation exists dan user punya akses
        $invitation = $invitationQuery->findOrFail($invitationId);
        
        // Get categories and status options using service
        $availableCategories = $this->guestService->getAvailableCategories($invitationId);
        $statusOptions = $this->guestService->getStatusOptions();

        return Inertia::render('guests/create', [
            'invitation' => $invitation,
            'categories' => $availableCategories,
            'attendanceStatuses' => $statusOptions['attendanceStatuses'],
            'invitationStatuses' => $statusOptions['invitationStatuses']
        ]);
    }

    public function store(StoreGuestRequest $request, $invitationId): RedirectResponse
    {
        $user = $request->user();
        
        // Check invitation ownership and existence
        $invitationQuery = Invitation::query();
        if ($user->role !== 'admin') {
            $invitationQuery->where('user_id', $user->user_id ?? $user->id);
        }
        
        // Pastikan invitation exists dan user punya akses
        $invitation = $invitationQuery->findOrFail($invitationId);
        
        $validated = $request->validated();
        
        // Create guest using service
        $this->guestService->createGuest($validated, $invitationId, $user->user_id ?? $user->id);
        
        return redirect()->route('guests.show', $invitationId)
                        ->with('success', 'Guest added successfully!');
    }

    public function edit(Request $request, $invitationId, $guestId): Response
    {
        $user = $request->user();
        
        // Check invitation ownership
        $invitationQuery = Invitation::query();
        if ($user->role !== 'admin') {
            $invitationQuery->where('user_id', $user->user_id ?? $user->id);
        }
        $invitation = $invitationQuery->findOrFail($invitationId);
        
        // Get guest
        $guest = Guest::where('guest_id', $guestId)
                     ->where('invitation_id', $invitationId)
                     ->firstOrFail();
        
        // Get categories and status options using service
        $availableCategories = $this->guestService->getAvailableCategories($invitationId);
        $statusOptions = $this->guestService->getStatusOptions();

        return Inertia::render('guests/edit', [
            'guest' => $guest,
            'invitation' => $invitation,
            'categories' => $availableCategories,
            'attendanceStatuses' => $statusOptions['attendanceStatuses'],
            'invitationStatuses' => $statusOptions['invitationStatuses']
        ]);
    }

    public function update(UpdateGuestRequest $request, $invitationId, $guestId): RedirectResponse
    {
        $user = $request->user();
        
        // Check invitation ownership
        $invitationQuery = Invitation::query();
        if ($user->role !== 'admin') {
            $invitationQuery->where('user_id', $user->user_id ?? $user->id);
        }
        $invitation = $invitationQuery->findOrFail($invitationId);
        
        // Get guest
        $guest = Guest::where('guest_id', $guestId)
                     ->where('invitation_id', $invitationId)
                     ->firstOrFail();
        
        $validated = $request->validated();
        
        // Update guest using service
        $this->guestService->updateGuest($guest, $validated);
        
        return redirect()->route('guests.show', $invitationId)
                        ->with('success', 'Guest updated successfully!');
    }

    public function destroy(Request $request, $invitationId, $guestId): RedirectResponse
    {
        $user = $request->user();
        
        // Check invitation ownership
        $invitationQuery = Invitation::query();
        if ($user->role !== 'admin') {
            $invitationQuery->where('user_id', $user->user_id ?? $user->id);
        }
        $invitation = $invitationQuery->findOrFail($invitationId);
        
        // Get guest
        $guest = Guest::where('guest_id', $guestId)
                     ->where('invitation_id', $invitationId)
                     ->firstOrFail();
        
        // Delete guest using service (includes QR code cleanup)
        $this->guestService->deleteGuest($guest);
        
        return redirect()->route('guests.index')
                        ->with('success', 'Guest deleted successfully!');
    }

    /**
     * Regenerate QR code for guest - utility method
     */
    public function regenerateQrCode($invitationId, $guestId)
    {
        $user = request()->user();
        
        // Check invitation ownership
        $invitationQuery = Invitation::query();
        if ($user->role !== 'admin') {
            $invitationQuery->where('user_id', $user->user_id ?? $user->id);
        }
        
        $invitation = $invitationQuery->findOrFail($invitationId);
        $guest = $invitation->guests()->findOrFail($guestId);
        
        // Regenerate QR code using service
        $qrData = $this->qrCodeService->regenerateGuestQrCode($guest, $guest->guest_name);
        
        if ($qrData['guest_qr_code'] !== 'qr-pending') {
            $guest->update($qrData);
            return response()->json([
                'success' => true, 
                'path' => $qrData['guest_qr_code'], 
                'qr_id' => $qrData['guest_id_qr_code']
            ]);
        }
        
        return response()->json(['success' => false, 'message' => 'QR generation failed']);
    }
}
