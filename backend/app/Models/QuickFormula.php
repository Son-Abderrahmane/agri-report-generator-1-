<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuickFormula extends Model
{
    protected $fillable = [
        'category',
        'title',
        'content'
    ];
}
