<?php
/**
 * Database Configuration & Connection Manager
 * Mendukung MySQL (default XAMPP) dan otomatis fallback ke SQLite jika MySQL belum dijalankan.
 */

// Konfigurasi Database MySQL
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'penabungan_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// Direktori untuk data SQLite lokal sebagai fallback
define('DATA_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'data');
define('SQLITE_FILE', DATA_DIR . DIRECTORY_SEPARATOR . 'database.sqlite');

function getDatabaseConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $driverUsed = 'mysql';

    // 1. Coba koneksi ke MySQL terlebih dahulu
    try {
        // Coba koneksi langsung ke server MySQL (timeout singkat agar tidak memperlambat)
        $dsnWithoutDb = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 2, // 2 detik timeout jika server offline
        ];
        
        $tempPdo = new PDO($dsnWithoutDb, DB_USER, DB_PASS, $options);
        // Buat database jika belum ada
        $tempPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        
        // Hubungkan ke database yang sudah dibuat
        $dsnWithDb = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsnWithDb, DB_USER, DB_PASS, $options);
        $driverUsed = 'mysql';
    } catch (Exception $e) {
        // 2. Jika MySQL tidak dapat dihubungi, fallback ke SQLite
        try {
            if (!is_dir(DATA_DIR)) {
                mkdir(DATA_DIR, 0777, true);
            }
            $dsnSqlite = "sqlite:" . SQLITE_FILE;
            $pdo = new PDO($dsnSqlite, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            $driverUsed = 'sqlite';
        } catch (Exception $sqliteErr) {
            die("Gagal menghubungkan ke database MySQL maupun SQLite: " . $sqliteErr->getMessage());
        }
    }

    // Inisialisasi struktur tabel jika belum ada
    initializeDatabaseTables($pdo, $driverUsed);

    return $pdo;
}

/**
 * Buat tabel jika belum tersedia
 */
function initializeDatabaseTables(PDO $pdo, string $driver) {
    if ($driver === 'mysql') {
        // Tabel Transaksi untuk MySQL
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('income', 'expense') NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                note TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_date (date),
                INDEX idx_type (type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Tabel Target Tabungan Bulanan untuk MySQL
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS savings_targets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                month_key VARCHAR(7) UNIQUE NOT NULL, -- Format: YYYY-MM
                target_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Tabel Target Tabungan Terintegrasi (Multi-Bulan / Tahunan) untuk MySQL
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS savings_goals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                target_amount DECIMAL(15, 2) NOT NULL,
                start_month VARCHAR(7) NOT NULL,
                end_month VARCHAR(7) NOT NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } else {
        // Tabel Transaksi untuk SQLite
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                note TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_trans_date ON transactions(date);
            CREATE INDEX IF NOT EXISTS idx_trans_type ON transactions(type);
        ");

        // Tabel Target Tabungan Bulanan untuk SQLite
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS savings_targets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                month_key TEXT UNIQUE NOT NULL,
                target_amount REAL NOT NULL DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        // Tabel Target Tabungan Terintegrasi (Multi-Bulan / Tahunan) untuk SQLite
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS savings_goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                target_amount REAL NOT NULL,
                start_month TEXT NOT NULL,
                end_month TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }
}

/**
 * ============================================================================
 * Kontrol Akses Jaringan Lokal (Wi-Fi LAN)
 * ============================================================================
 * Menjaga aplikasi agar HANYA dapat diakses dari jaringan lokal Wi-Fi atau localhost.
 * Jika ada akses dari internet publik / luar Wi-Fi, sistem akan otomatis memblokir.
 */
define('ENFORCE_LAN_ONLY', true);

/**
 * Memeriksa apakah IP klien berasal dari jaringan lokal / privat (RFC 1918 / localhost / loopback).
 */
function isAllowedLocalClient(?string $ip = null): bool {
    if ($ip === null) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }

    // Selalu izinkan Localhost IPv4 & IPv6
    if ($ip === '127.0.0.1' || $ip === '::1' || $ip === 'localhost') {
        return true;
    }

    // Jika filter_var mengembalikan false pada FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
    // maka IP tersebut merupakan IP lokal / privat (192.168.x.x, 10.x.x.x, 172.16-31.x.x, fe80::, dll).
    $isPublicInternet = filter_var(
        $ip,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    );

    if ($isPublicInternet === false && filter_var($ip, FILTER_VALIDATE_IP)) {
        return true;
    }

    return false;
}

/**
 * Validasi akses jaringan lokal.
 * Menampilkan pesan 403 Forbidden jika diakses dari luar Wi-Fi lokal.
 */
function validateLocalNetworkAccess(): void {
    if (!defined('ENFORCE_LAN_ONLY') || !ENFORCE_LAN_ONLY) {
        return;
    }

    if (!isAllowedLocalClient()) {
        http_response_code(403);
        $clientIp = htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'Unknown');
        
        $isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') 
               || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
               || (isset($_GET['action']));

        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'message' => "Akses ditolak: Aplikasi ini hanya dapat diakses melalui jaringan Wi-Fi lokal (IP: {$clientIp})."
            ]);
            exit;
        }

        echo '<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akses Dibatasi - TabunganKu</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #0b0f19; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1.5rem; text-align: center; }
        .card { background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(244, 63, 94, 0.35); border-radius: 1.25rem; padding: 2.5rem 2rem; max-width: 480px; width: 100%; box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.6); backdrop-filter: blur(16px); }
        .icon { font-size: 3.25rem; margin-bottom: 1rem; }
        h1 { font-size: 1.35rem; color: #fb7185; margin-bottom: 0.75rem; font-weight: 700; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem; }
        .badge { display: inline-block; background: rgba(244, 63, 94, 0.15); color: #fda4af; padding: 0.4rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(244, 63, 94, 0.3); margin-bottom: 1.5rem; }
        .instructions { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.75rem; padding: 1.15rem; text-align: left; font-size: 0.85rem; color: #cbd5e1; }
        .instructions ol { padding-left: 1.25rem; margin-top: 0.5rem; }
        .instructions li { margin-bottom: 0.45rem; line-height: 1.45; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">🔒</div>
        <h1>Akses Dibatasi (Khusus Wi-Fi Lokal)</h1>
        <div class="badge">IP Anda: ' . $clientIp . '</div>
        <p>Aplikasi <strong>TabunganKu</strong> ini diproteksi dan hanya dapat diakses oleh perangkat yang tersambung ke jaringan Wi-Fi lokal yang sama.</p>
        <div class="instructions">
            <strong>Cara Menghubungkan Perangkat / HP:</strong>
            <ol>
                <li>Sambungkan Wi-Fi di HP ke jaringan <strong>PERTA SHOP</strong>.</li>
                <li>Matikan koneksi data seluler sementara (jika menggunakan HP) agar rute jaringan otomatis melalui Wi-Fi.</li>
                <li>Buka kembali tautan web setelah terhubung.</li>
            </ol>
        </div>
    </div>
</body>
</html>';
        exit;
    }
}

/**
 * Mendapatkan Alamat IP Lokal Server (misal 192.168.1.10)
 */
function detectServerLanIp(): string {
    // 1. Cek apakah diakses melalui Host Header IP
    if (!empty($_SERVER['HTTP_HOST'])) {
        $host = explode(':', $_SERVER['HTTP_HOST'])[0];
        if (filter_var($host, FILTER_VALIDATE_IP) && $host !== '127.0.0.1') {
            return $host;
        }
    }
    
    // 2. Gunakan gethostbyname dari hostname lokal
    $localIp = gethostbyname(gethostname());
    if (filter_var($localIp, FILTER_VALIDATE_IP) && $localIp !== '127.0.0.1') {
        return $localIp;
    }
    
    // 3. Fallback ke SERVER_ADDR jika tersedia
    if (!empty($_SERVER['SERVER_ADDR']) && $_SERVER['SERVER_ADDR'] !== '127.0.0.1' && $_SERVER['SERVER_ADDR'] !== '::1') {
        return $_SERVER['SERVER_ADDR'];
    }

    return '192.168.1.10';
}

