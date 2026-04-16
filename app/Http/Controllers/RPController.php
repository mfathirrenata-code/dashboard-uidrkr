<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RPController extends BaseGoogleSheetController
{
    private $spreadsheetId;

    public function __construct()
    {
        // Langsung lock ke Sheet Rupiah
        $this->spreadsheetId = env('GOOGLE_SHEET_RUPIAH');
    }

    // ==========================================
    // 1. DASHBOARD
    // ==========================================
    public function getDashboard(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            
            // Baca data dari REKAP UID (untuk Kartu Atas) dan REAL UP3 (untuk Grafik & Ranking)
            $ranges = ["'REKAP UID'!A2:N20", "'REAL UP3'!A2:G200"];
            $response = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
            $valueRanges = $response->getValueRanges();

            $rekapUidRaw = isset($valueRanges[0]) ? ($valueRanges[0]->getValues() ?? []) : [];
            $realUp3Raw = isset($valueRanges[1]) ? ($valueRanges[1]->getValues() ?? []) : [];

            // ==========================================
            // A. OLAH KARTU SUMMARY (Dari REKAP UID)
            // ==========================================
            $currentMonthData = null;
            $maxReal = -1;
            $maxCarryOver = 0; 

            foreach ($rekapUidRaw as $row) {
                if (isset($row[2]) && !empty(trim($row[2]))) { 
                    $realKom = $this->cleanNumber($row[5] ?? 0); // F: REAL KOM
                    if ($realKom > $maxReal) {
                        $maxReal = $realKom;
                        $currentMonthData = $row;
                    }

                    $komCO = $this->cleanNumber($row[9] ?? 0); // J: KOM CARRY OVER
                    if ($komCO > $maxCarryOver) {
                        $maxCarryOver = $komCO;
                    }
                }
            }

            if (!$currentMonthData && count($rekapUidRaw) > 0) {
                $currentMonthData = $rekapUidRaw[0];
            }

            // ==========================================
            // B. OLAH GRAFIK BULANAN & PERINGKAT (Dari REAL UP3)
            // ==========================================
            $monthlyDataMap = [];
            $monthOrder = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            foreach ($monthOrder as $m) {
                $monthlyDataMap[$m] = ['name' => $m, 'target' => 0, 'real' => 0, 'persen' => 0];
            }

            $up3Groups = [];

            foreach ($realUp3Raw as $row) {
                if (isset($row[3]) && !empty(trim($row[3])) && trim($row[3]) !== 'BULAN') {
                    
                    $bulan = trim($row[3]);                      // D: BULAN
                    $target = $this->cleanNumber($row[4] ?? 0);  // E: TARGET
                    $realKom = $this->cleanNumber($row[5] ?? 0); // F: REAL KOM

                    if (isset($monthlyDataMap[$bulan])) {
                        $monthlyDataMap[$bulan]['target'] += $target;
                        $monthlyDataMap[$bulan]['real'] += $realKom;
                    }

                    $namaUp3 = trim(str_ireplace('UP3 ', '', $row[1] ?? ''));
                    if (!empty($namaUp3)) {
                        if (!isset($up3Groups[$namaUp3]) || $realKom > $up3Groups[$namaUp3]) {
                            $up3Groups[$namaUp3] = $realKom;
                        }
                    }
                }
            }

            $monthlyData = [];
            foreach ($monthlyDataMap as $data) {
                $data['persen'] = $data['target'] > 0 ? round(($data['real'] / $data['target']) * 100, 2) : 0;
                $monthlyData[] = $data;
            }

            $kinerjaUP3 = [];
            foreach ($up3Groups as $nama => $realisasi) {
                $kinerjaUP3[] = ['nama' => $nama, 'realisasi' => $realisasi];
            }
            usort($kinerjaUP3, fn($a, $b) => $b['realisasi'] <=> $a['realisasi']);

            return response()->json([
                'real'           => number_format($maxReal, 0, ',', '.'),
                'carryOver'      => number_format($maxCarryOver, 0, ',', '.'),
                'kumUpdate'      => (float) str_replace(['%', ','], ['', '.'], $currentMonthData[12] ?? 0),   
                'komCarryOver'   => (float) str_replace(['%', ','], ['', '.'], $currentMonthData[13] ?? 0), 
                'persenTahunan'  => (float) str_replace(['%', ','], ['', '.'], $currentMonthData[6] ?? 0), 
                'monthlyData'    => $monthlyData,  
                'kinerjaUP3'     => $kinerjaUP3
            ]);

        } catch (\Exception $e) {
            \Log::error('Google Sheets Error (RPController): ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal mengambil data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // 2. DATA PUSAT
    // ==========================================
    public function getDataPusat(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $ranges = ["'DATA PUSAT'!A2:H5000"]; 
            $response = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
            $sheetRaw = $response->getValueRanges()[0]->getValues() ?? [];

            $formattedData = [];
            foreach ($sheetRaw as $row) {
                if (isset($row[1]) && !empty(trim($row[1]))) {
                    $formattedData[] = [
                        'nama_unit_upi'    => trim($row[1] ?? '-'), 
                        'nama_unit_ap'     => trim($row[2] ?? '-'), 
                        'nama_unit_up'     => trim($row[3] ?? '-'), 
                        'transaksi'        => $this->cleanNumber($row[4] ?? 0), 
                        'detail'           => trim($row[5] ?? '-'), 
                        'jenis_pembayaran' => trim($row[6] ?? '-'), 
                        'bulan'            => trim($row[7] ?? '-')  
                    ];
                }
            }
            return response()->json(['data' => $formattedData]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data pusat Rupiah', 'message' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 3. REAL UP3
    // ==========================================
    public function getRekapUp3(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            // Menggunakan tab REKAP UP3 sesuai revisi
            $ranges = ["'REKAP UP3'!A2:I7"];

            $response = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
            $sheetTabelUP3 = $response->getValueRanges()[0]->getValues() ?? [];

            $tabelUP3 = [];

            foreach ($sheetTabelUP3 as $index => $row) {
                // Skip baris kosong (Cek berdasarkan kolom B / Index 1)
                if (!isset($row[1]) || empty(trim($row[1]))) {
                    continue;
                }

                $tabelUP3[] = [
                    'unit'     => trim($row[0] ?? '-'), // Ditambahkan agar React (row.unit) tidak error
                    'unit_ap'  => trim($row[0] ?? '-'), // Index 0
                    'bulan'    => trim($row[2] ?? '-'), // Index 2
                    'target'   => $this->cleanNumber($row[3] ?? 0), // Index 3
                    'real'     => $this->cleanNumber($row[4] ?? 0), // Index 4
                    'persen'   => $this->cleanNumber($row[5] ?? 0), // Index 5
                    'rank'     => trim($row[6] ?? '-')  // Index 6
                ];
            }

            return response()->json([
                'tabelUP3' => $tabelUP3,
                'tabelULP' => $tabelUP3 // Cadangan jika frontend terlanjur baca tabelULP
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data UP3 Rupiah', 'message' => $e->getMessage()], 500);
        }
    }

    public function getRealUp3(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $ranges = ["'REAL UP3'!A2:G200"]; // Saya lebarkan sedikit jadi G200 buat jaga-jaga kalau datanya nambah

            $response = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
            $sheetTabelULP = $response->getValueRanges()[0]->getValues() ?? [];

            $tabelULP = [];

            foreach ($sheetTabelULP as $index => $row) {
                // Skip baris kosong (Berdasarkan kolom B / Index 1)
                if (!isset($row[1]) || empty(trim($row[1]))) {
                    continue;
                }

                $tabelULP[] = [
                    'no'       => $index + 1,
                    'unit_ap'  => trim($row[1] ?? '-'),
                    'kode_ap'  => trim($row[2] ?? '-'),
                    'bulan'    => trim($row[3] ?? '-'),
                    'target'   => $this->cleanNumber($row[4] ?? 0), // Dipakaikan cleanNumber agar konsisten
                    'real'     => $this->cleanNumber($row[5] ?? 0),
                    'persen'   => $this->cleanNumber($row[6] ?? 0),
                ];
            }

            return response()->json([
                'tabelULP' => $tabelULP
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data Real UP3', 'message' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 4. REAL ULP KOM
    // ==========================================
    public function getRealUlpKom(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $ranges = [
                "'REKAP REAL'!A2:J100",
                "'REAL ULP PST'!A2:M1500" 
            ];

            $response = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
            $valueRanges = $response->getValueRanges();

            $sheetTabelRaw = isset($valueRanges[0]) ? ($valueRanges[0]->getValues() ?? []) : [];
            $tabelULP = [];
            foreach ($sheetTabelRaw as $row) {
                if (isset($row[3]) && !empty(trim($row[3]))) {
                    $tabelULP[] = [
                        'unit_up' => trim($row[3] ?? '-'),
                        'bulan'   => trim($row[5] ?? '-'),
                        'target'  => $this->cleanNumber($row[6] ?? 0),
                        'real'    => $this->cleanNumber($row[7] ?? 0),
                        'persen'  => $this->cleanNumber(str_replace('%', '', $row[8] ?? 0)),
                        'rank'    => trim($row[9] ?? '-')
                    ];
                }
            }

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
                        'kom'   => $this->cleanNumber(str_replace('%', '', $komKolom))
                    ];
                }
            }

            return response()->json([
                'tabelULP' => $tabelULP,
                'chartULP' => $chartULP
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data ULP KOM Rupiah', 'message' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 5. REAL ULP
    // ==========================================
    public function getRealUlp(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $ranges = ["'REAL ULP PST'!A2:M2000"];
            
            $response = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
            $sheetRaw = $response->getValueRanges()[0]->getValues() ?? [];

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
                        '%_kom'      => $this->cleanNumber(str_replace('%', '', $row[11] ?? 0))            
                    ];
                }
            }

            return response()->json([
                'data' => $formattedData 
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data Real ULP Pusat Rupiah', 'message' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 6. MONITORING (Dummy sementara biar gak error)
    // ==========================================
    public function getMonitoring(Request $request)
    {
        try {
            return response()->json([
                'status' => 'Sukses',
                'message' => 'API Monitoring Rupiah berhasil diakses! Menunggu format sheet yang benar.',
                'data' => []
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data monitoring Rupiah', 'message' => $e->getMessage()], 500);
        }
    }

    // ========================================================
    // HELPER: SUPER CLEAN NUMBER
    // ========================================================
    // private function cleanNumber($value) 
    // {
    //     if (is_array($value)) return 0;
    //     if (empty($value) || trim((string)$value) === '-') return 0;
    //     if (is_numeric($value)) return (float) $value;
        
    //     $clean = trim((string) $value);
    //     $clean = str_replace(['%', ' '], '', $clean);
        
    //     if (strpos($clean, ',') !== false && strpos($clean, '.') !== false) {
    //         $clean = str_replace('.', '', $clean);
    //         $clean = str_replace(',', '.', $clean);
    //     } 
    //     elseif (substr_count($clean, '.') > 1) {
    //         $clean = str_replace('.', '', $clean);
    //     } 
    //     elseif (strpos($clean, ',') !== false && strpos($clean, '.') === false) {
    //         $komaPos = strrpos($clean, ',');
    //         $angkaBelakangKoma = strlen($clean) - $komaPos - 1;
            
    //         if ($angkaBelakangKoma <= 2) {
    //             $clean = str_replace(',', '.', $clean);
    //         } else {
    //             $clean = str_replace(',', '', $clean);
    //         }
    //     }

    //     $clean = preg_replace('/[^0-9\-.]/', '', $clean);
    //     return (float) $clean;
    // }
}