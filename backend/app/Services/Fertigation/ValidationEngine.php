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

    public function validateRecipeUF(array $targets, array $achievedUF, array $doses, array $fertilizers): array
    {
        $warnings = [];

        // 1. Nitrogen Excess check
        $targetN = $targets['n'] ?? 0;
        $achievedN = $achievedUF['n'] ?? 0;
        if ($targetN > 0 && $achievedN > $targetN * 1.1) {
            $warnings[] = "Excès d'azote: L'apport calculé (" . round($achievedN, 1) . " UF) dépasse la recommandation de plus de 10%.";
        }

        // 2. High EC Risk (rough estimate based on total UF)
        $totalUF = array_sum($achievedUF);
        if ($totalUF > 100) { // arbitrary threshold for weekly high load
            $warnings[] = "Risque d'EC élevée: La charge totale d'engrais est importante. Surveillez la conductivité (EC) de la solution fille.";
        }

        // 3. Ca:P Ratio
        $ca = $achievedUF['cao'] ?? ($achievedUF['ca'] ?? 0);
        $p = $achievedUF['p2o5'] ?? ($achievedUF['p'] ?? 0);
        if ($p > 0 && ($ca / $p) < 0.5) {
            $warnings[] = "Déséquilibre Ca:P: Le ratio Calcium/Phosphore est très bas. Cela peut limiter le développement racinaire.";
        }

        // 4. K:Mg Ratio
        $k = $achievedUF['k2o'] ?? ($achievedUF['k'] ?? 0);
        $mg = $achievedUF['mgo'] ?? ($achievedUF['mg'] ?? 0);
        if ($mg > 0 && ($k / $mg) > 5) {
            $warnings[] = "Déséquilibre K:Mg: Un excès de Potassium peut bloquer l'absorption du Magnésium (antagonisme).";
        }

        return $warnings;
    }
}
