<?php
namespace App\Services\Fertigation;

class SequentialUFSolver implements OptimizationServiceInterface
{
    protected $nutrientRegistry;
    protected $waterProcessor;
    protected $validationEngine;
    protected $tankGenerator;

    public function __construct(
        NutrientRegistry $nutrientRegistry,
        WaterAnalysisProcessor $waterProcessor,
        ValidationEngine $validationEngine,
        StockTankGenerator $tankGenerator
    ) {
        $this->nutrientRegistry = $nutrientRegistry;
        $this->waterProcessor = $waterProcessor;
        $this->validationEngine = $validationEngine;
        $this->tankGenerator = $tankGenerator;
    }

    public function optimize(array $targets, array $waterAnalysis, array $availableSoilNutrients, array $fertilizers, array $params): array
    {
        $areaHa = (float)($params['area_ha'] ?? 1.0);
        $durationDays = (int)($params['duration_days'] ?? 7);
        $irrigationLitersPerDayHa = (float)($params['irrigation_volume_liters_day'] ?? 10000);
        
        $strategy = $params['selection_strategy'] ?? 'highest_concentration';
        $nitrogenBalancerId = $params['nitrogen_balancer_id'] ?? null;

        $totalLiters = $irrigationLitersPerDayHa * $areaHa * $durationDays;

        // Step 1: Water & Soil Conversion to UF Offsets
        $netTargets = $this->waterProcessor->calculateNetTargetsUF($targets, $waterAnalysis, $availableSoilNutrients, $totalLiters, $areaHa);

        $doses = [];
        $achievedUF = [];
        $calculationTrace = [];

        foreach ($targets as $nutrient => $val) {
            $achievedUF[$nutrient] = 0.0;
        }

        $remainingTargets = $netTargets;
        $selectedFertilizersDoses = [];

        // Step 2: Sequential Calculation
        $priorityList = $this->nutrientRegistry->getDefaultPriority();
        $oxideMap = $this->nutrientRegistry->getOxideMap();
        $elementMap = array_flip($oxideMap);

        foreach ($priorityList as $nutrient) {
            if ($nutrient === 'n') {
                continue; // Nitrogen is balanced at the end
            }

            if (!isset($remainingTargets[$nutrient]) || $remainingTargets[$nutrient] <= 0) {
                continue;
            }

            $targetUF = $remainingTargets[$nutrient];
            $bestFertilizer = $this->selectFertilizer($fertilizers, $nutrient, $strategy);

            if ($bestFertilizer) {
                $percentage = (float)($bestFertilizer[$nutrient] ?? 0);
                if ($percentage > 0) {
                    $doseKg = $targetUF / ($percentage / 100);
                    $doseKg = round($doseKg, 2);

                    if ($doseKg > 0) {
                        $fertId = $bestFertilizer['id'];
                        if (!isset($selectedFertilizersDoses[$fertId])) {
                            $selectedFertilizersDoses[$fertId] = 0;
                        }
                        $selectedFertilizersDoses[$fertId] += $doseKg;

                        $traceStep = [
                            'step' => "Solve $nutrient",
                            'target_uf' => round($targetUF, 2),
                            'fertilizer' => $bestFertilizer['name'],
                            'dose_kg' => $doseKg,
                            'contributions' => []
                        ];

                        // Add secondary contributions
                        foreach ($bestFertilizer as $key => $val) {
                            if ($this->nutrientRegistry->isMacro($key) || $this->nutrientRegistry->isMicro($key)) {
                                $perc = (float)$val;
                                if ($perc > 0) {
                                    $contributionUF = $doseKg * ($perc / 100);
                                    $achievedUF[$key] = ($achievedUF[$key] ?? 0) + $contributionUF;
                                    $remainingTargets[$key] = max(0, ($remainingTargets[$key] ?? 0) - $contributionUF);
                                    
                                    // if it's an oxide, also reduce the elemental counterpart
                                    if (isset($elementMap[$key])) {
                                        $remainingTargets[$elementMap[$key]] = max(0, ($remainingTargets[$elementMap[$key]] ?? 0) - $contributionUF);
                                    }
                                    if (isset($oxideMap[$key])) {
                                        $remainingTargets[$oxideMap[$key]] = max(0, ($remainingTargets[$oxideMap[$key]] ?? 0) - $contributionUF);
                                    }
                                    
                                    $traceStep['contributions'][$key] = round($contributionUF, 2);
                                }
                            }
                        }
                        $calculationTrace[] = $traceStep;
                    }
                }
            }
        }

        // Step 4: Nitrogen Balance
        $remainingN = $remainingTargets['n'] ?? 0;
        if ($remainingN > 0 && $nitrogenBalancerId) {
            $balancer = collect($fertilizers)->firstWhere('id', $nitrogenBalancerId);
            if ($balancer && isset($balancer['n']) && (float)$balancer['n'] > 0) {
                $percentage = (float)$balancer['n'];
                $doseKg = $remainingN / ($percentage / 100);
                $doseKg = round($doseKg, 2);

                if ($doseKg > 0) {
                    $fertId = $balancer['id'];
                    if (!isset($selectedFertilizersDoses[$fertId])) {
                        $selectedFertilizersDoses[$fertId] = 0;
                    }
                    $selectedFertilizersDoses[$fertId] += $doseKg;

                    $traceStep = [
                        'step' => "Solve n (Balance)",
                        'target_uf' => round($remainingN, 2),
                        'fertilizer' => $balancer['name'],
                        'dose_kg' => $doseKg,
                        'contributions' => []
                    ];

                    foreach ($balancer as $key => $val) {
                        if ($this->nutrientRegistry->isMacro($key) || $this->nutrientRegistry->isMicro($key)) {
                            $perc = (float)$val;
                            if ($perc > 0) {
                                $contributionUF = $doseKg * ($perc / 100);
                                $achievedUF[$key] = ($achievedUF[$key] ?? 0) + $contributionUF;
                                $traceStep['contributions'][$key] = round($contributionUF, 2);
                            }
                        }
                    }
                    $calculationTrace[] = $traceStep;
                }
            }
        }

        // Step 5: Format Output
        $doses = [];
        $totalCost = 0;
        foreach ($selectedFertilizersDoses as $fertId => $amountKg) {
            $fert = collect($fertilizers)->firstWhere('id', $fertId);
            $type = $fert['type'] ?? 'Solid';
            $density = (float)($fert['density'] ?? 1.0);
            $density = $density > 0 ? $density : 1.0;
            $unit = $fert['unit'] ?? 'kg';

            $amountToDisplay = $amountKg;
            if (strtolower($unit) === 'l') {
                $amountToDisplay = $amountKg / $density;
            } elseif (strtolower($unit) === 'ml') {
                $amountToDisplay = ($amountKg / $density) * 1000;
            }

            $cost = $amountToDisplay * (float)($fert['price_per_unit'] ?? 0);
            $totalCost += $cost;

            $doses[] = [
                'id' => $fertId,
                'name' => $fert['name'],
                'amount' => round($amountToDisplay, 2),
                'unit' => $unit,
                'cost' => round($cost, 2),
                'per_ha_day' => round($amountToDisplay / $areaHa / $durationDays, 2),
                'per_ha_week' => round(($amountToDisplay / $areaHa / $durationDays) * 7, 2),
                'per_ha_month' => round(($amountToDisplay / $areaHa / $durationDays) * 30, 2),
                'total_amount' => round($amountToDisplay, 2),
            ];
        }

        $warnings = $this->validationEngine->validateRecipeUF($targets, $achievedUF, $doses, $fertilizers);
        $tanks = $this->tankGenerator->generateTanksDynamic($doses, $fertilizers);

        return [
            'status' => 'success',
            'net_targets' => $netTargets,
            'achieved' => $achievedUF,
            'doses' => $doses,
            'tanks' => $tanks,
            'warnings' => $warnings,
            'total_cost' => round($totalCost, 2),
            'calculation_trace' => $calculationTrace,
            'inputs_json' => [
                'area_ha' => $areaHa,
                'duration_days' => $durationDays,
                'strategy' => $strategy
            ]
        ];
    }

    protected function selectFertilizer(array $fertilizers, string $nutrient, string $strategy)
    {
        $validFertilizers = array_filter($fertilizers, function($f) use ($nutrient) {
            return isset($f[$nutrient]) && (float)$f[$nutrient] > 0;
        });

        if (empty($validFertilizers)) return null;

        if ($strategy === 'lowest_cost') {
            usort($validFertilizers, function($a, $b) use ($nutrient) {
                $costA = (float)($a['price_per_unit'] ?? 0) / (float)$a[$nutrient];
                $costB = (float)($b['price_per_unit'] ?? 0) / (float)$b[$nutrient];
                return $costA <=> $costB;
            });
        } else {
            // Default: Highest concentration
            usort($validFertilizers, function($a, $b) use ($nutrient) {
                return (float)$b[$nutrient] <=> (float)$a[$nutrient];
            });
        }

        return reset($validFertilizers);
    }
}
