<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaterAnalysis extends Model
{
    protected $fillable = [
        'name', 'n', 'p', 'k', 'ca', 'mg', 's', 'na', 'cl', 'ec', 'ph', 
        'hardness', 'alkalinity', 'hco3', 'co3', 'fe'
    ];
}
