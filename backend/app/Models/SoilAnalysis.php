<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoilAnalysis extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    
    protected $casts = [
        'sampling_date' => 'date',
        'availability_coefficients' => 'array'
    ];

    public function crop()
    {
        return $this->belongsTo(Crop::class);
    }
}
