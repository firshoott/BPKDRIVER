/**
 * TabunganKu - Modern Web Application Logic
 * Penanganan AJAX, kalkulasi saldo & target tabungan periode multi-bulan / tahunan terintegrasi, interaksi UI, dan tema
 */

(function () {
  'use strict';

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
    viewMonth: new Date().getMonth(), // 0-indexed (0 = Januari)
    currentType: 'income', // 'income' | 'expense'
    summary: null,
    transactions: [],
    searchQuery: '',
    filterType: 'all',
    theme: localStorage.getItem('tabunganku_theme') || 'dark',
    activeGoal: null,
    savedGoals: [],
    networkInfo: null
  };

  // --- Elemen DOM ---
  const el = {
    // Header & Controls
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),
    currentMonthDisplay: document.getElementById('currentMonthDisplay'),
    todayBtn: document.getElementById('todayBtn'),
    exportBtn: document.getElementById('exportBtn'),
    lanShareBtn: document.getElementById('lanShareBtn'),
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

    // Modal Akses Wi-Fi LAN & QR Code
    lanShareModal: document.getElementById('lanShareModal'),
    closeLanModalBtn: document.getElementById('closeLanModalBtn'),
    closeLanModalFooterBtn: document.getElementById('closeLanModalFooterBtn'),
    btnCopyLanUrl: document.getElementById('btnCopyLanUrl'),
    lanUrlInput: document.getElementById('lanUrlInput'),
    lanIpDisplay: document.getElementById('lanIpDisplay'),
    lanWifiName: document.getElementById('lanWifiName'),
    lanQrCodeCanvasWrap: document.getElementById('lanQrCodeCanvasWrap'),

    // Toast Container
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
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--expense-color);"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

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

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  // --- Kategori & Quick Chips Sync ---
  function renderCategoryOptions(type) {
    const list = CATEGORIES[type] || [];
    
    // Select Options
    el.inputCategory.innerHTML = '<option value="" disabled selected>Pilih Kategori...</option>';
    list.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = `${cat.icon} ${cat.name}`;
      el.inputCategory.appendChild(opt);
    });

    // Quick Tags Chips
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

  // --- Fetch Data dari API Backend ---
  async function loadDataForCurrentMonth() {
    const monthKey = getMonthKey(state.viewYear, state.viewMonth);
    el.currentMonthDisplay.textContent = `${MONTH_NAMES_ID[state.viewMonth]} ${state.viewYear}`;

    try {
      const response = await fetch(`api.php?action=get_summary&month=${monthKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Gagal memuat data');
      }

      state.summary = result.data.summary;
      state.transactions = result.data.transactions;
      state.allTransactions = result.data.all_transactions || [];
      state.activeGoal = result.data.summary.goal || null;

      if (result.data.goals) {
        state.savedGoals = result.data.goals;
        if (el.goalsCountBadge) el.goalsCountBadge.textContent = result.data.goals.length;
        updateQuickGoalSelector(result.data.goals, state.activeGoal ? state.activeGoal.id : null);
      }

      // Jika bulan yang sedang dibuka kosong, tetapi ada data di bulan lain (misal Agustus),
      // dan pengguna belum secara eksplisit memilih bulan di sesi ini, arahkan otomatis ke bulan yang memiliki data!
      if (state.transactions.length === 0 && result.data.latest_month && result.data.latest_month !== monthKey && !sessionStorage.getItem('tabunganku_user_picked_month')) {
        const parts = result.data.latest_month.split('-');
        state.viewYear = parseInt(parts[0], 10);
        state.viewMonth = parseInt(parts[1], 10) - 1;
        localStorage.setItem('tabunganku_active_month', result.data.latest_month);
        loadDataForCurrentMonth();
        return;
      }

      localStorage.setItem('tabunganku_active_month', monthKey);

      updateDashboardUI(result.data.summary);
      renderTransactionList();
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Gagal memuat data: ' + err.message, 'error');
    }
  }

  // --- Update Tampilan Dashboard & Target Tabungan Terintegrasi ---
  function updateDashboardUI(summary) {
    if (!summary) return;

    const balance = summary.current_balance;
    const income = summary.total_income;
    const expense = summary.total_expense;
    const cf = summary.monthly_cashflow !== undefined ? summary.monthly_cashflow : balance;
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

    // Progress Bar Visual
    const percent = goal.percentage || 0;
    const rawPercent = goal.raw_percentage || 0;
    el.targetProgressPercent.textContent = `${rawPercent}%`;
    el.targetProgressBar.style.width = `${percent}%`;

    // 3. Kotak Rekomendasi Tabungan Cerdas Bulanan
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

    // 4. Logika Status & Banner Peringatan
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
      el.recommendationBox.style.display = 'flex';
      el.recommendationText.innerHTML = `
        Belum ada target yang aktif. Klik tombol <strong>Atur Target Periode</strong> di atas untuk membuat rencana tabungan Anda.
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
        <strong>Laju Tabungan On-Track!</strong>
        <span>${escapeHtml(goal.alert_message)}</span>
      `;
    } else {
      el.targetProgressBar.className = 'progress-fill status-warning';
      el.targetAlertBanner.className = 'target-alert-banner alert-warning';
      el.targetAlertBanner.removeAttribute('style');
      el.alertIconBox.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: #f43f5e;">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `;
      el.targetAlertMessage.innerHTML = `
        <strong>Peringatan Target Periode:</strong>
        <span>${escapeHtml(goal.alert_message)}</span>
      `;
    }
  }

  // --- Render Riwayat Transaksi ---
  function renderTransactionList() {
    const isAllHistory = state.filterType === 'all_history';
    const list = isAllHistory ? (state.allTransactions || state.transactions) : state.transactions;
    const query = state.searchQuery.toLowerCase().trim();
    const filter = state.filterType;

    const filtered = list.filter(t => {
      const matchType = isAllHistory || filter === 'all' || t.type === filter;
      const matchQuery = !query ||
        (t.category && t.category.toLowerCase().includes(query)) ||
        (t.note && t.note.toLowerCase().includes(query)) ||
        (t.amount && t.amount.toString().includes(query));
      return matchType && matchQuery;
    });

    el.txCountBadge.textContent = `(${filtered.length})`;

    if (filtered.length === 0) {
      el.transactionList.innerHTML = '';
      if (state.allTransactions && state.allTransactions.length > 0 && !isAllHistory) {
        el.emptyState.innerHTML = `
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <p>Belum ada transaksi di bulan ${MONTH_NAMES_ID[state.viewMonth]} ${state.viewYear}</p>
          <span>Data transaksi Anda berada di bulan lain (${state.allTransactions.length} transaksi).</span>
          <div style="margin-top: 1rem;">
            <button type="button" class="btn-primary" style="width: auto; margin: 0 auto; padding: 0.5rem 1.1rem; font-size: 0.82rem;" id="btnViewAllHistoryQuick">
              Lihat Semua Riwayat (${state.allTransactions.length} Transaksi)
            </button>
          </div>
        `;
        const quickBtn = document.getElementById('btnViewAllHistoryQuick');
        if (quickBtn) {
          quickBtn.addEventListener('click', () => {
            el.filterType.value = 'all_history';
            state.filterType = 'all_history';
            renderTransactionList();
          });
        }
      } else {
        el.emptyState.innerHTML = `
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <p>Belum ada transaksi</p>
          <span>Gunakan formulir di sebelah kiri untuk mencatat pendapatan atau pengeluaran baru.</span>
        `;
      }
      el.emptyState.style.display = 'block';
      return;
    }

    el.emptyState.style.display = 'none';

    const html = filtered.map(t => {
      const isIncome = t.type === 'income';
      const icon = getCategoryIcon(t.category, t.type);
      const sign = isIncome ? '+' : '-';
      const amountClass = isIncome ? 'income' : 'expense';
      const noteHtml = t.note ? `<span class="item-note" title="${escapeHtml(t.note)}">• ${escapeHtml(t.note)}</span>` : '';

      return `
        <div class="transaction-item" data-id="${t.id}">
          <div class="item-left">
            <div class="item-icon-badge ${amountClass}" aria-hidden="true">
              ${icon}
            </div>
            <div class="item-info">
              <div class="item-category">${escapeHtml(t.category)}</div>
              <div class="item-meta">
                <span>${formatDateIndo(t.date)}</span>
                ${noteHtml}
              </div>
            </div>
          </div>
          <div class="item-right">
            <div class="item-amount ${amountClass}">
              ${sign}${formatRupiah(t.amount)}
            </div>
            <button 
              type="button" 
              class="btn-delete-item" 
              data-id="${t.id}" 
              title="Hapus Transaksi"
              aria-label="Hapus transaksi ${escapeHtml(t.category)}"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    el.transactionList.innerHTML = html;

    // Bind event tombol hapus
    el.transactionList.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        confirmDeleteTransaction(id);
      });
    });
  }

  // --- Hapus Transaksi ---
  async function confirmDeleteTransaction(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    try {
      const response = await fetch('api.php?action=delete_transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id, 10) })
      });

      const result = await response.json();
      if (result.success) {
        showToast('Transaksi berhasil dihapus!', 'success');
        loadDataForCurrentMonth();
      } else {
        showToast(result.message || 'Gagal menghapus transaksi', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Terjadi kesalahan jaringan', 'error');
    }
  }

  // --- Form Tambah Transaksi Submit ---
  async function handleTransactionSubmit(e) {
    e.preventDefault();

    const type = el.inputType.value;
    const rawAmount = parseRupiahInput(el.inputAmountFormatted.value);
    const category = el.inputCategory.value;
    const date = el.inputDate.value;
    const note = el.inputNote.value.trim();

    if (rawAmount <= 0) {
      showToast('Masukkan nominal transaksi yang valid (lebih dari 0).', 'error');
      el.inputAmountFormatted.focus();
      return;
    }

    if (!category) {
      showToast('Silakan pilih kategori transaksi.', 'error');
      el.inputCategory.focus();
      return;
    }

    if (!date) {
      showToast('Silakan tentukan tanggal transaksi.', 'error');
      return;
    }

    el.submitTransactionBtn.disabled = true;
    el.submitTransactionBtn.style.opacity = '0.7';

    try {
      const response = await fetch('api.php?action=add_transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: rawAmount,
          category,
          date,
          note
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast(result.message || 'Transaksi berhasil disimpan!', 'success');

        el.inputAmountFormatted.value = '';
        el.inputAmount.value = '0';
        el.inputCategory.value = '';
        el.inputNote.value = '';
        highlightActiveTag('');

        // Arahkan tampilan dan simpan ke bulan transaksi tersebut
        const txMonth = date.substring(0, 7);
        const parts = txMonth.split('-');
        state.viewYear = parseInt(parts[0], 10);
        state.viewMonth = parseInt(parts[1], 10) - 1;
        localStorage.setItem('tabunganku_active_month', txMonth);
        sessionStorage.setItem('tabunganku_user_picked_month', '1');

        loadDataForCurrentMonth();
      } else {
        showToast(result.message || 'Gagal menyimpan transaksi', 'error');
      }
    } catch (err) {
      console.error('Submit error:', err);
      showToast('Gagal menghubungi server.', 'error');
    } finally {
      el.submitTransactionBtn.disabled = false;
      el.submitTransactionBtn.style.opacity = '1';
    }
  }

  // --- Quick Goal Selector di Header Card Target ---
  function updateQuickGoalSelector(goals, activeGoalId) {
    if (!el.quickGoalSelect || !el.quickGoalSelectWrap) return;

    if (!goals || goals.length <= 1) {
      el.quickGoalSelectWrap.style.display = 'none';
      return;
    }

    el.quickGoalSelectWrap.style.display = 'block';
    el.quickGoalSelect.innerHTML = '';

    goals.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      const isAct = parseInt(g.id, 10) === parseInt(activeGoalId, 10);
      opt.textContent = `${isAct ? '🎯 ' : ''}${g.title} (${formatRupiah(g.target_amount)})`;
      if (isAct) {
        opt.selected = true;
      }
      el.quickGoalSelect.appendChild(opt);
    });
  }

  // --- Modal Target Tabungan Periode & Multi-Goal Management ---
  function openNewGoalModal() {
    const year = state.viewYear;
    const currentMonthKey = getMonthKey(state.viewYear, state.viewMonth);

    el.inputGoalId.value = '0';
    el.inputGoalTitle.value = '';
    el.inputTargetModal.value = '0';
    el.inputTargetModalFormatted.value = '';
    el.inputStartMonth.value = currentMonthKey;
    el.inputEndMonth.value = `${year}-12`;
    if (el.inputMakeActive) el.inputMakeActive.checked = true;

    // Set status mode baru
    if (el.formModeBanner) {
      el.formModeBanner.className = 'form-mode-banner mode-new';
      el.bannerModeTitle.textContent = '➕ Mode: Tambah Target Baru';
      el.bannerModeSubtitle.textContent = 'Target ini akan ditambahkan ke database tanpa mengubah target Anda yang lain.';
      el.btnSwitchToNewGoal.style.display = 'none';
    }
    el.saveTargetBtn.textContent = '➕ Simpan Target Baru';

    switchModalTab('form');
    el.targetModal.classList.add('open');
    loadSavedGoals();
    setTimeout(() => el.inputGoalTitle.focus(), 150);
  }

  function openEditGoalModal(goalOrId) {
    let goal = null;
    if (typeof goalOrId === 'object' && goalOrId !== null) {
      goal = goalOrId;
    } else if (goalOrId) {
      goal = (state.savedGoals || []).find(g => parseInt(g.id, 10) === parseInt(goalOrId, 10));
    }

    if (!goal) {
      goal = state.activeGoal;
    }

    if (!goal || !goal.id) {
      openNewGoalModal();
      return;
    }

    const year = state.viewYear;
    el.inputGoalId.value = goal.id;
    el.inputGoalTitle.value = goal.title || '';
    el.inputTargetModal.value = goal.target_amount || 0;
    el.inputTargetModalFormatted.value = goal.target_amount > 0 ? formatRupiah(goal.target_amount, false) : '';
    el.inputStartMonth.value = goal.start_month || `${year}-01`;
    el.inputEndMonth.value = goal.end_month || `${year}-12`;
    if (el.inputMakeActive) {
      el.inputMakeActive.checked = parseInt(goal.is_active, 10) === 1;
    }

    // Set status mode edit
    if (el.formModeBanner) {
      el.formModeBanner.className = 'form-mode-banner mode-edit';
      el.bannerModeTitle.textContent = `✏️ Mode: Mengedit Target "${escapeHtml(goal.title || '')}"`;
      el.bannerModeSubtitle.textContent = 'Perubahan akan disimpan pada target ini.';
      el.btnSwitchToNewGoal.style.display = 'inline-block';
    }
    el.saveTargetBtn.textContent = '💾 Perbarui Target';

    switchModalTab('form');
    el.targetModal.classList.add('open');
    loadSavedGoals();
    setTimeout(() => el.inputGoalTitle.focus(), 150);
  }

  function openManageGoalsModal() {
    switchModalTab('list');
    el.targetModal.classList.add('open');
    loadSavedGoals();
  }

  function openTargetModal() {
    // Jika sudah ada target aktif, buka dalam mode edit target tersebut, tapi pengguna bisa klik "+ Target Baru"
    if (state.activeGoal && state.activeGoal.id) {
      openEditGoalModal(state.activeGoal);
    } else {
      openNewGoalModal();
    }
  }

  function closeTargetModal() {
    el.targetModal.classList.remove('open');
  }

  function switchModalTab(tabName) {
    if (tabName === 'form') {
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

  async function loadSavedGoals() {
    try {
      const res = await fetch('api.php?action=get_goals');
      const json = await res.json();
      if (json.success && json.goals) {
        state.savedGoals = json.goals;
        el.goalsCountBadge.textContent = json.goals.length;
        renderSavedGoals(json.goals);
        updateQuickGoalSelector(json.goals, state.activeGoal ? state.activeGoal.id : null);
      }
    } catch (e) {
      console.error('Failed to load goals:', e);
    }
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
      const isActive = parseInt(g.is_active, 10) === 1;
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
            <button type="button" class="btn-delete-item" data-action="delete" data-id="${g.id}" title="Hapus Target">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind action buttons
    el.savedGoalsList.querySelectorAll('button[data-action="activate"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await activateGoal(id);
      });
    });

    el.savedGoalsList.querySelectorAll('button[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditGoalModal(id);
      });
    });

    el.savedGoalsList.querySelectorAll('button[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await deleteGoal(id);
      });
    });
  }

  async function activateGoal(id) {
    try {
      const res = await fetch('api.php?action=set_active_goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id, 10) })
      });
      const json = await res.json();
      if (json.success) {
        showToast('Target aktif di dashboard berhasil diubah!', 'success');
        closeTargetModal();
        loadDataForCurrentMonth();
      } else {
        showToast(json.message || 'Gagal mengubah target aktif', 'error');
      }
    } catch (e) {
      showToast('Gagal menghubungi server', 'error');
    }
  }

  async function deleteGoal(id) {
    if (!confirm('Hapus target tabungan ini?')) return;
    try {
      const res = await fetch('api.php?action=delete_goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id, 10) })
      });
      const json = await res.json();
      if (json.success) {
        showToast('Target berhasil dihapus', 'success');
        loadSavedGoals();
        loadDataForCurrentMonth();
      } else {
        showToast(json.message || 'Gagal menghapus target', 'error');
      }
    } catch (e) {
      showToast('Gagal menghapus target', 'error');
    }
  }

  async function handleTargetSubmit(e) {
    e.preventDefault();

    const id = parseInt(el.inputGoalId.value, 10) || 0;
    const title = el.inputGoalTitle.value.trim();
    const targetAmount = parseRupiahInput(el.inputTargetModalFormatted.value);
    const startMonth = el.inputStartMonth.value;
    const endMonth = el.inputEndMonth.value;
    const isActive = el.inputMakeActive ? (el.inputMakeActive.checked ? 1 : 0) : 1;

    if (!title) {
      showToast('Silakan isi nama sasaran target tabungan.', 'error');
      el.inputGoalTitle.focus();
      return;
    }

    if (targetAmount <= 0) {
      showToast('Nominal target harus lebih besar dari 0.', 'error');
      el.inputTargetModalFormatted.focus();
      return;
    }

    if (!startMonth || !endMonth) {
      showToast('Tentukan bulan mulai dan bulan batas akhir pengumpulan.', 'error');
      return;
    }

    if (startMonth > endMonth) {
      showToast('Bulan mulai tidak boleh lebih besar dari bulan batas akhir.', 'error');
      return;
    }

    el.saveTargetBtn.disabled = true;

    try {
      const response = await fetch('api.php?action=save_goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          target_amount: targetAmount,
          start_month: startMonth,
          end_month: endMonth,
          is_active: isActive
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast(result.message || (id > 0 ? 'Target berhasil diperbarui!' : 'Target baru berhasil ditambahkan!'), 'success');
        closeTargetModal();
        loadDataForCurrentMonth();
      } else {
        showToast(result.message || 'Gagal menyimpan target.', 'error');
      }
    } catch (err) {
      console.error('Save target error:', err);
      showToast('Terjadi kesalahan koneksi server.', 'error');
    } finally {
      el.saveTargetBtn.disabled = false;
    }
  }

  // --- Format Input Rupiah Real-time ---
  function bindRupiahInput(formattedInput, hiddenInput) {
    formattedInput.addEventListener('input', function () {
      const val = parseRupiahInput(this.value);
      hiddenInput.value = val;
      this.value = val > 0 ? formatRupiah(val, false) : '';
    });
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Navigasi Bulan
    el.prevMonthBtn.addEventListener('click', () => {
      state.viewMonth--;
      if (state.viewMonth < 0) {
        state.viewMonth = 11;
        state.viewYear--;
      }
      sessionStorage.setItem('tabunganku_user_picked_month', '1');
      localStorage.setItem('tabunganku_active_month', getMonthKey(state.viewYear, state.viewMonth));
      loadDataForCurrentMonth();
    });

    el.nextMonthBtn.addEventListener('click', () => {
      state.viewMonth++;
      if (state.viewMonth > 11) {
        state.viewMonth = 0;
        state.viewYear++;
      }
      sessionStorage.setItem('tabunganku_user_picked_month', '1');
      localStorage.setItem('tabunganku_active_month', getMonthKey(state.viewYear, state.viewMonth));
      loadDataForCurrentMonth();
    });

    el.todayBtn.addEventListener('click', () => {
      const now = new Date();
      state.viewYear = now.getFullYear();
      state.viewMonth = now.getMonth();
      sessionStorage.setItem('tabunganku_user_picked_month', '1');
      localStorage.setItem('tabunganku_active_month', getMonthKey(state.viewYear, state.viewMonth));
      loadDataForCurrentMonth();
    });

    // Ekspor CSV
    el.exportBtn.addEventListener('click', () => {
      const monthKey = getMonthKey(state.viewYear, state.viewMonth);
      window.location.href = `api.php?action=export_csv&month=${monthKey}`;
    });

    // Theme Switcher
    el.themeToggleBtn.addEventListener('click', () => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });

    // Toggle Jenis Transaksi
    el.toggleIncome.addEventListener('click', () => setTransactionType('income'));
    el.toggleExpense.addEventListener('click', () => setTransactionType('expense'));

    // Input nominal masking
    bindRupiahInput(el.inputAmountFormatted, el.inputAmount);
    bindRupiahInput(el.inputTargetModalFormatted, el.inputTargetModal);

    // Kategori dropdown change -> highlight chip
    el.inputCategory.addEventListener('change', function () {
      highlightActiveTag(this.value);
    });

    // Form Transaksi Submit
    el.transactionForm.addEventListener('submit', handleTransactionSubmit);

    // Search & Filter Riwayat
    el.searchInput.addEventListener('input', function () {
      state.searchQuery = this.value;
      renderTransactionList();
    });

    el.filterType.addEventListener('change', function () {
      state.filterType = this.value;
      renderTransactionList();
    });

    // Modal Target Periode & Multi-Goal
    if (el.btnAddNewGoalMain) {
      el.btnAddNewGoalMain.addEventListener('click', openNewGoalModal);
    }
    if (el.openTargetModalBtn) {
      el.openTargetModalBtn.addEventListener('click', openManageGoalsModal);
    }
    if (el.btnListAddNewGoal) {
      el.btnListAddNewGoal.addEventListener('click', openNewGoalModal);
    }
    if (el.btnSwitchToNewGoal) {
      el.btnSwitchToNewGoal.addEventListener('click', openNewGoalModal);
    }

    el.closeTargetModalBtn.addEventListener('click', closeTargetModal);
    el.cancelTargetModalBtn.addEventListener('click', closeTargetModal);
    el.closeListModalBtn.addEventListener('click', closeTargetModal);
    el.tabBtnForm.addEventListener('click', () => switchModalTab('form'));
    el.tabBtnList.addEventListener('click', () => switchModalTab('list'));
    el.targetForm.addEventListener('submit', handleTargetSubmit);

    // Quick Goal Chips
    if (el.quickGoalSuggestions) {
      el.quickGoalSuggestions.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const t = chip.getAttribute('data-title');
          if (t) {
            el.inputGoalTitle.value = t;
            el.inputTargetModalFormatted.focus();
          }
        });
      });
    }

    // Helper Buttons untuk Bulan Mulai & Akhir
    if (el.btnSetStartMonthThisMonth) {
      el.btnSetStartMonthThisMonth.addEventListener('click', () => {
        el.inputStartMonth.value = getMonthKey(state.viewYear, state.viewMonth);
        showToast(`Bulan mulai diatur ke ${MONTH_NAMES_ID[state.viewMonth]} ${state.viewYear}`, 'success');
      });
    }

    if (el.btnSetEndMonthDec) {
      el.btnSetEndMonthDec.addEventListener('click', () => {
        el.inputEndMonth.value = `${state.viewYear}-12`;
        showToast(`Bulan batas akhir diatur ke Desember ${state.viewYear}`, 'success');
      });
    }

    // Quick Goal Switcher di Header Card
    if (el.quickGoalSelect) {
      el.quickGoalSelect.addEventListener('change', async (e) => {
        const selectedId = e.target.value;
        if (selectedId) {
          await activateGoal(selectedId);
        }
      });
    }

    // Wi-Fi LAN Sharing Modal Events
    if (el.lanShareBtn) {
      el.lanShareBtn.addEventListener('click', openLanModal);
    }
    if (el.closeLanModalBtn) {
      el.closeLanModalBtn.addEventListener('click', closeLanModal);
    }
    if (el.closeLanModalFooterBtn) {
      el.closeLanModalFooterBtn.addEventListener('click', closeLanModal);
    }
    if (el.btnCopyLanUrl) {
      el.btnCopyLanUrl.addEventListener('click', copyLanUrl);
    }
    if (el.lanShareModal) {
      el.lanShareModal.addEventListener('click', (e) => {
        if (e.target === el.lanShareModal) {
          closeLanModal();
        }
      });
    }

    // Close modal on backdrop click
    el.targetModal.addEventListener('click', (e) => {
      if (e.target === el.targetModal) {
        closeTargetModal();
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.targetModal && el.targetModal.classList.contains('open')) {
          closeTargetModal();
        }
        if (el.lanShareModal && el.lanShareModal.classList.contains('open')) {
          closeLanModal();
        }
      }
    });
  }

  // --- Fitur Berbagi Wi-Fi LAN & QR Code ---
  let qrCodeInstance = null;

  async function loadNetworkInfo() {
    try {
      const response = await fetch('api.php?action=get_network_info');
      if (!response.ok) return;
      const result = await response.json();
      if (!result.success || !result.data) return;

      state.networkInfo = result.data;
      if (el.lanUrlInput) el.lanUrlInput.value = result.data.lan_url;
      if (el.lanIpDisplay) el.lanIpDisplay.textContent = result.data.lan_ip;
      if (el.lanWifiName) el.lanWifiName.textContent = result.data.wifi_ssid || 'PERTA SHOP';

      // Update label di tombol jika ada
      const shareLabel = el.lanShareBtn ? el.lanShareBtn.querySelector('.lan-share-label') : null;
      if (shareLabel && result.data.lan_ip) {
        shareLabel.textContent = `LAN: ${result.data.lan_ip}`;
      }

      renderLanQrCode(result.data.lan_url);
    } catch (e) {
      console.warn('Gagal memuat info jaringan LAN:', e);
    }
  }

  function renderLanQrCode(url) {
    if (!el.lanQrCodeCanvasWrap || !url) return;
    el.lanQrCodeCanvasWrap.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      try {
        qrCodeInstance = new QRCode(el.lanQrCodeCanvasWrap, {
          text: url,
          width: 160,
          height: 160,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (err) {
        console.error('Error saat render QRCode:', err);
      }
    }
  }

  function openLanModal() {
    if (!el.lanShareModal) return;
    el.lanShareModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const currentUrl = el.lanUrlInput ? el.lanUrlInput.value : '';
    if (currentUrl && el.lanQrCodeCanvasWrap && !el.lanQrCodeCanvasWrap.hasChildNodes()) {
      renderLanQrCode(currentUrl);
    }
  }

  function closeLanModal() {
    if (!el.lanShareModal) return;
    el.lanShareModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  async function copyLanUrl() {
    if (!el.lanUrlInput) return;
    const url = el.lanUrlInput.value;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        el.lanUrlInput.select();
        document.execCommand('copy');
      }
      showToast('Tautan akses HP berhasil disalin!', 'success');
    } catch (err) {
      el.lanUrlInput.select();
      document.execCommand('copy');
      showToast('Tautan akses disalin!', 'success');
    }
  }

  // --- Initial Setup saat Halaman Dimuat ---
  function init() {
    applyTheme(state.theme);

    // Buka bulan yang disimpan sebelumnya di localStorage jika ada
    const savedMonth = localStorage.getItem('tabunganku_active_month');
    if (savedMonth && savedMonth.includes('-')) {
      const parts = savedMonth.split('-');
      state.viewYear = parseInt(parts[0], 10);
      state.viewMonth = parseInt(parts[1], 10) - 1;
    }

    const today = new Date();
    const yyyy = state.viewYear || today.getFullYear();
    const mm = String((state.viewMonth !== undefined ? state.viewMonth : today.getMonth()) + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    el.inputDate.value = `${yyyy}-${mm}-${dd}`;

    setTransactionType('income');
    setupEventListeners();
    loadDataForCurrentMonth();
    loadNetworkInfo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
