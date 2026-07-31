<?php
namespace App\Services\Fertigation;

class NutrientConverter
{
    // Oxide to elemental conversion factors
    const P2O5_TO_P = 0.4364;
    const K2O_TO_K = 0.8302;
    const CAO_TO_CA = 0.7147;
    const MGO_TO_MG = 0.6030;
    const SO3_TO_S = 0.4005;

    public function convertOxidesToElemental(array $fertilizer): array
    {
        // Convert P2O5 to P if P is missing
        if (!empty($fertilizer['p2o5']) && $fertilizer['p2o5'] > 0 && empty($fertilizer['p'])) {
            $fertilizer['p'] = $fertilizer['p2o5'] * self::P2O5_TO_P;
        }
        // Convert K2O to K if K is missing
        if (!empty($fertilizer['k2o']) && $fertilizer['k2o'] > 0 && empty($fertilizer['k'])) {
            $fertilizer['k'] = $fertilizer['k2o'] * self::K2O_TO_K;
        }
        return $fertilizer;
    }
}
