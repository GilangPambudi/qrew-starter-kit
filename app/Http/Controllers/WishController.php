<?php

namespace App\Http\Controllers;

use App\Models\Wish;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class WishController extends Controller
{
    /**
     * Check if the current user has access to the specified invitation
     * Returns 404 if invitation doesn't exist, 403 if user doesn't have access
     */
    private function checkInvitationAccess($invitation_id)
    {
        $invitation = Invitation::find($invitation_id);
        
        if (!$invitation) {
            abort(404, 'Invitation not found');
        }
        
        // If user is admin, allow access to all invitations
        if (Auth::user()->role === 'admin') {
            return;
        }
        
        // If user is regular user, only allow access to their own invitation
        if (Auth::user()->role === 'user') {
            $userInvitation = Invitation::where('user_id', Auth::id())->first();
            
            if (!$userInvitation || $userInvitation->invitation_id != $invitation_id) {
                abort(403, 'You do not have permission to access this invitation');
            }
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index($invitation_id = null)
    {
        if ($invitation_id) {
            // Check invitation access permission
            $this->checkInvitationAccess($invitation_id);

            // Specific invitation wishes management
            $invitation = Invitation::findOrFail($invitation_id);

            $title = 'Wedding Wishes - ' . $invitation->wedding_name;
            $breadcrumb = (object)[
                'title' => 'Wedding Wishes - ' . $invitation->wedding_name,
                'list' => ['Home', 'Wishes', $invitation->wedding_name]
            ];
            $page = (object)[
                'title' => 'Wedding Wishes - ' . $invitation->wedding_name
            ];
            $activeMenu = 'wishes';

            return view('wishes.index', [
                'title' => $title,
                'breadcrumb' => $breadcrumb,
                'page' => $page,
                'activeMenu' => $activeMenu,
                'invitation' => $invitation
            ]);
        } else {
            // Redirect to select page
            return redirect()->route('wishes.select');
        }
    }

    public function list(Request $request, $invitation_id = null)
    {
        // Check invitation access permission if invitation_id is provided
        if ($invitation_id) {
            $this->checkInvitationAccess($invitation_id);
        }

        $query = Wish::with(['guest', 'invitation'])->select('wishes.*');

        // Filter by specific invitation if provided
        if ($invitation_id) {
            $query->where('invitation_id', $invitation_id);
        }

        // Apply other filters
        if ($request->has('date_range') && !empty($request->date_range)) {
            $dateRange = explode(' - ', $request->date_range);
            if (count($dateRange) == 2) {
                $startDate = \Carbon\Carbon::createFromFormat('d/m/Y', trim($dateRange[0]))->startOfDay();
                $endDate = \Carbon\Carbon::createFromFormat('d/m/Y', trim($dateRange[1]))->endOfDay();
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
        }

        if ($request->has('guest_category') && !empty($request->guest_category)) {
            $query->whereHas('guest', function ($q) use ($request) {
                $q->where('guest_category', $request->guest_category);
            });
        }

        return DataTables::of($query)
            ->addIndexColumn()
            ->addColumn('invitation_info', function ($wish) {
                return $wish->invitation->wedding_name . '<br>' .
                    '<small class="text-muted">' . $wish->invitation->groom_name . ' & ' . $wish->invitation->bride_name . '</small>';
            })
            ->addColumn('guest_info', function ($wish) {
                return $wish->guest->guest_name . '<br>' .
                    '<small class="text-muted">' . $wish->guest->guest_category . '</small>';
            })
            ->addColumn('message_preview', function ($wish) {
                $message = $wish->message;
                if (strlen($message) > 100) {
                    return '<span title="' . htmlspecialchars($message) . '">' .
                        substr($message, 0, 100) . '...</span>';
                }
                return $message;
            })
            ->addColumn('created_at_formatted', function ($wish) {
                return $wish->created_at->format('d M Y H:i') . '<br>' .
                    '<small class="text-muted">' . $wish->created_at->diffForHumans() . '</small>';
            })
            ->addColumn('action', function ($wish) {
                $btn = '<div class="btn-group" role="group">';
                $btn .= '<button onclick="modalAction(\'' . url('/wishes/' . $wish->wish_id . '/show_ajax') . '\')" class="btn btn-info btn-sm" title="View Wish"><i class="fa fa-eye"></i> Detail</button>';
                $btn .= '</div>';
                return $btn;
            })
            ->filterColumn('invitation_info', function ($query, $keyword) {
                $query->whereHas('invitation', function ($q) use ($keyword) {
                    $q->where('wedding_name', 'like', "%{$keyword}%")
                        ->orWhere('groom_name', 'like', "%{$keyword}%")
                        ->orWhere('bride_name', 'like', "%{$keyword}%");
                });
            })
            ->filterColumn('guest_info', function ($query, $keyword) {
                $query->whereHas('guest', function ($q) use ($keyword) {
                    $q->where('guest_name', 'like', "%{$keyword}%")
                        ->orWhere('guest_category', 'like', "%{$keyword}%");
                });
            })
            ->rawColumns(['invitation_info', 'guest_info', 'message_preview', 'created_at_formatted', 'action'])
            ->make(true);
    }

    public function wishSelect()
    {
        if (Auth::user()->role === 'admin') {
            // Admin bisa lihat semua invitation dengan select page
            $invitations = Invitation::select('invitation_id', 'wedding_name', 'groom_name', 'bride_name', 'wedding_date', 'wedding_venue')
                ->withCount(['wishes' => function ($query) {
                    // Count only wishes, not guests
                }])
                ->orderBy('wedding_date', 'desc')
                ->get();

            $title = 'Wish Management';
            $breadcrumb = (object)[
                'title' => 'Wish Management - Select Invitation',
                'list' => ['Home', 'Wishes']
            ];
            $page = (object)[
                'title' => 'Wish Management'
            ];
            $activeMenu = 'wishes';

            return view('wishes.select', [
                'title' => $title,
                'breadcrumb' => $breadcrumb,
                'page' => $page,
                'activeMenu' => $activeMenu,
                'invitations' => $invitations
            ]);
        } else {
            // User logic: direct redirect to their invitation wishes
            $userInvitation = Invitation::where('user_id', Auth::id())->first();
            
            if (!$userInvitation) {
                // User belum punya invitation -> redirect dengan notifikasi
                return redirect('/invitation')
                    ->with('error', 'Please create your invitation first!');
            }

            // User punya invitation -> langsung redirect ke wish management (URL yang benar)
            return redirect("/wishes/invitation/{$userInvitation->invitation_id}");
        }
    }

    public function show_ajax($id)
    {
        $wish = Wish::with(['guest', 'invitation'])->find($id);
        return view('wishes.show_ajax', ['wish' => $wish]);
    }

    public function delete_ajax($id)
    {
        try {
            $wish = Wish::find($id);

            if ($wish) {
                $wish->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'Wish deleted successfully.'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Wish not found.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete wish: ' . $e->getMessage()
            ], 500);
        }
    }

    public function bulkAction(Request $request)
    {
        try {
            $action = $request->action;
            $wishIds = $request->wish_ids;

            if (empty($wishIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No wishes selected'
                ], 400);
            }

            switch ($action) {
                case 'delete':
                    Wish::whereIn('wish_id', $wishIds)->delete();
                    $message = count($wishIds) . ' wish(es) deleted successfully!';
                    break;

                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid action'
                    ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'refresh' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process bulk action: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // GUEST FACING METHODS
    // =========================

    /**
     * Get wishes for specific invitation (guest facing)
     */
    public function getWishesForInvitation(Request $request, $slug)
    {
        try {
            $invitation = Invitation::where('slug', $slug)->firstOrFail();

            $page = $request->get('page', 1);
            $perPage = 10;
            $offset = ($page - 1) * $perPage;

            $total = Wish::where('invitation_id', $invitation->invitation_id)->count();

            $wishes = Wish::with('guest')
                ->where('invitation_id', $invitation->invitation_id)
                ->orderBy('created_at', 'desc')
                ->skip($offset)
                ->take($perPage)
                ->get()
                ->map(function ($wish) {
                    return [
                        'wish_id' => $wish->wish_id,
                        'guest_name' => $wish->guest->guest_name ?? 'Anonymous',
                        'message' => $wish->message,
                        'created_at_formatted' => $wish->created_at_formatted,
                    ];
                });

            $hasMore = ($offset + $perPage) < $total;

            return response()->json([
                'success' => true,
                'wishes' => $wishes,
                'total' => $total,
                'current_page' => $page,
                'has_more' => $hasMore
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading wishes: ' . $e->getMessage(), [
                'slug' => $slug,
                'page' => $request->get('page', 1),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load wishes'
            ], 500);
        }
    }

    /**
     * Check if guest has already sent a wish
     */
    public function checkUserWish($slug, $guest_id_qr_code)
    {
        try {
            $invitation = Invitation::where('slug', $slug)->firstOrFail();
            $guest = Guest::where('guest_id_qr_code', $guest_id_qr_code)
                ->where('invitation_id', $invitation->invitation_id)
                ->firstOrFail();

            $existingWish = Wish::where('invitation_id', $invitation->invitation_id)
                ->where('guest_id', $guest->guest_id)
                ->first();

            return response()->json([
                'success' => true,
                'has_wish' => $existingWish ? true : false,
                'user_wish' => $existingWish ? [
                    'wish_id' => $existingWish->wish_id,
                    'message' => $existingWish->message,
                    'created_at_formatted' => $existingWish->created_at_formatted
                ] : null
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking user wish: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to check wish status'
            ], 500);
        }
    }

    /**
     * Store or update guest wish
     */
    public function storeGuestWish(Request $request, $slug, $guest_id_qr_code)
    {
        try {
            Log::info('Storing wish', [
                'slug' => $slug,
                'guest_id_qr_code' => $guest_id_qr_code,
                'message' => $request->message
            ]);

            $invitation = Invitation::where('slug', $slug)->firstOrFail();
            $guest = Guest::where('guest_id_qr_code', $guest_id_qr_code)
                ->where('invitation_id', $invitation->invitation_id)
                ->firstOrFail();

            $validator = Validator::make($request->all(), [
                'message' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please check your input: ' . implode(', ', $validator->errors()->all())
                ], 422);
            }

            // Check if guest already left a wish
            $existingWish = Wish::where('invitation_id', $invitation->invitation_id)
                ->where('guest_id', $guest->guest_id)
                ->first();

            if ($existingWish) {
                // Update existing wish
                $existingWish->update([
                    'message' => $request->message
                ]);

                Log::info('Wish updated successfully', ['wish_id' => $existingWish->wish_id]);

                return response()->json([
                    'success' => true,
                    'message' => 'Your wishes have been updated!',
                    'action' => 'updated'
                ]);
            } else {
                // Create new wish
                $wish = Wish::create([
                    'invitation_id' => $invitation->invitation_id,
                    'guest_id' => $guest->guest_id,
                    'message' => $request->message
                ]);

                Log::info('Wish created successfully', ['wish_id' => $wish->wish_id]);

                return response()->json([
                    'success' => true,
                    'message' => 'Your wishes have been sent!',
                    'action' => 'created'
                ]);
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Model not found in wish store', [
                'slug' => $slug,
                'guest_id_qr_code' => $guest_id_qr_code,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid invitation or guest information.'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error storing wish: ' . $e->getMessage(), [
                'slug' => $slug,
                'guest_id_qr_code' => $guest_id_qr_code,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send wishes. Please try again.'
            ], 500);
        }
    }

    /**
     * Update an existing wish for a guest (AJAX)
     */
    public function update(Request $request, $slug, $guest_id_qr_code)
    {
        try {
            Log::info('Updating wish', [
                'slug' => $slug,
                'guest_id_qr_code' => $guest_id_qr_code,
                'message' => $request->message
            ]);

            $invitation = Invitation::where('slug', $slug)->firstOrFail();
            $guest = Guest::where('guest_id_qr_code', $guest_id_qr_code)
                ->where('invitation_id', $invitation->invitation_id)
                ->firstOrFail();

            $validator = Validator::make($request->all(), [
                'message' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please check your input: ' . implode(', ', $validator->errors()->all())
                ], 422);
            }

            $wish = Wish::where('invitation_id', $invitation->invitation_id)
                ->where('guest_id', $guest->guest_id)
                ->first();

            if (!$wish) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ucapan tidak ditemukan untuk diperbarui.'
                ], 404);
            }

            $wish->message = $request->message;
            $wish->save();

            Log::info('Wish updated successfully', ['wish_id' => $wish->wish_id]);

            return response()->json([
                'success' => true,
                'message' => 'Ucapan berhasil diperbarui!',
                'new_message' => $wish->message
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Model not found in wish update', [
                'slug' => $slug,
                'guest_id_qr_code' => $guest_id_qr_code,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Data undangan atau tamu tidak valid.'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error updating wish: ' . $e->getMessage(), [
                'slug' => $slug,
                'guest_id_qr_code' => $guest_id_qr_code,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui ucapan. Silakan coba lagi.'
            ], 500);
        }
    }

    /**
     * Export wishes to Excel file
     */
    public function export($invitation_id)
    {
        // Check invitation access permission
        $this->checkInvitationAccess($invitation_id);

        try {
            // Get invitation details for filename
            $invitation = \App\Models\Invitation::findOrFail($invitation_id);
            $filename = 'ucapan_doa_' . str_replace([' ', '&', '/'], ['_', 'and', '_'], $invitation->wedding_name) . '_' . date('Y-m-d') . '.xlsx';

            // Create and download export
            $export = new \App\Exports\WishesExport($invitation_id);
            $export->download($filename);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Export failed: ' . $e->getMessage());
        }
    }
}