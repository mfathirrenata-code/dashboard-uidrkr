<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Client as Google_Client;
use Google\Service\Sheets as Google_Service_Sheets;

class GoogleSheetController extends Controller
{
    public function getSheetData(Request $request)
    {
        $type = $request->query('type', 'kali');

        try {
            $client = new Google_Client();
            $authConfigPath = storage_path('app/google-access.json');

            if (!file_exists($authConfigPath)) {
                return response()->json(['error' => 'File JSON kredensial tidak ditemukan'], 500);
            }

            $client->setAuthConfig($authConfigPath);
            $client->addScope(Google_Service_Sheets::SPREADSHEETS_READONLY);
            $service = new Google_Service_Sheets($client);

            $spreadsheetId = ($type === 'rupiah') ? env('GOOGLE_SHEET_RUPIAH') : env('GOOGLE_SHEET_KALI');

            // Kita lebarkan range REKAP UID sampai Kolom N, dan hilangkan REKAP REAL (karena udah gak perlu)
            $ranges = [
                'REKAP UID!A2:N13',  
                'REKAP UP3!A2:B20'   
            ];

            $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
            $valueRanges = $response->getValueRanges();

            $sheetBulanan = isset($valueRanges[0]) ? ($valueRanges[0]->getValues() ?? []) : [];
            $sheetUP3     = isset($valueRanges[1]) ? ($valueRanges[1]->getValues() ?? []) : [];

            // 1. PROSES TAB BULANAN & SUMMARY (REKAP UID)
            $monthlyData = [];
            $totalTargetTahunan = 0;
            $totalRealYTD = 0;
            $carryOverNominal = 0;
            
            // Tarik data statis dari Baris Pertama (Kolom M dan N)
            $kumUpdate = isset($sheetBulanan[0][12]) ? $this->cleanNumber($sheetBulanan[0][12]) : 0;
            $komCarryOver = isset($sheetBulanan[0][13]) ? $this->cleanNumber($sheetBulanan[0][13]) : 0;

            foreach ($sheetBulanan as $row) {
                // Pastikan Kolom C (Index 2 - Bulan) ada isinya
                if (isset($row[2]) && !empty(trim($row[2]))) {
                    $bulan  = substr(trim($row[2]), 0, 3); // Ambil 3 huruf (JAN, FEB)
                    $target = $this->cleanNumber($row[3] ?? 0); // Kolom D
                    $real   = $this->cleanNumber($row[4] ?? 0); // Kolom E
                    $persen = $this->cleanNumber($row[6] ?? 0); // Kolom G (% KOM)
                    
                    $totalTargetTahunan += $target;
                    $totalRealYTD += $real;

                    // Cari nilai tertinggi dari OM CARRY OVER di Kolom J (Index 9)
                    $coRow = $this->cleanNumber($row[9] ?? 0);
                    if ($coRow > $carryOverNominal) {
                        $carryOverNominal = $coRow;
                    }

                    $monthlyData[] = [
                        'name'   => $bulan,
                        'target' => $target,
                        'real'   => $real,
                        'persen' => $persen
                    ];
                }
            }

            // Kalkulasi Persen YTD otomatis
            $persenTahunan = $totalTargetTahunan > 0 ? round(($totalRealYTD / $totalTargetTahunan) * 100, 1) : 0;

            // 2. PROSES TAB UP3 (Ini udah jalan dengan sempurna sebelumnya)
            $kinerjaUP3 = [];
            foreach ($sheetUP3 as $row) {
                if (count($row) >= 2 && !empty(trim($row[0] ?? ''))) {
                    $kinerjaUP3[] = [
                        'nama'      => trim(str_ireplace('UP3 ', '', $row[0])),
                        'realisasi' => $this->cleanNumber($row[1] ?? 0)
                    ];
                }
            }
            usort($kinerjaUP3, fn($a, $b) => $b['realisasi'] <=> $a['realisasi']);

            return response()->json([
                'real'           => number_format($totalRealYTD, 0, '.', ','), // Format buat UI (Ribuan pake koma)
                'carryOver'      => number_format($carryOverNominal, 0, '.', ','),
                'kumUpdate'      => $kumUpdate,
                'komCarryOver'   => $komCarryOver,
                'targetTahunan'  => number_format($totalTargetTahunan, 0, '.', ','),
                'persenTahunan'  => $persenTahunan,
                'monthlyData'    => $monthlyData,
                'kinerjaUP3'     => $kinerjaUP3
            ]);

        } catch (\Exception $e) {
            \Log::error('Google Sheets Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal mengambil data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * FUNGSI AJAIB PEMBERSIH ANGKA (UPDATE KE FORMAT US)
     */
    private function cleanNumber($value) {
        if (empty($value)) return 0;
        
        $clean = (string) $value;
        // 1. Hapus simbol persen kalau ada
        $clean = str_replace('%', '', $clean);
        
        // 2. Berdasarkan sheet lu, format angkanya US (Koma buat ribuan, Titik buat desimal).
        // Jadi kita HAPUS komanya saja, dan biarkan titiknya.
        $clean = str_replace(',', '', $clean); 
        
        // 3. Bersihin karakter aneh lainnya selain angka dan titik
        $clean = preg_replace('/[^0-9\-.]/', '', $clean);

        return (float) $clean;
    }
}