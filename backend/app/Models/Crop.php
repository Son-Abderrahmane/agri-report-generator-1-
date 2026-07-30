<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Crop extends Model
{
    protected $fillable = ['name'];

    public function pesticides()
    {
        return $this->hasMany(Pesticide::class);
    }
}
