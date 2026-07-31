<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Fertilizer;
use App\Models\GrowthStage;
use App\Models\GrowthStageRecipe;
use App\Models\GrowthStageTarget;
use App\Models\WaterAnalysis;
use App\Models\OptimizationRun;
use App\Services\Fertigation\OptimizationServiceInterface;

class FertigationOptimizerController extends Controller
{
    protected $optimizer;

    public function __construct(OptimizationServiceInterface $optimizer)
    {
        $this->optimizer = $optimizer;
    }

    // --- Fertilizers ---
    public function getFertilizers()
    {
        return response()->json(Fertilizer::all());
    }

    public function createFertilizer(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
        ]);
        $fert = Fertilizer::create($request->all());
        return response()->json($fert, 201);
    }

    public function updateFertilizer(Request $request, $id)
    {
        $fert = Fertilizer::findOrFail($id);
        $fert->update($request->all());
        return response()->json($fert);
    }

    public function deleteFertilizer($id)
    {
        Fertilizer::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // --- Growth Stages & Recipes ---
    public function getGrowthStages(Request $request)
    {
        $query = GrowthStage::with(['recipes.targets']);
        if ($request->has('crop_id')) {
            $query->where('crop_id', $request->crop_id);
        }
        return response()->json($query->orderBy('order_index')->get());
    }

    public function createGrowthStage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'crop_id' => 'required|integer',
            'duration_days' => 'nullable|integer',
            'target_ec_min' => 'nullable|numeric',
            'target_ec_max' => 'nullable|numeric',
            'target_ph_min' => 'nullable|numeric',
            'target_ph_max' => 'nullable|numeric',
            'order_index' => 'nullable|integer',
            'recipes' => 'nullable|array'
        ]);

        $stage = GrowthStage::create($request->except('recipes'));

        if (!empty($validated['recipes'])) {
            foreach ($validated['recipes'] as $recipeData) {
                $recipe = $stage->recipes()->create(['name' => $recipeData['name'] ?? 'Default Recipe']);
                if (!empty($recipeData['targets'])) {
                    foreach ($recipeData['targets'] as $targetData) {
                        $recipe->targets()->create([
                            'nutrient' => $targetData['nutrient'],
                            'target_ppm' => $targetData['target_ppm']
                        ]);
                    }
                }
            }
        }

        return response()->json($stage->load('recipes.targets'), 201);
    }

    public function deleteGrowthStage($id)
    {
        GrowthStage::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
    
    // --- Water Analyses ---
    public function getWaterAnalyses()
    {
        return response()->json(WaterAnalysis::all());
    }
    
    public function createWaterAnalysis(Request $request)
    {
        $wa = WaterAnalysis::create($request->all());
        return response()->json($wa, 201);
    }

    public function updateWaterAnalysis(Request $request, $id)
    {
        $wa = WaterAnalysis::findOrFail($id);
        $wa->update($request->all());
        return response()->json($wa);
    }

    public function deleteWaterAnalysis($id)
    {
        WaterAnalysis::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // --- Optimization Engine Endpoint ---
    public function runOptimization(Request $request)
    {
        $validated = $request->validate([
            'recipe_id' => 'required|exists:growth_stage_recipes,id',
            'water_analysis_id' => 'nullable|exists:water_analyses,id',
            'fertilizer_ids' => 'required|array',
            'fertilizer_ids.*' => 'exists:fertilizers,id',
            'irrigation_volume_liters' => 'required|numeric',
            'objective' => 'nullable|string',
        ]);

        $recipe = GrowthStageRecipe::with('targets')->findOrFail($validated['recipe_id']);
        $targets = [];
        foreach ($recipe->targets as $target) {
            $targets[strtolower($target->nutrient)] = (float)$target->target_ppm;
        }

        $waterAnalysis = [];
        if (!empty($validated['water_analysis_id'])) {
            $waModel = WaterAnalysis::find($validated['water_analysis_id']);
            $waterAnalysis = $waModel ? $waModel->toArray() : [];
        }

        $fertilizers = Fertilizer::whereIn('id', $validated['fertilizer_ids'])->get()->toArray();

        $params = [
            'irrigation_volume_liters' => $validated['irrigation_volume_liters'],
            'objective' => $validated['objective'] ?? 'target_accuracy',
        ];

        $result = $this->optimizer->optimize($targets, $waterAnalysis, $fertilizers, $params);

        $run = OptimizationRun::create([
            'user_id' => auth()->id(),
            'crop_id' => $recipe->growth_stage_id ? GrowthStage::find($recipe->growth_stage_id)->crop_id : null,
            'recipe_id' => $recipe->id,
            'water_analysis_id' => $validated['water_analysis_id'] ?? null,
            'optimization_objective' => $params['objective'],
            'total_cost' => $result['total_cost'] ?? 0,
            'inputs_json' => [
                'targets' => $targets,
                'water' => $waterAnalysis,
                'fertilizer_ids' => $validated['fertilizer_ids'],
                'params' => $params
            ],
            'results_json' => $result
        ]);

        $result['run_id'] = $run->id;

        return response()->json($result);
    }
}
