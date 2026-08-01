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
            $placed = false;

            foreach (['Tank A', 'Tank B', 'Tank C'] as $tankName) {
                if ($this->isCompatibleWithTank($fertId, $tanks[$tankName], $rules)) {
                    $tanks[$tankName][] = $dose;
                    $placed = true;
                    break;
                }
            }

            if (!$placed) {
                // If it can't go in A, B, or C, we just create a new tank dynamically or put it in C with a warning.
                $tanks['Tank C'][] = $dose;
            }
        }

        // Clean up empty tanks
        return array_filter($tanks, fn($tank) => !empty($tank));
    }

    protected function isCompatibleWithTank($newFertId, array $tankItems, $rules): bool
    {
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
        }

        // Hardcoded fallbacks if no DB rules exist yet for MVP
        $newFert = collect($tankItems)->firstWhere('id', $newFertId) ?? ['name' => ''];
        $newName = strtolower($newFert['name'] ?? '');
        
        foreach ($tankItems as $item) {
            $existingName = strtolower($item['name']);
            // Calcium + Sulfate/Phosphate fallback
            if (
                (str_contains($newName, 'calcium') && (str_contains($existingName, 'sulfat') || str_contains($existingName, 'phosphat'))) ||
                (str_contains($existingName, 'calcium') && (str_contains($newName, 'sulfat') || str_contains($newName, 'phosphat')))
            ) {
                return false;
            }
        }

        return true;
    }
}
