<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recommendation_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Insert default categories
        DB::table('recommendation_categories')->insert([
            ['name' => 'Général', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Irrigation / Drainage', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Phytosanitaire', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Climat & Serre', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recommendation_categories');
    }
};
