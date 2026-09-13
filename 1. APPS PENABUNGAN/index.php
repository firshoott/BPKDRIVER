<?php
require_once __DIR__ . '/config.php';
validateLocalNetworkAccess();
$serverLanIp = detectServerLanIp();
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TabunganKu - Pelacak Pendapatan, Pengeluaran & Target Tabungan</title>
  <meta name="description" content="Aplikasi pencatat keuangan pribadi modern dan responsif untuk melacak pendapatan, pengeluaran, dan progress target tabungan bulanan.">
  
  <!-- Google Fonts: Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Main Stylesheet -->
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M21 18v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-8-2h10V8H13v8zm4-2.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z'/></svg>">
</head>
<body>

  <!-- Ambient Dynamic Background Glows -->
  <div class="ambient-glow" aria-hidden="true">
    <div class="glow-1"></div>
    <div class="glow-2"></div>
    <div class="glow-3"></div>
  </div>

  <div class="container">
    
    <!-- Top Application Header -->
    <header class="app-header">
      <div class="brand-wrapper">
        <div class="brand-logo" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
          </svg>
        </div>
        <div>
          <h1 class="brand-title">TabunganKu</h1>
          <span class="brand-subtitle">Pelacak Pendapatan & Pengeluaran Bulanan</span>
        </div>
      </div>

      <div class="header-controls">
        <!-- Month Navigation Switcher -->
        <div class="month-selector" role="region" aria-label="Navigasi Periode Bulan">
          <button type="button" class="month-btn" id="prevMonthBtn" title="Bulan Sebelumnya" aria-label="Bulan Sebelumnya">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="current-month-label" id="currentMonthDisplay">September 2026</span>
          <button type="button" class="month-btn" id="nextMonthBtn" title="Bulan Berikutnya" aria-label="Bulan Berikutnya">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <button type="button" class="icon-btn" id="todayBtn" title="Kembali ke bulan berjalan saat ini">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Hari Ini
        </button>

        <button type="button" class="icon-btn" id="exportBtn" title="Unduh data transaksi ke file Excel CSV">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Ekspor CSV
        </button>

        <!-- Tombol Akses & Bagikan Wi-Fi LAN -->
        <button type="button" class="icon-btn btn-lan-share" id="lanShareBtn" title="Buka di HP / Bagikan Jaringan Wi-Fi Ini">
          <span class="lan-pulse-dot" aria-hidden="true"></span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
          <span class="lan-share-label">Wi-Fi LAN</span>
        </button>

        <!-- Theme Toggle Dark / Light -->
        <button type="button" class="icon-btn" id="themeToggleBtn" title="Ganti Mode Gelap / Terang">
          <svg id="themeIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
      </div>
    </header>

    <!-- Ringkasan Dashboard (Total Pendapatan, Total Pengeluaran, Saldo Saat Ini) -->
    <section class="summary-grid" aria-label="Ringkasan Metrik Finansial">
      
      <!-- Card: Saldo Saat Ini -->
      <article class="metric-card balance" id="metricCardBalance">
        <div class="metric-header">
          <span class="metric-title">Saldo Saat Ini</span>
          <div class="metric-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
        </div>
        <div class="metric-value" id="cardBalance">Rp 0</div>
        <div class="metric-footer">
          <span class="badge-status healthy" id="balanceBadge">Surplus</span>
          <span id="balanceFormulaText">Pendapatan - Pengeluaran</span>
        </div>
      </article>

      <!-- Card: Total Pendapatan -->
      <article class="metric-card income">
        <div class="metric-header">
          <span class="metric-title">Total Pendapatan</span>
          <div class="metric-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </div>
        </div>
        <div class="metric-value" id="cardIncome">Rp 0</div>
        <div class="metric-footer">
          <span>Pemasukan Bulan Ini</span>
        </div>
      </article>

      <!-- Card: Total Pengeluaran -->
      <article class="metric-card expense">
        <div class="metric-header">
          <span class="metric-title">Total Pengeluaran</span>
          <div class="metric-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
        </div>
        <div class="metric-value" id="cardExpense">Rp 0</div>
        <div class="metric-footer">
          <span>Pengeluaran Bulan Ini</span>
        </div>
      </article>

    </section>

    <!-- Bagian Target Tabungan Terintegrasi (Multi-Bulan / Tahunan) & Progress Bar Real-Time -->
    <section class="savings-target-card" id="savingsTargetCard" aria-label="Bagian Target Tabungan Terintegrasi">
      <div class="target-header">
        <div class="target-title-wrap">
          <div class="target-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m4.93 4.93 4.24 4.24"></path>
              <path d="m14.83 9.17 4.24-4.24"></path>
              <path d="m14.83 14.83 4.24 4.24"></path>
              <path d="m9.17 14.83-4.24 4.24"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
              <h2 class="target-heading" id="targetGoalTitle">Target Tabungan Periode</h2>
              <span class="period-badge" id="targetPeriodBadge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span id="targetPeriodText">April 2026 ➔ Desember 2026</span>
              </span>
            </div>
            <span class="target-subheading">Akumulasi seluruh saldo bersih (pendapatan - pengeluaran) sejak awal periode pengumpulan</span>
          </div>
        </div>

        <div class="target-actions-group">
          <!-- Quick Selector Target jika ada lebih dari 1 target -->
          <div class="quick-goal-select-wrap" id="quickGoalSelectWrap" style="display: none;">
            <select id="quickGoalSelect" class="quick-goal-select" title="Ganti target yang sedang dipantau"></select>
          </div>

          <button type="button" class="btn-add-goal-main" id="btnAddNewGoalMain" title="Tambah Sasaran Target Tabungan Baru">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ Tambah Target</span>
          </button>

          <button type="button" class="btn-edit-target" id="openTargetModalBtn" title="Lihat dan Kelola Semua Target">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Kelola Target</span>
          </button>
        </div>
      </div>

      <!-- Detail 4 Statistik Target Terintegrasi -->
      <div class="target-stats-row">
        <div class="target-stat-item">
          <div class="target-stat-label">Sasaran Target</div>
          <div class="target-stat-value" id="targetDisplayAmount">Rp 0</div>
        </div>
        <div class="target-stat-item">
          <div class="target-stat-label">Akumulasi Terkumpul</div>
          <div class="target-stat-value" id="targetCurrentBalance">Rp 0</div>
        </div>
        <div class="target-stat-item">
          <div class="target-stat-label" id="targetDifferenceLabel">Sisa Kekurangan</div>
          <div class="target-stat-value" id="targetDifferenceValue">Rp 0</div>
        </div>
        <div class="target-stat-item">
          <div class="target-stat-label">Waktu Tersisa</div>
          <div class="target-stat-value" id="targetRemainingTime" style="color: #38bdf8;">0 Bulan</div>
        </div>
      </div>

      <!-- Bilah Kemajuan (Progress Bar) Visual -->
      <div class="progress-container">
        <div class="progress-info">
          <span>Pencapaian Target Akumulasi</span>
          <span id="targetProgressPercent">0%</span>
        </div>
        <div class="progress-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="progressTrack">
          <div class="progress-fill status-warning" id="targetProgressBar" style="width: 0%;"></div>
        </div>
      </div>

      <!-- Kotak Analisis & Rekomendasi Tabungan Cerdas -->
      <div class="recommendation-box" id="recommendationBox">
        <div class="rec-icon">💡</div>
        <div class="rec-text" id="recommendationText">
          Untuk mencapai target, sisihkan rata-rata <strong>Rp 0 / bulan</strong> selama periode pengumpulan.
        </div>
      </div>

      <!-- Pesan Peringatan Logika Dinamis -->
      <div class="target-alert-banner alert-warning" id="targetAlertBanner" role="alert" style="margin-top: 1rem;">
        <div class="alert-icon-box" id="alertIconBox">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="alert-message" id="targetAlertMessage">
          <strong>Perhatian:</strong>
          <span>Akumulasi tabungan saat ini masih di bawah jadwal target yang ditentukan.</span>
        </div>
      </div>
    </section>

    <!-- Tata Letak Utama 2 Kolom (Mobile: 1 Kolom Bertumpuk) -->
    <main class="main-layout">
      
      <!-- Kolom Kiri: Formulir Tambah Transaksi -->
      <section class="form-card" aria-label="Formulir Transaksi Baru">
        <div class="section-header">
          <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Tambah Transaksi
          </h2>
        </div>

        <form id="transactionForm" autocomplete="off">
          
          <!-- Toggle Jenis Transaksi: Pendapatan vs Pengeluaran -->
          <div class="type-toggle-group" role="radiogroup" aria-label="Jenis Transaksi">
            <button type="button" class="type-toggle-btn active type-income" id="toggleIncome" role="radio" aria-checked="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
              Pendapatan
            </button>
            <button type="button" class="type-toggle-btn type-expense" id="toggleExpense" role="radio" aria-checked="false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
              Pengeluaran
            </button>
          </div>
          <input type="hidden" name="type" id="inputType" value="income">

          <!-- Jumlah (Nominal) -->
          <div class="form-group">
            <label for="inputAmountFormatted" class="form-label">Jumlah (Nominal)</label>
            <div class="form-input-wrap">
              <span class="input-prefix">Rp</span>
              <input 
                type="text" 
                id="inputAmountFormatted" 
                class="form-input has-prefix" 
                placeholder="0" 
                inputmode="numeric" 
                required
              >
              <input type="hidden" name="amount" id="inputAmount" value="0">
            </div>
          </div>

          <!-- Kategori Transaksi & Quick Tag Chips -->
          <div class="form-group">
            <label for="inputCategory" class="form-label">Kategori</label>
            <select id="inputCategory" name="category" class="form-select" required>
              <option value="" disabled selected>Pilih Kategori...</option>
              <!-- Dinamis diisi sesuai jenis transaksi (Income/Expense) -->
            </select>
            
            <!-- Quick Tag Buttons untuk input cepat -->
            <div class="quick-tags" id="quickCategoryTags">
              <!-- Tag cepat otomatis berubah sesuai mode income / expense -->
            </div>
          </div>

          <!-- Tanggal Transaksi -->
          <div class="form-group">
            <label for="inputDate" class="form-label">Tanggal Transaksi</label>
            <input type="date" id="inputDate" name="date" class="form-input" required>
          </div>

          <!-- Catatan Singkat -->
          <div class="form-group">
            <label for="inputNote" class="form-label">Catatan Singkat (Opsional)</label>
            <textarea id="inputNote" name="note" class="form-textarea" placeholder="Contoh: Gaji bulan ini, belanja bulanan, dll." rows="2"></textarea>
          </div>

          <!-- Tombol Submit -->
          <button type="submit" class="btn-primary" id="submitTransactionBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Simpan Transaksi
          </button>
        </form>
      </section>

      <!-- Kolom Kanan: Riwayat Transaksi -->
      <section class="history-card" aria-label="Riwayat Transaksi Bulanan">
        <div class="section-header">
          <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Riwayat Transaksi
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);" id="txCountBadge">(0)</span>
          </h2>
        </div>

        <!-- Toolbar Pencarian & Filter -->
        <div class="history-toolbar">
          <div class="search-input-box">
            <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="searchInput" placeholder="Cari kategori atau catatan..." aria-label="Cari transaksi">
          </div>

          <select class="filter-select" id="filterType" aria-label="Filter berdasarkan jenis">
            <option value="all">Bulan Ini (Semua)</option>
            <option value="income">Bulan Ini (Pendapatan)</option>
            <option value="expense">Bulan Ini (Pengeluaran)</option>
            <option value="all_history">Semua Bulan (Riwayat Lengkap)</option>
          </select>
        </div>

        <!-- Daftar Transaksi (Urut dari yang terbaru) -->
        <div class="transaction-list" id="transactionList" role="feed" aria-busy="false">
          <!-- Item transaksi akan di-render di sini via JavaScript -->
        </div>

        <!-- Empty State ketika belum ada transaksi -->
        <div class="empty-state" id="emptyState" style="display: none;">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <p>Belum ada transaksi di bulan ini</p>
          <span>Gunakan formulir di sebelah kiri untuk mencatat pendapatan atau pengeluaran baru.</span>
        </div>
      </section>

    </main>
  </div>

  <!-- Modal Pengaturan Target Tabungan Terintegrasi (Multi-Bulan / Tahunan) -->
  <div class="modal-backdrop" id="targetModal" role="dialog" aria-modal="true" aria-labelledby="targetModalTitle">
    <div class="modal-card" style="max-width: 540px;">
      <div class="modal-header">
        <h3 class="modal-title" id="targetModalTitle">Target Tabungan Periode</h3>
        <button type="button" class="btn-close-modal" id="closeTargetModalBtn" aria-label="Tutup Dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Tab Navigasi Modal -->
      <div class="modal-tabs">
        <button type="button" class="modal-tab-btn active" id="tabBtnForm">➕ Form Target</button>
        <button type="button" class="modal-tab-btn" id="tabBtnList">📋 Daftar Target (<span id="goalsCountBadge">0</span>)</button>
      </div>

      <!-- Tab Content 1: Formulir Target -->
      <div id="tabContentForm">
        <!-- Banner Mode Status: Tambah Baru vs Edit -->
        <div class="form-mode-banner mode-new" id="formModeBanner">
          <div class="banner-text">
            <strong id="bannerModeTitle">➕ Mode: Tambah Target Baru</strong>
            <span id="bannerModeSubtitle">Target ini akan ditambahkan ke daftar target tabungan Anda.</span>
          </div>
          <button type="button" class="btn-link-reset" id="btnSwitchToNewGoal" style="display: none;">+ Buat Target Baru Saja</button>
        </div>

        <form id="targetForm">
          <input type="hidden" name="goal_id" id="inputGoalId" value="0">

          <!-- Nama Target / Sasaran -->
          <div class="form-group">
            <label for="inputGoalTitle" class="form-label">Nama Sasaran Tabungan</label>
            <input 
              type="text" 
              id="inputGoalTitle" 
              name="title" 
              class="form-input" 
              placeholder="Contoh: Beli Laptop Baru, Liburan Akhir Tahun, Dana Darurat" 
              required
            >
            <!-- Quick Suggestion Chips -->
            <div class="quick-goal-suggestions" id="quickGoalSuggestions">
              <span class="suggestion-chip" data-title="Beli Gadget / Laptop">📱 Gadget/Laptop</span>
              <span class="suggestion-chip" data-title="Balik Kampung / Liburan">✈️ Mudik/Liburan</span>
              <span class="suggestion-chip" data-title="Dana Darurat">🛡️ Dana Darurat</span>
              <span class="suggestion-chip" data-title="Beli Motor / Mobil">🛵 Kendaraan</span>
              <span class="suggestion-chip" data-title="Renovasi Rumah">🏠 Renovasi</span>
            </div>
          </div>

          <!-- Nominal Target -->
          <div class="form-group">
            <label for="inputTargetModalFormatted" class="form-label">Nominal Target yang Ingin Dicapai (Rp)</label>
            <div class="form-input-wrap">
              <span class="input-prefix">Rp</span>
              <input 
                type="text" 
                id="inputTargetModalFormatted" 
                class="form-input has-prefix" 
                placeholder="Contoh: 10.000.000" 
                inputmode="numeric" 
                required
              >
              <input type="hidden" name="target_amount" id="inputTargetModal" value="0">
            </div>
          </div>

          <!-- Rentang Periode Pengumpulan (Bulan Mulai s/d Bulan Target) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.65rem;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <label for="inputStartMonth" class="form-label" style="margin-bottom: 0;">Bulan Mulai</label>
                <button type="button" class="btn-text-helper" id="btnSetStartMonthThisMonth" title="Gunakan bulan yang sedang aktif">Set Bulan Ini</button>
              </div>
              <input type="month" id="inputStartMonth" name="start_month" class="form-input" required>
              <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
                Mulai hitung tabungan dari bulan ini
              </span>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <label for="inputEndMonth" class="form-label" style="margin-bottom: 0;">Bulan Batas Akhir</label>
                <button type="button" class="btn-text-helper" id="btnSetEndMonthDec" title="Set ke akhir tahun">Desember</button>
              </div>
              <input type="month" id="inputEndMonth" name="end_month" class="form-input" required>
              <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
                Batas akhir pengumpulan
              </span>
            </div>
          </div>

          <!-- Catatan Info Periode -->
          <div class="goal-period-note">
            💡 <strong>Penting:</strong> Seluruh saldo bersih transaksi dari <em>Bulan Mulai</em> hingga <em>Bulan Batas Akhir</em> akan dihitung otomatis sebagai progres pencapaian target ini.
          </div>

          <!-- Opsi Jadikan Target Aktif -->
          <div class="form-group" style="margin-top: 0.85rem; margin-bottom: 1.15rem;">
            <label class="custom-checkbox-label">
              <input type="checkbox" id="inputMakeActive" checked>
              <span>Jadikan sebagai target utama yang aktif dipantau di dashboard</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" id="cancelTargetModalBtn">Batal</button>
            <button type="submit" class="btn-primary" style="width: auto; margin-top: 0;" id="saveTargetBtn">➕ Simpan Target Baru</button>
          </div>
        </form>
      </div>

      <!-- Tab Content 2: Daftar Target Tersimpan -->
      <div id="tabContentList" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
          <span style="font-size: 0.85rem; color: var(--text-secondary);">Target yang tersimpan di database:</span>
          <button type="button" class="btn-primary-sm" id="btnListAddNewGoal">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            + Target Baru
          </button>
        </div>

        <div class="goal-list" id="savedGoalsList">
          <!-- Daftar target akan di-render di sini via JavaScript -->
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="closeListModalBtn">Tutup</button>
        </div>
      </div>

    </div>
  </div>

  <!-- Modal Berbagi Akses Jaringan Lokal (Wi-Fi LAN) -->
  <div class="modal-backdrop" id="lanShareModal" role="dialog" aria-modal="true" aria-labelledby="lanShareModalTitle">
    <div class="modal-card" style="max-width: 500px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <div class="lan-header-icon-badge" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
          </div>
          <div>
            <h3 class="modal-title" id="lanShareModalTitle">Akses Jaringan Lokal (Wi-Fi)</h3>
            <span style="font-size: 0.78rem; color: var(--text-secondary);">Buka aplikasi ini dari HP atau laptop lain</span>
          </div>
        </div>
        <button type="button" class="btn-close-modal" id="closeLanModalBtn" aria-label="Tutup Dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="lan-modal-body">
        <!-- Status Badge Koneksi Wi-Fi -->
        <div class="lan-network-badge">
          <div class="lan-badge-info">
            <span class="lan-status-dot"></span>
            <span>Nama Wi-Fi: <strong id="lanWifiName">PERTA SHOP</strong></span>
          </div>
          <span class="lan-status-tag">Lokal Terhubung</span>
        </div>

        <!-- QR Code Card Box -->
        <div class="lan-qr-container">
          <div class="lan-qr-frame">
            <div id="lanQrCodeCanvasWrap">
              <!-- QR Code Canvas / SVG rendered here by JS -->
            </div>
          </div>
          <div class="lan-qr-hint">
            <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">📸 Pindai QR Code dengan HP</strong>
            <span style="color: var(--text-secondary); font-size: 0.82rem; line-height: 1.4; display: block;">
              Buka kamera smartphone yang terhubung ke Wi-Fi <strong>PERTA SHOP</strong>, lalu arahkan ke QR di atas untuk membuka aplikasi secara instan.
            </span>
          </div>
        </div>

        <!-- URL Input & Copy Button -->
        <div class="form-group" style="margin-top: 1.1rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <label class="form-label" style="margin-bottom: 0;">Alamat Akses di Browser HP / Laptop:</label>
            <span style="color: var(--primary-color); font-weight: 700; font-size: 0.85rem;" id="lanIpDisplay"><?= htmlspecialchars($serverLanIp) ?></span>
          </div>
          <div class="copy-url-group">
            <input 
              type="text" 
              id="lanUrlInput" 
              class="form-input has-copy-btn" 
              readonly 
              value="http://<?= htmlspecialchars($serverLanIp) ?>/apps_penabungan/"
            >
            <button type="button" class="btn-copy-url" id="btnCopyLanUrl" title="Salin tautan ke clipboard">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Salin</span>
            </button>
          </div>
        </div>

        <!-- Kotak Informasi Keamanan Jaringan -->
        <div class="lan-security-note">
          <div class="sec-note-icon">🔒</div>
          <div class="sec-note-text">
            <strong>Proteksi Jaringan Lokal Aktif</strong>
            <p>Hanya perangkat yang terhubung ke Wi-Fi <strong>PERTA SHOP</strong> yang dapat mengakses aplikasi ini. Perangkat di luar Wi-Fi (seperti kuota seluler / hotspot lain) secara otomatis tidak dapat mengakses.</p>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="margin-top: 1.25rem;">
        <button type="button" class="btn-secondary" id="closeLanModalFooterBtn">Tutup</button>
      </div>
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div class="toast-container" id="toastContainer" aria-live="polite"></div>

  <!-- QR Code Generator Library (Offline Local) -->
  <script src="js/qrcode.min.js"></script>

  <!-- Main Application JavaScript -->
  <script src="js/app.js"></script>
</body>
</html>
