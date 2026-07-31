<?php
namespace App\Services\Fertigation;

class HeuristicOptimizationSolver implements OptimizationServiceInterface
{
    protected $nutrientConverter;
    protected $waterProcessor;
    protected $validationEngine;
    protected $tankGenerator;

    public function __construct(
        NutrientConverter $nutrientConverter,
        WaterAnalysisProcessor $waterProcessor,
        ValidationEngine $validationEngine,
        StockTankGenerator $tankGenerator
    ) {
        $this->nutrientConverter = $nutrientConverter;
        $this->waterProcessor = $waterProcessor;
        $this->validationEngine = $validationEngine;
        $this->tankGenerator = $tankGenerator;
    }

    public function optimize(array $targets, array $waterAnalysis, array $availableSoilNutrients, array $fertilizers, array $params): array
    {
        $netTargets = $this->waterProcessor->calculateNetTargets($targets, $waterAnalysis, $availableSoilNutrients);
        
        $doses = [];
        $achieved = [];
        
        // Initialize achieved with water and available soil nutrients
        foreach (['n', 'p', 'k', 'ca', 'mg', 's', 'fe', 'mn', 'zn', 'cu', 'b', 'mo', 'si'] as $n) {
            $achieved[$n] = ($waterAnalysis[$n] ?? 0) + ($availableSoilNutrients[$n] ?? 0);
        }

        $volumeLiters = $params['irrigation_volume_liters'] ?? 10000; // default 10m3

        // Normalize fertilizers
        $normalizedFertilizers = array_map([$this->nutrientConverter, 'convertOxidesToElemental'], $fertilizers);

        // MOCK HEURISTIC: Divide equally to demonstrate UI
        // In a real implementation, this would iteratively solve linear equations
        if (count($normalizedFertilizers) > 0) {
            foreach ($normalizedFertilizers as $fert) {
                // Apply 5kg of everything for testing the output
                $amount_kg = 5; 
                $doses[] = [
                    'id' => $fert['id'],
                    'name' => $fert['name'],
                    'amount_kg' => $amount_kg,
                    'cost' => $amount_kg * ($fert['price_per_unit'] ?? 0)
                ];
                
                foreach (['n', 'p', 'k', 'ca', 'mg', 's'] as $n) {
                    if (!empty($fert[$n])) {
                        // Formula: (kg * % / 100) * 1,000,000 mg / Liters = ppm
                        $ppm = ($amount_kg * ($fert[$n] / 100) * 1000000) / $volumeLiters;
                        $achieved[$n] += $ppm;
                    }
                }
            }
        }

        $warnings = $this->validationEngine->validateRecipe(['achieved' => $achieved]);
        $tanks = $this->tankGenerator->generateTanks($doses);

        return [
            'status' => 'success',
            'net_targets' => $netTargets,
            'achieved' => $achieved,
            'doses' => $doses,
            'tanks' => $tanks,
            'warnings' => $warnings,
            'total_cost' => array_sum(array_column($doses, 'cost')),
        ];
    }
}
