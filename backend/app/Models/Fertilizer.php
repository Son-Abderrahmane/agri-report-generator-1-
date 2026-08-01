<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fertilizer extends Model
{
    protected $fillable = [
        'name', 'commercial_name', 'type', 'unit', 'density', 'price_per_unit',
        'n', 'p', 'p2o5', 'k', 'k2o', 'cao', 'mgo', 'so3', 'fe', 'mn', 'zn', 'cu', 'b', 'mo', 'si'
    ];
}
