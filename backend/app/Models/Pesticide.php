<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pesticide extends Model
{
    protected $fillable = [
        'crop_id',
        'crop_name',
        'target_pest',
        'product_name',
        'active_ingredient',
        'teneur',
        'holder',
        'supplier',
        'registration_number',
        'valid_until',
        'dosage',
        'dar',
        'nbr_application'
    ];

    public function crop()
    {
        return $this->belongsTo(Crop::class);
    }
}
