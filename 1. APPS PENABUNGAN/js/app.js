/**
 * TabunganKu - Modern Web Application Logic (100% Static Client-Side)
 * Mendukung Auth Gate (fillipo/pipo112803), StorageService LocalStorage, 
 * Target Tabungan Terintegrasi, Ekspor CSV, dan Backup/Restore JSON.
 */

(function () {
  'use strict';

  // --- Kredensial Autentikasi ---
  const AUTH_CREDENTIALS = {
    username: 'fillipo',
    password: 'pipo112803'
  };

  const AUTH_KEY = 'tabunganku_auth_session';

  // --- Konstanta & Kategori Bawaan ---
  const CATEGORIES = {
    income: [
      { name: 'Gaji Pokok', icon: '💰' },
      { name: 'Bonus & Tunjangan', icon: '🎁' },
      { name: 'Hasil Usaha & Bisnis', icon: '💼' },
      { name: 'Investasi & Bunga', icon: '📈' },
      { name: 'Pemberian / Hadiah', icon: '🤝' },
      { name: 'Pendapatan Lain', icon: '✨' }
    ],
    expense: [
      { name: 'Makan & Minum', icon: '🍜' },
      { name: 'Transportasi & Bensin', icon: '🚗' },
      { name: 'Tagihan & Listrik/Air', icon: '⚡' },
      { name: 'Belanja Kebutuhan', icon: '🛒' },
      { name: 'Hiburan & Rekreasi', icon: '🍿' },
      { name: 'Kesehatan & Obat', icon: '💊' },
      { name: 'Pendidikan & Kursus', icon: '📚' },
      { name: 'Keluarga & Rumah', icon: '🏠' },
      { name: 'Amal & Sedekah', icon: '🤲' },
      { name: 'Pengeluaran Lain', icon: '📝' }
    ]
  };

  const MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // --- State Aplikasi ---
  const state = {
    currentDate: new Date(),
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(), // 0-indexed
    currentType: 'income',
    summary: null,
    transactions: [],
    allTransactions: [],
    searchQuery: '',
    filterType: 'all',
    theme: localStorage.getItem('tabunganku_theme') || 'dark',
    activeGoal: null,
    savedGoals: []
  };

  // --- Elemen DOM ---
  const el = {
    // Auth
    loginOverlay: document.getElementById('loginOverlay'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginRemember: document.getElementById('loginRemember'),
    loginError: document.getElementById('loginError'),
    loginErrorMsg: document.getElementById('loginErrorMsg'),
    togglePasswordBtn: document.getElementById('togglePasswordBtn'),
    userBadgeName: document.getElementById('userBadgeName'),
    logoutBtn: document.getElementById('logoutBtn'),

    // Header & Controls
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),
    currentMonthDisplay: document.getElementById('currentMonthDisplay'),
    todayBtn: document.getElementById('todayBtn'),
    exportBtn: document.getElementById('exportBtn'),
    backupBtn: document.getElementById('backupBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),

    // Cards Ringkasan
    cardBalance: document.getElementById('cardBalance'),
    balanceBadge: document.getElementById('balanceBadge'),
    cardIncome: document.getElementById('cardIncome'),
    cardExpense: document.getElementById('cardExpense'),
    balanceFormulaText: document.getElementById('balanceFormulaText'),

    // Target Tabungan Card (Multi-Bulan Terintegrasi)
    targetGoalTitle: document.getElementById('targetGoalTitle'),
    targetPeriodBadge: document.getElementById('targetPeriodBadge'),
    targetPeriodText: document.getElementById('targetPeriodText'),
    targetDisplayAmount: document.getElementById('targetDisplayAmount'),
    targetCurrentBalance: document.getElementById('targetCurrentBalance'),
    targetDifferenceLabel: document.getElementById('targetDifferenceLabel'),
    targetDifferenceValue: document.getElementById('targetDifferenceValue'),
    targetRemainingTime: document.getElementById('targetRemainingTime'),
    targetProgressPercent: document.getElementById('targetProgressPercent'),
    targetProgressBar: document.getElementById('targetProgressBar'),
    recommendationBox: document.getElementById('recommendationBox'),
    recommendationText: document.getElementById('recommendationText'),
    targetAlertBanner: document.getElementById('targetAlertBanner'),
    alertIconBox: document.getElementById('alertIconBox'),
    targetAlertMessage: document.getElementById('targetAlertMessage'),
    openTargetModalBtn: document.getElementById('openTargetModalBtn'),
    btnAddNewGoalMain: document.getElementById('btnAddNewGoalMain'),
    quickGoalSelectWrap: document.getElementById('quickGoalSelectWrap'),
    quickGoalSelect: document.getElementById('quickGoalSelect'),

    // Formulir Transaksi
    transactionForm: document.getElementById('transactionForm'),
    toggleIncome: document.getElementById('toggleIncome'),
    toggleExpense: document.getElementById('toggleExpense'),
    inputType: document.getElementById('inputType'),
    inputAmountFormatted: document.getElementById('inputAmountFormatted'),
    inputAmount: document.getElementById('inputAmount'),
    inputCategory: document.getElementById('inputCategory'),
    quickCategoryTags: document.getElementById('quickCategoryTags'),
    inputDate: document.getElementById('inputDate'),
    inputNote: document.getElementById('inputNote'),
    submitTransactionBtn: document.getElementById('submitTransactionBtn'),

    // Riwayat Transaksi
    transactionList: document.getElementById('transactionList'),
    emptyState: document.getElementById('emptyState'),
    txCountBadge: document.getElementById('txCountBadge'),
    searchInput: document.getElementById('searchInput'),
    filterType: document.getElementById('filterType'),

    // Modal Target Periode
    targetModal: document.getElementById('targetModal'),
    targetForm: document.getElementById('targetForm'),
    closeTargetModalBtn: document.getElementById('closeTargetModalBtn'),
    cancelTargetModalBtn: document.getElementById('cancelTargetModalBtn'),
    tabBtnForm: document.getElementById('tabBtnForm'),
    tabBtnList: document.getElementById('tabBtnList'),
    tabContentForm: document.getElementById('tabContentForm'),
    tabContentList: document.getElementById('tabContentList'),
    savedGoalsList: document.getElementById('savedGoalsList'),
    goalsCountBadge: document.getElementById('goalsCountBadge'),
    closeListModalBtn: document.getElementById('closeListModalBtn'),
    btnListAddNewGoal: document.getElementById('btnListAddNewGoal'),
    formModeBanner: document.getElementById('formModeBanner'),
    bannerModeTitle: document.getElementById('bannerModeTitle'),
    bannerModeSubtitle: document.getElementById('bannerModeSubtitle'),
    btnSwitchToNewGoal: document.getElementById('btnSwitchToNewGoal'),
    inputGoalId: document.getElementById('inputGoalId'),
    inputGoalTitle: document.getElementById('inputGoalTitle'),
    quickGoalSuggestions: document.getElementById('quickGoalSuggestions'),
    inputTargetModalFormatted: document.getElementById('inputTargetModalFormatted'),
    inputTargetModal: document.getElementById('inputTargetModal'),
    inputStartMonth: document.getElementById('inputStartMonth'),
    inputEndMonth: document.getElementById('inputEndMonth'),
    btnSetStartMonthThisMonth: document.getElementById('btnSetStartMonthThisMonth'),
    btnSetEndMonthDec: document.getElementById('btnSetEndMonthDec'),
    inputMakeActive: document.getElementById('inputMakeActive'),
    saveTargetBtn: document.getElementById('saveTargetBtn'),

    // Modal Backup & Restore
    backupModal: document.getElementById('backupModal'),
    closeBackupModalBtn: document.getElementById('closeBackupModalBtn'),
    closeBackupModalFooterBtn: document.getElementById('closeBackupModalFooterBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importFileInput: document.getElementById('importFileInput'),
    btnTriggerImport: document.getElementById('btnTriggerImport'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // --- Helper Formatting Rupiah & Tanggal ---
  function formatRupiah(amount, withPrefix = true) {
    const num = Number(amount) || 0;
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const formatted = Math.round(absNum).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (!withPrefix) return formatted;
    return (isNegative ? '-Rp ' : 'Rp ') + formatted;
  }

  function parseRupiahInput(formattedStr) {
    if (!formattedStr) return 0;
    const cleaned = formattedStr.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }

  function getMonthKey(year, month) {
    const m = String(month + 1).padStart(2, '0');
    return `${year}-${m}`;
  }

  function formatMonthYearIndo(monthKey) {
    if (!monthKey || !monthKey.includes('-')) return monthKey || '-';
    const parts = monthKey.split('-');
    const y = parts[0];
    const m = parseInt(parts[1], 10) - 1;
    return `${MONTH_NAMES_ID[m] || ''} ${y}`;
  }

  function formatDateIndo(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const d = parseInt(parts[2], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parts[0];
    const monthName = MONTH_NAMES_ID[m] ? MONTH_NAMES_ID[m].substring(0, 3) : '';
    return `${d} ${monthName} ${y}`;
  }

  function getCategoryIcon(categoryName, type) {
    const list = CATEGORIES[type] || [];
    const found = list.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
    if (found) return found.icon;
    return type === 'income' ? '💵' : '💸';
  }

  function escapeHtml(string) {
    if (!string) return '';
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  // --- Inisialisasi Tema Gelap / Terang ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tabunganku_theme', theme);

    if (theme === 'light') {
      el.themeIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
      el.themeToggleBtn.setAttribute('title', 'Beralih ke Mode Gelap');
    } else {
      el.themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
      el.themeToggleBtn.setAttribute('title', 'Beralih ke Mode Terang');
    }
  }

  // --- Toast Notification System ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconSvg = type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--income-color);"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : (type === 'error' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--expense-color);"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #38bdf8;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`);

    toast.innerHTML = `
      ${iconSvg}
      <span>${escapeHtml(message)}</span>
    `;

    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Autentikasi Pengguna (Auth Gate) ---
  function isAuthenticated() {
    const session = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
    if (!session) return false;
    try {
      const data = JSON.parse(session);
      return data.authenticated === true && data.username === AUTH_CREDENTIALS.username;
    } catch (e) {
      return false;
    }
  }

  function checkAuth() {
    if (isAuthenticated()) {
      el.loginOverlay.classList.add('hidden');
      el.userBadgeName.textContent = AUTH_CREDENTIALS.username;
      initDashboard();
    } else {
      el.loginOverlay.classList.remove('hidden');
      setTimeout(() => {
        if (el.loginUsername) el.loginUsername.focus();
      }, 150);
    }
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    const user = (el.loginUsername.value || '').trim();
    const pass = el.loginPassword.value || '';
    const remember = el.loginRemember.checked;

    if (user.toLowerCase() === AUTH_CREDENTIALS.username.toLowerCase() && pass === AUTH_CREDENTIALS.password) {
      el.loginError.classList.remove('show');
      const sessionData = JSON.stringify({
        authenticated: true,
        username: AUTH_CREDENTIALS.username,
        time: Date.now()
      });

      if (remember) {
        localStorage.setItem(AUTH_KEY, sessionData);
      } else {
        sessionStorage.setItem(AUTH_KEY, sessionData);
      }

      el.loginOverlay.classList.add('hidden');
      el.userBadgeName.textContent = AUTH_CREDENTIALS.username;
      showToast(`Selamat datang kembali, ${AUTH_CREDENTIALS.username}!`, 'success');
      initDashboard();
    } else {
      el.loginError.classList.add('show');
      el.loginErrorMsg.textContent = 'Username atau password salah. Silakan coba lagi!';
      el.loginPassword.value = '';
      el.loginPassword.focus();
    }
  }

  function handleLogout() {
    if (!confirm('Apakah Anda ingin keluar dan mengunci aplikasi ini?')) return;
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    el.loginPassword.value = '';
    el.loginOverlay.classList.remove('hidden');
    el.loginUsername.focus();
    showToast('Aplikasi telah dikunci.', 'info');
  }

  function togglePasswordVisibility() {
    const isPass = el.loginPassword.type === 'password';
    el.loginPassword.type = isPass ? 'text' : 'password';
    const eyeIcon = document.getElementById('eyeIcon');
    if (eyeIcon) {
      eyeIcon.innerHTML = isPass
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }
  }

  // --- Kategori & Quick Chips Sync ---
  function renderCategoryOptions(type) {
    const list = CATEGORIES[type] || [];
    el.inputCategory.innerHTML = '<option value="" disabled selected>Pilih Kategori...</option>';
    list.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = `${cat.icon} ${cat.name}`;
      el.inputCategory.appendChild(opt);
    });

    el.quickCategoryTags.innerHTML = '';
    list.forEach(cat => {
      const tag = document.createElement('button');
      tag.type = 'button';
      tag.className = 'tag-pill';
      tag.textContent = `${cat.icon} ${cat.name}`;
      tag.addEventListener('click', () => {
        el.inputCategory.value = cat.name;
        highlightActiveTag(cat.name);
      });
      el.quickCategoryTags.appendChild(tag);
    });
  }

  function highlightActiveTag(selectedName) {
    const pills = el.quickCategoryTags.querySelectorAll('.tag-pill');
    pills.forEach(pill => {
      if (pill.textContent.includes(selectedName)) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  function setTransactionType(type) {
    state.currentType = type;
    el.inputType.value = type;

    if (type === 'income') {
      el.toggleIncome.classList.add('active', 'type-income');
      el.toggleIncome.setAttribute('aria-checked', 'true');
      el.toggleExpense.classList.remove('active', 'type-expense');
      el.toggleExpense.setAttribute('aria-checked', 'false');
      el.submitTransactionBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      el.submitTransactionBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Simpan Pendapatan
      `;
    } else {
      el.toggleExpense.classList.add('active', 'type-expense');
      el.toggleExpense.setAttribute('aria-checked', 'true');
      el.toggleIncome.classList.remove('active', 'type-income');
      el.toggleIncome.setAttribute('aria-checked', 'false');
      el.submitTransactionBtn.style.background = 'linear-gradient(135deg, #f43f5e, #e11d48)';
      el.submitTransactionBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Simpan Pengeluaran
      `;
    }

    renderCategoryOptions(type);
  }

  // --- Ambil Data dari StorageService (LocalStorage) ---
  function loadDataForCurrentMonth() {
    const monthKey = getMonthKey(state.viewYear, state.viewMonth);
    el.currentMonthDisplay.textContent = `${MONTH_NAMES_ID[state.viewMonth]} ${state.viewYear}`;

    try {
      const result = StorageService.getSummary(monthKey);
      if (!result.success) {
        throw new Error('Gagal memuat data lokal');
      }

      state.summary = result.data.summary;
      state.transactions = result.data.transactions;
      state.allTransactions = result.data.all_transactions || StorageService.getTransactions();
      state.activeGoal = result.data.summary.goal || null;

      if (result.data.goals) {
        state.savedGoals = result.data.goals;
        if (el.goalsCountBadge) el.goalsCountBadge.textContent = result.data.goals.length;
        updateQuickGoalSelector(result.data.goals, state.activeGoal ? state.activeGoal.id : null);
      }

      // Jika bulan kosong tapi ada data di bulan lain (misal Agustus 2026), arahkan ke bulan tersebut pada load pertama
      if (state.transactions.length === 0 && result.data.latest_month && result.data.latest_month !== monthKey && !sessionStorage.getItem('tabunganku_user_picked_month')) {
        const parts = result.data.latest_month.split('-');
        state.viewYear = parseInt(parts[0], 10);
        state.viewMonth = parseInt(parts[1], 10) - 1;
        loadDataForCurrentMonth();
        return;
      }

      updateDashboardUI(result.data.summary);
      renderTransactionList();
    } catch (err) {
      console.error('Error reading storage:', err);
      showToast('Gagal memuat data: ' + err.message, 'error');
    }
  }

  // --- Perbarui Dashboard UI ---
  function updateDashboardUI(summary) {
    if (!summary) return;

    const balance = summary.current_balance;
    const income = summary.total_income;
    const expense = summary.total_expense;
    const cf = summary.monthly_cashflow !== undefined ? summary.monthly_cashflow : (income - expense);
    const monthLabel = MONTH_NAMES_ID[state.viewMonth] || 'Bulan Ini';

    // 1. Metric Cards
    el.cardBalance.textContent = formatRupiah(balance);
    el.cardIncome.textContent = formatRupiah(income);
    el.cardExpense.textContent = formatRupiah(expense);

    if (balance >= 0) {
      el.balanceBadge.className = 'badge-status healthy';
      el.balanceBadge.textContent = 'Surplus Kas';
      el.cardBalance.style.color = 'var(--text-primary)';
      el.balanceFormulaText.textContent = `Total Kas (Arus kas ${monthLabel}: ${cf >= 0 ? '+' : ''}${formatRupiah(cf)})`;
    } else {
      el.balanceBadge.className = 'badge-status deficit';
      el.balanceBadge.textContent = 'Defisit Kas';
      el.cardBalance.style.color = 'var(--expense-color)';
      el.balanceFormulaText.textContent = `Total Kas (Arus kas ${monthLabel}: ${cf >= 0 ? '+' : ''}${formatRupiah(cf)})`;
    }

    // 2. Target Tabungan Terintegrasi (Goal-Based Savings)
    const goal = summary.goal;
    if (!goal) return;

    el.targetGoalTitle.textContent = goal.title || 'Target Tabungan Periode';
    el.targetPeriodText.textContent = `${formatMonthYearIndo(goal.start_month)} ➔ ${formatMonthYearIndo(goal.end_month)}`;

    el.targetDisplayAmount.textContent = formatRupiah(goal.target_amount);
    el.targetCurrentBalance.textContent = formatRupiah(goal.cumulative_balance);
    el.targetDifferenceValue.textContent = formatRupiah(goal.remaining_to_target);
    
    if (goal.remaining_to_target <= 0) {
      el.targetDifferenceLabel.textContent = 'Kelebihan Tabungan';
      el.targetDifferenceValue.textContent = formatRupiah(goal.cumulative_balance - goal.target_amount);
    } else {
      el.targetDifferenceLabel.textContent = 'Sisa Kekurangan';
      el.targetDifferenceValue.textContent = formatRupiah(goal.remaining_to_target);
    }

    el.targetRemainingTime.textContent = `${goal.remaining_months} Bulan Tersisa`;

    // Progress Bar
    const percent = goal.percentage || 0;
    const rawPercent = goal.raw_percentage || 0;
    el.targetProgressPercent.textContent = `${rawPercent}%`;
    el.targetProgressBar.style.width = `${percent}%`;

    // 3. Rekomendasi Tabungan
    if (goal.remaining_to_target <= 0) {
      el.recommendationBox.style.display = 'flex';
      el.recommendationText.innerHTML = `
        🎉 <strong>Luar Biasa, Target Tercapai!</strong> Seluruh sasaran tabungan Anda telah terkumpul penuh. Anda memiliki surplus <strong>${formatRupiah(goal.cumulative_balance - goal.target_amount)}</strong>.
      `;
    } else if (goal.remaining_months > 0) {
      el.recommendationBox.style.display = 'flex';
      el.recommendationText.innerHTML = `
        Untuk mencapai target pada <strong>${formatMonthYearIndo(goal.end_month)}</strong>, Anda disarankan menyisihkan rata-rata <strong>${formatRupiah(goal.monthly_saving_recommended)} / bulan</strong> selama <strong>${goal.remaining_months} bulan</strong> ke depan.
      `;
    } else {
      el.recommendationBox.style.display = 'flex';
      el.recommendationText.innerHTML = `
        Batas akhir periode target telah terlewati. Sisa nominal yang belum tercapai sebesar <strong>${formatRupiah(goal.remaining_to_target)}</strong>.
      `;
    }

    // 4. Status & Alert Banner
    const status = goal.status;
    if (status === 'no_target') {
      el.targetProgressBar.className = 'progress-fill status-warning';
      el.targetAlertBanner.className = 'target-alert-banner';
      el.targetAlertBanner.style.background = 'rgba(255, 255, 255, 0.05)';
      el.targetAlertBanner.style.borderColor = 'var(--border-subtle)';
      el.targetAlertBanner.style.color = 'var(--text-secondary)';
      el.alertIconBox.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
      el.targetAlertMessage.innerHTML = `
        <strong>Belum Ada Target Aktif:</strong>
        <span>Target tabungan periode belum diatur. Klik tombol "Atur Target Periode" untuk memasang sasaran tabungan Anda.</span>
      `;
      el.targetRemainingTime.textContent = '-';
    } else if (status === 'upcoming') {
      el.targetProgressBar.className = 'progress-fill status-warning';
      el.targetAlertBanner.className = 'target-alert-banner alert-warning';
      el.targetAlertBanner.removeAttribute('style');
      el.alertIconBox.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #38bdf8;">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      `;
      el.targetAlertMessage.innerHTML = `
        <strong>Periode Belum Berjalan:</strong>
        <span>${escapeHtml(goal.alert_message)}</span>
      `;
    } else if (status === 'success') {
      el.targetProgressBar.className = 'progress-fill status-success';
      el.targetAlertBanner.className = 'target-alert-banner alert-success';
      el.targetAlertBanner.removeAttribute('style');
      el.alertIconBox.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981;">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
      el.targetAlertMessage.innerHTML = `
        <strong>Target Tercapai!</strong>
        <span>${escapeHtml(goal.alert_message)}</span>
      `;
    } else if (status === 'on_track') {
      el.targetProgressBar.className = 'progress-fill status-success';
      el.targetAlertBanner.className = 'target-alert-banner alert-success';
      el.targetAlertBanner.removeAttribute('style');
      el.alertIconBox.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981;">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 14 14"></polyline>
        </svg>
      `;
      el.targetAlertMessage.innerHTML = `
        <strong>Laju Bagus (On Track):</strong>
        <span>${escapeHtml(goal.alert_message)}</span>
      `;
    } else {
      el.targetProgressBar.className = 'progress-fill status-warning';
      el.targetAlertBanner.className = 'target-alert-banner alert-warning';
      el.targetAlertBanner.removeAttribute('style');
      el.alertIconBox.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `;
      el.targetAlertMessage.innerHTML = `
        <strong>Peringatan Tabungan:</strong>
        <span>${escapeHtml(goal.alert_message)}</span>
      `;
    }
  }

  // --- Update Quick Selector Target di Header ---
  function updateQuickGoalSelector(goals, activeGoalId) {
    if (!el.quickGoalSelectWrap || !el.quickGoalSelect) return;
    if (!goals || goals.length <= 1) {
      el.quickGoalSelectWrap.style.display = 'none';
      return;
    }

    el.quickGoalSelectWrap.style.display = 'block';
    el.quickGoalSelect.innerHTML = '';
    goals.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = `🎯 ${g.title} (${formatRupiah(g.target_amount)})`;
      if (Number(g.id) === Number(activeGoalId) || Number(g.is_active) === 1) {
        opt.selected = true;
      }
      el.quickGoalSelect.appendChild(opt);
    });
  }

  // --- Render Daftar Transaksi ---
  function renderTransactionList() {
    let list = state.filterType === 'all_history' ? state.allTransactions : state.transactions;

    // Filter Type
    if (state.filterType === 'income') {
      list = list.filter(t => t.type === 'income');
    } else if (state.filterType === 'expense') {
      list = list.filter(t => t.type === 'expense');
    }

    // Search Query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(t => 
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.note && t.note.toLowerCase().includes(q))
      );
    }

    el.txCountBadge.textContent = `(${list.length})`;

    if (list.length === 0) {
      el.transactionList.innerHTML = '';
      el.emptyState.style.display = 'block';
      return;
    }

    el.emptyState.style.display = 'none';

    el.transactionList.innerHTML = list.map(tx => {
      const isIncome = tx.type === 'income';
      const icon = getCategoryIcon(tx.category, tx.type);
      return `
        <div class="transaction-item" data-id="${tx.id}">
          <div class="tx-left">
            <div class="tx-icon ${isIncome ? 'income' : 'expense'}" aria-hidden="true">
              ${icon}
            </div>
            <div class="tx-details">
              <div class="tx-title">${escapeHtml(tx.category || 'Lainnya')}</div>
              <div class="tx-meta">
                <span>${formatDateIndo(tx.date)}</span>
                ${tx.note ? `<span>•</span><span class="tx-note-text" title="${escapeHtml(tx.note)}">${escapeHtml(tx.note)}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="tx-right">
            <div class="tx-amount ${isIncome ? 'income' : 'expense'}">
              ${isIncome ? '+' : '-'}${formatRupiah(tx.amount)}
            </div>
            <button type="button" class="btn-delete-tx" data-id="${tx.id}" title="Hapus transaksi ini" aria-label="Hapus transaksi">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Event Listener Hapus Transaksi
    const deleteBtns = el.transactionList.querySelectorAll('.btn-delete-tx');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        confirmDeleteTransaction(id);
      });
    });
  }

  // --- Hapus Transaksi ---
  function confirmDeleteTransaction(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    try {
      const ok = StorageService.deleteTransaction(id);
      if (ok) {
        showToast('Transaksi berhasil dihapus!', 'success');
        loadDataForCurrentMonth();
      } else {
        showToast('Gagal menemukan transaksi untuk dihapus', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Gagal menghapus transaksi', 'error');
    }
  }

  // --- Form Tambah Transaksi Submit ---
  function handleTransactionSubmit(e) {
    e.preventDefault();

    const rawAmount = el.inputAmount.value;
    const amount = parseFloat(rawAmount);

    if (isNaN(amount) || amount <= 0) {
      showToast('Mohon masukkan nominal yang valid dan lebih dari 0', 'error');
      el.inputAmountFormatted.focus();
      return;
    }

    const category = el.inputCategory.value;
    if (!category) {
      showToast('Pilih kategori transaksi terlebih dahulu', 'error');
      el.inputCategory.focus();
      return;
    }

    const date = el.inputDate.value;
    if (!date) {
      showToast('Pilih tanggal transaksi terlebih dahulu', 'error');
      el.inputDate.focus();
      return;
    }

    const txData = {
      type: el.inputType.value,
      amount: amount,
      category: category,
      date: date,
      note: el.inputNote.value.trim()
    };

    try {
      StorageService.addTransaction(txData);
      showToast(`${txData.type === 'income' ? 'Pendapatan' : 'Pengeluaran'} berhasil disimpan!`, 'success');

      // Reset Form
      el.inputAmountFormatted.value = '';
      el.inputAmount.value = '0';
      el.inputNote.value = '';
      highlightActiveTag('');

      // Jika transaksi dicatat di bulan yang sedang dilihat, refresh UI
      const txMonth = date.substring(0, 7);
      const currentViewMonth = getMonthKey(state.viewYear, state.viewMonth);
      if (txMonth !== currentViewMonth) {
        // Arahkan otomatis ke bulan transaksi yang baru dicatat
        const parts = txMonth.split('-');
        state.viewYear = parseInt(parts[0], 10);
        state.viewMonth = parseInt(parts[1], 10) - 1;
        sessionStorage.setItem('tabunganku_user_picked_month', '1');
      }

      loadDataForCurrentMonth();
    } catch (err) {
      console.error('Submit error:', err);
      showToast('Gagal menyimpan transaksi: ' + err.message, 'error');
    }
  }

  // --- Manajemen Modal Target ---
  function openTargetModal(isNewMode = false) {
    el.targetModal.classList.add('active');

    if (isNewMode) {
      switchTargetModalTab('form');
      setTargetModalMode('new');
    } else {
      switchTargetModalTab('list');
    }
  }

  function closeTargetModal() {
    el.targetModal.classList.remove('active');
  }

  function setTargetModalMode(mode, goalData = null) {
    if (mode === 'new') {
      el.inputGoalId.value = '0';
      el.inputGoalTitle.value = '';
      el.inputTargetModalFormatted.value = '';
      el.inputTargetModal.value = '0';
      el.inputStartMonth.value = getMonthKey(state.viewYear, state.viewMonth);
      el.inputEndMonth.value = `${state.viewYear}-12`;
      el.inputMakeActive.checked = true;

      el.formModeBanner.className = 'form-mode-banner mode-new';
      el.bannerModeTitle.textContent = '➕ Mode: Tambah Target Baru';
      el.bannerModeSubtitle.textContent = 'Target ini akan ditambahkan ke daftar target tabungan Anda.';
      el.btnSwitchToNewGoal.style.display = 'none';
      el.saveTargetBtn.textContent = '➕ Simpan Target Baru';
    } else if (mode === 'edit' && goalData) {
      el.inputGoalId.value = goalData.id;
      el.inputGoalTitle.value = goalData.title;
      el.inputTargetModalFormatted.value = formatRupiah(goalData.target_amount, false);
      el.inputTargetModal.value = goalData.target_amount;
      el.inputStartMonth.value = goalData.start_month;
      el.inputEndMonth.value = goalData.end_month;
      el.inputMakeActive.checked = Number(goalData.is_active) === 1;

      el.formModeBanner.className = 'form-mode-banner mode-edit';
      el.bannerModeTitle.textContent = `✏️ Mode Edit: "${goalData.title}"`;
      el.bannerModeSubtitle.textContent = 'Perubahan akan otomatis memperbarui perhitungan progres tabungan.';
      el.btnSwitchToNewGoal.style.display = 'inline-block';
      el.saveTargetBtn.textContent = '💾 Perbarui Target';
    }
  }

  function switchTargetModalTab(tab) {
    if (tab === 'form') {
      el.tabBtnForm.classList.add('active');
      el.tabBtnList.classList.remove('active');
      el.tabContentForm.style.display = 'block';
      el.tabContentList.style.display = 'none';
    } else {
      el.tabBtnList.classList.add('active');
      el.tabBtnForm.classList.remove('active');
      el.tabContentList.style.display = 'block';
      el.tabContentForm.style.display = 'none';
      loadSavedGoals();
    }
  }

  function loadSavedGoals() {
    const goals = StorageService.getGoals();
    state.savedGoals = goals;
    if (el.goalsCountBadge) el.goalsCountBadge.textContent = goals.length;
    renderSavedGoals(goals);
    updateQuickGoalSelector(goals, state.activeGoal ? state.activeGoal.id : null);
  }

  function renderSavedGoals(goals) {
    if (!goals || goals.length === 0) {
      el.savedGoalsList.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem 1rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
          <p style="font-weight: 600; margin-bottom: 0.25rem;">Belum ada target yang tersimpan</p>
          <span style="font-size: 0.8rem;">Klik tombol "+ Target Baru" di atas untuk menambahkan sasaran tabungan Anda.</span>
        </div>
      `;
      return;
    }

    el.savedGoalsList.innerHTML = goals.map(g => {
      const isActive = Number(g.is_active) === 1;
      return `
        <div class="goal-card-item ${isActive ? 'active-target' : ''}">
          <div class="goal-item-left">
            <div class="goal-item-title">
              ${escapeHtml(g.title)}
              ${isActive ? '<span style="font-size: 0.72rem; color: #10b981; font-weight: 700; margin-left: 0.35rem;">✓ Aktif Dipantau</span>' : ''}
            </div>
            <div class="goal-item-period">
              <span>🎯 <strong>${formatRupiah(g.target_amount)}</strong></span> • 
              <span>🗓️ ${formatMonthYearIndo(g.start_month)} ➔ ${formatMonthYearIndo(g.end_month)}</span>
            </div>
          </div>
          <div class="goal-item-actions">
            ${isActive 
              ? '<button type="button" class="btn-activate-goal" disabled>Aktif</button>' 
              : `<button type="button" class="btn-activate-goal" data-action="activate" data-id="${g.id}">Pantau Ini</button>`
            }
            <button type="button" class="btn-edit-item" data-action="edit" data-id="${g.id}" title="Edit Target Ini">
              ✏️ Edit
            </button>
            <button type="button" class="btn-delete-item" data-action="delete" data-id="${g.id}" title="Hapus Target Ini">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Event Delegasi untuk item Target
    el.savedGoalsList.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        if (action === 'activate') {
          activateGoal(id);
        } else if (action === 'edit') {
          const goal = state.savedGoals.find(g => String(g.id) === String(id));
          if (goal) {
            setTargetModalMode('edit', goal);
            switchTargetModalTab('form');
          }
        } else if (action === 'delete') {
          deleteGoal(id);
        }
      });
    });
  }

  function activateGoal(id) {
    try {
      StorageService.setActiveGoal(id);
      showToast('Target aktif berhasil diganti!', 'success');
      loadSavedGoals();
      loadDataForCurrentMonth();
    } catch (e) {
      showToast('Gagal mengaktifkan target', 'error');
    }
  }

  function deleteGoal(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus sasaran target ini?')) return;
    try {
      StorageService.deleteGoal(id);
      showToast('Target berhasil dihapus', 'success');
      loadSavedGoals();
      loadDataForCurrentMonth();
    } catch (e) {
      showToast('Gagal menghapus target', 'error');
    }
  }

  function handleTargetFormSubmit(e) {
    e.preventDefault();

    const title = el.inputGoalTitle.value.trim();
    const rawTarget = el.inputTargetModal.value;
    const targetAmount = parseFloat(rawTarget);
    const startMonth = el.inputStartMonth.value;
    const endMonth = el.inputEndMonth.value;
    const makeActive = el.inputMakeActive.checked;
    const goalId = el.inputGoalId.value !== '0' ? el.inputGoalId.value : null;

    if (!title) {
      showToast('Nama sasaran tabungan tidak boleh kosong', 'error');
      el.inputGoalTitle.focus();
      return;
    }

    if (isNaN(targetAmount) || targetAmount <= 0) {
      showToast('Nominal target harus lebih dari 0', 'error');
      el.inputTargetModalFormatted.focus();
      return;
    }

    if (!startMonth || !endMonth) {
      showToast('Bulan mulai dan batas akhir harus ditentukan', 'error');
      return;
    }

    if (startMonth > endMonth) {
      showToast('Bulan batas akhir tidak boleh sebelum bulan mulai!', 'error');
      return;
    }

    const payload = {
      id: goalId,
      title: title,
      target_amount: targetAmount,
      start_month: startMonth,
      end_month: endMonth,
      is_active: makeActive
    };

    try {
      StorageService.saveGoal(payload);
      showToast(goalId ? 'Target tabungan berhasil diperbarui!' : 'Target tabungan baru berhasil dibuat!', 'success');
      closeTargetModal();
      loadDataForCurrentMonth();
    } catch (err) {
      console.error('Save goal error:', err);
      showToast('Gagal menyimpan target', 'error');
    }
  }

  // --- Modal Backup & Restore JSON ---
  function openBackupModal() {
    el.backupModal.classList.add('active');
  }

  function closeBackupModal() {
    el.backupModal.classList.remove('active');
  }

  function handleExportJson() {
    StorageService.exportBackupJson();
    showToast('Cadangan data JSON berhasil diunduh!', 'success');
  }

  function handleImportFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const res = StorageService.importBackupJson(event.target.result);
        if (res.success) {
          showToast(`Berhasil memulihkan ${res.count} transaksi dari cadangan!`, 'success');
          closeBackupModal();
          loadDataForCurrentMonth();
        } else {
          showToast(`Gagal memulihkan data: ${res.error}`, 'error');
        }
      } catch (err) {
        showToast('Format file JSON tidak valid', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Auth Form & Logout
    el.loginForm.addEventListener('submit', handleLoginSubmit);
    if (el.togglePasswordBtn) el.togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    if (el.logoutBtn) el.logoutBtn.addEventListener('click', handleLogout);

    // Navigasi Bulan
    el.prevMonthBtn.addEventListener('click', () => {
      sessionStorage.setItem('tabunganku_user_picked_month', '1');
      if (state.viewMonth === 0) {
        state.viewMonth = 11;
        state.viewYear--;
      } else {
        state.viewMonth--;
      }
      loadDataForCurrentMonth();
    });

    el.nextMonthBtn.addEventListener('click', () => {
      sessionStorage.setItem('tabunganku_user_picked_month', '1');
      if (state.viewMonth === 11) {
        state.viewMonth = 0;
        state.viewYear++;
      } else {
        state.viewMonth++;
      }
      loadDataForCurrentMonth();
    });

    el.todayBtn.addEventListener('click', () => {
      sessionStorage.setItem('tabunganku_user_picked_month', '1');
      const now = new Date();
      state.viewYear = now.getFullYear();
      state.viewMonth = now.getMonth();
      loadDataForCurrentMonth();
      showToast('Kembali ke bulan berjalan saat ini', 'info');
    });

    // Theme Toggle
    el.themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });

    // Ekspor CSV
    el.exportBtn.addEventListener('click', () => {
      const monthKey = getMonthKey(state.viewYear, state.viewMonth);
      StorageService.exportCsv(monthKey);
      showToast(`Mengunduh file Excel CSV untuk periode ${formatMonthYearIndo(monthKey)}...`, 'info');
    });

    // Backup & Restore
    el.backupBtn.addEventListener('click', openBackupModal);
    el.closeBackupModalBtn.addEventListener('click', closeBackupModal);
    el.closeBackupModalFooterBtn.addEventListener('click', closeBackupModal);
    el.exportJsonBtn.addEventListener('click', handleExportJson);
    el.btnTriggerImport.addEventListener('click', () => el.importFileInput.click());
    el.importFileInput.addEventListener('change', handleImportFileSelect);

    // Form Toggle Income / Expense
    el.toggleIncome.addEventListener('click', () => setTransactionType('income'));
    el.toggleExpense.addEventListener('click', () => setTransactionType('expense'));

    // Input Format Rupiah
    el.inputAmountFormatted.addEventListener('input', (e) => {
      const parsed = parseRupiahInput(e.target.value);
      el.inputAmount.value = parsed;
      e.target.value = parsed ? formatRupiah(parsed, false) : '';
    });

    el.inputTargetModalFormatted.addEventListener('input', (e) => {
      const parsed = parseRupiahInput(e.target.value);
      el.inputTargetModal.value = parsed;
      e.target.value = parsed ? formatRupiah(parsed, false) : '';
    });

    // Submit Transaksi
    el.transactionForm.addEventListener('submit', handleTransactionSubmit);

    // Search & Filter Riwayat
    el.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderTransactionList();
    });

    el.filterType.addEventListener('change', (e) => {
      state.filterType = e.target.value;
      renderTransactionList();
    });

    // Modal Target Tabungan
    el.openTargetModalBtn.addEventListener('click', () => openTargetModal(false));
    el.btnAddNewGoalMain.addEventListener('click', () => openTargetModal(true));
    el.closeTargetModalBtn.addEventListener('click', closeTargetModal);
    el.cancelTargetModalBtn.addEventListener('click', closeTargetModal);
    el.closeListModalBtn.addEventListener('click', closeTargetModal);

    el.tabBtnForm.addEventListener('click', () => switchTargetModalTab('form'));
    el.tabBtnList.addEventListener('click', () => switchTargetModalTab('list'));
    el.btnListAddNewGoal.addEventListener('click', () => {
      setTargetModalMode('new');
      switchTargetModalTab('form');
    });

    el.btnSwitchToNewGoal.addEventListener('click', () => {
      setTargetModalMode('new');
    });

    // Helper Buttons Modal Target
    el.btnSetStartMonthThisMonth.addEventListener('click', () => {
      el.inputStartMonth.value = getMonthKey(state.viewYear, state.viewMonth);
    });

    el.btnSetEndMonthDec.addEventListener('click', () => {
      el.inputEndMonth.value = `${state.viewYear}-12`;
    });

    // Suggestions Chips Modal Target
    el.quickGoalSuggestions.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        el.inputGoalTitle.value = chip.getAttribute('data-title');
      });
    });

    // Submit Target Form
    el.targetForm.addEventListener('submit', handleTargetFormSubmit);

    // Quick Target Selector di Header
    if (el.quickGoalSelect) {
      el.quickGoalSelect.addEventListener('change', (e) => {
        activateGoal(e.target.value);
      });
    }

    // Tutup modal jika klik backdrop di luar card
    window.addEventListener('click', (e) => {
      if (e.target === el.targetModal) closeTargetModal();
      if (e.target === el.backupModal) closeBackupModal();
    });
  }

  // --- Inisialisasi Dashboard Setelah Login ---
  function initDashboard() {
    // Set default tanggal hari ini pada form transaksi
    const today = new Date().toISOString().split('T')[0];
    el.inputDate.value = today;

    // Set tipe awal: Pendapatan
    setTransactionType('income');

    // Load data bulan aktif
    loadDataForCurrentMonth();
  }

  // --- Entry Point ---
  function init() {
    applyTheme(state.theme);
    setupEventListeners();
    checkAuth();
  }

  // Jalankan saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
