<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('soil_analyses', function (Blueprint $table) {
            $table->id();
            // Metadata
            $table->string('name');
            $table->string('field_name')->nullable();
            $table->foreignId('crop_id')->nullable()->constrained()->nullOnDelete();
            $table->string('laboratory_name')->nullable();
            $table->string('analysis_number')->nullable();
            $table->string('sampling_method')->nullable();
            $table->string('gps_location')->nullable();
            $table->date('sampling_date')->nullable();
            $table->decimal('depth', 5, 2)->nullable();
            $table->string('status')->default('Active'); // Active / Archived
            
            // Physical & Types
            $table->string('unit')->default('ppm'); // mg/kg, ppm, cmol(+)/kg, meq/100 g
            $table->string('texture')->nullable(); // Sand, Sandy Loam, Loam, Silt Loam, Clay Loam, Clay
            $table->decimal('organic_matter', 8, 2)->default(0);
            $table->decimal('organic_carbon', 8, 2)->default(0);
            $table->decimal('cec', 8, 2)->default(0);
            
            // Chemical
            $table->decimal('ph', 5, 2)->default(0);
            $table->decimal('ec', 8, 2)->default(0);
            $table->decimal('ca_co3', 8, 2)->default(0);
            
            // Macro / Micro
            $table->decimal('n', 8, 2)->default(0);
            $table->decimal('p', 8, 2)->default(0);
            $table->decimal('k', 8, 2)->default(0);
            $table->decimal('ca', 8, 2)->default(0);
            $table->decimal('mg', 8, 2)->default(0);
            $table->decimal('s', 8, 2)->default(0);
            $table->decimal('fe', 8, 2)->default(0);
            $table->decimal('mn', 8, 2)->default(0);
            $table->decimal('zn', 8, 2)->default(0);
            $table->decimal('cu', 8, 2)->default(0);
            $table->decimal('b', 8, 2)->default(0);
            $table->decimal('mo', 8, 2)->default(0);
            $table->decimal('si', 8, 2)->default(0);
            
            // Salinity & Sodium
            $table->decimal('na', 8, 2)->default(0);
            $table->decimal('cl', 8, 2)->default(0);
            $table->decimal('sar', 8, 2)->default(0);
            $table->decimal('esp', 8, 2)->default(0);
            
            $table->text('notes')->nullable();
            $table->json('availability_coefficients')->nullable(); // User overrides

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soil_analyses');
    }
};
