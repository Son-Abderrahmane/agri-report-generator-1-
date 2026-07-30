<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use App\Models\Pesticide;
use App\Models\QuickFormula;
use App\Models\EvaluationTemplate;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    // --- Crops ---
    public function getCrops()
    {
        return response()->json(Crop::all());
    }

    public function storeCrop(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:crops']);
        $crop = Crop::create($validated);
        return response()->json($crop, 201);
    }

    public function updateCrop(Request $request, $id)
    {
        $crop = Crop::findOrFail($id);
        $validated = $request->validate(['name' => 'required|string|unique:crops,name,' . $id]);
        $crop->update($validated);
        return response()->json($crop);
    }

    public function destroyCrop($id)
    {
        Crop::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // --- Pesticides ---
    public function getPesticides()
    {
        return response()->json(Pesticide::all());
    }

    public function storePesticide(Request $request)
    {
        $validated = $request->validate([
            'crop_id' => 'nullable|exists:crops,id',
            'crop_name' => 'nullable|string',
            'target_pest' => 'nullable|string',
            'product_name' => 'required|string',
            'holder' => 'nullable|string',
            'supplier' => 'nullable|string',
            'registration_number' => 'nullable|string',
            'valid_until' => 'nullable|string',
            'dosage' => 'nullable|string',
        ]);
        $pesticide = Pesticide::create($validated);
        return response()->json($pesticide, 201);
    }

    public function importPesticides(Request $request)
    {
        $request->validate([
            'file' => 'required|file'
        ]);

        $path = $request->file('file')->getRealPath();

        if (!class_exists('\Spatie\SimpleExcel\SimpleExcelReader')) {
            return response()->json(['error' => 'Please install spatie/simple-excel via composer.'], 500);
        }

        $extension = $request->file('file')->getClientOriginalExtension();
        if (strtolower($extension) === 'xls') {
            return response()->json(['error' => "L'ancien format Excel (.xls) n'est pas supporté. Veuillez enregistrer votre fichier au format .xlsx ou .csv avant de l'importer."], 400);
        }

        try {
            $type = strtolower($extension);
            $rows = \Spatie\SimpleExcel\SimpleExcelReader::create($path, $type)->getRows();

            $importedCount = 0;
            $firstRowKeys = [];

            $rows->each(function(array $row) use (&$importedCount, &$firstRowKeys) {
                if (empty($firstRowKeys)) {
                    $firstRowKeys = array_keys($row);
                }

                // Normalize keys (remove spaces, accents, special chars, make lowercase)
                $normalizedRow = [];
                foreach ($row as $key => $value) {
                    // Basic transliteration for accents
                    $cleanKey = str_replace(
                        ['é','è','ê','ë','à','â','î','ï','ô','ö','ù','û','ü','ç'],
                        ['e','e','e','e','a','a','i','i','o','o','u','u','u','c'],
                        mb_strtolower(trim($key))
                    );
                    $normKey = preg_replace('/[^a-z0-9]/', '', $cleanKey);
                    
                    // Handle dynamic export numbers like "Produits (92)"
                    if (str_starts_with($normKey, 'produit')) {
                        $normalizedRow['produit'] = $value;
                    }
                    if (str_starts_with($normKey, 'culture')) {
                        $normalizedRow['culture'] = $value;
                    }
                    
                    $normalizedRow[$normKey] = $value;
                }

                $cropName = $normalizedRow['culture'] ?? $normalizedRow['cultures'] ?? null;
                $productName = $normalizedRow['produit'] ?? $normalizedRow['produits'] ?? $normalizedRow['nomcommercial'] ?? $normalizedRow['specialitecommerciale'] ?? $normalizedRow['specialite'] ?? null;
                $targetPest = $normalizedRow['cible'] ?? $normalizedRow['cibles'] ?? $normalizedRow['bioagresseur'] ?? $normalizedRow['maladie'] ?? $normalizedRow['ravageur'] ?? $normalizedRow['usage'] ?? null;
                $activeIngredient = $normalizedRow['matiereactive'] ?? $normalizedRow['matieresactives'] ?? $normalizedRow['activeingredient'] ?? null;
                $dosage = $normalizedRow['dose'] ?? $normalizedRow['dosage'] ?? $normalizedRow['dosedemploi'] ?? null;
                
                $holder = $normalizedRow['detenteur'] ?? $normalizedRow['societe'] ?? $normalizedRow['titulaire'] ?? null;
                $supplier = $normalizedRow['fournisseur'] ?? $normalizedRow['distributeur'] ?? null;
                $regNumber = $normalizedRow['numerohomologation'] ?? $normalizedRow['homologation'] ?? $normalizedRow['numhomologation'] ?? null;
                $validUntil = $normalizedRow['valablejusquau'] ?? $normalizedRow['validite'] ?? $normalizedRow['datefinoctroi'] ?? null;

                if ($productName) {
                    $cropId = null;
                    if ($cropName) {
                        $crop = \App\Models\Crop::firstOrCreate(['name' => trim($cropName)]);
                        $cropId = $crop->id;
                    }

                    $pesticide = Pesticide::firstOrCreate([
                        'product_name' => trim($productName),
                        'crop_name' => $cropName ? trim($cropName) : null,
                        'target_pest' => $targetPest ? trim($targetPest) : null,
                    ], [
                        'crop_id' => $cropId,
                        'active_ingredient' => $activeIngredient,
                        'dosage' => $dosage,
                        'holder' => $holder,
                        'supplier' => $supplier,
                        'registration_number' => $regNumber,
                        'valid_until' => $validUntil,
                    ]);
                    
                    if ($pesticide->wasRecentlyCreated) {
                        $importedCount++;
                    }
                }
            });

            if ($importedCount === 0 && !empty($firstRowKeys)) {
                $keysStr = implode(', ', $firstRowKeys);
                return response()->json([
                    'error' => "0 produit importé. Les colonnes détectées sont : [{$keysStr}]. Si vous voyez toutes les colonnes collées ensemble, c'est un problème de séparateur CSV."
                ], 400);
            }

            return response()->json(['message' => "Imported {$importedCount} pesticides successfully."]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la lecture du fichier: ' . $e->getMessage()], 500);
        }
    }

    public function updatePesticide(Request $request, $id)
    {
        $pesticide = Pesticide::findOrFail($id);
        $validated = $request->validate([
            'crop_id' => 'nullable|exists:crops,id',
            'crop_name' => 'nullable|string',
            'target_pest' => 'nullable|string',
            'product_name' => 'required|string',
            'holder' => 'nullable|string',
            'supplier' => 'nullable|string',
            'registration_number' => 'nullable|string',
            'valid_until' => 'nullable|string',
            'dosage' => 'nullable|string',
        ]);
        $pesticide->update($validated);
        return response()->json($pesticide);
    }

    public function destroyPesticide($id)
    {
        Pesticide::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function deleteAllPesticides()
    {
        Pesticide::truncate();
        return response()->json(['message' => 'Tous les produits ont été supprimés avec succès.']);
    }

    // --- Quick Formulas ---
    public function getQuickFormulas()
    {
        return response()->json(QuickFormula::all());
    }

    public function storeQuickFormula(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'title' => 'nullable|string',
            'content' => 'required|string',
        ]);
        $formula = QuickFormula::create($validated);
        return response()->json($formula, 201);
    }

    public function updateQuickFormula(Request $request, $id)
    {
        $formula = QuickFormula::findOrFail($id);
        $validated = $request->validate([
            'category' => 'required|string',
            'title' => 'nullable|string',
            'content' => 'required|string',
        ]);
        $formula->update($validated);
        return response()->json($formula);
    }

    public function destroyQuickFormula($id)
    {
        QuickFormula::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // --- Evaluation Templates ---
    public function getEvaluationTemplates()
    {
        return response()->json(EvaluationTemplate::all());
    }

    public function storeEvaluationTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'risk_level' => 'required|string',
            'condition_explanation' => 'nullable|string',
            'preventive_action' => 'nullable|string',
            'report_sentence' => 'nullable|string',
        ]);
        $template = EvaluationTemplate::create($validated);
        return response()->json($template, 201);
    }

    public function updateEvaluationTemplate(Request $request, $id)
    {
        $template = EvaluationTemplate::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'risk_level' => 'required|string',
            'condition_explanation' => 'nullable|string',
            'preventive_action' => 'nullable|string',
            'report_sentence' => 'nullable|string',
        ]);
        $template->update($validated);
        return response()->json($template);
    }

    public function destroyEvaluationTemplate($id)
    {
        EvaluationTemplate::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
