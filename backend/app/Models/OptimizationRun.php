<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OptimizationRun extends Model
{
    protected $fillable = [
        'user_id', 'crop_id', 'recipe_id', 'water_analysis_id', 
        'optimization_objective', 'total_cost', 'inputs_json', 'results_json'
    ];

    protected $casts = [
        'inputs_json' => 'array',
        'results_json' => 'array'
    ];
}
