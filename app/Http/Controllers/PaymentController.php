<?php
namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Payment;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Set konfigurasi Midtrans
        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isSanitized = env('MIDTRANS_IS_SANITIZED', true);
        Config::$is3ds = env('MIDTRANS_IS_3DS', true);
    }
    
    public function createPayment(Request $request, $slug, $guest_id_qr_code)
    {
        $invitation = Invitation::where('slug', $slug)->firstOrFail();
        $guest = Guest::where('guest_id_qr_code', $guest_id_qr_code)
            ->where('invitation_id', $invitation->invitation_id)
            ->firstOrFail();
        
        $amount = $request->input('amount', 1000); // Default 1k
        
        // Validate minimum amount
        if ($amount < 1000) {
            return response()->json([
                'success' => false,
                'message' => 'Nominal hadiah minimal adalah Rp 1.000.'
            ], 400);
        }

        // Check existing payment for this guest & invitation
        $existingPayment = Payment::where('guest_id', $guest->guest_id)
            ->where('invitation_id', $invitation->invitation_id)
            ->orderByDesc('payment_id')
            ->first();

        // 1. If already paid (settlement), return thank you message and block payment
        if ($existingPayment && $existingPayment->transaction_status === 'settlement') {
            return response()->json([
                'success' => false,
                'message' => 'Terima kasih telah memberikan hadiah untuk pernikahan ' . $invitation->groom_name . ' & ' . $invitation->bride_name . '. Kontribusi Anda sangat berarti bagi kami! 💝',
                'already_paid' => true
            ]);
        }

        // 2. If has pending payment, always reuse it (never update order_id or snap_token)
        if ($existingPayment && $existingPayment->transaction_status === 'pending') {
            return response()->json([
                'success' => true,
                'snap_token' => $existingPayment->snap_token,
                'order_id' => $existingPayment->order_id,
                'reused' => true,
                'message' => 'Melanjutkan pembayaran yang masih pending. Silakan selesaikan pembayaran.'
            ]);
        }

        // 3. If expired/canceled or no payment, create new payment (new order_id & snap_token)
        $orderId = 'WED-' . $invitation->invitation_id . '-' . $guest->guest_id . '-' . time();
        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $amount,
            ],
            'customer_details' => [
                'first_name' => $guest->guest_name,
                'phone' => $guest->guest_contact,
            ],
            'item_details' => [
                [
                    'id' => 'wedding_gift',
                    'price' => $amount,
                    'quantity' => 1,
                    'name' => 'Wedding Gift for ' . $invitation->groom_name . ' & ' . $invitation->bride_name
                ]
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            Payment::create([
                'guest_id' => $guest->guest_id,
                'invitation_id' => $invitation->invitation_id,
                'order_id' => $orderId,
                'gross_amount' => $amount,
                'snap_token' => $snapToken,
            ]);
            return response()->json([
                'success' => true,
                'snap_token' => $snapToken,
                'order_id' => $orderId
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public function checkPaymentStatus($slug, $guest_id_qr_code)
    {
        $invitation = Invitation::where('slug', $slug)->firstOrFail();
        $guest = Guest::where('guest_id_qr_code', $guest_id_qr_code)
            ->where('invitation_id', $invitation->invitation_id)
            ->firstOrFail();
            
        // Check existing payment for this guest
        $existingPayment = Payment::where('guest_id', $guest->guest_id)
            ->where('invitation_id', $invitation->invitation_id)
            ->first();
            
        if (!$existingPayment) {
            return response()->json([
                'has_payment' => false,
                'message' => 'Belum ada pembayaran'
            ]);
        }
        
        $createdAt = \Carbon\Carbon::parse($existingPayment->created_at);
        $now = \Carbon\Carbon::now();
        $minutesSinceCreated = $now->diffInMinutes($createdAt);
        $hoursSinceCreated = $now->diffInHours($createdAt);

        $message = '';
        if ($existingPayment->transaction_status === 'settlement') {
          $message = 'Terima kasih telah memberikan hadiah, kontribusi Anda sangat berarti bagi kami! 💝';
        } elseif ($existingPayment->transaction_status === 'pending') {
            if ($minutesSinceCreated < 15) {
            $message = 'Anda memiliki pembayaran yang sedang pending. Silakan selesaikan atau lanjutkan pembayaran tersebut.';
            } else {
            $message = 'Pembayaran sebelumnya sudah expired. Anda dapat membuat pembayaran baru.';
            }
        }
        
        return response()->json([
            'has_payment' => true,
            'status' => $existingPayment->transaction_status,
            'amount' => $existingPayment->gross_amount,
            'hours_since_created' => $hoursSinceCreated,
            'message' => $message,
            'created_at' => $existingPayment->created_at,
            'order_id' => $existingPayment->order_id,
            'snap_token' => $existingPayment->snap_token  // Menambahkan snap_token untuk digunakan langsung
        ]);
    }

    public function handleCallback(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);
        
        if ($hashed == $request->signature_key) {
            $payment = Payment::where('order_id', $request->order_id)->first();
            
            if ($payment) {
                $payment->update([
                    'transaction_status' => $request->transaction_status,
                    'payment_type' => $request->payment_type ?? null,
                    'payment_status' => $request->transaction_status == 'settlement' ? 'success' : 'pending',
                    'midtrans_response' => $request->all()
                ]);

                // Auto-create gift record when payment is successful
                if ($request->transaction_status == 'settlement') {
                    $this->createGiftFromPayment($payment);
                }
            }
        }
        
        return response('OK');
    }

    /**
     * Create gift record from successful payment
     */
    private function createGiftFromPayment($payment)
    {
        try {
            // Check if gift already exists
            $existingGift = \App\Models\Gift::where('guest_id', $payment->guest_id)
                ->where('invitation_id', $payment->invitation_id)
                ->first();

            if (!$existingGift) {
                \App\Models\Gift::create([
                    'guest_id' => $payment->guest_id,
                    'invitation_id' => $payment->invitation_id,
                    'gift_amount' => $payment->gross_amount,
                    'gift_method' => 'Digital Payment',
                    'gift_notes' => 'Payment via Midtrans - Order ID: ' . $payment->order_id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create gift from payment: ' . $e->getMessage(), [
                'payment_id' => $payment->payment_id,
                'order_id' => $payment->order_id
            ]);
        }
    }
}