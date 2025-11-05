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

        Schema::create('gifts', function (Blueprint $table) {
            $table->id('gift_id');
            $table->unsignedBigInteger('guest_id');
            $table->foreign('guest_id')->references('guest_id')->on('guests');
            $table->float('amount', 53);
            $table->bigInteger('transaction_id');
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gifts');
    }
};
