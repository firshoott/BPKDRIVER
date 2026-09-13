/**
 * apps_penabungan - Storage Management Service
 * Handles persistence with LocalStorage, defaults, and data export/import.
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'apps_penabungan_tx_v1',
  TARGETS: 'apps_penabungan_targets_v1',
  THEME: 'apps_penabungan_theme_v1'
};

const StorageService = {
  /**
   * Get all transactions
   * @returns {Array} List of transactions
   */
  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading transactions from localStorage:', e);
      return [];
    }
  },

  /**
   * Save transactions list
   * @param {Array} transactions
   */
  saveTransactions(transactions) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions to localStorage:', e);
    }
  },

  /**
   * Add a new transaction
   * @param {Object} tx
   * @returns {Object} Added transaction
   */
  addTransaction(tx) {
    const transactions = this.getTransactions();
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type: tx.type, // 'income' | 'expense'
      amount: Number(tx.amount),
      category: tx.category || 'Lainnya',
      date: tx.date, // 'YYYY-MM-DD'
      note: tx.note || '',
      createdAt: new Date().toISOString()
    };
    transactions.unshift(newTx);
    this.saveTransactions(transactions);
    return newTx;
  },

  /**
   * Delete transaction by ID
   * @param {string} id
   * @returns {boolean} True if deleted
   */
  deleteTransaction(id) {
    const transactions = this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    if (filtered.length !== transactions.length) {
      this.saveTransactions(filtered);
      return true;
    }
    return false;
  },

  /**
   * Get monthly savings targets map
   * @returns {Object} { 'YYYY-MM': number }
   */
  getTargets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TARGETS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error reading targets from localStorage:', e);
      return {};
    }
  },

  /**
   * Get target for specific month
   * @param {string} monthKey 'YYYY-MM'
   * @returns {number} Target amount in IDR
   */
  getTargetForMonth(monthKey) {
    const targets = this.getTargets();
    if (targets[monthKey] !== undefined) {
      return Number(targets[monthKey]);
    }
    // Default fallback target: Rp 3.000.000
    return 3000000;
  },

  /**
   * Set target for specific month
   * @param {string} monthKey 'YYYY-MM'
   * @param {number} amount
   */
  setTargetForMonth(monthKey, amount) {
    const targets = this.getTargets();
    targets[monthKey] = Number(amount);
    try {
      localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
    } catch (e) {
      console.error('Error saving target to localStorage:', e);
    }
  },

  /**
   * Theme settings
   */
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  /**
   * Initialize initial mock data if empty
   */
  seedInitialDataIfEmpty() {
    const existing = this.getTransactions();
    if (existing.length === 0) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const monthKey = `${yyyy}-${mm}`;

      const sampleData = [
        {
          id: 'tx_seed_1',
          type: 'income',
          amount: 6500000,
          category: 'Gaji',
          date: `${yyyy}-${mm}-01`,
          note: 'Gaji Bulanan Kantor',
          createdAt: new Date(today.getTime() - 86400000 * 6).toISOString()
        },
        {
          id: 'tx_seed_2',
          type: 'income',
          amount: 1500000,
          category: 'Freelance',
          date: `${yyyy}-${mm}-03`,
          note: 'Proyek Desain Web',
          createdAt: new Date(today.getTime() - 86400000 * 4).toISOString()
        },
        {
          id: 'tx_seed_3',
          type: 'expense',
          amount: 1200000,
          category: 'Belanja',
          date: `${yyyy}-${mm}-02`,
          note: 'Belanja Kebutuhan Bulanan Supermarket',
          createdAt: new Date(today.getTime() - 86400000 * 5).toISOString()
        },
        {
          id: 'tx_seed_4',
          type: 'expense',
          amount: 850000,
          category: 'Makan & Minum',
          date: `${yyyy}-${mm}-04`,
          note: 'Makan Siang & Kopi Mingguan',
          createdAt: new Date(today.getTime() - 86400000 * 3).toISOString()
        },
        {
          id: 'tx_seed_5',
          type: 'expense',
          amount: 650000,
          category: 'Tagihan & Utilitas',
          date: `${yyyy}-${mm}-05`,
          note: 'Listrik PLN & Tagihan WiFi Internet',
          createdAt: new Date(today.getTime() - 86400000 * 2).toISOString()
        },
        {
          id: 'tx_seed_6',
          type: 'expense',
          amount: 350000,
          category: 'Transportasi',
          date: `${yyyy}-${mm}-06`,
          note: 'Bensin & Saldo E-Toll',
          createdAt: new Date(today.getTime() - 86400000 * 1).toISOString()
        }
      ];

      this.saveTransactions(sampleData);
      this.setTargetForMonth(monthKey, 4500000);
      console.log('Sample data seeded successfully.');
    }
  },

  /**
   * Export all data as JSON
   */
  exportData() {
    const data = {
      transactions: this.getTransactions(),
      targets: this.getTargets(),
      exportedAt: new Date().toISOString(),
      appName: 'apps_penabungan'
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apps_penabungan_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Reset all data
   */
  resetData() {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.TARGETS);
  }
};
