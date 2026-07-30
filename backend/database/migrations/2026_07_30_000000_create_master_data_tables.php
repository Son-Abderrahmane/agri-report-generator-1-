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
        Schema::create('crops', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('pesticides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_id')->nullable()->constrained()->nullOnDelete();
            $table->string('crop_name')->nullable(); // Denormalized just in case
            $table->string('target_pest')->nullable();
            $table->string('product_name');
            $table->string('holder')->nullable();
            $table->string('supplier')->nullable();
            $table->string('registration_number')->nullable();
            $table->string('valid_until')->nullable(); // Using string for dates since formats might vary
            $table->string('dosage')->nullable();
            $table->timestamps();
        });

        Schema::create('quick_formulas', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index(); // 'diagnostic', 'recommendation', etc.
            $table->string('title')->nullable();
            $table->text('content');
            $table->timestamps();
        });

        Schema::create('evaluation_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('risk_level')->default('Info');
            $table->text('condition_explanation')->nullable();
            $table->text('preventive_action')->nullable();
            $table->text('report_sentence')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_templates');
        Schema::dropIfExists('quick_formulas');
        Schema::dropIfExists('pesticides');
        Schema::dropIfExists('crops');
    }
};
