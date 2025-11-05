<?php

namespace App\Services;

class PhoneService
{
    /**
     * Normalize phone number to 62XXX format for WhatsApp compatibility
     * Sama seperti di SKRIPSI
     */
    public function normalizePhoneNumber(?string $phoneNumber): ?string
    {
        if (empty($phoneNumber)) {
            return null;
        }

        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phoneNumber);

        if (empty($phone)) {
            return null;
        }

        // Handle different formats
        if (substr($phone, 0, 3) === '620') {
            // 6208xxx -> 628xxx (remove leading 0 after 62)
            $phone = '62' . substr($phone, 3);
        } elseif (substr($phone, 0, 2) === '62') {
            // Already in 62xxx format, keep as is
            $phone = $phone;
        } elseif (substr($phone, 0, 1) === '0') {
            // 08xxx -> 628xxx
            $phone = '62' . substr($phone, 1);
        } elseif (substr($phone, 0, 1) === '8') {
            // 8xxx -> 628xxx
            $phone = '62' . $phone;
        } else {
            // Other formats, prepend 62
            $phone = '62' . $phone;
        }

        // Validate final format (should be 62 followed by 8-13 digits)
        if (!preg_match('/^62[0-9]{8,13}$/', $phone)) {
            return null;
        }

        return $phone;
    }

    /**
     * Validate if phone number is in correct format
     */
    public function isValidPhoneNumber(?string $phoneNumber): bool
    {
        return $this->normalizePhoneNumber($phoneNumber) !== null;
    }

    /**
     * Format phone number for display (add spacing)
     */
    public function formatPhoneNumber(?string $phoneNumber): ?string
    {
        $normalized = $this->normalizePhoneNumber($phoneNumber);
        
        if (!$normalized) {
            return $phoneNumber; // Return original if normalization fails
        }

        // Format: +62 812 3456 7890
        if (strlen($normalized) >= 10) {
            return '+' . substr($normalized, 0, 2) . ' ' . 
                   substr($normalized, 2, 3) . ' ' . 
                   substr($normalized, 5, 4) . ' ' . 
                   substr($normalized, 9);
        }

        return '+' . $normalized;
    }
}