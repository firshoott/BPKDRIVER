<?php
/**
 * REST API Handler untuk Pelacak Tabungan & Anggaran Bulanan Terintegrasi
 * Mengembalikan respons berformat JSON untuk komunikasi AJAX frontend
 */

if (!headers_sent()) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

// Validasi pembatasan akses khusus jaringan lokal Wi-Fi (LAN)
validateLocalNetworkAccess();

// Pastikan selalu merespons dengan JSON (kecuali export CSV)
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if ($action === 'export_csv') {
    handleExportCsv();
    exit;
}

if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
}

try {
    $pdo = getDatabaseConnection();

    switch ($action) {
        case 'get_summary':
            handleGetSummary($pdo);
            break;

        case 'add_transaction':
            handleAddTransaction($pdo);
            break;

        case 'delete_transaction':
            handleDeleteTransaction($pdo);
            break;

        case 'update_target':
            handleUpdateTarget($pdo);
            break;

        case 'get_goals':
            handleGetGoals($pdo);
            break;

        case 'save_goal':
            handleSaveGoal($pdo);
            break;

        case 'set_active_goal':
            handleSetActiveGoal($pdo);
            break;

        case 'delete_goal':
            handleDeleteGoal($pdo);
            break;

        case 'get_network_info':
            handleGetNetworkInfo();
            break;

        default:
            echo json_encode([
                'success' => false,
                'message' => 'Aksi tidak valid atau parameter action tidak ditemukan.'
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan pada server: ' . $e->getMessage()
    ]);
}

/**
 * Mengambil ringkasan keuangan dan daftar transaksi berdasarkan bulan (YYYY-MM),
 * terintegrasi dengan Target Tabungan Periode (Multi-Bulan / Tahunan).
 */
function handleGetSummary(PDO $pdo) {
    $month = $_GET['month'] ?? date('Y-m');
    if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
        $month = date('Y-m');
    }

    $startDate = $month . '-01';
    $endDate = date('Y-m-t', strtotime($startDate));

    // 1. Ambil transaksi pada bulan yang sedang dilihat
    $stmt = $pdo->prepare("
        SELECT id, type, amount, category, date, note, created_at
        FROM transactions
        WHERE date BETWEEN :start_date AND :end_date
        ORDER BY date DESC, id DESC
    ");
    $stmt->execute([
        ':start_date' => $startDate,
        ':end_date' => $endDate
    ]);
    $transactions = $stmt->fetchAll();

    // 2. Ambil juga semua transaksi (untuk opsi filter semua riwayat)
    $allStmt = $pdo->query("
        SELECT id, type, amount, category, date, note, created_at
        FROM transactions
        ORDER BY date DESC, id DESC
    ");
    $allTransactions = $allStmt->fetchAll();

    // 3. Hitung total pendapatan dan pengeluaran KHUSUS bulan yang sedang dilihat (Arus Kas Bulanan)
    $monthlyIncome = 0;
    $monthlyExpense = 0;

    foreach ($transactions as $t) {
        $amt = (float)$t['amount'];
        if ($t['type'] === 'income') {
            $monthlyIncome += $amt;
        } else {
            $monthlyExpense += $amt;
        }
    }

    $monthlyCashflow = $monthlyIncome - $monthlyExpense;

    // 4. Hitung TOTAL SALDO KAS BERJALAN (Akumulasi kas nyata yang dimiliki pengguna sampai bulan ini)
    $runningBalanceStmt = $pdo->prepare("
        SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        WHERE date <= :end_date
    ");
    $runningBalanceStmt->execute([':end_date' => $endDate]);
    $runningRow = $runningBalanceStmt->fetch();

    $runningIncome = $runningRow['total_income'] ? (float)$runningRow['total_income'] : 0;
    $runningExpense = $runningRow['total_expense'] ? (float)$runningRow['total_expense'] : 0;
    // Saldo Saat Ini adalah akumulasi kas nyata (pendapatan bulan lalu yang belum habis tetap ada di saldo)
    $currentBalance = $runningIncome - $runningExpense;

    // 5. Ambil Target Tabungan Terintegrasi (Goal-Based) yang aktif
    $goalStmt = $pdo->prepare("
        SELECT id, title, target_amount, start_month, end_month, is_active
        FROM savings_goals
        WHERE is_active = 1
        ORDER BY id DESC
        LIMIT 1
    ");
    $goalStmt->execute();
    $activeGoal = $goalStmt->fetch();

    if (!$activeGoal) {
        // Cek jika ada target lain tapi belum aktif
        $anyGoal = $pdo->query("SELECT id, title, target_amount, start_month, end_month, is_active FROM savings_goals ORDER BY id DESC LIMIT 1")->fetch();
        if ($anyGoal) {
            $activeGoal = $anyGoal;
        }
    }

    if (!$activeGoal) {
        // Kondisi bersih (Database baru atau di-reset)
        echo json_encode([
            'success' => true,
            'data' => [
                'month' => $month,
                'summary' => [
                    'total_income' => $monthlyIncome,
                    'total_expense' => $monthlyExpense,
                    'monthly_cashflow' => $monthlyCashflow,
                    'current_balance' => $currentBalance,
                    'target_amount' => 0,
                    'percentage' => 0,
                    'raw_percentage' => 0,
                    'remaining_to_target' => 0,
                    'status' => 'no_target',
                    'alert_message' => 'Belum ada target tabungan aktif. Klik tombol "Atur Target Periode" untuk menentukan sasaran tabungan Anda.',
                    'goal' => [
                        'id' => 0,
                        'title' => 'Belum Ada Target Aktif',
                        'target_amount' => 0,
                        'start_month' => $month,
                        'end_month' => date('Y-12'),
                        'cumulative_balance' => $currentBalance,
                        'cumulative_income' => $monthlyIncome,
                        'cumulative_expense' => $monthlyExpense,
                        'total_months' => 0,
                        'months_elapsed' => 0,
                        'remaining_months' => 0,
                        'monthly_saving_recommended' => 0,
                        'percentage' => 0,
                        'raw_percentage' => 0,
                        'remaining_to_target' => 0,
                        'status' => 'no_target',
                        'alert_message' => 'Belum ada target tabungan aktif. Klik tombol "Atur Target Periode" untuk menentukan sasaran tabungan Anda.'
                    ]
                ],
                'transactions' => $transactions,
                'all_transactions' => $allTransactions,
                'transaction_count' => count($transactions)
            ]
        ]);
        return;
    }

    // 4. Hitung Akumulasi Terintegrasi dari Bulan Mulai (start_month) s/d Akhir Bulan yang Dilihat
    $goalStartMonth = $activeGoal['start_month'];
    $goalEndMonth = $activeGoal['end_month'];
    $targetAmount = (float)$activeGoal['target_amount'];

    $cumStartDate = $goalStartMonth . '-01';
    // Akumulasi dihitung sampai akhir bulan yang sedang aktif dilihat pengguna
    $cumEndDate = date('Y-m-t', strtotime($startDate));

    if (strcmp($cumEndDate, $cumStartDate) < 0) {
        // Bulan yang dilihat saat ini berada sebelum bulan mulai periode pengumpulan target
        $cumIncome = 0;
        $cumExpense = 0;
        $cumulativeBalance = 0;
    } else {
        $cumStmt = $pdo->prepare("
            SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
            FROM transactions
            WHERE date BETWEEN :cum_start AND :cum_end
        ");
        $cumStmt->execute([
            ':cum_start' => $cumStartDate,
            ':cum_end' => $cumEndDate
        ]);
        $cumRow = $cumStmt->fetch();

        $cumIncome = $cumRow['total_income'] ? (float)$cumRow['total_income'] : 0;
        $cumExpense = $cumRow['total_expense'] ? (float)$cumRow['total_expense'] : 0;
        $cumulativeBalance = $cumIncome - $cumExpense;
    }

    // 5. Analisis Waktu & Periode (Bulan Mulai, Bulan Berjalan, Bulan Target)
    $startParts = explode('-', $goalStartMonth);
    $endParts = explode('-', $goalEndMonth);
    $viewParts = explode('-', $month);

    $startY = (int)$startParts[0]; $startM = (int)$startParts[1];
    $endY = (int)$endParts[0]; $endM = (int)$endParts[1];
    $viewY = (int)$viewParts[0]; $viewM = (int)$viewParts[1];

    $totalMonthsInPeriod = max(1, ($endY - $startY) * 12 + ($endM - $startM) + 1);
    $monthsElapsed = ($viewY - $startY) * 12 + ($viewM - $startM) + 1;
    $monthsElapsed = max(1, min($totalMonthsInPeriod, $monthsElapsed));

    // Sisa bulan menuju batas target (termasuk bulan berjalan jika belum terlewati)
    $remainingMonths = ($endY - $viewY) * 12 + ($endM - $viewM) + 1;
    if ($remainingMonths < 0) {
        $remainingMonths = 0;
    }

    // 6. Hitung Metrik Target & Rekomendasi Tabungan Bulanan
    $remainingToTarget = max(0, $targetAmount - $cumulativeBalance);
    $percentage = $targetAmount > 0 ? min(100, max(0, round(($cumulativeBalance / $targetAmount) * 100, 1))) : 0;
    $rawPercentage = $targetAmount > 0 ? round(($cumulativeBalance / $targetAmount) * 100, 1) : 0;

    // Rekomendasi nominal tabungan per bulan
    $monthlySavingRecommended = $remainingMonths > 0 ? round($remainingToTarget / $remainingMonths) : 0;

    // Kecepatan ideal tabungan (proyeksi ideal saat ini)
    $idealProgress = ($monthsElapsed / $totalMonthsInPeriod) * $targetAmount;

    // Tentukan Status: 'success' | 'on_track' | 'warning' | 'expired'
    $status = 'warning';
    $alertMessage = '';

    if ($targetAmount <= 0) {
        $status = 'no_target';
        $alertMessage = 'Nominal target tabungan belum diatur.';
    } elseif ($cumulativeBalance >= $targetAmount) {
        $status = 'success';
        $surplus = $cumulativeBalance - $targetAmount;
        $alertMessage = 'Target Tabungan Tercapai! Akumulasi tabungan telah mencapai ' . $rawPercentage . '% dari sasaran target.' . ($surplus > 0 ? ' Kelebihan tabungan: Rp ' . number_format($surplus, 0, ',', '.') : '');
    } elseif ($remainingMonths === 0 && ($viewY > $endY || ($viewY === $endY && $viewM > $endM))) {
        $status = 'expired';
        $alertMessage = 'Batas periode target telah terlewati. Tabungan terkumpul Rp ' . number_format($cumulativeBalance, 0, ',', '.') . ' dari target Rp ' . number_format($targetAmount, 0, ',', '.') . ' (Kurang Rp ' . number_format($remainingToTarget, 0, ',', '.') . ').';
    } elseif ($viewY < $startY || ($viewY === $startY && $viewM < $startM)) {
        $status = 'upcoming';
        $alertMessage = 'Target ini dijadwalkan mulai pada ' . getIndoMonthName($startM) . ' ' . $startY . '. Transaksi di bulan ' . getIndoMonthName($viewM) . ' ' . $viewY . ' belum masuk hitungan target ini. Jika ingin tabungan saat ini dihitung, ubah Bulan Mulai target ke ' . getIndoMonthName($viewM) . ' ' . $viewY . '.';
    } elseif ($cumulativeBalance >= ($idealProgress * 0.9)) {
        // Laju tabungan bagus / on-track
        $status = 'success';
        $alertMessage = 'Laju Tabungan On-Track! Anda sudah mengumpulkan Rp ' . number_format($cumulativeBalance, 0, ',', '.') . ' (' . $rawPercentage . '%). Sisihkan sekitar Rp ' . number_format($monthlySavingRecommended, 0, ',', '.') . '/bulan dalam ' . $remainingMonths . ' bulan tersisa untuk mencapai target.';
    } else {
        // Tertinggal dari jadwal ideal (Warna merah)
        $status = 'warning';
        $alertMessage = 'Perhatian: Tabungan terkumpul (Rp ' . number_format($cumulativeBalance, 0, ',', '.') . ') masih di bawah proyeksi ideal. Anda perlu menabung rata-rata Rp ' . number_format($monthlySavingRecommended, 0, ',', '.') . '/bulan selama ' . $remainingMonths . ' bulan ke depan agar target di bulan ' . getIndoMonthName($endM) . ' ' . $endY . ' tercapai.';
    }

    // Ambil info bulan-bulan yang memiliki data transaksi
    $monthsStmt = $pdo->query("SELECT SUBSTR(date, 1, 7) as m, COUNT(*) as cnt FROM transactions GROUP BY m ORDER BY m DESC");
    $monthsWithData = $monthsStmt->fetchAll(PDO::FETCH_KEY_PAIR);
    $latestMonth = !empty($monthsWithData) ? array_key_first($monthsWithData) : date('Y-m');

    // Ambil seluruh daftar target untuk switcher
    $allGoalsStmt = $pdo->query("SELECT * FROM savings_goals ORDER BY is_active DESC, id DESC");
    $allGoals = $allGoalsStmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => [
            'month' => $month,
            'latest_month' => $latestMonth,
            'months_with_data' => $monthsWithData,
            'goals' => $allGoals,
            'summary' => [
                'total_income' => $monthlyIncome,
                'total_expense' => $monthlyExpense,
                'monthly_cashflow' => $monthlyCashflow,
                'current_balance' => $currentBalance,
                // Target Bulanan (kompatibilitas)
                'target_amount' => $targetAmount,
                'percentage' => $percentage,
                'raw_percentage' => $rawPercentage,
                'remaining_to_target' => $remainingToTarget,
                'status' => $status,
                'alert_message' => $alertMessage,
                // Target Terintegrasi Multi-Bulan / Tahunan
                'goal' => [
                    'id' => (int)$activeGoal['id'],
                    'title' => $activeGoal['title'],
                    'target_amount' => $targetAmount,
                    'start_month' => $goalStartMonth,
                    'end_month' => $goalEndMonth,
                    'cumulative_balance' => $cumulativeBalance,
                    'cumulative_income' => $cumIncome,
                    'cumulative_expense' => $cumExpense,
                    'total_months' => $totalMonthsInPeriod,
                    'months_elapsed' => $monthsElapsed,
                    'remaining_months' => $remainingMonths,
                    'monthly_saving_recommended' => $monthlySavingRecommended,
                    'percentage' => $percentage,
                    'raw_percentage' => $rawPercentage,
                    'remaining_to_target' => $remainingToTarget,
                    'status' => $status,
                    'alert_message' => $alertMessage
                ]
            ],
            'transactions' => $transactions,
            'all_transactions' => $allTransactions,
            'transaction_count' => count($transactions)
        ]
    ]);
}

/**
 * Mengambil seluruh daftar target tabungan (Multi-Goal)
 */
function handleGetGoals(PDO $pdo) {
    $stmt = $pdo->query("SELECT * FROM savings_goals ORDER BY is_active DESC, id DESC");
    $goals = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'goals' => $goals
    ]);
}

/**
 * Menyimpan / memperbarui target tabungan terintegrasi (Multi-Bulan / Tahunan)
 */
function handleSaveGoal(PDO $pdo) {
    $input = getRequestPayload();

    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $title = trim($input['title'] ?? 'Target Tabungan');
    $targetAmount = (float)($input['target_amount'] ?? 0);
    $startMonth = trim($input['start_month'] ?? '');
    $endMonth = trim($input['end_month'] ?? '');
    $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

    if (empty($title)) {
        $title = 'Target Tabungan';
    }

    if ($targetAmount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Nominal target harus lebih besar dari 0.']);
        return;
    }

    if (!preg_match('/^\d{4}-\d{2}$/', $startMonth) || !preg_match('/^\d{4}-\d{2}$/', $endMonth)) {
        echo json_encode(['success' => false, 'message' => 'Format bulan harus berupa YYYY-MM (contoh: 2026-04).']);
        return;
    }

    if (strcmp($startMonth, $endMonth) > 0) {
        echo json_encode(['success' => false, 'message' => 'Bulan mulai tidak boleh lebih besar dari bulan target/akhir.']);
        return;
    }

    // Jika target ini aktif, nonaktifkan target lain terlebih dahulu
    if ($isActive === 1) {
        $pdo->exec("UPDATE savings_goals SET is_active = 0");
    }

    if ($id > 0) {
        $stmt = $pdo->prepare("
            UPDATE savings_goals 
            SET title = :title, target_amount = :target_amount, start_month = :start_month, end_month = :end_month, is_active = :is_active
            WHERE id = :id
        ");
        $stmt->execute([
            ':title' => $title,
            ':target_amount' => $targetAmount,
            ':start_month' => $startMonth,
            ':end_month' => $endMonth,
            ':is_active' => $isActive,
            ':id' => $id
        ]);
        $message = 'Target tabungan berhasil diperbarui!';
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO savings_goals (title, target_amount, start_month, end_month, is_active)
            VALUES (:title, :target_amount, :start_month, :end_month, :is_active)
        ");
        $stmt->execute([
            ':title' => $title,
            ':target_amount' => $targetAmount,
            ':start_month' => $startMonth,
            ':end_month' => $endMonth,
            ':is_active' => $isActive
        ]);
        $id = $pdo->lastInsertId();
        $message = 'Target tabungan baru berhasil ditambahkan!';
    }

    echo json_encode([
        'success' => true,
        'message' => $message,
        'id' => $id
    ]);
}

/**
 * Menjadikan salah satu target sebagai target aktif di dashboard
 */
function handleSetActiveGoal(PDO $pdo) {
    $input = getRequestPayload();
    $id = (int)($input['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID target tidak valid.']);
        return;
    }

    $pdo->exec("UPDATE savings_goals SET is_active = 0");
    $stmt = $pdo->prepare("UPDATE savings_goals SET is_active = 1 WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Target tabungan aktif berhasil diubah.'
    ]);
}

/**
 * Menghapus target tabungan
 */
function handleDeleteGoal(PDO $pdo) {
    $input = getRequestPayload();
    $id = (int)($input['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID target tidak valid.']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM savings_goals WHERE id = :id");
    $stmt->execute([':id' => $id]);

    // Jika yang dihapus adalah target aktif, aktifkan target lainnya jika masih ada
    $check = $pdo->query("SELECT id FROM savings_goals WHERE is_active = 1 LIMIT 1")->fetch();
    if (!$check) {
        $pdo->exec("UPDATE savings_goals SET is_active = 1 ORDER BY id DESC LIMIT 1");
    }

    echo json_encode([
        'success' => true,
        'message' => 'Target tabungan berhasil dihapus.'
    ]);
}

/**
 * Menambahkan transaksi baru
 */
function handleAddTransaction(PDO $pdo) {
    $input = getRequestPayload();

    $type = trim($input['type'] ?? '');
    $amount = (float)($input['amount'] ?? 0);
    $category = trim($input['category'] ?? '');
    $date = trim($input['date'] ?? '');
    $note = trim($input['note'] ?? '');

    // Validasi
    if (!in_array($type, ['income', 'expense'])) {
        echo json_encode(['success' => false, 'message' => 'Jenis transaksi harus berupa Pendapatan (income) atau Pengeluaran (expense).']);
        return;
    }

    if ($amount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Nominal transaksi harus lebih besar dari 0.']);
        return;
    }

    if (empty($category)) {
        echo json_encode(['success' => false, 'message' => 'Kategori transaksi wajib diisi.']);
        return;
    }

    if (empty($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = date('Y-m-d');
    }

    $stmt = $pdo->prepare("
        INSERT INTO transactions (type, amount, category, date, note)
        VALUES (:type, :amount, :category, :date, :note)
    ");

    $stmt->execute([
        ':type' => $type,
        ':amount' => $amount,
        ':category' => $category,
        ':date' => $date,
        ':note' => $note
    ]);

    $insertedId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Transaksi berhasil ditambahkan!',
        'id' => $insertedId
    ]);
}

/**
 * Menghapus transaksi berdasarkan ID
 */
function handleDeleteTransaction(PDO $pdo) {
    $input = getRequestPayload();
    $id = (int)($input['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID transaksi tidak valid.']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = :id");
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Transaksi berhasil dihapus.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Transaksi tidak ditemukan atau sudah dihapus.']);
    }
}

/**
 * Memperbarui target bulanan (fallback kompatibilitas)
 */
function handleUpdateTarget(PDO $pdo) {
    $input = getRequestPayload();
    $monthKey = trim($input['month_key'] ?? '');
    $targetAmount = (float)($input['target_amount'] ?? 0);

    if (!preg_match('/^\d{4}-\d{2}$/', $monthKey)) {
        echo json_encode(['success' => false, 'message' => 'Format bulan harus YYYY-MM.']);
        return;
    }

    $stmt = $pdo->prepare("
        UPDATE savings_goals 
        SET target_amount = :target_amount, updated_at = CURRENT_TIMESTAMP 
        WHERE is_active = 1
    ");
    $stmt->execute([':target_amount' => $targetAmount]);

    echo json_encode([
        'success' => true,
        'message' => 'Target tabungan berhasil disimpan!',
        'target_amount' => $targetAmount
    ]);
}

/**
 * Ekspor transaksi ke file CSV (Otomatis mengekspor seluruh transaksi jika bulan kosong)
 */
function handleExportCsv() {
    $pdo = getDatabaseConnection();
    $month = $_GET['month'] ?? 'all';
    $rows = [];
    $filename = 'laporan-keuangan-' . $month . '.csv';

    if ($month !== 'all' && preg_match('/^\d{4}-\d{2}$/', $month)) {
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));

        $stmt = $pdo->prepare("
            SELECT date, type, category, amount, note 
            FROM transactions 
            WHERE date BETWEEN :start_date AND :end_date 
            ORDER BY date ASC, id ASC
        ");
        $stmt->execute([':start_date' => $startDate, ':end_date' => $endDate]);
        $rows = $stmt->fetchAll();
    }

    // Jika bulan yang dipilih tidak memiliki transaksi, otomatis ekspor seluruh data transaksi di database
    if (empty($rows)) {
        $stmt = $pdo->query("
            SELECT date, type, category, amount, note 
            FROM transactions 
            ORDER BY date ASC, id ASC
        ");
        $rows = $stmt->fetchAll();
        $filename = 'laporan-keuangan-seluruh-transaksi.csv';
    }

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=' . $filename);

    $output = fopen('php://output', 'w');
    fputs($output, "\xEF\xBB\xBF");

    fputcsv($output, ['Tanggal', 'Jenis', 'Kategori', 'Nominal (Rp)', 'Catatan']);

    foreach ($rows as $row) {
        fputcsv($output, [
            $row['date'],
            $row['type'] === 'income' ? 'Pendapatan' : 'Pengeluaran',
            $row['category'],
            number_format((float)$row['amount'], 2, ',', '.'),
            $row['note'] ?? '-'
        ]);
    }

    fclose($output);
}

function getIndoMonthName(int $m) {
    $names = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
    ];
    return $names[$m] ?? '';
}

function getRequestPayload() {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $json = json_decode($raw, true);
        if (is_array($json)) {
            return $json;
        }
    }
    return $_POST;
}

/**
 * Mengembalikan informasi jaringan lokal dan URL akses Wi-Fi
 */
function handleGetNetworkInfo() {
    $lanIp = detectServerLanIp();
    $serverPort = $_SERVER['SERVER_PORT'] ?? '80';
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    
    // Tentukan path direktori web
    $scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
    $path = ($scriptDir === '' ? '' : $scriptDir) . '/';
    $portSuffix = ($serverPort === '80' || $serverPort === '443') ? '' : ":{$serverPort}";
    
    $lanUrl = "{$protocol}{$lanIp}{$portSuffix}{$path}";
    $localhostUrl = "{$protocol}localhost{$portSuffix}{$path}";

    echo json_encode([
        'success' => true,
        'data' => [
            'lan_ip' => $lanIp,
            'client_ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            'port' => (int)$serverPort,
            'wifi_ssid' => 'PERTA SHOP',
            'lan_url' => $lanUrl,
            'localhost_url' => $localhostUrl,
            'is_lan_client' => isAllowedLocalClient(),
            'is_localhost' => in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1', 'localhost'])
        ]
    ]);
}

