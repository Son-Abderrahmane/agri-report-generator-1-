<?php
namespace App\Services\Fertigation;

class StockTankGenerator
{
    public function generateTanksDynamic(array $fertilizerDoses, array $allFertilizers): array
    {
        $tanks = [
            'Tank A' => [],
            'Tank B' => [],
            'Tank C' => []
        ];

        // Fetch compatibility rules from DB (in a real app, inject the Model, here we use DB facade)
        $rules = \Illuminate\Support\Facades\DB::table('fertilizer_compatibility_rules')->get();

        foreach ($fertilizerDoses as $dose) {
            $fertId = $dose['id'];
            
            // Get the full fertilizer info to determine its category
            $fertInfo = collect($allFertilizers)->firstWhere('id', $fertId);
            $name = strtolower($fertInfo['name'] ?? $dose['name']);

            // Agronomic Rule Check based on Name/Composition
            $isCalcium = str_contains($name, 'calcium');
            $isPhosphate = str_contains($name, 'phosphat') || str_contains($name, 'map') || str_contains($name, 'mkp') || str_contains($name, 'dap');
            $isSulfate = str_contains($name, 'sulfat');

            $placed = false;

            // Preferred Tank assignment
            // Tank A: Calcium & Azote (Nitrate de Calcium, Nitrate de Potassium, Urée)
            // Tank B: Phosphates & Sulfates (MAP, Sulfate de Magnésium, Sulfate de Potassium)
            $preferredTank = 'Tank A'; // Default
            
            if ($isPhosphate || $isSulfate) {
                $preferredTank = 'Tank B';
            }
            if ($isCalcium) {
                $preferredTank = 'Tank A';
            }

            // Try to place in the preferred tank first
            if ($this->isCompatibleWithTank($fertId, $tanks[$preferredTank], $rules, $allFertilizers)) {
                $tanks[$preferredTank][] = $dose;
                $placed = true;
            } else {
                // If not compatible with preferred tank, try the other main tank
                $otherTank = ($preferredTank === 'Tank A') ? 'Tank B' : 'Tank A';
                if ($this->isCompatibleWithTank($fertId, $tanks[$otherTank], $rules, $allFertilizers)) {
                    $tanks[$otherTank][] = $dose;
                    $placed = true;
                }
            }

            if (!$placed) {
                // If it can't go in A or B, we just create a new tank dynamically or put it in C
                $tanks['Tank C'][] = $dose;
            }
        }

        // Clean up empty tanks
        return array_filter($tanks, fn($tank) => !empty($tank));
    }

    protected function isCompatibleWithTank($newFertId, array $tankItems, $rules, array $allFertilizers): bool
    {
        $newFert = collect($allFertilizers)->firstWhere('id', $newFertId);
        $newName = strtolower($newFert['name'] ?? '');

        foreach ($tankItems as $item) {
            $existingFertId = $item['id'];
            
            // Check if there's a rule saying these two are incompatible
            $incompatible = $rules->contains(function ($rule) use ($newFertId, $existingFertId) {
                return (
                    ($rule->fertilizer_id_a == $newFertId && $rule->fertilizer_id_b == $existingFertId) ||
                    ($rule->fertilizer_id_a == $existingFertId && $rule->fertilizer_id_b == $newFertId)
                ) && !$rule->is_compatible;
            });

            if ($incompatible) {
                return false;
            }
            
            // Hardcoded agronomic fallbacks
            $existingFert = collect($allFertilizers)->firstWhere('id', $existingFertId);
            $existingName = strtolower($existingFert['name'] ?? $item['name']);
            
            // Calcium + Sulfate/Phosphate precipitate
            $newIsCalcium = str_contains($newName, 'calcium');
            $existingIsCalcium = str_contains($existingName, 'calcium');
            
            $newIsSulfateOrPhos = str_contains($newName, 'sulfat') || str_contains($newName, 'phosphat') || str_contains($newName, 'map') || str_contains($newName, 'mkp');
            $existingIsSulfateOrPhos = str_contains($existingName, 'sulfat') || str_contains($existingName, 'phosphat') || str_contains($existingName, 'map') || str_contains($existingName, 'mkp');

            if (($newIsCalcium && $existingIsSulfateOrPhos) || ($existingIsCalcium && $newIsSulfateOrPhos)) {
                return false;
            }
        }

        return true;
    }
}
