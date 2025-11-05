<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invitation_template_mappings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('invitation_id');
            $table->string('guest_category'); // VIP, Regular, Keluarga, etc.
            $table->string('template_name'); // invitation_1, invitation_2
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('invitation_id')->references('invitation_id')->on('invitations')->onDelete('cascade');
            
            // Pastikan satu kategori hanya bisa punya satu template per undangan
            $table->unique(['invitation_id', 'guest_category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitation_template_mappings');
    }
};
