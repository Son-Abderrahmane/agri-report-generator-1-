<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index()
    {
        // Return formatted as the frontend expects
        $reports = Report::orderBy('updated_at', 'desc')->get()->map(function ($report) {
            $data = $report->data ?? [];
            $data['id'] = $report->id;
            $data['title'] = $report->title;
            $data['status'] = $report->status;
            $data['createdAt'] = $report->created_at;
            $data['updatedAt'] = $report->updated_at;
            return $data;
        });

        return response()->json($reports);
    }

    public function show($id)
    {
        $report = Report::find($id);
        if (!$report) {
            return response()->json(['error' => 'Rapport introuvable'], 404);
        }

        $data = $report->data ?? [];
        $data['id'] = $report->id;
        $data['title'] = $report->title;
        $data['status'] = $report->status;
        $data['createdAt'] = $report->created_at;
        $data['updatedAt'] = $report->updated_at;

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $payload = $request->all();
        $id = $payload['id'] ?? 'rep_' . time() . '_' . substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 6);
        
        $title = $payload['title'] ?? 'Nouveau Rapport';
        $status = $payload['status'] ?? 'draft';

        $report = Report::create([
            'id' => $id,
            'title' => $title,
            'status' => $status,
            'data' => $payload,
        ]);

        $data = $report->data;
        $data['id'] = $report->id;
        $data['createdAt'] = $report->created_at;
        $data['updatedAt'] = $report->updated_at;

        return response()->json($data);
    }

    public function update(Request $request, $id)
    {
        $report = Report::firstOrCreate(['id' => $id]);
        $payload = $request->all();
        
        if (isset($payload['title'])) {
            $report->title = $payload['title'];
        }
        if (isset($payload['status'])) {
            $report->status = $payload['status'];
        }

        $report->data = $payload;
        $report->save();

        $data = $report->data;
        $data['id'] = $report->id;
        $data['createdAt'] = $report->created_at;
        $data['updatedAt'] = $report->updated_at;

        return response()->json($data);
    }

    public function duplicate($id)
    {
        $source = Report::find($id);
        if (!$source) {
            return response()->json(['error' => 'Rapport source non trouvé'], 404);
        }

        $newId = 'rep_' . time() . '_' . substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 6);
        $duplicatedData = $source->data;
        
        if (isset($duplicatedData['farmDetails'])) {
            $duplicatedData['farmDetails']['reportRef'] = 'RVT-' . date('Y-m') . '-' . rand(100, 999);
            $duplicatedData['farmDetails']['visitDate'] = date('Y-m-d');
        }

        $report = Report::create([
            'id' => $newId,
            'title' => $source->title . ' (Copie)',
            'status' => 'draft',
            'data' => $duplicatedData,
        ]);

        $data = $report->data;
        $data['id'] = $report->id;
        $data['title'] = $report->title;
        $data['status'] = $report->status;
        $data['createdAt'] = $report->created_at;
        $data['updatedAt'] = $report->updated_at;

        return response()->json($data);
    }

    public function destroy($id)
    {
        Report::where('id', $id)->delete();
        return response()->json(['success' => true, 'id' => $id]);
    }

    public function upload(Request $request)
    {
        $imageData = $request->input('imageData');
        $caption = $request->input('caption', 'Photo terrain importée');

        if (!$imageData) {
            return response()->json(['error' => 'Aucune donnée d\'image reçue'], 400);
        }

        return response()->json([
            'success' => true,
            'url' => $imageData,
            'caption' => $caption,
            'timestamp' => date('Y-m-d'),
        ]);
    }
}
