<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Fertilizer;
use App\Models\GrowthStage;
use App\Models\GrowthStageRecipe;
use App\Models\GrowthStageTarget;
use App\Models\WaterAnalysis;
use App\Models\SoilAnalysis;
use App\Models\OptimizationRun;
use App\Services\Fertigation\OptimizationServiceInterface;
use App\Services\Fertigation\SoilAvailabilityService;
use App\Services\Fertigation\NutrientMapperService;

class FertigationOptimizerController extends Controller
{
    protected $optimizer;
    protected $soilAvailabilityService;
    protected $mapper;

    public function __construct(
        OptimizationServiceInterface $optimizer,
        SoilAvailabilityService $soilAvailabilityService,
        NutrientMapperService $mapper
    ) {
        $this->optimizer = $optimizer;
        $this->soilAvailabilityService = $soilAvailabilityService;
        $this->mapper = $mapper;
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

    public function updateGrowthStage(Request $request, $id)
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

        $stage = GrowthStage::findOrFail($id);
        $stage->update($request->except('recipes'));

        if ($request->has('recipes')) {
            // Delete old recipes to recreate them simply
            $stage->recipes()->each(function ($r) {
                $r->targets()->delete();
                $r->delete();
            });

            foreach ($validated['recipes'] as $recipeData) {
                $recipe = $stage->recipes()->create(['name' => $recipeData['name'] ?? 'Default Recipe']);
                if (!empty($recipeData['targets'])) {
                    foreach ($recipeData['targets'] as $targetData) {
                        $recipe->targets()->create([
                            'nutrient' => strtolower($targetData['nutrient']),
                            'target_ppm' => $targetData['target_ppm']
                        ]);
                    }
                }
            }
        }

        return response()->json($stage->load('recipes.targets'));
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

    // --- Soil Analyses ---
    public function getSoilAnalyses()
    {
        return response()->json(SoilAnalysis::all());
    }

    public function createSoilAnalysis(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'crop_id' => 'nullable|integer'
        ]);
        $sa = SoilAnalysis::create($request->all());
        return response()->json($sa, 201);
    }

    public function updateSoilAnalysis(Request $request, $id)
    {
        $sa = SoilAnalysis::findOrFail($id);
        $sa->update($request->all());
        return response()->json($sa);
    }

    public function deleteSoilAnalysis($id)
    {
        SoilAnalysis::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // --- Optimization Engine Endpoint ---
    public function runOptimization(Request $request)
    {
        $validated = $request->validate([
            'recipe_id' => 'required|exists:growth_stage_recipes,id',
            'water_analysis_id' => 'nullable|exists:water_analyses,id',
            'soil_analysis_id' => 'nullable|exists:soil_analyses,id',
            'fertilizer_ids' => 'required|array',
            'fertilizer_ids.*' => 'exists:fertilizers,id',
            'area_ha' => 'required|numeric',
            'duration_days' => 'required|integer',
            'irrigation_volume_liters_day' => 'required|numeric',
            'nitrogen_balancer_id' => 'nullable|exists:fertilizers,id',
            'selection_strategy' => 'nullable|string',
            'strategy' => 'nullable|string',
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

        $availableSoilNutrients = [];
        $soilAnalysisData = [];
        if (!empty($validated['soil_analysis_id'])) {
            $saModel = SoilAnalysis::find($validated['soil_analysis_id']);
            if ($saModel) {
                $soilAnalysisData = $saModel->toArray();
                
                $strategy = $validated['strategy'] ?? 'sequential_uf';
                if ($strategy === 'sequential_uf') {
                    $availableSoilNutrients = $this->soilAvailabilityService->calculateAvailableNutrientsUF($soilAnalysisData);
                } else {
                    $availableSoilNutrients = $this->soilAvailabilityService->calculateAvailableNutrients($soilAnalysisData);
                }
            }
        }

        $fertilizers = Fertilizer::whereIn('id', $validated['fertilizer_ids'])->get()->toArray();

        // Use Option A: Assume targets entered by users are Oxides mathematically (e.g. Ca=10 means CaO=10)
        // Convert Targets, Water, Soil, and Fertilizers to strict elements before optimization
        $elementalTargets = $this->mapper->convertToElements($targets);
        $elementalWater = $this->mapper->convertToElements($waterAnalysis);
        $elementalSoil = $this->mapper->convertToElements($availableSoilNutrients);
        $elementalFertilizers = $this->mapper->convertFertilizersToElements($fertilizers);

        $params = [
            'area_ha' => $validated['area_ha'],
            'duration_days' => $validated['duration_days'],
            'irrigation_volume_liters_day' => $validated['irrigation_volume_liters_day'],
            'nitrogen_balancer_id' => $validated['nitrogen_balancer_id'] ?? null,
            'selection_strategy' => $validated['selection_strategy'] ?? 'highest_concentration',
            'strategy' => $validated['strategy'] ?? 'sequential_uf',
            'objective' => $validated['objective'] ?? 'target_accuracy',
        ];

        // Optimize using elemental structures
        $result = $this->optimizer->optimize($elementalTargets, $elementalWater, $elementalSoil, $elementalFertilizers, $params);

        // Convert the outputs back to oxides so the frontend displays them correctly
        if (isset($result['net_targets'])) {
            $result['net_targets'] = $this->mapper->convertToOxides($result['net_targets']);
        }
        if (isset($result['achieved'])) {
            $result['achieved'] = $this->mapper->convertToOxides($result['achieved']);
        }
        // Calculation trace keeps its step names (e.g., "Solve ca") but that's fine for debug info
        
        $inputs = [
            'targets' => $targets, // Keep original inputs for history
            'water' => $waterAnalysis,
            'soil_analysis_id' => $validated['soil_analysis_id'] ?? null,
            'available_soil_nutrients' => $availableSoilNutrients,
            'fertilizer_ids' => $validated['fertilizer_ids'],
            'params' => $params
        ];

        $run = OptimizationRun::create([
            'user_id' => auth()->id(),
            'crop_id' => $recipe->growth_stage_id ? GrowthStage::find($recipe->growth_stage_id)->crop_id : null,
            'recipe_id' => $recipe->id,
            'water_analysis_id' => $validated['water_analysis_id'] ?? null,
            'optimization_objective' => $params['objective'],
            'total_cost' => $result['total_cost'] ?? 0,
            'inputs_json' => $inputs,
            'results_json' => $result
        ]);

        $result['run_id'] = $run->id;
        $result['inputs_json'] = $inputs;

        return response()->json($result);
    }
    public function getCompatibilityRules()
    {
        $rules = \Illuminate\Support\Facades\DB::table('fertilizer_compatibility_rules')->get();
        return response()->json($rules);
    }
}
