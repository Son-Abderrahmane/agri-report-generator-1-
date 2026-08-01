<?php
namespace App\Services\Fertigation;

class NutrientMapperService
{
    // Conversion factors: Oxide to Element
    const FACTORS = [
        'p2o5' => 0.4364, // P = P2O5 * 0.4364
        'k2o'  => 0.8302, // K = K2O * 0.8302
        'cao'  => 0.7147, // Ca = CaO * 0.7147
        'mgo'  => 0.6030, // Mg = MgO * 0.6030
        'so3'  => 0.4005, // S = SO3 * 0.4005
    ];

    // Map: Oxide -> Element
    const OXIDE_TO_ELEMENT = [
        'p2o5' => 'p',
        'k2o'  => 'k',
        'cao'  => 'ca',
        'mgo'  => 'mg',
        'so3'  => 's',
    ];

    // Map: Element -> Oxide
    const ELEMENT_TO_OXIDE = [
        'p'  => 'p2o5',
        'k'  => 'k2o',
        'ca' => 'cao',
        'mg' => 'mgo',
        's'  => 'so3',
    ];

    /**
     * Converts an array of nutrients (which may contain oxides) into pure elements.
     * Elements like 'n', 'fe', 'zn' are preserved.
     */
    public function convertToElements(array $nutrients): array
    {
        $elements = [];
        
        foreach ($nutrients as $key => $value) {
            $keyLower = strtolower($key);
            
            if (is_numeric($value)) {
                // If it's an oxide, convert to element
                if (isset(self::FACTORS[$keyLower])) {
                    $elementKey = self::OXIDE_TO_ELEMENT[$keyLower];
                    $elementValue = $value * self::FACTORS[$keyLower];
                    // Accumulate in case both oxide and element were provided (edge case)
                    $elements[$elementKey] = ($elements[$elementKey] ?? 0) + $elementValue;
                } else {
                    // If it's already an element or something else numeric, pass it through
                    $elements[$keyLower] = ($elements[$keyLower] ?? 0) + $value;
                }
            } else {
                // If it's not numeric (e.g. name, unit), just pass it through as is
                $elements[$keyLower] = $value;
            }
        }

        return $elements;
    }

    /**
     * Converts an array of elemental nutrients back to oxides where applicable.
     */
    public function convertToOxides(array $elements): array
    {
        $oxides = [];

        foreach ($elements as $key => $value) {
            $keyLower = strtolower($key);

            if (is_numeric($value)) {
                // If it's an element that has an oxide form, convert it
                if (isset(self::ELEMENT_TO_OXIDE[$keyLower])) {
                    $oxideKey = self::ELEMENT_TO_OXIDE[$keyLower];
                    $factor = self::FACTORS[$oxideKey];
                    $oxideValue = $value / $factor;
                    $oxides[$oxideKey] = ($oxides[$oxideKey] ?? 0) + $oxideValue;
                } else {
                    // E.g., 'n', 'fe', etc. remain unchanged
                    $oxides[$keyLower] = ($oxides[$keyLower] ?? 0) + $value;
                }
            } else {
                // Pass through non-numeric fields
                $oxides[$keyLower] = $value;
            }
        }

        return $oxides;
    }

    /**
     * Helper to process an array of fertilizers
     */
    public function convertFertilizersToElements(array $fertilizers): array
    {
        $mapped = [];
        foreach ($fertilizers as $fert) {
            $fertData = $fert;
            // The composition fields are part of the fertilizer array.
            // We need to convert p2o5 to p, k2o to k, etc.
            foreach (self::OXIDE_TO_ELEMENT as $oxide => $element) {
                if (isset($fert[$oxide]) && (float)$fert[$oxide] > 0) {
                    $fertData[$element] = $fert[$oxide] * self::FACTORS[$oxide];
                    // Option: Unset the oxide to keep it strictly elemental internally
                    unset($fertData[$oxide]);
                }
            }
            // Some databases might incorrectly have 'ca' storing 'cao' percentage.
            // The user requested we assume they are standard fertilizer labels (oxides).
            // So if a fertilizer already has 'ca' and no 'cao', it's ambiguous.
            // But we will strictly follow standard labels and the defined factors above.
            $mapped[] = $fertData;
        }
        return $mapped;
    }
}
