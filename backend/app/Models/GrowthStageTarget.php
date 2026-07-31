<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GrowthStageTarget extends Model
{
    protected $fillable = ['recipe_id', 'nutrient', 'target_ppm'];

    public function recipe()
    {
        return $this->belongsTo(GrowthStageRecipe::class, 'recipe_id');
    }
}
