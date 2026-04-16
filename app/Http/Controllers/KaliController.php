<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class KaliController extends BaseGoogleSheetController
{
    private function getSpreadsheetId(Request $request)
    {
        return $request->query('tipe') === 'rupiah' 
            ? env('GOOGLE_SHEET_RUPIAH') 
            : env('GOOGLE_SHEET_KALI');
    }

    public function getDashboard(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $spreadsheetId = $this->getSpreadsheetId($request);
            
            // Baca data dari REKAP UID (untuk Kartu Atas) dan REAL UP3 (untuk Grafik & Ranking)
            $ranges = ["'REKAP UID'!A2:N20", "'REAL UP3'!A2:G200"];
            $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
            $valueRanges = $response->getValueRanges();

            $rekapUidRaw = isset($valueRanges[0]) ? ($valueRanges[0]->getValues() ?? []) : [];
            $realUp3Raw = isset($valueRanges[1]) ? ($valueRanges[1]->getValues() ?? []) : [];

            // ==========================================
            // 1. OLAH KARTU SUMMARY (Dari REKAP UID)
            // ==========================================
            $currentMonthData = null;
            $maxReal = -1;
            $maxCarryOver = 0; 

            // Kita butuh ini untuk mencari "Bulan Terakhir" dan angka summary (Carry Over, dll)
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
            // 2. OLAH GRAFIK BULANAN & PERINGKAT (Dari REAL UP3)
            // ==========================================
            $monthlyDataMap = [];
            // Struktur bulan urut dari Jan - Des
            $monthOrder = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            foreach ($monthOrder as $m) {
                $monthlyDataMap[$m] = ['name' => $m, 'target' => 0, 'real' => 0, 'persen' => 0];
            }

            $up3Groups = [];

            // Looping data tab REAL UP3
            foreach ($realUp3Raw as $row) {
                // Pastikan baris memiliki data bulan dan bukan Header tabel
                if (isset($row[3]) && !empty(trim($row[3])) && trim($row[3]) !== 'BULAN') {
                    
                    $bulan = trim($row[3]);                      // D: BULAN (Indeks 3)
                    $target = $this->cleanNumber($row[4] ?? 0);  // E: TARGET (Indeks 4)
                    $realKom = $this->cleanNumber($row[5] ?? 0); // F: REAL KOM (Indeks 5)

                    // A. Agregasi (Penjumlahan) untuk Grafik Bulanan
                    if (isset($monthlyDataMap[$bulan])) {
                        $monthlyDataMap[$bulan]['target'] += $target;
                        $monthlyDataMap[$bulan]['real'] += $realKom;
                    }

                    // B. Pencarian Peringkat UP3
                    $namaUp3 = trim(str_ireplace('UP3 ', '', $row[1] ?? '')); // B: UNIT AP
                    if (!empty($namaUp3)) {
                        // Ambil nilai REAL KOM terbesar untuk masing-masing UP3
                        if (!isset($up3Groups[$namaUp3]) || $realKom > $up3Groups[$namaUp3]) {
                            $up3Groups[$namaUp3] = $realKom;
                        }
                    }
                }
            }

            // Format ulang data bulanan ke bentuk array untuk React
            $monthlyData = [];
            foreach ($monthlyDataMap as $data) {
                // Kalkulasi Persentase: (Real / Target) * 100
                $data['persen'] = $data['target'] > 0 ? round(($data['real'] / $data['target']) * 100, 2) : 0;
                $monthlyData[] = $data;
            }

            // Format ulang data UP3 ke bentuk array
            $kinerjaUP3 = [];
            foreach ($up3Groups as $nama => $realisasi) {
                $kinerjaUP3[] = ['nama' => $nama, 'realisasi' => $realisasi];
            }
            // Sorting ranking dari terbesar ke terkecil
            usort($kinerjaUP3, fn($a, $b) => $b['realisasi'] <=> $a['realisasi']);

            // ==========================================
            // 3. FORMAT HASIL JSON UNTUK REACT
            // ==========================================
            return response()->json([
                'real' => number_format($maxReal, 0, ',', '.'),
                'carryOver' => number_format($maxCarryOver, 0, ',', '.'),
                'kumUpdate' => (float) str_replace(['%', ','], ['', '.'], $currentMonthData[12] ?? 0),   
                'komCarryOver' => (float) str_replace(['%', ','], ['', '.'], $currentMonthData[13] ?? 0), 
                'persenTahunan' => (float) str_replace(['%', ','], ['', '.'], $currentMonthData[6] ?? 0), 
                'monthlyData' => $monthlyData,  // <--- Sekarang murni 100% totalan dari tab REAL UP3
                'kinerjaUP3' => $kinerjaUP3
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data dashboard', 'message' => $e->getMessage()], 500);
        }
    }

    public function getDataPusat(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $spreadsheetId = $this->getSpreadsheetId($request);
            
            $ranges = ["'DATA PUSAT'!A2:H5000"]; 
            $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
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
            return response()->json(['error' => 'Gagal mengambil data pusat', 'message' => $e->getMessage()], 500);
        }
    }
    
    public function getRekapUp3(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $spreadsheetId = $this->getSpreadsheetId($request);
            $ranges = ["'REAL UP3'!A2:G200"];

            $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
            $sheetTabelUP3 = $response->getValueRanges()[0]->getValues() ?? [];

            $tabelUP3 = [];
            foreach ($sheetTabelUP3 as $row) {
                if (isset($row[1]) && !empty(trim($row[1]))) {
                    $tabelUP3[] = [
                        'unit' => trim($row[1] ?? '-'),
                        'bulan' => trim($row[3] ?? '-'),
                        'target' => $this->cleanNumber($row[4] ?? 0),
                        'real' => $this->cleanNumber($row[5] ?? 0),
                        'persen' => $this->cleanNumber(str_replace('%', '', $row[6] ?? 0))
                    ];
                }
            }

            return response()->json(['tabelUP3' => $tabelUP3]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data UP3', 'message' => $e->getMessage()], 500);
        }
    }

    public function getRealUlpKom(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $spreadsheetId = $this->getSpreadsheetId($request);
            $ranges = [
                "'REKAP REAL'!A2:J100",
                "'REAL ULP PST'!A2:M1500" 
            ];

            $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
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
            return response()->json(['error' => 'Gagal mengambil data ULP KOM', 'message' => $e->getMessage()], 500);
        }
    }

    public function getRealUlp(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $spreadsheetId = $this->getSpreadsheetId($request);
            $ranges = ["'REAL ULP PST'!A2:M2000"];
            
            $response = $service->spreadsheets_values->batchGet($spreadsheetId, ['ranges' => $ranges]);
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
                        '%_kom'     => $this->cleanNumber(str_replace('%', '', $row[11] ?? 0))            
                    ];
                }
            }

            return response()->json([
                'data' => $formattedData 
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data Real ULP Pusat', 'message' => $e->getMessage()], 500);
        }
    }
}