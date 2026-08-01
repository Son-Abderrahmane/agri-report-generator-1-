<?php
namespace App\Services\Fertigation;

class SoilAvailabilityService
{
    /**
     * Default availability coefficients for nutrients in the soil.
     * N = 40%, P = 20%, K = 50%
     */
    protected $defaultCoefficients = [
        'n' => 0.40,
        'p' => 0.20,
        'k' => 0.50,
        'ca' => 0.30,
        'mg' => 0.30,
        's' => 0.50,
        'fe' => 0.10,
        'mn' => 0.10,
        'zn' => 0.10,
        'cu' => 0.10,
        'b' => 0.20,
        'mo' => 0.10,
        'si' => 0.10
    ];

    /**
     * Calculate the nutrients that are actually available to the plant from the soil.
     * 
     * @param array $soilAnalysis The raw soil analysis values
     * @return array Available nutrients (e.g. ['n' => 12.5, 'p' => 4.0, ...])
     */
    public function calculateAvailableNutrients(array $soilAnalysis): array
    {
        if (empty($soilAnalysis)) {
            return [];
        }

        $available = [];
        $customCoefficients = $soilAnalysis['availability_coefficients'] ?? [];

        foreach ($this->defaultCoefficients as $nutrient => $defaultCoef) {
            $rawAmount = $soilAnalysis[$nutrient] ?? 0;
            
            // Use custom coefficient if provided, otherwise default
            $coef = $customCoefficients[$nutrient] ?? $defaultCoef;
            
            // For MVP: We assume the rawAmount (often mg/kg or ppm) translates
            // directly to solution ppm after applying the coefficient.
            // In a more advanced model, this would factor in bulk density, depth, moisture, etc.
            $available[$nutrient] = $rawAmount * $coef;
        }

        return $available;
    }

    /**
     * Calculate available nutrients in UF/ha.
     * Assumes typical topsoil weight of ~2,000,000 kg/ha.
     * 1 mg/kg in 2,000,000 kg soil = 2 kg/ha = 2 UF/ha.
     */
    public function calculateAvailableNutrientsUF(array $soilAnalysis): array
    {
        if (empty($soilAnalysis)) {
            return [];
        }

        $availableUF = [];
        $customCoefficients = $soilAnalysis['availability_coefficients'] ?? [];

        foreach ($this->defaultCoefficients as $nutrient => $defaultCoef) {
            $rawAmount = $soilAnalysis[$nutrient] ?? 0; // typically mg/kg
            $coef = $customCoefficients[$nutrient] ?? $defaultCoef;
            
            // Soil bulk density conversion: 1 mg/kg * 2 = 2 kg/ha
            $availableUF[$nutrient] = ($rawAmount * 2) * $coef;
        }

        return $availableUF;
    }
}
