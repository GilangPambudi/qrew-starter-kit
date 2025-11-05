<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wish extends Model
{
    use HasFactory;

    protected $table = 'wishes';
    protected $primaryKey = 'wish_id';
    
    protected $fillable = [
        'invitation_id',
        'guest_id', 
        'message'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function invitation()
    {
        return $this->belongsTo(Invitation::class, 'invitation_id', 'invitation_id');
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class, 'guest_id', 'guest_id');
    }

    // Accessor untuk format tanggal
    public function getCreatedAtFormattedAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}