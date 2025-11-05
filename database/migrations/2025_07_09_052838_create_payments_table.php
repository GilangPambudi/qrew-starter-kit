<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('guest_id');
            $table->unsignedBigInteger('invitation_id');
            $table->string('order_id')->unique();
            $table->string('payment_type')->nullable();
            $table->decimal('gross_amount', 15, 2);
            $table->string('transaction_status')->default('pending');
            $table->string('payment_status')->default('pending');
            $table->text('snap_token')->nullable();
            $table->json('midtrans_response')->nullable();
            $table->timestamps();

            $table->foreign('guest_id')->references('guest_id')->on('guests')->onDelete('cascade');
            $table->foreign('invitation_id')->references('invitation_id')->on('invitations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
