/**
 * TabunganKu - Client-Side Storage & Financial Logic Service
 * Menyimpan data di Browser LocalStorage dan mendukung ekspor/impor data mandiri.
 * Terintegrasi dengan seed data awal dari database sebelumnya.
 */

const SEED_DATA = {
  transactions: [
    {
      "id": 1,
      "type": "income",
      "amount": 4020000.00,
      "category": "Gaji Pokok",
      "date": "2026-08-28",
      "note": "Gaji Pokok",
      "created_at": "2026-09-07 11:45:34"
    },
    {
      "id": 14,
      "type": "expense",
      "amount": 60000.00,
      "category": "Hiburan & Rekreasi",
      "date": "2026-08-13",
      "note": "MIXUE",
      "created_at": "2026-09-13 23:25:30"
    },
    {
      "id": 13,
      "type": "expense",
      "amount": 783000.00,
      "category": "Hiburan & Rekreasi",
      "date": "2026-08-12",
      "note": "Ngajak jalan kakak kawan putri bisokop, dan tukaran uang dll",
      "created_at": "2026-09-12 22:03:05"
    },
    {
      "id": 12,
      "type": "expense",
      "amount": 252000.00,
      "category": "Makan & Minum",
      "date": "2026-08-07",
      "note": "Makan",
      "created_at": "2026-09-07 11:54:32"
    },
    {
      "id": 11,
      "type": "expense",
      "amount": 200000.00,
      "category": "Hiburan & Rekreasi",
      "date": "2026-08-07",
      "note": "Top UP Game",
      "created_at": "2026-09-07 11:54:02"
    },
    {
      "id": 10,
      "type": "expense",
      "amount": 40000.00,
      "category": "Makan & Minum",
      "date": "2026-08-07",
      "note": "Kwota",
      "created_at": "2026-09-07 11:51:54"
    },
    {
      "id": 9,
      "type": "expense",
      "amount": 98000.00,
      "category": "Makan & Minum",
      "date": "2026-08-07",
      "note": "Makanan",
      "created_at": "2026-09-07 11:50:52"
    },
    {
      "id": 8,
      "type": "expense",
      "amount": 145000.00,
      "category": "Hiburan & Rekreasi",
      "date": "2026-08-07",
      "note": "Liq dan Qoil",
      "created_at": "2026-09-07 11:50:16"
    },
    {
      "id": 7,
      "type": "expense",
      "amount": 167000.00,
      "category": "Belanja Kebutuhan",
      "date": "2026-08-07",
      "note": "Perlengkapan dari ALfamart",
      "created_at": "2026-09-07 11:49:42"
    },
    {
      "id": 6,
      "type": "expense",
      "amount": 300000.00,
      "category": "Hiburan & Rekreasi",
      "date": "2026-08-07",
      "note": "Makan Hotways",
      "created_at": "2026-09-07 11:48:19"
    },
    {
      "id": 5,
      "type": "expense",
      "amount": 200000.00,
      "category": "Makan & Minum",
      "date": "2026-08-07",
      "note": "Duit Makan",
      "created_at": "2026-09-07 11:48:03"
    },
    {
      "id": 4,
      "type": "expense",
      "amount": 180000.00,
      "category": "Hiburan & Rekreasi",
      "date": "2026-08-07",
      "note": "Qoil",
      "created_at": "2026-09-07 11:47:40"
    },
    {
      "id": 3,
      "type": "expense",
      "amount": 405000.00,
      "category": "Hiburan & Rekreasi",
      "date": "2026-08-07",
      "note": "Liquid",
      "created_at": "2026-09-07 11:47:14"
    },
    {
      "id": 2,
      "type": "expense",
      "amount": 1020000.00,
      "category": "Tagihan & Listrik/Air",
      "date": "2026-08-07",
      "note": "Cicilan AC pertama",
      "created_at": "2026-09-07 11:46:47"
    }
  ],
  goals: [
    {
      "id": 1,
      "title": "Balik Kampung",
      "target_amount": 10000000.00,
      "start_month": "2027-01",
      "end_month": "2027-02",
      "is_active": 0,
      "created_at": "2026-09-07 11:45:16",
      "updated_at": "2026-09-07 12:06:01"
    },
    {
      "id": 3,
      "title": "Xiaomi Redmi Pad 2 Pro",
      "target_amount": 6000000.00,
      "start_month": "2026-08",
      "end_month": "2026-12",
      "is_active": 1,
      "created_at": "2026-09-07 12:05:48",
      "updated_at": "2026-09-07 12:06:01"
    }
  ]
};

const STORAGE_KEYS = {
  TRANSACTIONS: 'tabunganku_transactions_v2',
  GOALS: 'tabunganku_goals_v2',
  AUTH: 'tabunganku_auth_session',
  THEME: 'tabunganku_theme'
};

const StorageService = {
  /**
   * Inisialisasi awal: Memastikan seed data terpasang jika belum ada
   */
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_DATA.transactions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(SEED_DATA.goals));
    }
  },

  /**
   * Ambil semua transaksi dari localStorage
   */
  getTransactions() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Gagal membaca transaksi dari localStorage:', e);
      return [];
    }
  },

  /**
   * Simpan transaksi ke localStorage
   */
  saveTransactions(transactions) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Gagal menyimpan transaksi ke localStorage:', e);
    }
  },

  /**
   * Tambah transaksi baru
   */
  addTransaction(tx) {
    const list = this.getTransactions();
    const newId = Date.now();
    const newTx = {
      id: newId,
      type: tx.type === 'income' ? 'income' : 'expense',
      amount: parseFloat(tx.amount) || 0,
      category: tx.category || 'Lainnya',
      date: tx.date || new Date().toISOString().split('T')[0],
      note: tx.note || '',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    list.unshift(newTx);
    this.saveTransactions(list);
    return newTx;
  },

  /**
   * Hapus transaksi berdasarkan ID
   */
  deleteTransaction(id) {
    const list = this.getTransactions();
    const filtered = list.filter(t => String(t.id) !== String(id));
    if (filtered.length !== list.length) {
      this.saveTransactions(filtered);
      return true;
    }
    return false;
  },

  /**
   * Ambil semua target tabungan
   */
  getGoals() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Gagal membaca goals:', e);
      return [];
    }
  },

  /**
   * Simpan daftar target tabungan
   */
  saveGoals(goals) {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Gagal menyimpan goals:', e);
    }
  },

  /**
   * Ambil target yang sedang aktif
   */
  getActiveGoal() {
    const goals = this.getGoals();
    return goals.find(g => Number(g.is_active) === 1) || null;
  },

  /**
   * Set target tertentu menjadi aktif
   */
  setActiveGoal(goalId) {
    const goals = this.getGoals();
    goals.forEach(g => {
      g.is_active = (String(g.id) === String(goalId)) ? 1 : 0;
    });
    this.saveGoals(goals);
    return true;
  },

  /**
   * Tambah atau perbarui target tabungan
   */
  saveGoal(goalData) {
    const goals = this.getGoals();
    const id = goalData.id ? Number(goalData.id) : null;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (id) {
      const idx = goals.findIndex(g => Number(g.id) === id);
      if (idx !== -1) {
        goals[idx].title = goalData.title;
        goals[idx].target_amount = parseFloat(goalData.target_amount) || 0;
        goals[idx].start_month = goalData.start_month;
        goals[idx].end_month = goalData.end_month;
        goals[idx].updated_at = nowStr;
        if (goalData.is_active !== undefined) {
          goals[idx].is_active = goalData.is_active ? 1 : 0;
        }
        this.saveGoals(goals);
        return goals[idx];
      }
    }

    // Buat target baru
    const newId = Date.now();
    const isFirstGoal = goals.length === 0;
    const makeActive = goalData.is_active !== undefined ? (goalData.is_active ? 1 : 0) : (isFirstGoal ? 1 : 0);

    if (makeActive) {
      goals.forEach(g => g.is_active = 0);
    }

    const newGoal = {
      id: newId,
      title: goalData.title,
      target_amount: parseFloat(goalData.target_amount) || 0,
      start_month: goalData.start_month,
      end_month: goalData.end_month,
      is_active: makeActive,
      created_at: nowStr,
      updated_at: nowStr
    };

    goals.push(newGoal);
    this.saveGoals(goals);
    return newGoal;
  },

  /**
   * Hapus target tabungan
   */
  deleteGoal(id) {
    let goals = this.getGoals();
    const targetGoal = goals.find(g => String(g.id) === String(id));
    const wasActive = targetGoal && Number(targetGoal.is_active) === 1;

    goals = goals.filter(g => String(g.id) !== String(id));
    if (wasActive && goals.length > 0) {
      goals[0].is_active = 1;
    }
    this.saveGoals(goals);
    return true;
  },

  /**
   * Dapatkan Ringkasan Finansial untuk Bulan Tertentu (Menggantikan api.php?action=get_summary)
   */
  getSummary(monthKey) {
    this.init();
    const allTx = this.getTransactions();
    const goals = this.getGoals();
    const activeGoal = goals.find(g => Number(g.is_active) === 1) || (goals.length > 0 ? goals[0] : null);

    // Hitung months with data
    const monthsWithData = {};
    let latestMonth = null;
    allTx.forEach(t => {
      const m = t.date.substring(0, 7);
      monthsWithData[m] = (monthsWithData[m] || 0) + 1;
      if (!latestMonth || m > latestMonth) {
        latestMonth = m;
      }
    });

    const nowMonth = new Date().toISOString().substring(0, 7);
    const targetMonth = monthKey || latestMonth || nowMonth;
    const [viewY, viewM] = targetMonth.split('-').map(Number);

    // Transaksi bulan yang dipilih
    const monthTx = allTx.filter(t => t.date.startsWith(targetMonth));
    monthTx.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return Number(b.id) - Number(a.id);
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    monthTx.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'income') monthlyIncome += amt;
      else monthlyExpense += amt;
    });
    const monthlyCashflow = monthlyIncome - monthlyExpense;

    // Hitung total saldo kas berjalan hingga akhir bulan yang dilihat (Running Balance)
    let runningIncome = 0;
    let runningExpense = 0;
    allTx.forEach(t => {
      const m = t.date.substring(0, 7);
      if (m <= targetMonth) {
        if (t.type === 'income') runningIncome += Number(t.amount);
        else runningExpense += Number(t.amount);
      }
    });
    const currentBalance = runningIncome - runningExpense;

    // Analisis & Akumulasi Target Tabungan
    let goalResult = null;
    if (activeGoal) {
      const startMStr = activeGoal.start_month;
      const endMStr = activeGoal.end_month;
      const targetAmt = parseFloat(activeGoal.target_amount) || 0;

      const [startY, startM] = startMStr.split('-').map(Number);
      const [endY, endM] = endMStr.split('-').map(Number);

      // Akumulasi surplus kas dari start_month hingga targetMonth
      let cumIncome = 0;
      let cumExpense = 0;
      allTx.forEach(t => {
        const m = t.date.substring(0, 7);
        if (m >= startMStr && m <= targetMonth) {
          if (t.type === 'income') cumIncome += Number(t.amount);
          else cumExpense += Number(t.amount);
        }
      });
      const cumulativeBalance = cumIncome - cumExpense;

      // Hitung sisa bulan
      const totalMonthsInPeriod = Math.max(1, (endY - startY) * 12 + (endM - startM) + 1);
      let monthsElapsed = (viewY - startY) * 12 + (viewM - startM) + 1;
      monthsElapsed = Math.max(1, Math.min(totalMonthsInPeriod, monthsElapsed));

      let remainingMonths = (endY - viewY) * 12 + (endM - viewM) + 1;
      if (remainingMonths < 0) remainingMonths = 0;

      const remainingToTarget = Math.max(0, targetAmt - cumulativeBalance);
      const percentage = targetAmt > 0 ? Math.min(100, Math.max(0, Math.round((cumulativeBalance / targetAmt) * 1000) / 10)) : 0;
      const rawPercentage = targetAmt > 0 ? Math.round((cumulativeBalance / targetAmt) * 1000) / 10 : 0;
      const monthlySavingRecommended = remainingMonths > 0 ? Math.ceil(remainingToTarget / remainingMonths) : 0;
      const idealProgress = (monthsElapsed / totalMonthsInPeriod) * targetAmt;

      // Evaluasi status & alert
      let status = 'warning';
      let alertMessage = '';

      if (targetAmt <= 0) {
        status = 'no_target';
        alertMessage = 'Nominal target tabungan belum diatur.';
      } else if (cumulativeBalance >= targetAmt) {
        status = 'success';
        const surplus = cumulativeBalance - targetAmt;
        alertMessage = `Target Tabungan Tercapai! Akumulasi tabungan telah mencapai ${rawPercentage}% dari sasaran target.` + (surplus > 0 ? ` Kelebihan tabungan: Rp ${Math.round(surplus).toLocaleString('id-ID')}` : '');
      } else if (remainingMonths === 0 && (viewY > endY || (viewY === endY && viewM > endM))) {
        status = 'expired';
        alertMessage = `Batas periode target telah terlewati. Tabungan terkumpul Rp ${Math.round(cumulativeBalance).toLocaleString('id-ID')} dari target Rp ${Math.round(targetAmt).toLocaleString('id-ID')} (Kurang Rp ${Math.round(remainingToTarget).toLocaleString('id-ID')}).`;
      } else if (viewY < startY || (viewY === startY && viewM < startM)) {
        status = 'upcoming';
        alertMessage = `Target ini dijadwalkan mulai pada bulan ${startMStr}. Transaksi di bulan ${targetMonth} belum masuk hitungan target ini.`;
      } else if (cumulativeBalance >= (idealProgress * 0.9)) {
        status = 'on_track';
        alertMessage = `Pencapaian tabungan berjalan sesuai rencana! Lanjutkan pola menabung ini untuk mencapai target tepat waktu pada ${endMStr}.`;
      } else {
        status = 'warning';
        alertMessage = `Akumulasi tabungan saat ini masih di bawah jadwal ideal (Target ideal saat ini: Rp ${Math.round(idealProgress).toLocaleString('id-ID')}). Tingkatkan tabungan atau hemat pengeluaran Anda!`;
      }

      goalResult = {
        id: activeGoal.id,
        title: activeGoal.title,
        target_amount: targetAmt,
        start_month: startMStr,
        end_month: endMStr,
        is_active: Number(activeGoal.is_active) === 1,
        cumulative_balance: cumulativeBalance,
        remaining_to_target: remainingToTarget,
        remaining_months: remainingMonths,
        monthly_saving_recommended: monthlySavingRecommended,
        percentage: percentage,
        raw_percentage: rawPercentage,
        status: status,
        alert_message: alertMessage
      };
    } else {
      goalResult = {
        id: 0,
        title: 'Belum Ada Target Aktif',
        target_amount: 0,
        start_month: targetMonth,
        end_month: `${viewY}-12`,
        is_active: false,
        cumulative_balance: currentBalance,
        remaining_to_target: 0,
        remaining_months: 0,
        monthly_saving_recommended: 0,
        percentage: 0,
        raw_percentage: 0,
        status: 'no_target',
        alert_message: 'Belum ada target tabungan aktif. Klik tombol "Tambah Target" untuk memasang sasaran tabungan Anda.'
      };
    }

    return {
      success: true,
      data: {
        month: targetMonth,
        latest_month: latestMonth || nowMonth,
        months_with_data: monthsWithData,
        goals: goals,
        summary: {
          total_income: monthlyIncome,
          total_expense: monthlyExpense,
          monthly_cashflow: monthlyCashflow,
          current_balance: currentBalance,
          target_amount: goalResult.target_amount,
          percentage: goalResult.percentage,
          raw_percentage: goalResult.raw_percentage,
          remaining_to_target: goalResult.remaining_to_target,
          status: goalResult.status,
          alert_message: goalResult.alert_message,
          goal: goalResult
        },
        transactions: monthTx,
        all_transactions: allTx,
        transaction_count: monthTx.length
      }
    };
  },

  /**
   * Ekspor transaksi ke format CSV dan trigger download
   */
  exportCsv(monthKey) {
    const summaryData = this.getSummary(monthKey).data;
    const transactions = summaryData.transactions;

    const rows = [
      ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Nominal (IDR)', 'Catatan']
    ];

    transactions.forEach(t => {
      rows.push([
        t.id,
        t.date,
        t.type === 'income' ? 'Pendapatan' : 'Pengeluaran',
        `"${(t.category || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ]);
    });

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tabunganku_${monthKey || 'semua'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Ekspor seluruh database ke file JSON untuk backup
   */
  exportBackupJson() {
    const backup = {
      version: '2.0-vercel',
      exportDate: new Date().toISOString(),
      transactions: this.getTransactions(),
      goals: this.getGoals()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_tabunganku_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Impor database dari file JSON
   */
  importBackupJson(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (!Array.isArray(data.transactions)) {
        throw new Error('Format cadangan tidak valid (tidak ada array transaksi)');
      }
      this.saveTransactions(data.transactions);
      if (Array.isArray(data.goals)) {
        this.saveGoals(data.goals);
      }
      return { success: true, count: data.transactions.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};

// Inisialisasi awal saat dimuat
StorageService.init();

// Export secara global ke window
window.StorageService = StorageService;
