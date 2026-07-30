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
