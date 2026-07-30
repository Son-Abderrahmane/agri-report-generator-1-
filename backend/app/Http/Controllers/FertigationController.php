<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FertigationEngine;

class FertigationController extends Controller
{
    protected $engine;

    public function __construct(FertigationEngine $engine)
    {
        $this->engine = $engine;
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'target_requirements' => 'required|array',
            'water_analysis' => 'nullable|array',
            'efficiency' => 'nullable|numeric|min:0|max:1',
            'available_fertilizers' => 'required|array', // [ 'Nitrate de Calcium' => ['Ca' => 19, 'N' => 15.5], ... ]
        ]);

        $target = $validated['target_requirements'];
        $water = $validated['water_analysis'] ?? [];
        $efficiency = $validated['efficiency'] ?? 1.0;
        $A = $validated['available_fertilizers'];

        // Convert requirements from oxides to elements if needed (assuming frontend sends elements directly for now, 
        // but if oxides are used, we can call convertRequirements).
        
        $B_net = $this->engine->calculateNetRequirements($target, $water, $efficiency);

        // Optional costs/penalties can be passed, here defaulting to empty
        $C = [];

        // Solve for optimal mix (X)
        $X = $this->engine->solveNNLS($A, $B_net, $C);

        // Filter out zero values
        $optimalMix = array_filter($X, fn($val) => $val > 0);

        // Separate tanks
        $tanks = $this->engine->separateTanks($optimalMix);

        // Estimate EC (simplified for now, ideally needs actual ionic breakdown)
        // We simulate a meq/L array based on the optimal mix dissolved in 1L stock, but this requires
        // molecular weights. For now, returning a mock or simple estimation if meq array is provided.
        // We'll return 0 for now as true estimation requires deep chemical composition of the final mix.
        $estimatedEC = 0; // $this->engine->estimateEC($simulated_meq);

        return response()->json([
            'net_requirements' => $B_net,
            'optimal_mix' => $optimalMix,
            'tanks' => $tanks,
            'estimated_ec' => $estimatedEC
        ]);
    }
}
