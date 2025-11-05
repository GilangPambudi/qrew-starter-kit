<?php

namespace App\Services;

use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Database\Eloquent\Collection;

class GuestService 
{
    public function __construct(
        private QrCodeService $qrCodeService,
        private PhoneService $phoneService
    ) {}

    /**
     * Create new guest with QR code generation
     */
    public function createGuest(array $guestData, int $invitationId, int $userId): Guest
    {
        // Normalize phone number if provided
        if (!empty($guestData['guest_contact'])) {
            $normalized = $this->phoneService->normalizePhoneNumber($guestData['guest_contact']);
            if ($normalized) {
                $guestData['guest_contact'] = $normalized;
            }
        }

        // Generate QR code data
        $qrData = $this->qrCodeService->generateGuestQrData($guestData['guest_name']);
        
        // Merge all data
        $guestData = array_merge($guestData, $qrData, [
            'invitation_id' => $invitationId,
            'user_id' => $userId
        ]);

        return Guest::create($guestData);
    }

    /**
     * Update existing guest with conditional QR code regeneration
     */
    public function updateGuest(Guest $guest, array $guestData): Guest
    {
        // Normalize phone number if provided
        if (!empty($guestData['guest_contact'])) {
            $normalized = $this->phoneService->normalizePhoneNumber($guestData['guest_contact']);
            if ($normalized) {
                $guestData['guest_contact'] = $normalized;
            }
        }

        // Check if guest name is being changed - regenerate QR code
        if (isset($guestData['guest_name']) && $guest->guest_name !== $guestData['guest_name']) {
            $qrData = $this->qrCodeService->regenerateGuestQrCode($guest, $guestData['guest_name']);
            $guestData = array_merge($guestData, $qrData);
        }

        $guest->update($guestData);
        return $guest->fresh();
    }

    /**
     * Delete guest with QR code cleanup
     */
    public function deleteGuest(Guest $guest): bool
    {
        // Delete QR code file
        $this->qrCodeService->deleteQrCode($guest->guest_qr_code);
        
        // Delete guest from database
        return $guest->delete();
    }

    /**
     * Get available categories for invitation
     */
    public function getAvailableCategories(int $invitationId): array
    {
        return Guest::where('invitation_id', $invitationId)
            ->whereNotNull('guest_category')
            ->where('guest_category', '!=', '')
            ->distinct()
            ->pluck('guest_category')
            ->mapWithKeys(function ($category) {
                return [$category => $category];
            })
            ->toArray();
    }

    /**
     * Get guest statistics for invitation
     */
    public function getGuestStatistics(Invitation $invitation): array
    {
        $guestStats = $invitation->guests->groupBy('guest_attendance_status');
        
        return [
            'total_guests' => $invitation->guests->count(),
            'confirmed_guests' => $guestStats->get('confirmed', collect())->count(),
            'attended_guests' => $guestStats->get('attended', collect())->count(),
            'pending_guests' => $guestStats->get('-', collect())->count(),
        ];
    }

    /**
     * Get default status options
     */
    public function getStatusOptions(): array
    {
        return [
            'attendanceStatuses' => [
                'confirmed' => 'Confirmed',
                'attended' => 'Attended',
                '-' => 'Pending'
            ],
            'invitationStatuses' => [
                'sent' => 'Sent',
                'delivered' => 'Delivered',
                'opened' => 'Opened',
                '-' => 'Not Sent'
            ]
        ];
    }
}