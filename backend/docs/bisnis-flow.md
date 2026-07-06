# Bisnis Flow — Stock & Sales Management App

> Dokumentasi ini menjelaskan alur bisnis dari level paling atas sampai detail tiap modul, termasuk penjelasan tiap field dengan contoh konkret. Semua referensi ke table mengikuti schema Drizzle terbaru (v2).

---

## Daftar Isi

1. [Gambaran Besar](#1-gambaran-besar)
2. [Modul Catalog](#2-modul-catalog)
3. [Modul Procurement](#3-modul-procurement)
4. [Modul Inventory](#4-modul-inventory)
5. [Modul Sales](#5-modul-sales)
6. [Modul Analytics](#6-modul-analytics)
7. [Modul System (Audit)](#7-modul-system-audit)
8. [Relasi Antar Modul](#8-relasi-antar-modul)
9. [Alur Lengkap — Contoh Kasus](#9-alur-lengkap--contoh-kasus)

---

## 1. Gambaran Besar

App ini adalah sistem manajemen stok dan penjualan (semacam mini-ERP / POS backend). Intinya ngelacak:

- **Produk** yang dijual (catalog)
- **Barang masuk** dari supplier (procurement)
- **Stok** yang bergerak naik-turun (inventory)
- **Transaksi penjualan** dan pembayarannya (sales)
- **Ringkasan analytics** harian (analytics)
- **Log perubahan** data penting (system / audit)

Alur utamanya:

```
Supplier → Barang Masuk → Stok Bertambah
                                ↓
                    Stok Berkurang ← Penjualan → Pembayaran
```

Ga ada payment gateway. Semua pembayaran dicatat manual — entah cash, QRIS, transfer, dll.

---

## 2. Modul Catalog

**Schema:** `catalog.categories`, `catalog.products`, `catalog.product_units`, `catalog.product_unit_prices`

Modul ini adalah **fondasi**. Semua modul lain ngerujuk ke sini.

---

### 2.1 Kategori

`catalog.categories`

Kategori cuma label pengelompokan produk. Contoh: Makanan, Minuman, ATK.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | serial (integer) | Primary key, **auto-increment dari DB** — bukan di-generate app | `1`, `2`, `3` |
| `name` | text | Nama kategori, **unique** — ga boleh duplikat | `"Makanan"` |
| `isActive` | boolean | `false` = kategori disembunyiin dari pilihan (soft delete) | `true` |
| `createdAt` | timestamp | Kapan dibuat, auto-diisi DB | `2026-06-01T08:00:00Z` |
| `updatedAt` | timestamp | Kapan terakhir diupdate, auto-diisi DB | `2026-06-01T08:00:00Z` |

> **Kenapa `id` di sini pakai serial (integer)?** Karena kategori adalah master data statis yang jumlahnya sedikit — jarang sampai ratusan, apalagi jutaan. Integer serial lebih simpel dan efisien.

> **Kenapa `products` FK ke `categories.name` bukan `categories.id`?** Design ini memilih human-readable FK — lebih mudah di-trace waktu debug. Trade-off-nya: kalau nama kategori diubah, perlu cascade update ke products. Karena itu, **nama kategori sebaiknya ga diubah setelah ada produk yang pakai** — lebih baik buat kategori baru.

Alur:
1. Admin buat kategori baru
2. Kalau ga relevan lagi, set `isActive = false` (soft delete, bukan hapus)

---

### 2.2 Produk

`catalog.products`

Ini inti dari semua transaksi. Tiap produk punya identitas unik.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key, di-generate server saat produk dibuat | `"01HVXXX...-abc1234567"` |
| `categoryName` | text (nullable) | FK ke `categories.name` — langsung pakai nama kategori, bukan id | `"Makanan"` |
| `name` | text | Nama produk, **unique** | `"Indomie Goreng"` |
| `sku` | text | Kode internal produk, **unique** — dipakai oleh tim internal | `"IDM001"` |
| `barcode` | text | Kode untuk scan barcode, **unique** | `"8998866123456"` |
| `baseUnit` | text | Satuan paling kecil dari produk ini | `"pcs"` |
| `costPrice` | integer | Harga beli **terkini** per base unit (rupiah) | `2500` |
| `sellingPrice` | integer | Harga jual **terkini** per base unit (rupiah) | `3500` |
| `isActive` | boolean | `false` = produk discontinue / soft delete | `true` |
| `createdAt` | timestamp | Auto-diisi DB | `2026-06-01T08:00:00Z` |
| `updatedAt` | timestamp | Auto-diisi DB | `2026-06-15T10:00:00Z` |

> **`costPrice` dan `sellingPrice` di sini adalah harga terkini (current state).** Harga historis per transaksi disimpan terpisah di `transaction_items.unitPrice` dan `transaction_items.unitCost`. Kalau harga produk berubah hari ini, semua transaksi lama tetap pakai harga yang sudah di-snapshot — data historis aman.

> **`sellingPrice` di sini adalah harga untuk base unit saja.** Untuk harga jual satuan lain (pack, dus), cek `catalog.product_unit_prices`.

> **Perbedaan `sku` vs `barcode`:** `sku` adalah kode internal yang dibuat sendiri oleh bisnis (`IDM001`), sedangkan `barcode` adalah kode yang tercetak di kemasan produk dan di-scan kasir (`8998866123456`). Keduanya unique.

Alur:
1. Admin buat produk baru, isi semua field
2. Kalau produk discontinue, set `isActive = false`
3. Kalau harga berubah, update `costPrice` / `sellingPrice` — otomatis ke-log di `audit_logs`

---

### 2.3 Satuan Produk

`catalog.product_units`

Satu produk bisa punya **banyak satuan**. Contoh untuk Indomie Goreng:

| Satuan | `conversionFactor` | `isBaseUnit` | Artinya |
|---|---|---|---|
| pcs | 1 | ✅ | Satuan terkecil |
| pack | 10 | ❌ | 1 pack = 10 pcs |
| dus | 40 | ❌ | 1 dus = 40 pcs |

`conversionFactor` selalu relatif ke `baseUnit` produk.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `productId` | text | FK ke `products.id` — produk mana yang punya satuan ini | `"01HVXXX...-xyz9876543"` |
| `name` | text | Nama satuan | `"dus"` |
| `conversionFactor` | integer | Berapa base unit dalam 1 satuan ini | `40` (1 dus = 40 pcs) |
| `isBaseUnit` | boolean | Apakah ini satuan terkecil | `false` |

Constraint penting:
- `(productId, name)` adalah **unique composite** — nama satuan boleh sama di produk berbeda (misal `pcs` ada di semua produk), tapi tidak boleh duplikat dalam satu produk yang sama
- Tiap produk harus punya tepat **1 satuan dengan `isBaseUnit = true`**

Alur:
1. Setelah buat produk, admin define satuan-satuannya
2. Minimal 1 satuan (base unit)
3. Satuan tambahan optional, tergantung kebutuhan penjualan / pembelian

---

### 2.4 Harga Per Satuan

`catalog.product_unit_prices`

Tabel ini menyimpan **harga jual khusus per satuan non-base**. Karena harga jual satuan besar biasanya bukan sekadar `sellingPrice × conversionFactor` — ada diskon bundling, dll.

Contoh untuk Indomie Goreng:

| Satuan | Dari mana harga dibaca | Nilai |
|---|---|---|
| pcs (base unit) | `products.sellingPrice` | `3500` |
| pack | `product_unit_prices.sellingPrice` | `32000` (bukan 3500×10=35000) |
| dus | `product_unit_prices.sellingPrice` | `120000` (bukan 3500×40=140000) |

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `productId` | text | FK ke `products.id` | `"01HVXXX...-xyz9876543"` |
| `unitId` | text | FK ke `product_units.id` — satuan mana yang di-assign harga ini | `"01HVXXX...-pqr1234567"` |
| `sellingPrice` | integer | Harga jual per satuan ini (rupiah) | `32000` |
| `isActive` | boolean | `false` = harga ini nonaktif | `true` |
| `createdAt` | timestamp | Auto-diisi DB | `2026-06-01T08:00:00Z` |
| `updatedAt` | timestamp | Auto-diisi DB | `2026-06-01T08:00:00Z` |

Constraint: `(productId, unitId)` adalah **unique composite** — satu produk hanya boleh punya satu entry harga aktif per satuan.

**Cara baca harga jual waktu transaksi (prioritas):**
1. Cek apakah ada record aktif di `product_unit_prices` untuk kombinasi produk + satuan ini
2. Kalau ada → pakai `product_unit_prices.sellingPrice`
3. Kalau tidak ada → pakai `products.sellingPrice` (fallback ke base unit price)
4. Hasil snapshot ke `transaction_items.unitPrice`

---

## 3. Modul Procurement

**Schema:** `procurement.suppliers`, `procurement.purchases`, `procurement.purchase_items`

Modul ini ngatur **barang masuk dari supplier**.

---

### 3.1 Supplier

`procurement.suppliers`

Master data supplier / vendor.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `name` | text | Nama perusahaan / toko | `"PT Indofood Sukses Makmur"` |
| `code` | text | Kode unik supplier, **ini yang dipakai sebagai FK dari purchases** | `"SUP-INDOFOOD"` |
| `phone` | text (nullable) | Nomor telepon, opsional | `"021-123456"` |
| `address` | text (nullable) | Alamat, opsional | `"Jakarta Pusat"` |
| `isActive` | boolean | `false` = supplier ga aktif lagi | `true` |
| `createdAt` | timestamp | Auto-diisi DB | `2026-06-01T08:00:00Z` |
| `updatedAt` | timestamp | Auto-diisi DB | `2026-06-01T08:00:00Z` |

> **Kenapa `purchases` FK ke `suppliers.code` bukan `suppliers.id`?** Sama dengan pattern di catalog — `code` sudah unique dan lebih mudah di-trace secara manual. Konsekuensi: jangan ubah `code` supplier setelah ada purchase yang mereferensikannya.

Alur:
1. Admin daftarin supplier dulu sebelum bisa buat purchase
2. Kalau supplier ga aktif lagi, set `isActive = false`

---

### 3.2 Purchase (Dokumen Pembelian)

`procurement.purchases`

Ini dokumen pembelian ke supplier.

**Status flow:**

```
DRAFT → CONFIRMED → RECEIVED → (selesai)
         ↓
      CANCELLED
```

| Status | Artinya | Efek ke stok |
|---|---|---|
| `DRAFT` | Dokumen dibuat, belum dikonfirmasi | Tidak ada |
| `CONFIRMED` | Sudah dikonfirmasi ke supplier, barang belum datang | Tidak ada |
| `RECEIVED` | Barang sudah diterima | **Trigger `stock_movements`** (+stok) |
| `CANCELLED` | Dibatalkan | Tidak ada |

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `supplierCode` | text | FK ke `suppliers.code` | `"SUP-INDOFOOD"` |
| `referenceNumber` | text | **Nomor PO atau faktur dari supplier** — bukan dari sistem kita, **unique** | `"INV/2026/06/001"` |
| `status` | enum | Status dokumen saat ini | `"RECEIVED"` |
| `totalCost` | integer | Total biaya pembelian (rupiah), di-maintain app layer | `900000` |
| `notes` | text (nullable) | Catatan bebas | `"Pengiriman via JNE"` |
| `receivedAt` | timestamp (nullable) | Kapan barang tiba — `null` sampai status → `RECEIVED` | `2026-06-05T14:00:00Z` |
| `createdAt` | timestamp | Auto-diisi DB | `2026-06-04T09:00:00Z` |
| `updatedAt` | timestamp | Auto-diisi DB | `2026-06-05T14:00:00Z` |

> **`referenceNumber`** adalah nomor dari dokumen supplier (faktur, surat jalan, dll), bukan nomor yang kita buat sendiri. Fungsinya untuk cross-check dengan dokumen fisik yang diterima. Misalnya supplier kasih faktur "INV/2026/06/001", itu yang dimasukin di sini.

> **`totalCost` di-maintain di application layer** (bukan DB trigger). Tiap ada perubahan di `purchase_items`, service harus recalculate dan update field ini.

---

### 3.3 Purchase Items

`procurement.purchase_items`

Detail produk yang dibeli dalam satu purchase.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `purchaseId` | text | FK ke `purchases.id` | `"01HVXXX...-pqr0000001"` |
| `productId` | text | FK ke `products.id` — produk yang dibeli | `"01HVXXX...-xyz9876543"` |
| `unitName` | text | **Snapshot** nama satuan saat beli | `"dus"` |
| `conversionFactor` | integer | **Snapshot** faktor konversi ke base unit saat beli | `40` |
| `quantity` | integer | Jumlah dalam `unitName` yang dibeli | `10` (10 dus) |
| `quantityInBase` | integer | `quantity × conversionFactor` — sudah dalam base unit | `400` (400 pcs) |
| `unitCost` | integer | Harga beli per `unitName` saat transaksi (rupiah) | `90000` (per dus) |
| `subtotal` | integer | `quantity × unitCost` (rupiah) | `900000` |

> **Kenapa `unitName` dan `conversionFactor` di-snapshot?** Supaya historical record tetap valid meskipun satuan produk di-edit atau dihapus di masa depan. Kalau kita cuma simpan `unitId`, begitu satuan dihapus, data pembelian lama jadi corrupt.

> **Kenapa ada `quantityInBase`?** Biar waktu status jadi `RECEIVED` dan service mau bikin `stock_movements`, tinggal baca field ini langsung — ga perlu kalkulasi ulang dari `quantity × conversionFactor`.

Ketika status purchase jadi `RECEIVED`, service bikin `stock_movements` per item:
- `type = 'PURCHASE'`
- `quantity = quantityInBase` (positif, stok bertambah)
- `referenceId = purchaseId`
- `referenceType = 'PURCHASE'`

---

## 4. Modul Inventory

**Schema:** `inventory.stock_movements`, `inventory.stock_snapshots`, `inventory.stock_adjustments`, `inventory.stock_adjustment_items`

Modul ini ngelacak **pergerakan stok**.

> **Tidak ada "tabel stok" eksplisit.** Stok dihitung dari `SUM(quantity)` semua movements. Snapshot mempercepat query kalau movements sudah jutaan row.

---

### 4.1 Stock Movements

`inventory.stock_movements`

Setiap pergerakan stok — masuk maupun keluar — jadi satu record di sini.

**Type yang tersedia:**

| Type | Arah | Trigger | Contoh |
|---|---|---|---|
| `PURCHASE` | +(masuk) | Purchase status → `RECEIVED` | Terima 400 pcs Indomie dari supplier |
| `SALE` | -(keluar) | Transaksi penjualan dibuat | Jual 5 pcs ke customer |
| `ADJUSTMENT_IN` | +(masuk) | Stock adjustment `CONFIRMED`, difference > 0 | Opname: fisik lebih banyak dari sistem |
| `ADJUSTMENT_OUT` | -(keluar) | Stock adjustment `CONFIRMED`, difference < 0 | Barang expired/rusak/hilang |
| `RETURN_SUPPLIER` | -(keluar) | Manual — retur ke supplier | Kirim balik 2 dus yang cacat |
| `RETURN_CUSTOMER` | +(masuk) | Manual — retur dari customer | Customer kembalikan barang |
| `OPENING_BALANCE` | +(masuk) | Setup awal sistem | Input stok awal waktu pertama kali install app |

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `productId` | text | Produk yang stoknya bergerak | `"01HVXXX...-xyz9876543"` |
| `transactionId` | text (nullable) | FK ke `sales.transactions.transactionNumber` — **hanya diisi untuk `SALE` dan `RETURN_CUSTOMER`** | `"TRX-20260616-001"` |
| `type` | enum | Jenis pergerakan stok | `"PURCHASE"` |
| `quantity` | integer | Jumlah yang bergerak — **selalu dalam base unit** — positif = masuk, negatif = keluar | `+400` atau `-5` |
| `referenceId` | text (nullable) | ID dokumen sumber movement ini | `"01HVXXX...-pqr0000001"` (purchase id) |
| `referenceType` | enum (nullable) | Tipe dokumen sumber | `"PURCHASE"` |
| `notes` | text (nullable) | Catatan tambahan | `"Opname Juni 2026"` |
| `createdAt` | timestamp | Waktu movement ini terjadi, auto-diisi DB | `2026-06-05T14:00:00Z` |

**Cara hitung stok saat ini:**

```sql
SELECT SUM(quantity)
FROM inventory.stock_movements
WHERE product_id = :productId
```

---

### 4.2 Stock Snapshots

`inventory.stock_snapshots`

Snapshot stok pada waktu tertentu. Dibuat oleh **cron job** (biasanya jalan malam hari).

Tujuannya: kalau `stock_movements` sudah jutaan row, query `SUM(quantity)` makin lambat. Snapshot mempercepat query — cukup baca snapshot terakhir + movements setelahnya.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `productId` | text | Produk yang di-snapshot | `"01HVXXX...-xyz9876543"` |
| `quantity` | integer | Total stok dalam base unit saat snapshot dibuat | `395` |
| `calculatedAt` | timestamp | Kapan snapshot ini dihitung | `2026-06-16T00:00:00Z` |

Cara baca stok pakai snapshot:

```sql
-- 1. Ambil snapshot terakhir
SELECT quantity, calculated_at FROM inventory.stock_snapshots
WHERE product_id = :productId
ORDER BY calculated_at DESC
LIMIT 1;

-- 2. Tambah movements setelah snapshot itu
SELECT SUM(quantity) FROM inventory.stock_movements
WHERE product_id = :productId
  AND created_at > :lastSnapshotAt;

-- 3. Hasil = snapshot.quantity + SUM(movements after snapshot)
```

---

### 4.3 Stock Adjustments (Dokumen Opname / Koreksi)

`inventory.stock_adjustments`

Dokumen penyesuaian stok. Dipakai untuk **opname fisik** atau koreksi karena barang rusak / hilang / expired.

**Status flow:**

```
DRAFT → CONFIRMED → (selesai, stock_movements terbuat)
         ↓
      CANCELLED
```

| Status | Artinya | Efek ke stok |
|---|---|---|
| `DRAFT` | Sedang diisi / disiapkan | Tidak ada |
| `CONFIRMED` | Dikonfirmasi | **Trigger `stock_movements`** per item |
| `CANCELLED` | Dibatalkan | Tidak ada |

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `referenceNumber` | text | Nomor dokumen adjustment, **unique** — dibuat sendiri oleh sistem kita | `"ADJ-2026-06-001"` |
| `reason` | enum | Alasan penyesuaian | `"OPNAME"` |
| `status` | enum | Status dokumen | `"CONFIRMED"` |
| `notes` | text (nullable) | Catatan tambahan | `"Opname bulanan Juni 2026"` |
| `confirmedAt` | timestamp (nullable) | Kapan dikonfirmasi — `null` sampai status → `CONFIRMED` | `2026-06-30T17:00:00Z` |
| `createdAt` | timestamp | Auto-diisi DB | `2026-06-30T09:00:00Z` |
| `updatedAt` | timestamp | Auto-diisi DB | `2026-06-30T17:00:00Z` |

**Reason yang tersedia:**

| Reason | Kapan dipakai |
|---|---|
| `OPNAME` | Penyesuaian berdasarkan hitung fisik (stock opname) |
| `DAMAGED` | Barang rusak dan harus dikeluarkan dari stok |
| `EXPIRED` | Barang expired / kedaluwarsa |
| `LOST` | Barang hilang |
| `OTHER` | Alasan lain yang tidak masuk kategori di atas |

---

### 4.4 Stock Adjustment Items

`inventory.stock_adjustment_items`

Detail per produk dalam satu dokumen adjustment.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `adjustmentId` | text | FK ke `stock_adjustments.id` | `"01HVXXX...-adj0000001"` |
| `productId` | text | Produk yang disesuaikan | `"01HVXXX...-xyz9876543"` |
| `systemQuantity` | integer | Stok menurut sistem (base unit) saat opname dilakukan | `400` |
| `physicalQuantity` | integer | Stok aktual yang dihitung secara fisik (base unit) | `393` |
| `difference` | integer | `physicalQuantity - systemQuantity` — **negatif = kurang dari sistem, positif = lebih dari sistem** | `-7` |
| `notes` | text (nullable) | Keterangan per item | `"7 pcs ditemukan expired"` |

**Ketika adjustment `CONFIRMED`**, service buat `stock_movements` per item:
- `difference > 0` → `type = 'ADJUSTMENT_IN'`, `quantity = +difference`
- `difference < 0` → `type = 'ADJUSTMENT_OUT'`, `quantity = difference` (negatif)
- `difference = 0` → tidak ada movement (tidak perlu insert)

---

## 5. Modul Sales

**Schema:** `sales.transactions`, `sales.transaction_items`, `sales.payment_methods`, `sales.transaction_payments`

Modul ini ngelacak **penjualan dan pembayaran**.

---

### 5.1 Transactions

`sales.transactions`

Satu record = satu transaksi penjualan (atau retur).

> **⚠️ Perubahan schema (v2):** Field `id` (ULID+nanoid) dihapus. `transactionNumber` sekarang menjadi **primary key**. Detail di bagian [ID Strategy](#id-strategy).

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `transactionNumber` | text | **Primary key** — nomor transaksi, human-readable, di-generate app layer | `"TRX-20260616-001"` |
| `type` | text | Jenis transaksi | `"SALE"` atau `"RETURN"` |
| `totalAmount` | integer | Total nilai transaksi (rupiah) | `17500` |
| `totalItems` | integer | Jumlah **jenis** item dalam transaksi — denormalized biar ga perlu COUNT | `1` |
| `notes` | text (nullable) | Catatan kasir | `"Pelanggan minta plastik tebal"` |
| `createdAt` | timestamp | Waktu transaksi, auto-diisi DB | `2026-06-16T10:30:00Z` |

---

**`transactionNumber` vs `id` — apa bedanya?**

Sebelumnya schema punya dua field: `id` (ULID+nanoid sebagai PK) dan `transactionNumber` (unique text). Ini membingungkan karena keduanya identifier tapi dipakai di konteks berbeda.

| | `id` (sudah dihapus di v2) | `transactionNumber` (sekarang PK) |
|---|---|---|
| Format | `01HVXXX...-abc1234567` — opaque, tidak bermakna | `TRX-20260616-001` — human-readable |
| Visible ke user? | Tidak — hanya di kode/DB | Ya — ditampilkan di struk, UI, laporan |
| Dibuat kapan | Di app sebelum request ke server (offline-first p
| Tujuan desain awal | Mendukung offline: ID bisa dibuat meski belum ada koneksi | Nomor transaksi yang bisa dibaca manusia |

Karena app ini **tidak membutuhkan offline support**, mempertahankan dua identifier sekaligus adalah overhead yang tidak perlu. Sekarang cukup `transactionNumber` saja — sudah unique, sudah bermakna, dan cukup sebagai PK.

**Format `transactionNumber`:** `TRX-YYYYMMDD-NNN`
- `TRX` = prefix tetap
- `YYYYMMDD` = tanggal transaksi
- `NNN` = urutan per hari (001, 002, dst)
- Di-generate di **application layer** saat buat transaksi

> **Untuk transaksi tipe `RETURN`:** Tambahkan field `referenceTransactionNumber text references transactions.transactionNumber` kalau perlu fitur retur dengan link ke transaksi asal.

---

### 5.2 Transaction Items

`sales.transaction_items`

Detail produk yang dijual dalam satu transaksi.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `transactionId` | text | FK ke `transactions.transactionNumber` | `"TRX-20260616-001"` |
| `productId` | text | FK ke `products.id` — produk yang dijual | `"01HVXXX...-xyz9876543"` |
| `unitName` | text | **Snapshot** nama satuan yang dijual | `"pcs"` |
| `quantity` | integer | Jumlah yang dijual | `5` |
| `unitPrice` | integer | **Snapshot** harga jual per unit saat transaksi (rupiah) | `3500` |
| `unitCost` | integer | **Snapshot** harga beli per unit saat transaksi (rupiah) | `2500` |
| `subtotal` | integer | `quantity × unitPrice` (rupiah) | `17500` |

> **Kenapa `unitPrice` dan `unitCost` disimpan (snapshot)?** Supaya margin per transaksi bisa dihitung akurat meskipun harga produk sudah berubah. Tanpa ini, kalau `products.sellingPrice` naik bulan depan, semua transaksi lama seolah-olah ikut naik juga — data historis jadi tidak valid.

> **Sumber `unitPrice`:** Cek `product_unit_prices.sellingPrice` untuk satuan yang dijual. Kalau tidak ada entry di sana (misal satuan base unit), fallback ke `products.sellingPrice`. Diambil saat transaksi dibuat, lalu disimpan sebagai snapshot di sini.

Setelah item dibuat, service buat `stock_movements`:
- `type = 'SALE'`, `quantity = -(quantity)` (negatif — stok berkurang)
- `transactionId = transactionNumber`

---

### 5.3 Payment Methods

`sales.payment_methods`

Master data metode pembayaran.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `name` | text | Nama untuk tampilan UI | `"Transfer BCA"` |
| `code` | text | Kode unik, dipakai di kode program, **unique** | `"TRF-BCA"` |
| `isActive` | boolean | `false` = metode pembayaran dinonaktifkan | `true` |
| `createdAt` | timestamp | Auto-diisi DB | `2026-06-01T08:00:00Z` |

Contoh isian awal:
- Cash → `CASH`
- QRIS → `QRIS`
- Transfer BCA → `TRF-BCA`

---

### 5.4 Transaction Payments

`sales.transaction_payments`

Satu transaksi bisa bayar pakai **beberapa metode** (split payment).

Contoh: Total 100.000 → Cash 40.000 + QRIS 60.000 = **2 record** di sini.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `transactionId` | text | FK ke `transactions.transactionNumber` | `"TRX-20260616-001"` |
| `paymentMethodId` | text | FK ke `payment_methods.id` | `"01HVXXX...-pay0000001"` |
| `amount` | integer | Jumlah yang dibayar dengan metode ini (rupiah) | `40000` |
| `referenceNumber` | text (nullable) | Nomor referensi bukti bayar (opsional) | `"TF20260616001"` (nomor bukti transfer) |
| `createdAt` | timestamp | Auto-diisi DB | `2026-06-16T10:35:00Z` |

Validasi di application layer: `SUM(amount) WHERE transactionId = x` harus sama dengan `transactions.totalAmount`.

---

## 6. Modul Analytics

**Schema:** `analytics.sales_daily_summary`

---

### 6.1 Sales Daily Summary

`analytics.sales_daily_summary`

Pre-aggregate harian untuk performa sales per produk.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `productId` | text | FK ke produk | `"01HVXXX...-xyz9876543"` |
| `totalQtySold` | integer | Total kuantitas terjual hari itu (dalam base unit) | `5` |
| `totalRevenue` | integer | Total pendapatan dari produk ini hari itu (rupiah) | `17500` |
| `totalCost` | integer | Total HPP dari produk ini hari itu (rupiah) | `12500` |
| `createdAt` | timestamp | Tanggal summary — satu record per produk per hari | `2026-06-16T00:00:00Z` |

**Gross margin** bisa dihitung langsung: `totalRevenue - totalCost`.

Di-generate oleh **cron job harian** — idealnya tengah malam atau early morning, mengambil data dari `transaction_items` hari itu.

Query yang didukung oleh index yang ada:
- Produk terlaris → sort by `totalQtySold`
- Revenue terbesar → sort by `totalRevenue`
- Performa harian / mingguan / bulanan → filter by `createdAt`
- Kombinasi revenue + tanggal → composite index

> **Tabel ini read-only analytics.** Jangan pernah di-update manual — selalu di-regenerate ulang oleh cron. Kalau ada koreksi, koreksi di sumber (transaction_items) dan re-generate summary-nya.

---

## 7. Modul System (Audit)

**Schema:** `system.audit_logs`

---

### 7.1 Audit Logs

`system.audit_logs`

Setiap perubahan data penting (create, update, delete) dicatat di sini.

| Field | Tipe | Keterangan | Contoh |
|---|---|---|---|
| `id` | text (ULID+nanoid) | Primary key | `"01HVXXX...-abc1234567"` |
| `action` | text | Jenis aksi yang dilakukan | `"UPDATE"` |
| `entity` | text | Nama table / entity yang berubah | `"products"` |
| `entityId` | text | ID atau identifier record yang berubah | `"01HVXXX...-xyz9876543"` |
| `oldValue` | jsonb (nullable) | Nilai field-field **sebelum** perubahan — hanya field yang berubah, bukan seluruh row | `{"sellingPrice": 3500}` |
| `newValue` | jsonb (nullable) | Nilai field-field **sesudah** perubahan | `{"sellingPrice": 4000}` |
| `createdAt` | timestamp | Waktu perubahan terjadi | `2026-06-16T09:00:00Z` |

Contoh: Admin ubah harga jual Indomie dari 3.500 → 4.000:

```json
{
  "action": "UPDATE",
  "entity": "products",
  "entityId": "01HVXXX...-xyz9876543",
  "oldValue": { "sellingPrice": 3500 },
  "newValue": { "sellingPrice": 4000 }
}
```

Ga perlu log seluruh row — cukup **field yang berubah** saja di `oldValue` / `newValue`. Ini menghemat storage dan lebih mudah di-read.

---

## 8. Relasi Antar Modul

```
catalog.categories
        │ (FK via name)
        ▼
catalog.products ──────────────────────────────────────────────────────┐
        │ (id)                                                          │
        ├──► catalog.product_units ─────────────────────────────────►  │
        │         │ (id)                                     (productId + unitId)
        │         └──► catalog.product_unit_prices                      │
        │                                                               │
        │    procurement.suppliers                                      │
        │           │ (code)                                            │
        │           ▼                                                   │
        │    procurement.purchases                                      │
        │           │ (id)                                              │
        │           ▼                                                   │
        └──► procurement.purchase_items                                 │
                    │                                                   │
                    ▼ (saat RECEIVED)                                   │
             inventory.stock_movements ◄───────────────────────────────┤
                    ▲                               sales.transaction_items (saat SALE)
                    │                                                   │
             inventory.stock_adjustments (via stock_adjustment_items)   │
                                                   sales.transactions (transactionNumber = PK)
                                                               │
                                                               ▼
                                               sales.transaction_payments
                                                               │
                                                               ▼
                                               sales.payment_methods

analytics.sales_daily_summary  ←  (aggregate dari transaction_items, oleh cron)

system.audit_logs  ←  (dari semua modul, tiap ada perubahan penting)
```

---

## 9. Alur Lengkap — Contoh Kasus

### Kasus: Beli 10 dus Indomie, jual 5 biji, bayar tunai

---

#### Step 1 — Setup Produk (sekali setup, ga perlu ulang)

```
1. Buat kategori "Makanan" → catalog.categories

2. Buat produk "Indomie Goreng":
   - SKU: IDM001
   - Barcode: 8998866xxxxxx
   - baseUnit: pcs
   - costPrice: 2500      ← harga beli per pcs (base unit)
   - sellingPrice: 3500   ← harga jual per pcs (base unit)
   - categoryName: "Makanan"
   → catalog.products

3. Buat satuan:
   - pcs (conversionFactor: 1, isBaseUnit: true)
   - pack (conversionFactor: 10)
   - dus (conversionFactor: 40)
   → catalog.product_units

4. Buat harga jual per satuan non-base (opsional):
   - pack → 32000
   - dus → 120000
   → catalog.product_unit_prices
```

---

#### Step 2 — Daftarkan Supplier (sekali setup)

```
Nama: PT Indofood Sukses Makmur
Code: SUP-INDOFOOD
→ procurement.suppliers
```

---

#### Step 3 — Buat Purchase Order

```
1. Buat purchase:
   - supplierCode: "SUP-INDOFOOD"
   - referenceNumber: "INV/2026/06/001"  ← nomor faktur dari supplier
   - status: DRAFT
   → procurement.purchases

2. Tambah item:
   - productId: [id Indomie]
   - unitName: "dus"
   - conversionFactor: 40
   - quantity: 10
   - quantityInBase: 400   ← 10 × 40
   - unitCost: 90000       ← harga per dus dari supplier
   - subtotal: 900000      ← 10 × 90000
   → procurement.purchase_items

3. Update purchase.totalCost = 900000
4. Update status → CONFIRMED (sudah order ke supplier)
```

---

#### Step 4 — Barang Datang

```
1. Update purchase.status → RECEIVED
2. Update purchase.receivedAt → now()
3. Otomatis buat stock_movements:
   - productId: [id Indomie]
   - type: PURCHASE
   - quantity: +400        ← dari quantityInBase
   - referenceId: [id purchase]
   - referenceType: PURCHASE
   → inventory.stock_movements

Stok Indomie sekarang: 400 pcs
```

---

#### Step 5 — Transaksi Penjualan

> ⚠️ **Schema v2:** `transactionNumber` sekarang primary key — tidak ada field `id` di tabel `transactions`. Semua FK dari `transaction_items`, `transaction_payments`, dan `stock_movements` mengarah ke `transactionNumber`.

```
1. Generate transactionNumber: "TRX-20260616-001"

2. Buat transaksi:
   - transactionNumber: "TRX-20260616-001"   ← ini primary key sekarang
   - type: "SALE"
   - totalAmount: 17500    ← 5 × 3500
   - totalItems: 1
   → sales.transactions

3. Buat item:
   - transactionId: "TRX-20260616-001"       ← FK ke transactionNumber
   - productId: [id Indomie]
   - unitName: "pcs"
   - quantity: 5
   - unitPrice: 3500       ← snapshot dari products.sellingPrice (base unit)
   - unitCost: 2500        ← snapshot dari products.costPrice
   - subtotal: 17500
   → sales.transaction_items

4. Buat stock movement:
   - productId: [id Indomie]
   - type: SALE
   - quantity: -5          ← negatif
   - transactionId: "TRX-20260616-001"
   → inventory.stock_movements

Stok Indomie sekarang: 395 pcs
```

---

#### Step 6 — Pembayaran

```
1. Pastikan payment method "Cash" sudah ada
   - code: CASH
   → sales.payment_methods

2. Catat pembayaran:
   - transactionId: "TRX-20260616-001"
   - paymentMethodId: [id Cash]
   - amount: 17500
   → sales.transaction_payments

Validasi: SUM(payments) == transactions.totalAmount ✅
```

---

#### Step 7 — Cron Job Malam

```
1. Hitung analytics harian per produk:
   - totalQtySold: 5
   - totalRevenue: 17500
   - totalCost: 12500      ← 5 × unitCost dari transaction_items
   → analytics.sales_daily_summary

2. Buat snapshot stok:
   - productId: [id Indomie]
   - quantity: 395
   → inventory.stock_snapshots
```

---

#### Step 8 — Opname Bulanan (bonus contoh)

```
1. Buat adjustment:
   - referenceNumber: "ADJ-2026-06-001"
   - reason: OPNAME
   - status: DRAFT
   → inventory.stock_adjustments

2. Hitung fisik Indomie: ternyata hanya 388 pcs (sistem bilang 395)
   - systemQuantity: 395
   - physicalQuantity: 388
   - difference: -7         ← 388 - 395
   - notes: "7 pcs ditemukan expired"
   → inventory.stock_adjustment_items

3. Konfirmasi:
   - Update status → CONFIRMED
   - Update confirmedAt → now()
   - Buat stock_movement:
     - type: ADJUSTMENT_OUT
     - quantity: -7
     - referenceId: [id adjustment]
     - referenceType: ADJUSTMENT
   → inventory.stock_movements

Stok Indomie sekarang: 388 pcs
```

---

#### Audit: Admin Ubah Harga Jual

```
Sebelum: sellingPrice = 3500
Sesudah: sellingPrice = 4000

Insert ke system.audit_logs:
{
  action: "UPDATE",
  entity: "products",
  entityId: "01HVXXX...-xyz9876543",
  oldValue: { sellingPrice: 3500 },
  newValue: { sellingPrice: 4000 }
}
```

---

## Catatan Tambahan

### ID Strategy

Sebagian besar tabel pakai kombinasi `ULID + nanoid(10)` sebagai ID, di-generate di **server/application layer**:

```ts
const id = () => `${ulid()}-${nanoid(10)}`
```

ULID itu time-ordered (sortable by time), jadi query by `created_at` lebih efisien karena ID-nya sendiri sudah urut waktu. Nanoid 10 karakter ditambahkan sebagai extra collision avoidance.

**Exception:**
- `catalog.categories` → `serial` (integer autoincrement DB) — master data statis, jumlahnya sedikit
- `sales.transactions` → `transactionNumber` sebagai PK (format `TRX-YYYYMMDD-NNN`), di-generate app layer

**Perubahan dari v1 → v2 (transactions):**

Sebelumnya `sales.transactions` punya dua field:
- `id` (ULID+nanoid) sebagai primary key
- `transactionNumber` sebagai unique field

Desain itu dibuat untuk mendukung offline-first: ID bisa di-generate di sisi app sebelum ada koneksi ke server. Karena app ini tidak butuh offline support, `id` dihapus dan `transactionNumber` dijadikan satu-satunya primary key. Lebih simpel, tidak ada duplikasi identifier.

---

### Soft Delete

Semua entity yang punya `isActive` menggunakan **soft delete** — ga dihapus fisik, cuma di-flag. Ini penting karena:

- Produk yang sudah pernah di-transaksikan ga boleh dihapus (FK constraint)
- Data historis harus tetap valid
- Audit trail lebih mudah

---

### Denormalized Fields

Beberapa field sengaja disimpan redundant (denormalized):

| Field | Di mana | Kenapa |
|---|---|---|
| `unitName` | `transaction_items`, `purchase_items` | Snapshot — valid meski satuan di-edit / dihapus |
| `conversionFactor` | `purchase_items` | Snapshot — untuk kalkulasi `quantityInBase` |
| `unitPrice` | `transaction_items` | Snapshot harga jual saat transaksi |
| `unitCost` | `transaction_items`, `purchase_items` | Snapshot harga beli (untuk margin kalkulasi) |
| `quantityInBase` | `purchase_items` | Denormalized — biar service ga perlu hitung ulang saat RECEIVED |
| `difference` | `stock_adjustment_items` | Denormalized — `physicalQty - systemQty`, langsung dipakai saat CONFIRMED |
| `totalItems` | `transactions` | Denormalized — biar dashboard ga perlu COUNT(*) join |
| `totalCost` | `purchases` | Denormalized — di-sync dari service layer tiap purchase_items berubah |

Trade-off: storage lebih besar, tapi query lebih cepat dan historical data lebih aman.
