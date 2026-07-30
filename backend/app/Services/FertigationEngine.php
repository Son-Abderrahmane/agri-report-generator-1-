<?php

namespace App\Services;

class FertigationEngine
{
    // Stoichiometric conversion factors to elemental forms
    const FACTORS = [
        'P' => 0.4364, // P2O5 to P
        'K' => 0.8302, // K2O to K
        'Ca' => 0.7147, // CaO to Ca
        'Mg' => 0.6031, // MgO to Mg
        'S' => 0.4005, // SO3 to S
    ];

    // Priority weights (W)
    const WEIGHTS = [
        'P' => 10,
        'Ca' => 8,
        'K' => 5,
        'N' => 3,
        'Mg' => 1,
        'S' => 1,
        'Fe' => 1,
    ];

    /**
     * Converts oxides to pure elements in the target requirement.
     */
    public function convertRequirements(array $requirements)
    {
        $converted = [];
        foreach ($requirements as $element => $value) {
            $value = floatval($value);
            if (isset(self::FACTORS[$element])) {
                $converted[$element] = $value * self::FACTORS[$element];
            } else {
                $converted[$element] = $value;
            }
        }
        return $converted;
    }

    /**
     * Calculate Net Requirement (B_net)
     * $B_{net,j} = \max(0, N_{cible,j} - (E_{eau,j} \times \eta))$
     */
    public function calculateNetRequirements(array $target, array $waterRaw, float $efficiency = 1.0)
    {
        $net = [];
        foreach ($target as $element => $val) {
            $waterVal = $waterRaw[$element] ?? 0;
            $net[$element] = max(0, $val - ($waterVal * $efficiency));
        }
        return $net;
    }

    /**
     * Solves the optimization problem using Coordinate Descent for Non-Negative Least Squares with L1 Regularization.
     * min ||W(Ax - B_net)||^2 + \lambda ||Cx||_1
     * 
     * $A: Composition matrix of fertilizers [fertilizer_id => [element => percentage, ...]]
     * $B_net: Net requirements [element => target_value]
     * $C: Cost/penalty vector [fertilizer_id => cost]
     */
    public function solveNNLS(array $A, array $B_net, array $C = [], float $lambda = 0.01, int $maxIters = 10000, float $tol = 1e-6)
    {
        $fertilizers = array_keys($A);
        $elements = array_keys($B_net);
        
        $n = count($fertilizers);
        if ($n === 0) return [];
        
        // Initialize x (mass of each fertilizer)
        $x = array_fill_keys($fertilizers, 0.0);
        
        // Weight matrix formulation
        $W = [];
        foreach ($elements as $el) {
            $W[$el] = self::WEIGHTS[$el] ?? 1.0;
        }

        // Coordinate descent loop
        for ($iter = 0; $iter < $maxIters; $iter++) {
            $maxDiff = 0;
            
            foreach ($fertilizers as $j) {
                $old_xj = $x[$j];
                
                // Calculate current residual for elements: r_i = B_i - \sum_{k \neq j} A_{ik} x_k
                // Since we update in place, we can just use the prediction error: err = A*x - B
                $err = [];
                foreach ($elements as $el) {
                    $pred = 0;
                    foreach ($fertilizers as $k) {
                        $composition = $A[$k][$el] ?? 0;
                        $pred += $composition * $x[$k];
                    }
                    $err[$el] = $pred - $B_net[$el];
                }

                // Update x_j
                // numerator = \sum_i W_i^2 A_{ij} (B_i - \sum_{k \neq j} A_{ik} x_k)
                //           = \sum_i W_i^2 A_{ij} (B_i - (pred_i - A_{ij} x_j))
                // denominator = \sum_i W_i^2 A_{ij}^2
                
                $numerator = 0;
                $denominator = 0;
                
                foreach ($elements as $el) {
                    $w2 = $W[$el] * $W[$el];
                    $A_ij = $A[$j][$el] ?? 0;
                    
                    if ($A_ij > 0) {
                        $denominator += $w2 * $A_ij * $A_ij;
                        // err[el] currently includes A_ij * old_xj. 
                        // So (B_i - \sum_{k \neq j} ...) is actually - (err[el] - A_ij * old_xj)
                        $residual_excluding_j = -($err[$el] - $A_ij * $old_xj);
                        $numerator += $w2 * $A_ij * $residual_excluding_j;
                    }
                }
                
                $cost_j = $C[$j] ?? 1.0;
                $numerator -= $lambda * $cost_j;

                if ($denominator > 1e-9) {
                    $new_xj = $numerator / $denominator;
                } else {
                    $new_xj = 0;
                }
                
                // Non-negative constraint
                $x[$j] = max(0, $new_xj);
                
                $maxDiff = max($maxDiff, abs($x[$j] - $old_xj));
            }
            
            if ($maxDiff < $tol) {
                break;
            }
        }

        // Apply Ammonium constraint: NH4 <= 0.15 * N_total
        // This is a post-processing heuristic since strict linear constraint requires LP solver.
        $total_nh4 = 0;
        $total_n = 0;
        foreach ($fertilizers as $j) {
            $nh4 = $A[$j]['NH4'] ?? 0;
            $n_tot = $A[$j]['N'] ?? 0;
            $total_nh4 += $nh4 * $x[$j];
            $total_n += $n_tot * $x[$j];
        }
        
        if ($total_n > 0 && $total_nh4 > 0.15 * $total_n) {
            $allowed_nh4 = 0.15 * $total_n;
            $ratio = $allowed_nh4 / $total_nh4;
            // Scale down fertilizers containing NH4
            foreach ($fertilizers as $j) {
                $nh4 = $A[$j]['NH4'] ?? 0;
                if ($nh4 > 0) {
                    $x[$j] *= $ratio;
                }
            }
        }

        // Round results
        foreach ($x as $j => $val) {
            if ($val < 0.01) {
                $x[$j] = 0;
            } else {
                $x[$j] = round($val, 3);
            }
        }

        return $x;
    }

    /**
     * Tank logic categorization.
     */
    public function separateTanks(array $fertilizers)
    {
        $tankA = [];
        $tankB = [];
        $tankC = [];

        foreach ($fertilizers as $name => $amount) {
            if ($amount <= 0) continue;

            $nameLower = strtolower($name);
            // Tank A: Calcium & Iron
            if (strpos($nameLower, 'calcium') !== false || strpos($nameLower, 'fer') !== false || strpos($nameLower, 'fe') !== false) {
                $tankA[$name] = $amount;
            }
            // Tank C: Acids
            elseif (strpos($nameLower, 'acide') !== false || strpos($nameLower, 'acid') !== false) {
                $tankC[$name] = $amount;
            }
            // Tank B: Phosphates, Sulfates, everything else
            else {
                $tankB[$name] = $amount;
            }
        }

        return [
            'A' => $tankA,
            'B' => $tankB,
            'C' => $tankC,
        ];
    }

    /**
     * Marion-Babcock / McNeal EC Approximation
     * EC (dS/m) ~ sum(C_meq/L * lambda) / 100
     */
    public function estimateEC(array $solution_meq)
    {
        // Equivalent conductivities (lambda) for common ions roughly at 25C
        $lambdas = [
            'Ca' => 5.95,
            'Mg' => 5.3,
            'K'  => 7.35,
            'Na' => 5.0,
            'NO3'=> 7.14,
            'SO4'=> 8.0,
            'Cl' => 7.63,
            'H2PO4' => 3.3, // Approximate
        ];

        $ec = 0;
        foreach ($solution_meq as $ion => $meq) {
            $l = $lambdas[$ion] ?? 5.0; // Default average lambda if unknown
            $ec += $meq * $l;
        }

        return round($ec / 100, 2);
    }
}
