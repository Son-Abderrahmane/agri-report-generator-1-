<?php
namespace App\Services\Fertigation;

class ValidationEngine
{
    public function validateRecipe(array $results): array
    {
        $warnings = [];
        
        $ca = $results['achieved']['ca'] ?? 0;
        $s = $results['achieved']['s'] ?? 0;
        $p = $results['achieved']['p'] ?? 0;
        
        // Precipitation risks
        if ($ca > 0 && $s > 0 && ($ca * $s) > 20000) {
            $warnings[] = "Risque de précipitation: Calcium et Sulfate élevés. Séparez-les dans les bacs A et B.";
        }
        if ($ca > 0 && $p > 0 && ($ca * $p) > 10000) { 
            $warnings[] = "Risque de précipitation: Calcium et Phosphore. Séparez-les dans les bacs A et B et maintenez un pH < 6.2.";
        }
        
        return $warnings;
    }
}
