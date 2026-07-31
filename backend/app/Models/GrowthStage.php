<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GrowthStage extends Model
{
    protected $fillable = [
        'crop_id', 'name', 'duration_days', 'target_ec_min', 'target_ec_max', 'target_ph_min', 'target_ph_max', 'order_index'
    ];

    public function crop()
    {
        return $this->belongsTo(Crop::class);
    }

    public function recipes()
    {
        return $this->hasMany(GrowthStageRecipe::class);
    }
}
