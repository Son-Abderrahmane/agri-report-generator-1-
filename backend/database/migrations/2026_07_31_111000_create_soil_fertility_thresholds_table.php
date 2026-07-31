<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('soil_fertility_thresholds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('nutrient'); // e.g. 'n', 'p', 'k'
            $table->decimal('low_threshold', 8, 2);
            $table->decimal('high_threshold', 8, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soil_fertility_thresholds');
    }
};
