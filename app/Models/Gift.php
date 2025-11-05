<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gift extends Model
{

    // ga jadi, langsung query dari tabel payment
    
    // protected $fillable = [
    //     'guest_id',
    //     'amount',
    //     'transaction_id'
    // ];

    // protected $primaryKey = 'gift_id';
    
    // public $timestamps = false;

    // public function guest()
    // {
    //     return $this->belongsTo(Guest::class, 'guest_id', 'guest_id');
    // }

    // public function payment()
    // {
    //     return $this->belongsTo(Payment::class, 'transaction_id', 'order_id');
    // }
}
