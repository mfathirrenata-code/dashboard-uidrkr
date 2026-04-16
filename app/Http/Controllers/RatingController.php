<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RatingController extends BaseGoogleSheetController
{
    private $spreadsheetId;

    public function __construct()
    {
        $this->spreadsheetId = env('GOOGLE_SHEET_RATING');
    }

    public function getRekapRatingUlp()
    {
        try {
            $service = $this->getGoogleService();
            $ranges = ["'REKAP RATING'!A2:N410"];
            
            $response = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
            $sheetULPRaw = $response->getValueRanges()[0]->getValues() ?? [];
            
            $tabelULP = [];
            foreach ($sheetULPRaw as $row) {
                if (isset($row[4]) && !empty(trim($row[4]))) { 
                    $tabelULP[] = [
                        'ulp'                => trim($row[4] ?? '-'),                     
                        'bulan'              => trim($row[6] ?? '-'),                     
                        'target'             => $this->cleanNumber($row[7] ?? 0),         
                        'realisasi'          => $this->cleanNumber($row[8] ?? 0),         
                        'persen_total_entry' => trim($row[9] ?? '0'),                     
                        'sesuai'             => $this->cleanNumber($row[12] ?? 0),        
                        'tidak_sesuai'       => $this->cleanNumber($row[13] ?? 0),        
                        'persen_real'        => trim($row[10] ?? '0')                      
                    ];
                }
            }
            return response()->json(['tabelRating' => $tabelULP]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data', 'message' => $e->getMessage()], 500);
        }
    }

    public function getRekapRatingUp3()
    {
        try {
            $service = $this->getGoogleService();
            $ranges = ["'REKAP RATING UP3'!A2:L500"];
            
            $response = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
            $sheetUP3Raw = $response->getValueRanges()[0]->getValues() ?? [];
            
            $tabelUP3 = [];
            foreach ($sheetUP3Raw as $row) {
                if (isset($row[2]) && !empty(trim($row[2]))) { 
                    $tabelUP3[] = [
                        'up3'                => trim($row[2] ?? '-'),
                        'bulan'              => trim($row[4] ?? '-'),
                        'target'             => $this->cleanNumber($row[5] ?? 0),
                        'realisasi'          => $this->cleanNumber($row[6] ?? 0),
                        'persen_total_entry' => trim($row[7] ?? '0'), 
                        'sesuai'             => $this->cleanNumber($row[10] ?? 0),
                        'tidak_sesuai'       => $this->cleanNumber($row[11] ?? 0),
                        'persen_real'        => trim($row[8] ?? '0')
                    ];
                }
            }
            return response()->json(['tabelRating' => $tabelUP3]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data', 'message' => $e->getMessage()], 500);
        }
    }

    public function getRatingHarian()
    {
        try {
            $service = $this->getGoogleService();
            $range = "'TABEL HARIAN'!A2:CU500"; 
            
            $response = $service->spreadsheets_values->get($this->spreadsheetId, $range);
            $sheetHarianRaw = $response->getValues() ?? [];

            $tabelHarian = [];
            foreach ($sheetHarianRaw as $row) {
                if (isset($row[0]) && !empty(trim($row[0]))) { 
                    $tabelHarian[] = [
                        'ui' => trim($row[0] ?? '-'),
                        'up' => trim($row[1] ?? '-'),
                        'ul' => trim($row[2] ?? '-'),
                        'tgl_1'  => trim($row[3] ?? '0'),
                        'tgl_2'  => trim($row[4] ?? '0'),
                        'tgl_3'  => trim($row[5] ?? '0'),
                        'tgl_4'  => trim($row[6] ?? '0'),
                        'tgl_5'  => trim($row[7] ?? '0'),
                        'tgl_6'  => trim($row[8] ?? '0'),
                        'tgl_7'  => trim($row[9] ?? '0'),
                        'tgl_8'  => trim($row[10] ?? '0'),
                        'tgl_9'  => trim($row[11] ?? '0'),
                        'tgl_10' => trim($row[12] ?? '0'),
                        'tgl_11' => trim($row[13] ?? '0'),
                        'tgl_12' => trim($row[14] ?? '0'),
                        'tgl_13' => trim($row[15] ?? '0'),
                        'tgl_14' => trim($row[16] ?? '0'),
                        'tgl_15' => trim($row[17] ?? '0'),
                    ];
                }
            }
            return response()->json(['tabelHarian' => $tabelHarian]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data', 'message' => $e->getMessage()], 500);
        }
    }
}