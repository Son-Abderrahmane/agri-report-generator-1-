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
        Schema::dropIfExists('fertilizer_compatibility_rules');
        Schema::create('fertilizer_compatibility_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fertilizer_id_a')->constrained('fertilizers')->cascadeOnDelete();
            $table->foreignId('fertilizer_id_b')->constrained('fertilizers')->cascadeOnDelete();
            $table->boolean('is_compatible')->default(true);
            $table->string('recommended_tank_separation')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Ensure unique pairing with a shortened constraint name to avoid 64-char limit
            $table->unique(['fertilizer_id_a', 'fertilizer_id_b'], 'fert_compat_a_b_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fertilizer_compatibility_rules');
    }
};
