<?php
namespace App\Services\Fertigation;

class WaterAnalysisProcessor
{
    public function calculateNetTargets(array $targets, array $waterAnalysis, array $availableSoilNutrients = []): array
    {
        $netTargets = [];
        foreach ($targets as $nutrient => $targetPpm) {
            $waterPpm = $waterAnalysis[strtolower($nutrient)] ?? 0;
            $soilPpm = $availableSoilNutrients[strtolower($nutrient)] ?? 0;
            $netTargets[$nutrient] = max(0, $targetPpm - $waterPpm - $soilPpm);
        }
        return $netTargets;
    }

    /**
     * Convert laboratory water analysis (mg/L) to UF/ha contribution based on irrigation volume.
     * 1 mg/L = 1 g/m3. Over X Liters (L/1000 = m3), the total grams is (mg/L * m3).
     * Total kg = grams / 1000.
     * So UF (kg/ha) contribution = (mg/L * totalLiters) / 1000000.
     */
    public function calculateNetTargetsUF(array $targets, array $waterAnalysis, array $availableSoilNutrients, float $totalLiters, float $areaHa): array
    {
        $netTargets = [];
        foreach ($targets as $nutrient => $targetUF) {
            $waterMgL = (float)($waterAnalysis[strtolower($nutrient)] ?? 0);
            
            // Soil nutrients typically come in mg/kg. The SoilAvailabilityService 
            // should have already converted them to a UF equivalent before passing them here,
            // or we do it here if it's returning kg/ha. Let's assume $availableSoilNutrients is already in UF/ha.
            $soilUF = (float)($availableSoilNutrients[strtolower($nutrient)] ?? 0);

            $waterUF = ($waterMgL * $totalLiters) / 1000000 / $areaHa;

            $netTargets[$nutrient] = max(0, (float)$targetUF - $waterUF - $soilUF);
        }
        return $netTargets;
    }
}
