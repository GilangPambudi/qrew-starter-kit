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
        Schema::table('guests', function (Blueprint $table) {
            $table->timestamp('h4_reminder_sent_at')->nullable()->after('invitation_opened_at');
            $table->timestamp('h1_info_sent_at')->nullable()->after('h4_reminder_sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropColumn(['h4_reminder_sent_at', 'h1_info_sent_at']);
        });
    }
};
