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

            // ========================================================
            // 1. LOGIKA UNTUK MENU "REKAP REALISASI UP3" (TABEL)
            // ========================================================
            if ($type === 'rekap_up3') {
                $ranges = ["'REAL UP3'!A2:G200"];

                $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
                $valueRanges = $response->getValueRanges();
                $sheetTabelUP3 = isset($valueRanges[0]) ? ($valueRanges[0]->getValues() ?? []) : [];

                $tabelUP3 = [];
                foreach ($sheetTabelUP3 as $row) {
                    if (isset($row[1]) && !empty(trim($row[1]))) {
                        $tabelUP3[] = [
                            'unit' => trim($row[1] ?? '-'),
                            'bulan' => trim($row[3] ?? '-'),
                            'target' => $this->cleanNumber($row[4] ?? 0),
                            'real' => $this->cleanNumber($row[5] ?? 0),
                            'persen' => $this->cleanNumber($row[6] ?? 0)
                        ];
                    }
                }

                return response()->json([
                    'tabelUP3' => $tabelUP3
                ]);
            }

            // ========================================================
            // 1.5. LOGIKA UNTUK MENU "REKAP REALISASI ULP KOM" (TABEL BARU)
            // ========================================================
            if ($type === 'rekap_ulp') {
                $ranges = [
                    'REKAP REAL!A2:J100',
                    "'REAL ULP PST'!A2:M1500" // Diperbaiki pake tanda kutip karena ada spasi di nama sheet
                ];

                $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
                $valueRanges = $response->getValueRanges();

                // --- PROSES DATA UNTUK TABEL (REKAP REAL) ---
                $sheetTabelRaw = isset($valueRanges[0]) ? ($valueRanges[0]->getValues() ?? []) : [];
                $tabelULP = [];
                foreach ($sheetTabelRaw as $row) {
                    if (isset($row[3]) && !empty(trim($row[3]))) {
                        $tabelULP[] = [
                            'unit_up' => trim($row[3] ?? '-'),
                            'bulan'   => trim($row[5] ?? '-'),
                            'target'  => $this->cleanNumber($row[6] ?? 0),
                            'real'    => $this->cleanNumber($row[7] ?? 0),
                            'persen'  => $this->cleanNumber($row[8] ?? 0),
                            'rank'    => trim($row[9] ?? '-')
                        ];
                    }
                }

                // --- PROSES DATA UNTUK CHART (REAL ULP PST) ---
                $sheetChartRaw = isset($valueRanges[1]) ? ($valueRanges[1]->getValues() ?? []) : [];
                $chartULP = [];
                
                foreach ($sheetChartRaw as $row) {
                    $unitKolom  = $row[3] ?? ''; 
                    $bulanKolom = $row[5] ?? ''; 
                    $komKolom   = $row[11] ?? 0;  

                    if (!empty(trim($unitKolom)) && !empty(trim($bulanKolom)) && trim($bulanKolom) !== 'BULAN') {
                        $chartULP[] = [
                            'unit'  => strtoupper(trim($unitKolom)),
                            'bulan' => trim($bulanKolom),
                            'kom'   => $this->cleanNumber($komKolom)
                        ];
                    }
                }

                return response()->json([
                    'tabelULP' => $tabelULP,
                    'chartULP' => $chartULP
                ]);
            }

            // ========================================================
            // 1.7. LOGIKA UNTUK HALAMAN DATA KESELURUHAN (REAL ULP PST)
            // ========================================================
            if ($type === 'real_ulp_pst') {
                $ranges = ["'REAL ULP PST'!A2:M2000"];
                $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
                $valueRanges = $response->getValueRanges();
                $sheetRaw = isset($valueRanges[0]) ? ($valueRanges[0]->getValues() ?? []) : [];

                $formattedData = [];

                foreach ($sheetRaw as $row) {
                    if (isset($row[1]) && !empty(trim($row[1]))) {
                        $formattedData[] = [
                            'no'         => trim($row[0] ?? ''),
                            'unit_up'    => trim($row[3] ?? '-'),
                            'kode_up'    => trim($row[4] ?? '-'),
                            'bulan'      => trim($row[5] ?? '-'),
                            'target_kom' => $this->cleanNumber($row[9] ?? 0),
                            'real_kom'   => $this->cleanNumber($row[10] ?? 0),
                            '%_kom' => $this->cleanNumber($row[11] ?? 0)             
                        ];
                    }
                }

                return response()->json([
                    'data' => $formattedData
                ]);
            }

            if ($type === 'data_pusat') {
                // Tarik data sampai kolom H, barisnya kita set agak banyak (misal 5000) jaga-jaga datanya panjang
                $ranges = ["'DATA PUSAT'!A2:H5000"]; 
                $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
                $valueRanges = $response->getValueRanges();
                $sheetRaw = isset($valueRanges[0]) ? ($valueRanges[0]->getValues() ?? []) : [];

                $formattedData = [];

                foreach ($sheetRaw as $row) {
                    // Cek biar baris kosong nggak ikut masuk (Cek Kolom B / NAMA UNIT UPI)
                    if (isset($row[1]) && !empty(trim($row[1]))) {
                        $formattedData[] = [
                            // 'no' (Kolom A / index 0) sengaja dilewati biar Frontend yang urus
                            'nama_unit_upi'    => trim($row[1] ?? '-'), // Kolom B
                            'nama_unit_ap'     => trim($row[2] ?? '-'), // Kolom C
                            'nama_unit_up'     => trim($row[3] ?? '-'), // Kolom D
                            'transaksi'        => $this->cleanNumber($row[4] ?? 0), // Kolom E (dibikin murni angka)
                            'detail'           => trim($row[5] ?? '-'), // Kolom F
                            'jenis_pembayaran' => trim($row[6] ?? '-'), // Kolom G
                            'bulan'            => trim($row[7] ?? '-')  // Kolom H
                        ];
                    }
                }

                return response()->json([
                    'data' => $formattedData
                ]);
            }

            // ========================================================
            // 2. LOGIKA UNTUK MENU DASHBOARD (REKAP UID & UP3 GRAFIK)
            // ========================================================
            $ranges = [
                'REKAP UID!A2:N13',
                'REKAP UP3!A2:B20'
            ];

            $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
            $valueRanges = $response->getValueRanges();

            $sheetBulanan = isset($valueRanges[0]) ? ($valueRanges[0]->getValues() ?? []) : [];
            $sheetUP3 = isset($valueRanges[1]) ? ($valueRanges[1]->getValues() ?? []) : [];

            $monthlyData = [];
            $totalTargetTahunan = 0;
            $totalRealYTD = 0;
            $carryOverNominal = 0;

            $kumUpdate = isset($sheetBulanan[0][12]) ? $this->cleanNumber($sheetBulanan[0][12]) : 0;
            $komCarryOver = isset($sheetBulanan[0][13]) ? $this->cleanNumber($sheetBulanan[0][13]) : 0;

            foreach ($sheetBulanan as $row) {
                if (isset($row[2]) && !empty(trim($row[2]))) {
                    $bulan = substr(trim($row[2]), 0, 3); 
                    $target = $this->cleanNumber($row[3] ?? 0); 
                    $real = $this->cleanNumber($row[4] ?? 0); 
                    $persen = $this->cleanNumber($row[6] ?? 0); 

                    $totalTargetTahunan += $target;
                    $totalRealYTD += $real;

                    $coRow = $this->cleanNumber($row[9] ?? 0);
                    if ($coRow > $carryOverNominal) {
                        $carryOverNominal = $coRow;
                    }

                    $monthlyData[] = [
                        'name' => $bulan,
                        'target' => $target,
                        'real' => $real,
                        'persen' => $persen
                    ];
                }
            }

            $persenTahunan = $totalTargetTahunan > 0 ? round(($totalRealYTD / $totalTargetTahunan) * 100, 1) : 0;

            $kinerjaUP3 = [];
            foreach ($sheetUP3 as $row) {
                if (count($row) >= 2 && !empty(trim($row[0] ?? ''))) {
                    $kinerjaUP3[] = [
                        'nama' => trim(str_ireplace('UP3 ', '', $row[0])),
                        'realisasi' => $this->cleanNumber($row[1] ?? 0)
                    ];
                }
            }
            usort($kinerjaUP3, fn($a, $b) => $b['realisasi'] <=> $a['realisasi']);

            return response()->json([
                'real' => number_format($totalRealYTD, 0, '.', ','),
                'carryOver' => number_format($carryOverNominal, 0, '.', ','),
                'kumUpdate' => $kumUpdate,
                'komCarryOver' => $komCarryOver,
                'targetTahunan' => number_format($totalTargetTahunan, 0, '.', ','),
                'persenTahunan' => $persenTahunan,
                'monthlyData' => $monthlyData,
                'kinerjaUP3' => $kinerjaUP3
            ]);

        } catch (\Exception $e) {
            \Log::error('Google Sheets Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal mengambil data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function cleanNumber($value)
    {
        if (empty($value))
            return 0;

        $clean = (string) $value;
        $clean = str_replace('%', '', $clean);
        $clean = str_replace(',', '', $clean);
        $clean = preg_replace('/[^0-9\-.]/', '', $clean);

        return (float) $clean;
    }
}