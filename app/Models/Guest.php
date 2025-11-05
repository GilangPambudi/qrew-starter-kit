<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    protected $fillable = [
        'guest_name',
        'guest_id_qr_code',
        'guest_gender',
        'guest_category',
        'guest_contact',
        'guest_address',
        'guest_qr_code',
        'guest_attendance_status',
        'guest_invitation_status',
        'guest_arrival_time',
        'user_id',
        'invitation_id',
        'invitation_sent_at',
        'invitation_opened_at',
        'h4_reminder_sent_at',
        'h1_info_sent_at',
    ];

    protected $primaryKey = 'guest_id';

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function invitation()
    {
        return $this->belongsTo(Invitation::class, 'invitation_id', 'invitation_id');
    }

    // Tambahkan relasi wishes
    // public function wishes()
    // {
    //     return $this->hasMany(Wish::class, 'guest_id', 'guest_id');
    // }

    // // Tambahkan relasi payments jika diperlukan
    // public function payments()
    // {
    //     return $this->hasMany(Payment::class, 'guest_id', 'guest_id');
    // }

    // // Tambahkan relasi gifts
    // public function gifts()
    // {
    //     return $this->hasMany(Gift::class, 'guest_id', 'guest_id');
    // }
}