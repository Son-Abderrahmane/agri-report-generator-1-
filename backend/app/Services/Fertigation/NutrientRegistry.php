<?php
namespace App\Services\Fertigation;

class NutrientRegistry
{
    /**
     * Get the default sequential priority for nutrients.
     * Everything is now processed as elements.
     */
    public function getDefaultPriority(): array
    {
        return [
            'p',    // Phosphorus
            'ca',   // Calcium
            'k',    // Potassium
            'n',    // Nitrogen (Often supplied by Ca, P, K fertilizers, adjusted later)
            'mg',   // Magnesium
            's',    // Sulfur
            'fe',   // Iron
            'mn',   // Manganese
            'zn',   // Zinc
            'cu',   // Copper
            'b',    // Boron
            'mo',   // Molybdenum
            'si'    // Silicon
        ];
    }

    /**
     * Check if a nutrient is a macronutrient
     */
    public function isMacro(string $nutrient): bool
    {
        return in_array(strtolower($nutrient), ['n', 'p', 'k', 'ca', 'mg', 's']);
    }

    /**
     * Check if a nutrient is a micronutrient
     */
    public function isMicro(string $nutrient): bool
    {
        return in_array(strtolower($nutrient), ['fe', 'mn', 'zn', 'cu', 'b', 'mo', 'si']);
    }

    /**
     * Oxide map is no longer needed in the solver because all mapping
     * is handled centrally by the NutrientMapperService before and after optimization.
     */
    public function getOxideMap(): array
    {
        return [];
    }
}
