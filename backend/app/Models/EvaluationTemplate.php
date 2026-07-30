<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluationTemplate extends Model
{
    protected $fillable = [
        'name',
        'risk_level',
        'condition_explanation',
        'preventive_action',
        'report_sentence'
    ];
}
