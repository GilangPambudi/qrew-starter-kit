<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wishes', function (Blueprint $table) {
            $table->id('wish_id');
            $table->unsignedBigInteger('invitation_id');
            $table->unsignedBigInteger('guest_id');
            $table->text('message');
            $table->timestamps();

            $table->foreign('invitation_id')->references('invitation_id')->on('invitations')->onDelete('cascade');
            $table->foreign('guest_id')->references('guest_id')->on('guests')->onDelete('cascade');
            
            $table->index(['invitation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishes');
    }
};