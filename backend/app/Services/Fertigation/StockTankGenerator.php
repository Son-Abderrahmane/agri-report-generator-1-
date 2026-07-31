<?php
namespace App\Services\Fertigation;

class StockTankGenerator
{
    public function generateTanks(array $fertilizerDoses): array
    {
        $tankA = [];
        $tankB = [];
        
        foreach ($fertilizerDoses as $dose) {
            $name = strtolower($dose['name']);
            if (str_contains($name, 'calcium') || str_contains($name, 'nitrique')) {
                $tankA[] = $dose;
            } elseif (str_contains($name, 'sulfat') || str_contains($name, 'phosphat') || str_contains($name, 'mkp') || str_contains($name, 'map') || str_contains($name, 'phosphorique') || str_contains($name, 'sulfurique')) {
                $tankB[] = $dose;
            } else {
                $tankA[] = $dose; // Default to Tank A
            }
        }
        
        return [
            'Tank A' => $tankA,
            'Tank B' => $tankB
        ];
    }
}
