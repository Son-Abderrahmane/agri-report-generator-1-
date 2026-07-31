<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoilFertilityThreshold extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function crop()
    {
        return $this->belongsTo(Crop::class);
    }
}
