<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $primaryKey = 'payment_id';
    protected $fillable = [
        'guest_id', 'invitation_id', 'order_id', 'payment_type',
        'gross_amount', 'transaction_status', 'payment_status', 
        'snap_token', 'midtrans_response'
    ];
    
    protected $casts = [
        'midtrans_response' => 'array'
    ];
    
    public function guest()
    {
        return $this->belongsTo(Guest::class, 'guest_id');
    }
    
    public function invitation()
    {
        return $this->belongsTo(Invitation::class, 'invitation_id');
    }
}