<?php

namespace App\Services;

use App\Models\Guest;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\SvgWriter;
use Hidehalo\Nanoid\Client;
use Illuminate\Support\Facades\Storage;

class QrCodeService
{
    /**
     * Generate unique QR code ID seperti di SKRIPSI
     */
    public function generateUniqueQrCodeId(string $guestName): string
    {
        do {
            // Generate NanoID seperti di SKRIPSI
            $client = new Client();
            $nanoId = $client->generateId(10); // Generate 10 character NanoID
            
            // Clean guest name seperti di SKRIPSI
            $cleanName = preg_replace('/[^a-zA-Z0-9 ]/', '', $guestName); // Hapus simbol
            $guestNameSlug = str_replace(' ', '-', strtolower($cleanName));
            
            // Format: {nanoId}-{guestNameSlug}
            $qrCodeId = "{$nanoId}-{$guestNameSlug}";
            
        } while (Guest::where('guest_id_qr_code', $qrCodeId)->exists());

        return $qrCodeId;
    }

    /**
     * Generate QR Code file seperti di SKRIPSI (prefer SVG, fallback to PNG)
     */
    public function generateQrCode(string $qrCodeId, string $guestName): ?string
    {
        try {
            // Create QR code with guest info
            $qrCode = new QrCode($qrCodeId);
            
            // Try SVG format first (seperti di SKRIPSI)
            try {
                $writer = new SvgWriter();
                $result = $writer->write($qrCode);
                
                // Save to storage/app/public/qr/guests/ (struktur seperti SKRIPSI)
                $fileName = $qrCodeId . '.svg';
                $filePath = 'qr/guests/' . $fileName;
                $fullPath = storage_path('app/public/' . $filePath);
                
                // Create directory if not exists
                $directory = dirname($fullPath);
                if (!file_exists($directory)) {
                    mkdir($directory, 0755, true);
                }
                
                // Save QR code
                file_put_contents($fullPath, $result->getString());
                
                // Verify file was created
                if (file_exists($fullPath) && filesize($fullPath) > 0) {
                    return "storage/{$filePath}"; // Return dengan prefix storage seperti SKRIPSI
                }
            } catch (\Exception $svgError) {
                logger('SVG QR generation failed, trying PNG: ' . $svgError->getMessage());
            }
            
            // Fallback to PNG if SVG fails
            $writer = new PngWriter();
            $result = $writer->write($qrCode);
            
            // Save to storage/app/public/qr/guests/
            $fileName = $qrCodeId . '.png';
            $filePath = 'qr/guests/' . $fileName;
            $fullPath = storage_path('app/public/' . $filePath);
            
            // Create directory if not exists
            $directory = dirname($fullPath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Save QR code
            file_put_contents($fullPath, $result->getString());
            
            // Verify file was created
            if (file_exists($fullPath) && filesize($fullPath) > 0) {
                return "storage/{$filePath}"; // Return dengan prefix storage seperti SKRIPSI
            }
            
            logger('QR Code file creation failed - file not found or empty');
            return null;
        } catch (\Exception $e) {
            logger('QR Code generation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete QR code file from storage
     */
    public function deleteQrCode(?string $qrCodePath): bool
    {
        if (!$qrCodePath || $qrCodePath === 'qr-pending') {
            return true; // Nothing to delete
        }

        try {
            $filePath = str_replace('storage/', '', $qrCodePath);
            return Storage::disk('public')->delete($filePath);
        } catch (\Exception $e) {
            logger('QR Code deletion failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate complete QR code data for guest
     */
    public function generateGuestQrData(string $guestName): array
    {
        $qrCodeId = $this->generateUniqueQrCodeId($guestName);
        $qrCodePath = $this->generateQrCode($qrCodeId, $guestName);

        return [
            'guest_id_qr_code' => $qrCodeId,
            'guest_qr_code' => $qrCodePath ?: 'qr-pending'
        ];
    }

    /**
     * Regenerate QR code for existing guest (used when name changes)
     */
    public function regenerateGuestQrCode(Guest $guest, string $newName): array
    {
        // Delete old QR code first
        $this->deleteQrCode($guest->guest_qr_code);

        // Generate new QR code data
        return $this->generateGuestQrData($newName);
    }
}