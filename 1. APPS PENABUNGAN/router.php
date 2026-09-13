<?php
/**
 * PHP Built-in Server Router for TabunganKu
 * Menangani routing, fallback, dan penanganan typo URL otomatis
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));

// Tangani typo umum seperti /index.ph atau /index.htm
if ($uri === '/index.ph' || $uri === '/index.htm') {
    header("Location: /index.php", true, 301);
    exit;
}

// Tangani jika pengguna mengakses prefix /apps_penabungan di port 8000
if (str_starts_with($uri, '/apps_penabungan')) {
    $cleanPath = substr($uri, strlen('/apps_penabungan'));
    if ($cleanPath === '' || $cleanPath === '/' || $cleanPath === '/index.ph') {
        $cleanPath = '/index.php';
    }
    // Jika file fisik ada setelah strip prefix
    $targetFile = __DIR__ . $cleanPath;
    if (file_exists($targetFile) && !is_dir($targetFile)) {
        // Alihkan agar aset tidak error
        header("Location: " . $cleanPath, true, 302);
        exit;
    }
    header("Location: " . $cleanPath, true, 302);
    exit;
}

// Jika request meminta file statis yang ada secara fisik (css, js, gambar, dll)
$filePath = __DIR__ . $uri;
if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    return false; // Biarkan PHP CLI server menyajikan file secara langsung
}

// Default ke index.php
require_once __DIR__ . '/index.php';
