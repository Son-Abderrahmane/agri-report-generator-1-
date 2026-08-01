<?php
namespace App\Services\Fertigation;

class NutrientRegistry
{
    /**
     * Get the default sequential priority for nutrients.
     * Order matters: primary macros, secondary macros, then micros.
     */
    public function getDefaultPriority(): array
    {
        return [
            'p2o5', // Phosphorus (Oxide)
            'p',    // Phosphorus (Elemental fallback)
            'cao',  // Calcium (Oxide)
            'ca',   // Calcium (Elemental fallback)
            'k2o',  // Potassium (Oxide)
            'k',    // Potassium (Elemental fallback)
            'n',    // Nitrogen (Often supplied by Ca, P, K fertilizers, adjusted later)
            'mgo',  // Magnesium (Oxide)
            'mg',   // Magnesium (Elemental fallback)
            'so3',  // Sulfur (Oxide)
            's',    // Sulfur (Elemental fallback)
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
        return in_array(strtolower($nutrient), ['n', 'p', 'p2o5', 'k', 'k2o', 'ca', 'cao', 'mg', 'mgo', 's', 'so3']);
    }

    /**
     * Check if a nutrient is a micronutrient
     */
    public function isMicro(string $nutrient): bool
    {
        return in_array(strtolower($nutrient), ['fe', 'mn', 'zn', 'cu', 'b', 'mo', 'si']);
    }

    /**
     * Define compatible mapping for elements vs oxides to avoid double solving
     */
    public function getOxideMap(): array
    {
        return [
            'p' => 'p2o5',
            'k' => 'k2o',
            'ca' => 'cao',
            'mg' => 'mgo',
            's' => 'so3'
        ];
    }
}
