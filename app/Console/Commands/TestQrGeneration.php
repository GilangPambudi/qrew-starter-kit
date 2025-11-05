<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\SvgWriter;
use Endroid\QrCode\Writer\PngWriter;
use Hidehalo\Nanoid\Client;

class TestQrGeneration extends Command
{
    protected $signature = 'test:qr';
    protected $description = 'Test QR code generation';

    public function handle()
    {
        $this->info('Testing QR code generation...');
        
        // Generate NanoID like SKRIPSI
        $client = new Client();
        $nanoId = $client->generateId(10);
        
        $guestName = 'John Doe Test';
        $cleanName = preg_replace('/[^a-zA-Z0-9 ]/', '', $guestName);
        $guestNameSlug = str_replace(' ', '-', strtolower($cleanName));
        $qrCodeId = "{$nanoId}-{$guestNameSlug}";
        
        $this->info("Generated QR ID: {$qrCodeId}");
        
        // Test SVG generation
        try {
            $qrCode = new QrCode($qrCodeId);
            $writer = new SvgWriter();
            $result = $writer->write($qrCode);
            
            $fileName = $qrCodeId . '.svg';
            $filePath = 'qr/guests/' . $fileName;
            $fullPath = storage_path('app/public/' . $filePath);
            
            $directory = dirname($fullPath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            file_put_contents($fullPath, $result->getString());
            
            if (file_exists($fullPath) && filesize($fullPath) > 0) {
                $this->info("✅ SVG QR code generated successfully: {$filePath}");
                $this->info("File size: " . filesize($fullPath) . " bytes");
            } else {
                $this->error("❌ SVG file creation failed");
            }
        } catch (\Exception $e) {
            $this->error("❌ SVG generation failed: " . $e->getMessage());
            
            // Test PNG fallback
            try {
                $qrCode = new QrCode($qrCodeId);
                $writer = new PngWriter();
                $result = $writer->write($qrCode);
                
                $fileName = $qrCodeId . '.png';
                $filePath = 'qr/guests/' . $fileName;
                $fullPath = storage_path('app/public/' . $filePath);
                
                file_put_contents($fullPath, $result->getString());
                
                if (file_exists($fullPath) && filesize($fullPath) > 0) {
                    $this->info("✅ PNG QR code generated successfully: {$filePath}");
                    $this->info("File size: " . filesize($fullPath) . " bytes");
                } else {
                    $this->error("❌ PNG file creation failed");
                }
            } catch (\Exception $pngError) {
                $this->error("❌ PNG generation also failed: " . $pngError->getMessage());
            }
        }
    }
}
