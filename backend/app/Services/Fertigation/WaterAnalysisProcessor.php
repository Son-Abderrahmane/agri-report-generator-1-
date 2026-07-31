<?php
namespace App\Services\Fertigation;

class WaterAnalysisProcessor
{
    public function calculateNetTargets(array $targets, array $waterAnalysis): array
    {
        $netTargets = [];
        foreach ($targets as $nutrient => $targetPpm) {
            $waterPpm = $waterAnalysis[strtolower($nutrient)] ?? 0;
            $netTargets[$nutrient] = max(0, $targetPpm - $waterPpm);
        }
        return $netTargets;
    }
}
