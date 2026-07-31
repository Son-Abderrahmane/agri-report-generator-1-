<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GrowthStageRecipe extends Model
{
    protected $fillable = ['growth_stage_id', 'name', 'description'];

    public function growthStage()
    {
        return $this->belongsTo(GrowthStage::class);
    }

    public function targets()
    {
        return $this->hasMany(GrowthStageTarget::class, 'recipe_id');
    }
}
