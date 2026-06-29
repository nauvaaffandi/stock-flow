# Bisnis Flow — Stock & Sales Management App

> Dokumentasi ini ngejelasin gimana alur bisnis berjalan dari level paling atas sampai ke detail tiap modul. Semua referensi ke table mengikuti schema Drizzle terbaru.

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

Alur utamanya simple:

```
Supplier → Barang Masuk → Stok Bertambah
                                ↓
                    Stok Berkurang ← Penjualan → Pembayaran
```

Ga ada payment gateway. Semua pembayaran dicatat manual — entah cash, QRIS, transfer, dll.

---

## 2. Modul Catalog

**Schema:** `catalog.categories`, `catalog.products`, `catalog.product_units`

Modul ini adalah **fondasi**. Semua modul lain ngerujuk ke sini.

---

### 2.1 Kategori

`catalog.categories`

Kategori cuma label pengelompokan produk. Contoh: Makanan, Minuman, ATK.

Field penting:
- `name` — unique, ga boleh duplikat
- `isActive` — kalau `false`, kategori ini disembunyiin dari pilihan

Alur:
1. Admin buat kategori baru
2. Kalau ga relevan lagi, set `isActive = false` (soft delete, bukan hapus)

---

### 2.2 Produk

`catalog.products`

Ini inti dari semua transaksi. Tiap produk punya identitas unik:

| Field | Keterangan |
|---|---|
| `id` | Primary key, ULID + nanoid |
| `sku` | Kode internal, unique |
| `barcode` | Buat scan, unique |
| `name` | Nama produk, unique |
| `baseUnit` | Satuan paling kecil (misal: `pcs`) |
| `costPrice` | Harga beli **saat ini** (current) |
| `sellingPrice` | Harga jual **saat ini** (current) |
| `categoryId` | Relasi ke `categories` |
| `isActive` | Soft delete |

> **Catatan penting:** `costPrice` dan `sellingPrice` di sini adalah harga **terkini**. Harga historis per transaksi disimpan di `transaction_items.unitCost` dan `transaction_items.unitPrice`. Jadi kalau harga produk berubah, data transaksi lama tetap valid.

Alur:
1. Admin buat produk baru, isi semua field
2. Kalau produk discontinue, set `isActive = false`
3. Kalau harga berubah, update `costPrice` / `sellingPrice` — otomatis ke-log di `audit_logs`

---

### 2.3 Satuan Produk

`catalog.product_units`

Satu produk bisa punya **banyak satuan**. Contoh untuk Indomie:

| Satuan | `conversionFactor` | `isBaseUnit` |
|---|---|---|
| pcs | 1 | ✅ |
| pack | 10 | ❌ |
| dus | 40 | ❌ |

`conversionFactor` selalu relatif ke `baseUnit` produk. Jadi kalau beli 1 dus = 40 pcs.

Constraint penting:
- `(productId, name)` adalah **unique composite** — jadi nama satuan boleh sama di produk berbeda (misal `pcs` bisa ada di semua produk), tapi ga boleh duplikat dalam satu produk yang sama
- Tiap produk harusnya punya tepat **1 satuan dengan `isBaseUnit = true`**

Alur:
1. Setelah buat produk, admin define satuan-satuannya
2. Minimal 1 satuan (base unit)
3. Satuan tambahan optional, tergantung kebutuhan penjualan / pembelian

---

## 3. Modul Procurement

**Schema:** `procurement.suppliers`, `procurement.purchases`, `procurement.purchase_items`

Modul ini ngatur **barang masuk dari supplier**. Sebelum ada modul ini, barang masuk langsung jadi `stock_movements` tanpa dokumen — sekarang ada dokumen resminya.

---

### 3.1 Supplier

`procurement.suppliers`

Master data supplier / vendor.

| Field | Keterangan |
|---|---|
| `code` | Kode unik supplier (contoh: `SUP-001`) |
| `name` | Nama perusahaan / toko |
| `phone` | Opsional |
| `address` | Opsional |
| `isActive` | Soft delete |

Alur:
1. Admin daftarin supplier dulu sebelum bisa buat purchase order
2. Kalau supplier ga aktif lagi, set `isActive = false`

---

### 3.2 Purchase (Dokumen Pembelian)

`procurement.purchases`

Ini dokumen pembelian / purchase order ke supplier.

**Status flow:**

```
DRAFT → CONFIRMED → RECEIVED → (selesai)
         ↓
      CANCELLED
```

| Status | Artinya |
|---|---|
| `DRAFT` | Dokumen dibuat, belum dikonfirmasi |
| `CONFIRMED` | Sudah dikonfirmasi, barang belum datang |
| `RECEIVED` | Barang sudah diterima → **trigger stock_movements** |
| `CANCELLED` | Dibatalkan, ga ada pergerakan stok |

Field penting:
- `referenceNumber` — nomor PO atau faktur dari supplier, unique
- `totalCost` — total biaya pembelian, di-sync dari service layer tiap `purchase_items` berubah
- `receivedAt` — null sampai status jadi `RECEIVED`, ini timestamp resmi barang masuk
- `notes` — catatan bebas

> **Penting:** `totalCost` di-maintain di application layer (bukan DB trigger). Tiap ada perubahan di `purchase_items`, service harus recalculate dan update field ini.

---

### 3.3 Purchase Items

`procurement.purchase_items`

Detail produk yang dibeli dalam satu purchase.

| Field | Keterangan |
|---|---|
| `unitName` | Snapshot nama satuan saat beli (misal: `dus`) |
| `conversionFactor` | Snapshot faktor konversi ke base unit |
| `quantity` | Jumlah dalam `unitName` (misal: 10 dus) |
| `quantityInBase` | `quantity × conversionFactor` (misal: 400 pcs) |
| `unitCost` | Harga beli per `unitName` saat itu |
| `subtotal` | `quantity × unitCost` |

> **Kenapa `unitName` dan `conversionFactor` disimpan eksplisit?** Supaya historical record tetap valid meskipun satuan produk di-edit atau dihapus di masa depan.

> **Kenapa ada `quantityInBase`?** Biar waktu status jadi `RECEIVED` dan service mau bikin `stock_movements`, tinggal baca field ini langsung — ga perlu kalkulasi ulang.

Alur ketika status purchase jadi `RECEIVED`:
1. Semua `purchase_items` dibaca
2. Tiap item bikin 1 record di `inventory.stock_movements` dengan:
   - `type = 'PURCHASE'`
   - `quantity = quantityInBase` (positif)
   - `referenceId = purchaseId`
   - `referenceType = 'PURCHASE'`

---

## 4. Modul Inventory

**Schema:** `inventory.stock_movements`, `inventory.stock_snapshots`

Modul ini ngelacak **pergerakan stok**. Ga ada "tabel stok" eksplisit — stok dihitung dari SUM semua movements.

---

### 4.1 Stock Movements

`inventory.stock_movements`

Setiap pergerakan stok — masuk maupun keluar — jadi satu record di sini.

**Type yang tersedia:**

| Type | Arah | Sumber |
|---|---|---|
| `PURCHASE` | + (masuk) | Dari procurement, waktu purchase `RECEIVED` |
| `SALE` | - (keluar) | Dari sales, waktu transaksi selesai |
| `ADJUSTMENT_IN` | + (masuk) | Koreksi manual, opname, dll |
| `ADJUSTMENT_OUT` | - (keluar) | Barang rusak, expired, selisih opname |
| `RETURN_SUPPLIER` | - (keluar) | Retur ke supplier |
| `RETURN_CUSTOMER` | + (masuk) | Barang retur dari customer |

Field penting:
- `quantity` — bisa positif (masuk) atau negatif (keluar) — **selalu dalam base unit**
- `referenceId` + `referenceType` — buat tracing ke dokumen asal (purchase, transaction, adjustment)
- `transactionId` — khusus untuk movement yang berasal dari penjualan, FK ke `sales.transactions`

**Cara hitung stok saat ini:**

```sql
SELECT SUM(quantity)
FROM inventory.stock_movements
WHERE product_id = :productId
```

Kalau sudah ada snapshot, cukup baca dari snapshot terakhir + movements setelah snapshot itu.

---

### 4.2 Stock Snapshots

`inventory.stock_snapshots`

Snapshot stok pada waktu tertentu. Dibuat oleh **cron job** (biasanya jalan malam hari).

Tujuannya: kalau `stock_movements` udah jutaan row, query `SUM(quantity)` makin lama. Snapshot mempercepat query — dashboard cukup baca snapshot terakhir + movements setelahnya.

Field penting:
- `productId` — produk yang di-snapshot
- `quantity` — total stok dalam base unit saat snapshot dibuat
- `calculatedAt` — timestamp snapshot

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

## 5. Modul Sales

**Schema:** `sales.transactions`, `sales.transaction_items`, `sales.payment_methods`, `sales.transaction_payments`

Modul ini ngelacak **penjualan dan pembayaran**.

---

### 5.1 Transactions

`sales.transactions`

Satu record = satu transaksi penjualan (atau retur).

| Field | Keterangan |
|---|---|
| `transactionNumber` | Nomor transaksi unique, contoh: `TRX-20260611-001` |
| `type` | `SALE` atau `RETURN` |
| `totalAmount` | Total nilai transaksi |
| `totalItems` | Jumlah item (buat cepat baca tanpa JOIN) |
| `notes` | Catatan kasir |

Untuk transaksi tipe `RETURN`:
- Perlu ada `referenceTransactionId` yang nunjuk ke transaksi asal (belum ada di schema — bisa ditambah kalau perlu retur)

---

### 5.2 Transaction Items

`sales.transaction_items`

Detail produk yang dijual dalam satu transaksi.

| Field | Keterangan |
|---|---|
| `unitName` | Snapshot nama satuan yang dijual |
| `quantity` | Jumlah yang dijual |
| `unitPrice` | Harga jual per unit **saat transaksi** (snapshot dari `products.sellingPrice`) |
| `unitCost` | Harga beli per unit **saat transaksi** (snapshot dari `products.costPrice`) |
| `subtotal` | `quantity × unitPrice` |

> **Kenapa `unitPrice` dan `unitCost` disimpan di sini?** Supaya margin per transaksi bisa dihitung akurat meskipun harga produk udah berubah. Tanpa ini, kalau harga naik, semua transaksi lama seolah-olah ikut naik juga.

Setelah `transaction_items` dibuat:
- Service bikin `stock_movements` per item dengan `type = 'SALE'` dan `quantity = -jumlah` (negatif)

---

### 5.3 Payment Methods

`sales.payment_methods`

Master data metode pembayaran.

Contoh isian:
- Cash — kode: `CASH`
- QRIS — kode: `QRIS`
- Transfer BCA — kode: `TRF-BCA`

Field `code` adalah unique identifier yang dipakai di kode program. Field `name` untuk tampilan UI.

---

### 5.4 Transaction Payments

`sales.transaction_payments`

Satu transaksi bisa bayar pakai **beberapa metode** (split payment).

Contoh: Total 100.000 → Cash 40.000 + QRIS 60.000 = 2 record di sini.

| Field | Keterangan |
|---|---|
| `transactionId` | FK ke transaksi |
| `paymentMethodId` | FK ke metode pembayaran |
| `amount` | Jumlah yang dibayar dengan metode ini |
| `referenceNumber` | Opsional — nomor referensi (misal nomor bukti transfer) |

Validasi di application layer: `SUM(amount) WHERE transactionId = x` harus sama dengan `transactions.totalAmount`.

---

## 6. Modul Analytics

**Schema:** `analytics.sales_daily_summary`

---

### 6.1 Sales Daily Summary

`analytics.sales_daily_summary`

Pre-aggregate harian untuk performa sales per produk.

| Field | Keterangan |
|---|---|
| `productId` | FK ke produk |
| `totalQtySold` | Total kuantitas terjual hari itu |
| `totalRevenue` | Total pendapatan dari produk ini hari itu |
| `totalCost` | Total HPP dari produk ini hari itu |
| `createdAt` | Tanggal summary (satu record per produk per hari) |

**Gross margin** bisa dihitung langsung: `totalRevenue - totalCost`.

Di-generate oleh **cron job harian** — idealnya tengah malam atau early morning.

Query yang didukung oleh index yang ada:
- Produk terlaris (sort by `totalQtySold`)
- Revenue terbesar (sort by `totalRevenue`)
- Performa harian / mingguan / bulanan (filter by `createdAt`)
- Kombinasi revenue + tanggal (composite index)

> **Catatan:** Tabel ini buat **read-only analytics**. Jangan pernah di-update manual — selalu di-regenerate ulang oleh cron.

---

## 7. Modul System (Audit)

**Schema:** `system.audit_logs`

---

### 7.1 Audit Logs

`system.audit_logs`

Setiap perubahan data penting (create, update, delete) dicatat di sini.

| Field | Keterangan |
|---|---|
| `action` | `CREATE`, `UPDATE`, `DELETE` |
| `entity` | Nama table / entity yang berubah (misal: `products`) |
| `entityId` | ID record yang berubah |
| `oldValue` | Nilai sebelum perubahan (JSON) |
| `newValue` | Nilai setelah perubahan (JSON) |

Contoh: Admin ubah harga jual Indomie dari 3.500 → 4.000:

```json
{
  "action": "UPDATE",
  "entity": "products",
  "entityId": "prod_xxxxx",
  "oldValue": { "sellingPrice": 3500 },
  "newValue": { "sellingPrice": 4000 }
}
```

Ga perlu log semua field — cukup **field yang berubah** saja di `oldValue` / `newValue`.

---

## 8. Relasi Antar Modul

```
catalog.categories
        │
        ▼
catalog.products ──────────────────────────────────────────┐
        │                                                   │
        ├──► catalog.product_units                         │
        │                                                   │
        │    procurement.suppliers                         │
        │           │                                      │
        │           ▼                                      │
        │    procurement.purchases                         │
        │           │                                      │
        │           ▼                                      │
        └──► procurement.purchase_items                    │
                    │                                      │
                    ▼ (saat RECEIVED)                      │
             inventory.stock_movements ◄───────────────────┤
                    │                              sales.transaction_items
                    ▼                                      │
             inventory.stock_snapshots          sales.transactions
                                                           │
                                                           ▼
                                               sales.transaction_payments
                                                           │
                                                           ▼
                                               sales.payment_methods

analytics.sales_daily_summary ← (dari sales.transaction_items, di-aggregate cron)

system.audit_logs ← (dari semua modul, tiap ada perubahan penting)
```

---

## 9. Alur Lengkap — Contoh Kasus

### Kasus: Beli 10 dus Indomie, jual 5 biji, bayar tunai

---

#### Step 1 — Setup Produk (sekali setup, ga perlu ulang)

```
1. Buat kategori "Makanan" → catalog.categories
2. Buat produk "Indomie Goreng"
   - SKU: IDM001
   - Barcode: 8998866xxxxxx
   - baseUnit: pcs
   - costPrice: 2500
   - sellingPrice: 3500
   → catalog.products

3. Buat satuan:
   - pcs (conversionFactor: 1, isBaseUnit: true)
   - pack (conversionFactor: 10)
   - dus (conversionFactor: 40)
   → catalog.product_units
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
   - supplierId: [id PT Indofood]
   - referenceNumber: "INV/2026/06/001"
   - status: DRAFT
   → procurement.purchases

2. Tambah item:
   - productId: [id Indomie]
   - unitName: "dus"
   - conversionFactor: 40
   - quantity: 10
   - quantityInBase: 400   ← 10 × 40
   - unitCost: 90000       ← harga per dus
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

```
1. Buat transaksi:
   - transactionNumber: TRX-20260616-001
   - type: SALE
   - totalAmount: 17500    ← 5 × 3500
   - totalItems: 1
   → sales.transactions

2. Buat item:
   - productId: [id Indomie]
   - unitName: pcs
   - quantity: 5
   - unitPrice: 3500       ← snapshot harga jual saat ini
   - unitCost: 2500        ← snapshot harga beli saat ini
   - subtotal: 17500
   → sales.transaction_items

3. Buat stock movement:
   - productId: [id Indomie]
   - type: SALE
   - quantity: -5          ← negatif
   - transactionId: [id transaksi]
   → inventory.stock_movements

Stok Indomie sekarang: 395 pcs
```

---

#### Step 6 — Pembayaran

```
1. Pastiin payment method "Cash" sudah ada
   - code: CASH
   → sales.payment_methods

2. Catat pembayaran:
   - transactionId: [id transaksi]
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

#### Audit: Admin Ubah Harga Jual

```
Sebelum: sellingPrice = 3500
Sesudah: sellingPrice = 4000

Insert ke system.audit_logs:
{
  action: "UPDATE",
  entity: "products",
  entityId: "...",
  oldValue: { sellingPrice: 3500 },
  newValue: { sellingPrice: 4000 }
}
```

---

## Catatan Tambahan

### ID Strategy

App ini pakai kombinasi `ULID + nanoid(10)` sebagai ID:

```ts
const id = () => `${ulid()}-${nanoid(10)}`
```

ULID itu sortable by time (beda dari UUID v4 yang random), jadi query by `created_at` lebih efficient karena ID-nya sendiri udah time-ordered. Nanoid 10 karakter ditambahkan sebagai extra collision avoidance.

Exception: `catalog.categories` pakai `serial` (integer autoincrement) karena ini master data statis yang jarang banget jadi jutaan row.

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
| `unitName` | `transaction_items`, `purchase_items` | Snapshot — valid meski satuan di-edit |
| `conversionFactor` | `purchase_items` | Snapshot — untuk kalkulasi `quantityInBase` |
| `unitPrice` | `transaction_items` | Snapshot harga jual saat transaksi |
| `unitCost` | `transaction_items` | Snapshot harga beli saat transaksi (untuk margin) |
| `quantityInBase` | `purchase_items` | Denormalized — biar service ga perlu hitung ulang |
| `totalItems` | `transactions` | Denormalized — biar dashboard ga perlu COUNT |
| `totalCost` | `purchases` | Denormalized — di-sync dari service layer |

Trade-off: storage lebih besar, tapi query lebih cepat dan historical data lebih aman.
