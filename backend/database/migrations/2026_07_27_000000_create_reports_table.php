<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->string('id')->primary(); // we use string because frontend generates "rep_..."
            $table->string('title')->nullable();
            $table->string('status')->default('draft');
            $table->json('data')->nullable(); // Stores the rest of the report fields
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
