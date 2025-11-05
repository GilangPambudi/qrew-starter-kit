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
        Schema::disableForeignKeyConstraints();

        Schema::create('attendance', function (Blueprint $table) {
            $table->id('attendance_id');
            $table->unsignedBigInteger('user_id'); // Ensure this is unsigned
            $table->foreign('user_id')->references('user_id')->on('users');
            $table->unsignedBigInteger('guest_id');
            $table->foreign('guest_id')->references('guest_id')->on('guests');
            $table->enum('attendance_status', ["yes", "no", "pending"]);
            $table->timestamp('check_in_time');
            $table->timestamp('check_out_time');
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};
