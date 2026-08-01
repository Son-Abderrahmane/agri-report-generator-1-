<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "FERTILIZERS:\n";
echo json_encode(\App\Models\Fertilizer::all(), JSON_PRETTY_PRINT);
echo "\n\nGROWTH STAGES:\n";
echo json_encode(\App\Models\GrowthStageRecipe::with('targets')->get(), JSON_PRETTY_PRINT);
