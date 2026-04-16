<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SpkluController extends BaseGoogleSheetController
{
    private $spreadsheetId;

    public function __construct()
    {
        $this->spreadsheetId = env('GOOGLE_SHEET_SPKLU');
    }

    /**
     * Data Dashboard Utama SPKLU
     */
    public function getDataSpklu(Request $request)
    {
        try {
            $service = $this->getGoogleService();

            // JURUS AUTO-DETECT NAMA TAB
            $spreadsheet = $service->spreadsheets->get($this->spreadsheetId);
            $sheets = $spreadsheet->getSheets();

            $tabRekap = 'REKAP';
            $tabTransaksi = 'TRANSAKSI';
            $tabTabel = 'TABEL';

            foreach ($sheets as $sheet) {
                $title = $sheet->getProperties()->getTitle();
                if (trim($title) === 'REKAP')
                    $tabRekap = $title;
                if (trim($title) === 'TRANSAKSI')
                    $tabTransaksi = $title;
                if (trim($title) === 'TABEL')
                    $tabTabel = $title;
            }

            $ranges = ["'{$tabRekap}'!A2:U2000", "'{$tabTransaksi}'!A2:AA5000", "'{$tabTabel}'!A2:Z100"];
            $response = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);

            $rekapRaw = $response->getValueRanges()[0]->getValues() ?? [];
            $transaksiRaw = $response->getValueRanges()[1]->getValues() ?? [];
            $tabelRaw = $response->getValueRanges()[2]->getValues() ?? [];

            // ==========================================
            // 1. OLAH DATA REKAP (Tabel, UP3, ULP, Tahun)
            // ==========================================
            $groupedData = [];
            $monthlyMapping = [
                8 => 'JAN',   // Kolom I
                9 => 'FEB',   // Kolom J
                10 => 'MAR',  // Kolom K
                11 => 'APR',  // Kolom L
                12 => 'MAY',  // Kolom M
                13 => 'JUN',  // Kolom N
                14 => 'JUL',  // Kolom O
                15 => 'AUG',  // Kolom P
                16 => 'SEP',  // Kolom Q
                17 => 'OCT',  // Kolom R
                18 => 'NOV',  // Kolom S
                19 => 'DEC',  // Kolom T
            ];

            $trendData = [];
            foreach ($monthlyMapping as $index => $monthName) {
                $trendData[$index] = ['name' => $monthName, 'transaksi' => 0, 'kwh' => 0, 'rpkwh' => 0];
            }

            foreach ($rekapRaw as $row) {
                if (isset($row[5]) && !empty(trim($row[5]))) {
                    $namaSpklu = trim($row[5]); // Kolom F
                    $up3 = trim($row[2] ?? '-'); // Kolom C
                    $ulp = trim($row[3] ?? '-'); // Kolom D
                    
                    // REVISI: Tukar Index 6 dan 7
                    $jenisRekap = strtolower(trim($row[6] ?? '')); // Kolom G (KWH/RP/TRX)
                    $tahun = trim($row[7] ?? '-'); // Kolom H (Tahun)
                    
                    $total = $this->cleanNumber($row[20] ?? 0); // Kolom U

                    if (!isset($groupedData[$namaSpklu])) {
                        $groupedData[$namaSpklu] = [
                            'nama_spklu' => $namaSpklu,
                            'up3' => $up3,
                            'ulp' => $ulp,
                            'tahun' => $tahun,
                            'kwh' => 0,
                            'rpkwh' => 0,
                            'transaksi' => 0
                        ];
                    }

                    if (str_contains($jenisRekap, 'kwh') && !str_contains($jenisRekap, 'rp')) {
                        $groupedData[$namaSpklu]['kwh'] += $total;
                        foreach ($monthlyMapping as $idx => $month)
                            $trendData[$idx]['kwh'] += $this->cleanNumber($row[$idx] ?? 0);
                    } elseif (str_contains($jenisRekap, 'rp') || str_contains($jenisRekap, 'rupiah')) {
                        $groupedData[$namaSpklu]['rpkwh'] += $total;
                        foreach ($monthlyMapping as $idx => $month)
                            $trendData[$idx]['rpkwh'] += $this->cleanNumber($row[$idx] ?? 0);
                    } elseif (str_contains($jenisRekap, 'trans')) {
                        $groupedData[$namaSpklu]['transaksi'] += $total;
                        foreach ($monthlyMapping as $idx => $month)
                            $trendData[$idx]['transaksi'] += $this->cleanNumber($row[$idx] ?? 0);
                    }
                }
            }

            // ==========================================
            // 2. OLAH DATA TRANSAKSI
            // ==========================================
            $harianData = [];
            $uniqueBulan = [];
            $uniqueTanggal = [];
            $uniqueTahun = [];

            foreach ($groupedData as $item) {
                if (!empty($item['tahun']) && $item['tahun'] !== '-' && !in_array($item['tahun'], $uniqueTahun)) {
                    $uniqueTahun[] = $item['tahun'];
                }
            }

            foreach ($transaksiRaw as $row) {
                $tanggal = trim($row[24] ?? '');
                $bulan = trim($row[25] ?? '');
                $tahun = trim($row[26] ?? '');
                $kwh = $this->cleanNumber($row[16] ?? 0);

                if (!empty($tanggal) && !in_array($tanggal, $uniqueTanggal))
                    $uniqueTanggal[] = $tanggal;
                if (!empty($bulan) && !in_array($bulan, $uniqueBulan))
                    $uniqueBulan[] = $bulan;
                if (!empty($tahun) && !in_array($tahun, $uniqueTahun))
                    $uniqueTahun[] = $tahun; 

                if (isset($row[12]) && !empty(trim($row[12])) && !empty($tanggal)) {
                    if (!isset($harianData[$tanggal])) {
                        $harianData[$tanggal] = ['name' => $tanggal, 'transaksi' => 0, 'kwh' => 0];
                    }
                    $harianData[$tanggal]['transaksi'] += 1;
                    $harianData[$tanggal]['kwh'] += $kwh;
                }
            }

            // ==========================================
            // 3. OLAH DATA TABEL (MON KINERJA)
            // ==========================================
            $monKinerjaData = [];
            foreach ($tabelRaw as $row) {
                if (isset($row[1]) && !empty(trim($row[1]))) {
                    $monKinerjaData[] = [
                        'ui_up' => trim($row[1]),
                        't_jan' => $this->cleanNumber($row[2] ?? 0),
                        'r_jan' => $this->cleanNumber($row[14] ?? 0),
                        't_feb' => $this->cleanNumber($row[3] ?? 0),
                        'r_feb' => $this->cleanNumber($row[15] ?? 0),
                        't_mar' => $this->cleanNumber($row[4] ?? 0),
                        'r_mar' => $this->cleanNumber($row[16] ?? 0),
                        't_apr' => $this->cleanNumber($row[5] ?? 0),
                        'r_apr' => $this->cleanNumber($row[17] ?? 0),
                        't_may' => $this->cleanNumber($row[6] ?? 0),
                        'r_may' => $this->cleanNumber($row[18] ?? 0),
                        't_jun' => $this->cleanNumber($row[7] ?? 0),
                        'r_jun' => $this->cleanNumber($row[19] ?? 0),
                        't_jul' => $this->cleanNumber($row[8] ?? 0),
                        'r_jul' => $this->cleanNumber($row[20] ?? 0),
                        't_aug' => $this->cleanNumber($row[9] ?? 0),
                        'r_aug' => $this->cleanNumber($row[21] ?? 0),
                        't_sep' => $this->cleanNumber($row[10] ?? 0),
                        'r_sep' => $this->cleanNumber($row[22] ?? 0),
                        't_oct' => $this->cleanNumber($row[11] ?? 0),
                        'r_oct' => $this->cleanNumber($row[23] ?? 0),
                        't_nov' => $this->cleanNumber($row[12] ?? 0),
                        'r_nov' => $this->cleanNumber($row[24] ?? 0),
                        't_dec' => $this->cleanNumber($row[13] ?? 0),
                        'r_dec' => $this->cleanNumber($row[25] ?? 0),
                    ];
                }
            }

            $formattedData = array_values($groupedData);
            $formattedTrend = array_values($trendData);
            $formattedHarian = array_values($harianData);

            usort($formattedData, fn($a, $b) => $b['transaksi'] <=> $a['transaksi']);
            usort($formattedHarian, fn($a, $b) => $b['name'] <=> $a['name']);
            sort($uniqueTahun);

            return response()->json([
                'dataSpklu' => $formattedData,
                'trendBulanan' => $formattedTrend,
                'trendHarian' => $formattedHarian,
                'monKinerja' => $monKinerjaData,
                'filterOptions' => [
                    'bulan' => $uniqueBulan,
                    'tanggal' => $uniqueTanggal,
                    'tahun' => $uniqueTahun
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * API Baru untuk Halaman Monitoring SPKLU
     */
    public function getMonitoringSpklu(Request $request)
    {
        try {
            $service = $this->getGoogleService();
            $range = "'REKAP'!A2:U2000"; // Mengambil data sampai Kolom U (Total)
            $response = $service->spreadsheets_values->get($this->spreadsheetId, $range);
            $values = $response->getValues() ?? [];

            $data = [];
            foreach ($values as $row) {
                // Pastikan Nama SPKLU (Kolom F / Index 5) tidak kosong
                if (!isset($row[5]) || empty(trim($row[5]))) continue;

                $data[] = [
                    'ulp'        => $row[3] ?? '-',  // Kolom D
                    'nama_spklu' => $row[5] ?? '-',  // Kolom F
                    'rekap'      => $row[6] ?? '-',  // REVISI: Kolom G (KWH/RP/TRX)
                    'tahun'      => $row[7] ?? '-',  // REVISI: Kolom H (Tahun)
                    'jan'        => $this->cleanNumber($row[8] ?? 0),  // Kolom I
                    'feb'        => $this->cleanNumber($row[9] ?? 0),  // Kolom J
                    'mar'        => $this->cleanNumber($row[10] ?? 0), // Kolom K
                    'apr'        => $this->cleanNumber($row[11] ?? 0), // Kolom L
                    'may'        => $this->cleanNumber($row[12] ?? 0), // Kolom M
                    'jun'        => $this->cleanNumber($row[13] ?? 0), // Kolom N
                    'jul'        => $this->cleanNumber($row[14] ?? 0), // Kolom O
                    'aug'        => $this->cleanNumber($row[15] ?? 0), // Kolom P
                    'sep'        => $this->cleanNumber($row[16] ?? 0), // Kolom Q
                    'oct'        => $this->cleanNumber($row[17] ?? 0), // Kolom R
                    'nov'        => $this->cleanNumber($row[18] ?? 0), // Kolom S
                    'dec'        => $this->cleanNumber($row[19] ?? 0), // Kolom T
                    'total'      => $this->cleanNumber($row[20] ?? 0), // Kolom U
                ];
            }

            return response()->json([
                'status' => 'Sukses',
                'message' => 'Data Monitoring SPKLU berhasil dimuat dari Tab REKAP.',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal', 'message' => $e->getMessage()], 500);
        }
    }
}