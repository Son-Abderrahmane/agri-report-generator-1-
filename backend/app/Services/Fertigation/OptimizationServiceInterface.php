<?php
namespace App\Services\Fertigation;

interface OptimizationServiceInterface
{
    /**
     * @param array $targets e.g. ['n' => 180, 'p' => 50, ...]
     * @param array $waterAnalysis
     * @param array $fertilizers
     * @param array $params (irrigation volume, injection ratio, objective)
     * @return array The optimization results
     */
    public function optimize(array $targets, array $waterAnalysis, array $fertilizers, array $params): array;
}
