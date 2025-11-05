<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Invitation;
use App\Models\Guest;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QrCodeGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_qr_code_generation_on_guest_creation()
    {
        // Create user
        $user = User::factory()->create([
            'role' => 'user'
        ]);

        // Create invitation
        $invitation = Invitation::factory()->create([
            'user_id' => $user->user_id ?? $user->id,
            'wedding_name' => 'Test Wedding',
            'groom_name' => 'John',
            'bride_name' => 'Jane'
        ]);

        // Act as user
        $this->actingAs($user);

        // Create guest data
        $guestData = [
            'guest_name' => 'Test Guest',
            'guest_gender' => 'Male',
            'guest_category' => 'Family',
            'guest_contact' => '081234567890',
            'guest_address' => 'Test Address'
        ];

        // Post to store guest
        $response = $this->post(route('guests.store', $invitation->invitation_id), $guestData);

        // Assert redirect
        $response->assertRedirect(route('guests.show', $invitation->invitation_id));

        // Assert guest created
        $this->assertDatabaseHas('guests', [
            'guest_name' => 'Test Guest',
            'guest_contact' => '6281234567890', // Normalized phone
            'invitation_id' => $invitation->invitation_id
        ]);

        // Check QR code fields
        $guest = Guest::where('guest_name', 'Test Guest')->first();
        $this->assertNotNull($guest->guest_id_qr_code);
        $this->assertStringStartsWith('QR', $guest->guest_id_qr_code);
    }
}