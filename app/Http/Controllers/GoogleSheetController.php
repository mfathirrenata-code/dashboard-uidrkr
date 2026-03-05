<?php

namespace App\Http\Controllers;

use Google\Client;
use Google\Service\Sheets;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GoogleSheetController extends Controller
{
    public function getSheetData(Request $request): JsonResponse
    {
        $client = new Client();
        $client->setAuthConfig(storage_path('app/google-access.json'));
        $client->addScope(Sheets::SPREADSHEETS_READONLY);

        $service = new Sheets($client);
        
        // Ambil tipe data dari request (default ke 'kali')
        $type = $request->query('type', 'kali');
        
        // Pilih ID berdasarkan tipe yang diminta
        if ($type === 'rupiah') {
            $spreadsheetId = env('GOOGLE_SHEET_RUPIAH');
        } else {
            $spreadsheetId = env('GOOGLE_SHEET_KALI');
        }

        // Tentukan Range (Pastikan nama Sheet/Tab di Excel kamu adalah 'Sheet1')
        $range = "'DATA PUSAT'!A1:Z100"; 

        try {
            $response = $service->spreadsheets_values->get($spreadsheetId, $range);
            return response()->json($response->getValues());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}