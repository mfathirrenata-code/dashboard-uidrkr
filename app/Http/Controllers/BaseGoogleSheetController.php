<?php

namespace App\Http\Controllers;

use Google\Client as Google_Client;
use Google\Service\Sheets as Google_Service_Sheets;

class BaseGoogleSheetController extends Controller
{
    /**
     * Inisialisasi koneksi ke Google API
     */
    protected function getGoogleService()
    {
        $client = new Google_Client();
        $authConfigPath = storage_path('app/google-access.json');

        if (!file_exists($authConfigPath)) {
            throw new \Exception('File JSON kredensial tidak ditemukan di: ' . $authConfigPath);
        }

        $client->setAuthConfig($authConfigPath);
        $client->addScope(Google_Service_Sheets::SPREADSHEETS_READONLY);
        
        return new Google_Service_Sheets($client);
    }

    /**
     * Fungsi pembersih angka yang bisa dipakai oleh semua child controller
     */
    protected function cleanNumber($value)
    {
        if (empty($value)) return 0;

        $clean = (string) $value;
        $clean = str_replace('%', '', $clean);
        $clean = str_replace(',', '', $clean);
        $clean = preg_replace('/[^0-9\-.]/', '', $clean);

        return (float) $clean;
    }
}