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
        Schema::table('pesticides', function (Blueprint $table) {
            $table->string('teneur')->nullable()->after('active_ingredient');
            $table->string('dar')->nullable()->after('dosage');
            $table->string('nbr_application')->nullable()->after('dar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pesticides', function (Blueprint $table) {
            $table->dropColumn(['teneur', 'dar', 'nbr_application']);
        });
    }
};
