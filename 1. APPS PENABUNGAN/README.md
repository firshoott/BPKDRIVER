# TabunganKu - Aplikasi Pelacak Tabungan & Anggaran Bulanan Modern (XAMPP) 💰

Aplikasi web modern, bersih, dan responsif untuk melacak pendapatan dan pengeluaran bulanan, dilengkapi dengan fitur **Target Tabungan Bulanan**, visual **Progress Bar** dinamis, dan sistem peringatan real-time.

Aplikasi ini dibangun khusus untuk lingkungan **XAMPP (PHP 8 + MySQL/SQLite PDO)** dan dioptimalkan untuk layar ponsel (*mobile-friendly*) maupun komputer desktop.

---

## ✨ Fitur Utama & Logika Sistem

1. **Ringkasan Dashboard Interaktif**:
   - **Total Pendapatan**, **Total Pengeluaran**, dan **Saldo Saat Ini** (Pendapatan dikurang Pengeluaran) terhitung secara otomatis untuk bulan yang sedang berjalan.
   - Status badge pintar: **Surplus** (saldo positif) atau **Defisit** (saldo negatif).
   - Pemilih bulan dinamis: Navigasi ke bulan sebelumnya, bulan berikutnya, atau tombol cepat *Hari Ini*.

2. **Fitur Target Tabungan & Bilah Kemajuan Visual**:
   - Menampilkan nominal target bulanan beserta **Progress Bar** persentase pencapaian target berdasarkan saldo bersih saat ini.
   - **Logika Peringatan Real-Time**:
     - 🔴 **Saldo < Target Tabungan**: Progress bar otomatis berubah menjadi **merah gradient**, memicu banner peringatan dengan rincian sisa nominal yang masih kurang untuk mencapai target.
     - 🟢 **Saldo >= Target Tabungan**: Progress bar otomatis berubah menjadi **hijau emerald**, memicu banner selamat atas pencapaian target beserta rincian kelebihan surplus.
     - ⚙️ **Ubah Target**: Pengguna dapat mengatur atau mengubah nominal target tabungan bulanan kapan saja melalui pop-up modal yang intuitif.

3. **Formulir Transaksi Cepat & Otomatis**:
   - Pilihan jenis transaksi: **Pendapatan** (*Income*) vs **Pengeluaran** (*Expense*) dengan tombol toggle cepat.
   - Input nominal otomatis dengan pemformatan mata uang Rupiah (`Rp 1.500.000`).
   - Pilihan kategori fleksibel lengkap dengan tombol *quick tag chips* (Gaji, Bonus, Bisnis, Makan & Minum, Transportasi, Tagihan, Belanja, Hiburan, dll.).
   - Input tanggal (otomatis terisi hari ini).
   - Catatan singkat opsional.

4. **Riwayat Transaksi Lengkap**:
   - Daftar transaksi bulanan diurutkan dari yang paling baru di atas (*newest first*).
   - Tombol **Hapus Transaksi** (*delete*) dengan dialog konfirmasi aman.
   - Pencarian instan (*live search*) berdasarkan kategori atau catatan.
   - Filter transaksi: *Semua Jenis*, *Hanya Pendapatan*, atau *Hanya Pengeluaran*.
   - Tombol **Ekspor CSV** untuk mengunduh laporan transaksi bulanan ke Excel.

5. **Desain Modern & Responsif**:
   - Tampilan estetika tinggi dengan gaya *Glassmorphism*, ambient lighting, dan font *Plus Jakarta Sans*.
   - Toggle tema: **Mode Gelap (*Dark Mode*)** dan **Mode Terang (*Light Mode*)**.
   - Tata letak responsif 1 kolom di HP dan 2 kolom di layar PC/tablet.

---

## 🚀 Cara Menjalankan Aplikasi di XAMPP

### Opsi 1: Menggunakan Apache XAMPP (Rekomendasi)
1. Buka aplikasi **XAMPP Control Panel**.
2. Klik tombol **Start** pada modul **Apache** (dan **MySQL** jika ingin menggunakan MySQL).
3. Salin folder aplikasi ini ke dalam direktori `htdocs` XAMPP:
   `C:\xampp\htdocs\apps_penabungan` *(sudah disiapkan otomatis)*.
4. Buka peramban (browser) dan akses alamat:
   ```
   http://localhost/apps_penabungan/index.php
   ```

### Opsi 2: Menggunakan PHP Built-in Server
Jika Anda tidak ingin membuka XAMPP Control Panel, cukup jalankan perintah berikut di terminal / PowerShell:
```powershell
& "C:\xampp\php\php.exe" -S localhost:8000
```
Lalu buka browser di:
```
http://localhost:8000/index.php
```

---

## 🗄️ Konfigurasi Database (MySQL & SQLite Fallback)

Aplikasi dilengkapi dengan sistem koneksi database cerdas pada `config.php`:
- **MySQL (Bawaan XAMPP)**: Otomatis mencoba terhubung ke `localhost:3306`, user `root`, tanpa password, dan otomatis membuat database `penabungan_db` serta tabelnya.
- **SQLite Auto-Fallback**: Jika MySQL belum Anda nyalakan di XAMPP, aplikasi secara cerdas beralih ke database SQLite lokal di `data/database.sqlite` sehingga aplikasi **langsung siap digunakan 100% tanpa error konfig**.
- **Impor Manual (Opsional)**: File `database.sql` tersedia jika Anda ingin mengimpor struktur dan data sampel awal langsung melalui **phpMyAdmin** (`http://localhost/phpmyadmin`).

---

## 📁 Struktur Direktori Proyek

```
1. APPS PENABUNGAN/
├── config.php          # Koneksi PDO (MySQL XAMPP & SQLite auto-fallback)
├── api.php             # REST API endpoint (CRUD transaksi, target, kalkulasi real-time, ekspor CSV)
├── index.php           # Tampilan utama antarmuka pengguna (UI)
├── database.sql        # Skrip skema database MySQL untuk phpMyAdmin
├── README.md           # Panduan lengkap penggunaan
├── css/
│   └── style.css       # Desain sistem modern FinTech, glassmorphism, responsif
├── js/
│   └── app.js          # Logika frontend, AJAX, kalkulasi saldo & target, format Rupiah
└── data/
    └── database.sqlite # Database SQLite lokal (jika MySQL offline)
```
