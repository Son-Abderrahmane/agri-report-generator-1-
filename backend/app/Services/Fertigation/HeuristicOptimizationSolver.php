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

        $macroNutrients = ['n', 'p', 'k', 'ca', 'mg', 's'];
        
        // Prepare targets (b_n)
        $b = [];
        foreach ($macroNutrients as $n) {
            $b[$n] = max(0, $netTargets[$n] ?? 0);
        }

        // Prepare matrix A_{f,n}
        $A = [];
        $x = []; // initial doses
        
        foreach ($normalizedFertilizers as $idx => $fert) {
            $A[$idx] = [];
            $x[$idx] = 0.0;
            foreach ($macroNutrients as $n) {
                $val = isset($fert[$n]) ? (float)$fert[$n] : 0.0;
                // A_{f,n} = PPM per 1 kg of fertilizer
                $A[$idx][$n] = ($val / 100.0) * 1000000.0 / $volumeLiters;
            }
        }

        // Coordinate Descent (NNLS)
        $maxIters = 5000;
        $tolerance = 0.0001;

        for ($iter = 0; $iter < $maxIters; $iter++) {
            $maxChange = 0.0;
            
            foreach ($normalizedFertilizers as $idx => $fert) {
                // Calculate R_n = b_n - sum_{j != idx} A_{j,n} * x_j
                $numerator = 0.0;
                $denominator = 0.0;
                
                foreach ($macroNutrients as $n) {
                    $A_fn = $A[$idx][$n];
                    if ($A_fn > 0) {
                        // Current achieved without f
                        $achievedWithoutF = 0.0;
                        foreach ($normalizedFertilizers as $jdx => $jfert) {
                            if ($jdx !== $idx) {
                                $achievedWithoutF += $A[$jdx][$n] * $x[$jdx];
                            }
                        }
                        
                        $R_n = $b[$n] - $achievedWithoutF;
                        
                        $numerator += $A_fn * $R_n;
                        $denominator += $A_fn * $A_fn;
                    }
                }
                
                if ($denominator > 0) {
                    $x_new = $numerator / $denominator;
                    $x_new = max(0.0, $x_new); // Non-negative constraint
                    
                    $change = abs($x[$idx] - $x_new);
                    $maxChange = max($maxChange, $change);
                    $x[$idx] = $x_new;
                }
            }
            
            if ($maxChange < $tolerance) {
                break;
            }
        }

        // Apply calculated doses
        foreach ($normalizedFertilizers as $idx => $fert) {
            $amount_kg = round($x[$idx], 2); // Round to 2 decimals (10g precision)
            
            if ($amount_kg > 0.01) { // Only include if more than 10g
                $doses[] = [
                    'id' => $fert['id'],
                    'name' => $fert['name'],
                    'amount_kg' => $amount_kg,
                    'cost' => $amount_kg * ((float)($fert['price_per_unit'] ?? 0))
                ];
                
                foreach ($macroNutrients as $n) {
                    if (!empty($fert[$n])) {
                        $ppm = ($amount_kg * ($fert[$n] / 100)) * 1000000 / $volumeLiters;
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
