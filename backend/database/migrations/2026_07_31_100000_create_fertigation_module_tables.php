<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fertilizers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('commercial_name')->nullable();
            $table->string('type'); // Mineral, Organic, Liquid, Soluble
            $table->string('unit'); // kg, g, L, ml
            $table->decimal('density', 8, 4)->nullable();
            $table->decimal('price_per_unit', 10, 2)->nullable();
            
            // Nutrients (Elemental & Oxide) percentages
            $table->decimal('n', 6, 2)->default(0);
            $table->decimal('p', 6, 2)->default(0);
            $table->decimal('p2o5', 6, 2)->default(0);
            $table->decimal('k', 6, 2)->default(0);
            $table->decimal('k2o', 6, 2)->default(0);
            $table->decimal('ca', 6, 2)->default(0);
            $table->decimal('mg', 6, 2)->default(0);
            $table->decimal('s', 6, 2)->default(0);
            $table->decimal('fe', 6, 2)->default(0);
            $table->decimal('mn', 6, 2)->default(0);
            $table->decimal('zn', 6, 2)->default(0);
            $table->decimal('cu', 6, 2)->default(0);
            $table->decimal('b', 6, 2)->default(0);
            $table->decimal('mo', 6, 2)->default(0);
            $table->decimal('si', 6, 2)->default(0);
            
            $table->timestamps();
        });

        Schema::create('growth_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g. "Vegetative"
            $table->integer('duration_days')->nullable();
            $table->decimal('target_ec_min', 4, 2)->nullable();
            $table->decimal('target_ec_max', 4, 2)->nullable();
            $table->decimal('target_ph_min', 4, 2)->nullable();
            $table->decimal('target_ph_max', 4, 2)->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        Schema::create('growth_stage_recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('growth_stage_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g. "Vegetative Standard"
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('growth_stage_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->constrained('growth_stage_recipes')->cascadeOnDelete();
            $table->string('nutrient'); // N, P, K, Ca, etc.
            $table->decimal('target_ppm', 8, 2);
            $table->timestamps();
        });

        Schema::create('water_analyses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('n', 8, 2)->default(0);
            $table->decimal('p', 8, 2)->default(0);
            $table->decimal('k', 8, 2)->default(0);
            $table->decimal('ca', 8, 2)->default(0);
            $table->decimal('mg', 8, 2)->default(0);
            $table->decimal('s', 8, 2)->default(0);
            $table->decimal('na', 8, 2)->default(0);
            $table->decimal('cl', 8, 2)->default(0);
            $table->decimal('ec', 8, 2)->default(0);
            $table->decimal('ph', 8, 2)->default(0);
            $table->decimal('hardness', 8, 2)->default(0);
            $table->decimal('alkalinity', 8, 2)->default(0);
            $table->decimal('hco3', 8, 2)->default(0);
            $table->decimal('co3', 8, 2)->default(0);
            $table->decimal('fe', 8, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('optimization_runs', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->nullable();
            $table->foreignId('crop_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('recipe_id')->nullable()->constrained('growth_stage_recipes')->nullOnDelete();
            $table->foreignId('water_analysis_id')->nullable()->constrained('water_analyses')->nullOnDelete();
            $table->string('optimization_objective'); // e.g., 'lowest_cost', 'target_accuracy'
            $table->decimal('total_cost', 10, 2)->nullable();
            $table->json('inputs_json')->nullable();
            $table->json('results_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('optimization_runs');
        Schema::dropIfExists('water_analyses');
        Schema::dropIfExists('growth_stage_targets');
        Schema::dropIfExists('growth_stage_recipes');
        Schema::dropIfExists('growth_stages');
        Schema::dropIfExists('fertilizers');
    }
};
