-- ==========================================================
-- Database Schema: Aplikasi Pelacak Tabungan & Anggaran (XAMPP)
-- Database Name: penabungan_db
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `penabungan_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `penabungan_db`;

-- --------------------------------------------------------
-- Tabel: transactions (Mencatat Pendapatan & Pengeluaran)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('income', 'expense') NOT NULL COMMENT 'Jenis: income=Pendapatan, expense=Pengeluaran',
    `amount` DECIMAL(15, 2) NOT NULL COMMENT 'Nominal transaksi',
    `category` VARCHAR(100) NOT NULL COMMENT 'Kategori transaksi',
    `date` DATE NOT NULL COMMENT 'Tanggal transaksi',
    `note` TEXT NULL COMMENT 'Catatan singkat',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_date` (`date`),
    INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: savings_targets (Target Tabungan per Bulan Tunggal)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `savings_targets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `month_key` VARCHAR(7) UNIQUE NOT NULL COMMENT 'Format bulan: YYYY-MM',
    `target_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Nominal target tabungan',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: savings_goals (Target Tabungan Multi-Bulan / Tahunan Terintegrasi)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `savings_goals` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL COMMENT 'Nama sasaran tabungan, misal: Tabungan Akhir Tahun 2026',
    `target_amount` DECIMAL(15, 2) NOT NULL COMMENT 'Nominal target yang ingin dicapai',
    `start_month` VARCHAR(7) NOT NULL COMMENT 'Bulan mulai menabung (YYYY-MM)',
    `end_month` VARCHAR(7) NOT NULL COMMENT 'Bulan batas target / deadline (YYYY-MM)',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Target aktif di dashboard utama',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Data Sampel Opsional (Demo Awal)
-- --------------------------------------------------------
INSERT INTO `savings_goals` (`title`, `target_amount`, `start_month`, `end_month`, `is_active`) 
VALUES ('Target Tabungan Akhir Tahun', 10000000.00, DATE_FORMAT(CURRENT_DATE, '%Y-04'), DATE_FORMAT(CURRENT_DATE, '%Y-12'), 1);

INSERT INTO `transactions` (`type`, `amount`, `category`, `date`, `note`) VALUES
('income', 6500000.00, 'Gaji Pokok', CURRENT_DATE, 'Gaji bulanan kantor'),
('expense', 450000.00, 'Makan & Minum', CURRENT_DATE, 'Belanja mingguan pasar & supermarket'),
('expense', 250000.00, 'Transportasi', CURRENT_DATE, 'Bensin dan isi e-toll'),
('expense', 600000.00, 'Tagihan Listrik & Air', CURRENT_DATE, 'Pembayaran utilitas bulanan');
