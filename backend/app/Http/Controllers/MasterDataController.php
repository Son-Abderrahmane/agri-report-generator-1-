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
            'file' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        $path = $request->file('file')->getRealPath();

        if (!class_exists('\Spatie\SimpleExcel\SimpleExcelReader')) {
            return response()->json(['error' => 'Please install spatie/simple-excel via composer.'], 500);
        }

        $rows = \Spatie\SimpleExcel\SimpleExcelReader::create($path)->getRows();

        $importedCount = 0;
        $rows->each(function(array $row) use (&$importedCount) {
            $cropName = $row['Culture'] ?? $row['culture'] ?? null;
            $productName = $row['Produits'] ?? $row['produits'] ?? $row['Produit'] ?? null;
            $targetPest = $row['Cible'] ?? $row['cible'] ?? null;
            $activeIngredient = $row['Matière Active'] ?? $row['matiere_active'] ?? $row['Active Ingredient'] ?? null;
            $dosage = $row['Dosage'] ?? $row['dosage'] ?? null;
            
            $holder = $row['Détenteur'] ?? $row['detenteur'] ?? null;
            $supplier = $row['Fournisseur'] ?? $row['fournisseur'] ?? null;
            $regNumber = $row['Numéro homologation'] ?? $row['numero_homologation'] ?? null;
            $validUntil = $row['Valable jusqu\'au'] ?? $row['valable_jusqu_au'] ?? null;

            if ($productName) {
                $cropId = null;
                if ($cropName) {
                    $crop = \App\Models\Crop::firstOrCreate(['name' => trim($cropName)]);
                    $cropId = $crop->id;
                }

                Pesticide::updateOrCreate([
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
                $importedCount++;
            }
        });

        return response()->json(['message' => "Imported {$importedCount} pesticides successfully."]);
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
