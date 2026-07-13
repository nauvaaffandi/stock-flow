# AGENTS.md — Stock Flow Backend

> Dokumen ini adalah context & instruction guide untuk coding agent (Claude Code, dsb) yang mengerjakan **backend** Stock Flow (`stock-flow-be`). Isi dokumen ini diekstrak langsung dari codebase yang ada (`src/`, `package.json`, `tsconfig.json`, `eslint.config.mjs`, `drizzle.config.ts`, `docs/bisnis-flow.md`) — bukan asumsi umum NestJS. Kalau ada bagian di sini yang bentrok dengan kode aktual (misalnya karena kode sudah berubah), **kode adalah source of truth**, bukan dokumen ini.

---

## 1. Tujuan & Gambaran Umum

Stock Flow backend adalah **mini-ERP / POS backend** untuk manajemen stok dan penjualan toko/warung. Domain bisnisnya:

- **Catalog** — produk, kategori, satuan produk (unit), dan harga per satuan.
- **Procurement** — supplier dan proses pembelian barang (purchase order → confirm → receive).
- **Inventory** — pergerakan stok (stock movement), didorong oleh event dari Procurement.
- **Sales** — transaksi penjualan dan item transaksi.
- **Analytics** — ringkasan penjualan harian (saat ini baru schema, belum ada handler/repository — lihat §3).
- **System** — audit log (saat ini baru schema, belum ada handler/repository — lihat §3).

Alur bisnis high-level:

```
Supplier → Purchase (Procurement) → Stock bertambah (Inventory, via event)
                                              ↓
                        Stock berkurang ← Transaction (Sales)
```

> **Catatan penting soal `docs/bisnis-flow.md`:** dokumen itu mendeskripsikan desain schema yang **berbeda** dari implementasi saat ini (mis. dia bilang `products.id` pakai ULID/text dan FK `categoryName`, padahal schema Drizzle aktual pakai `bigserial` integer dan FK `categoryId`). Jangan jadikan `bisnis-flow.md` sebagai acuan struktur data — jadikan `src/modules/*/infrastructure/drizzle/schema.ts` sebagai satu-satunya source of truth untuk schema. `bisnis-flow.md` masih valid untuk memahami *alur bisnis* dan *relasi antar modul* secara konsep.

---

## 2. Tech Stack

Diambil langsung dari `package.json`:

| Kategori | Tool | Catatan |
|---|---|---|
| Runtime | Node.js (dijalankan lewat **Bun** sebagai script runner) | Semua script (`build`, `start`, `start:dev`, `format`) di-prefix `bunx` |
| Framework | NestJS 11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) | Express sebagai HTTP adapter |
| Package manager | Bun (`bunx nest ...`) dipakai untuk run CLI, tapi dependency tetap di `package.json` standar npm |
| CQRS | `@nestjs/cqrs` | Wajib dipakai untuk semua write (command) & read (query) di layer `features/` |
| Database | PostgreSQL (`pg`) | Koneksi lewat `pg.Pool` |
| ORM | Drizzle ORM (`drizzle-orm`, `drizzle-kit`) | Schema-per-module, multi `pgSchema` |
| Validation | Zod v4 | Body validation via custom `ZodValidationPipe`, **bukan** `class-validator` |
| API docs | `@nestjs/swagger` | Semua controller pakai decorator Swagger manual (bukan auto-generate dari DTO saja) |
| Logging | Winston + `nest-winston` + `winston-daily-rotate-file` | Custom `LoggerService` di `src/infrastructure/logging` |
| Realtime | `@nestjs/websockets` + `socket.io` | Dipakai untuk barcode scanner gateway & logging gateway |
| Testing | Jest + `@nestjs/testing` (ts-jest) | Unit test co-located di `handlers/__test__/*.spec.ts` |
| Lint/format | ESLint 9 (flat config) + Prettier | Prettier: tab, single quote, no semicolon (lihat §14) |
| Custom tooling | `@stock-flow/nest-schematics` (local package via `file:../tools/nest-schematics`) | Nest CLI collection kustom — dipakai `nest generate` (lihat §18) |
| Utilitas lain | `nanoid`, `ulid`, `uuid`, `dayjs`, `camelcase-keys`, `snakecase-keys` | Lihat §15 untuk kegunaan spesifik |

Path alias (dari `tsconfig.json`):

```jsonc
"paths": {
  "@/*": ["src/*"],
  "@shared/*": ["src/shared/*"],
  "@core/*": ["src/core/*"],
  "@modules/*": ["src/modules/*"],
  "@logger/*": ["src/infrastructure/logging/*"]
}
```

**Penting:** alias ini dipakai **tidak konsisten**. Sebagian besar kode pakai relative import (`../../../domain/...`), hanya `@core/identifier` dan `@logger/logger.service` yang konsisten pakai alias. Untuk kode baru, **lebih disarankan pakai alias** (`@core`, `@modules`, `@shared`, `@logger`) karena lebih tahan terhadap perpindahan folder — tapi jangan refactor besar-besaran import lama hanya demi konsistensi kecuali diminta eksplisit.

---

## 3. Arsitektur Backend & Alasan Pembagian Layer

Backend ini pakai **modular layered architecture per bounded-context**, dikombinasikan dengan **CQRS** di level fitur. Setiap module (`catalog`, `procurement`, `inventory`, `sales`, `system`, `analytics`) adalah bounded context yang punya 4 layer:

```
modules/<module>/
├── domain/            ← kontrak murni: types, abstract repository, abstract service, exception, event, spesifikasi bisnis
├── application/        ← implementasi service (business logic lintas-repository yang dipakai module lain)
├── infrastructure/     ← implementasi teknis: Drizzle schema + Drizzle repository
├── features/           ← use-case per resource, isinya command/query/handler/controller/dto/validation (CQRS)
├── <module>.module.ts  ← NestJS module: wiring DI
└── index.ts             ← public API module (lihat §17)
```

Alasan pembagian ini:
- **`domain/`** tidak boleh bergantung ke framework/infra (Drizzle, Express) — isinya `abstract class` (bukan `interface` polos, karena NestJS DI butuh token runtime — lihat §11) dan plain types. Ini yang membuat business rule bisa di-test tanpa DB nyata (lihat `handlers/__test__/*.spec.ts` yang mock repository lewat DI token `abstract class`).
- **`application/`** berisi service yang mengorkestrasi domain, dipakai **lintas module** (di-export lewat `index.ts` module dan diimport module lain — contoh: `ProductService`, `PurchaseItemsService`). Ini beda dengan `features/handlers`, yang isinya orkestrasi khusus 1 use-case dan **tidak** diexport ke module lain.
- **`infrastructure/`** adalah satu-satunya tempat yang boleh import Drizzle langsung.
- **`features/`** adalah tempat CQRS command/query + presentation layer (controller, DTO, validation) hidup, dikelompokkan **per resource/use-case**, bukan per teknis (tidak ada folder `controllers/` global per module).

> Tidak semua module punya keempat layer ini secara penuh. `system` dan `analytics` saat ini **cuma punya `infrastructure/drizzle/schema.ts`** — module-nya kosong (`@Module({})`), belum ada domain/application/features. Kalau task-nya membangun fitur di `system` atau `analytics`, ikuti pola lengkap `catalog`/`procurement` sebagai referensi, jangan bikin pola baru.

---

## 4. Struktur Directory & Tanggung Jawab

```
src/
├── app.controller.ts / app.module.ts / app.service.ts / main.ts
├── core/
│   └── identifier/            # generator & parser public-facing ID (mis. "PRD-286")
├── infrastructure/            # infra lintas-module (bukan spesifik 1 bounded context)
│   ├── cqrs/cqrs.module.ts    # wrapper @Global untuk CqrsModule bawaan Nest
│   ├── drizzle/                # koneksi DB + Database type + index publik
│   └── logging/                 # LoggerService, event log, gateway realtime log
├── shared/                     # cross-cutting concern generik, TIDAK spesifik business domain
│   ├── decorators/             # decorator custom (termasuk swagger response reusable)
│   ├── filters/                 # ExceptionFilter — generik & per-domain-exception
│   ├── interceptors/            # snake_case response, access logging
│   ├── libs/                    # helper murni (day-utils, random)
│   ├── middleware/               # request-id, request-timing, camelCase body
│   └── pipes/                    # ZodValidationPipe
├── types/                       # TypeScript utility types & global augmentation (express.d.ts)
├── views/                        # Pug templates (dashboard log viewer, bukan bagian dari REST API)
└── modules/
    ├── catalog/
    ├── procurement/
    ├── inventory/
    ├── sales/
    ├── system/
    └── analytics/
```

Aturan penting:
- **`shared/`** vs **`modules/<x>/domain/`**: `shared/` isinya generik lintas-domain (pipe validasi, filter HTTP generik). Filter/exception/decorator yang **spesifik 1 resource bisnis** (mis. `ProductNotFoundException`) tetap didefinisikan di `domain/exceptions/` module masing-masing, tapi filter HTTP-nya (yang meng-`@Catch()` exception itu dan translate ke response) diletakkan di `shared/filters/<resource>/`. Lihat §15.
- **`infrastructure/` (root) vs `modules/<x>/infrastructure/`**: root `infrastructure/` isinya infra generik lintas-module (koneksi DB, CQRS wrapper, logger). `modules/<x>/infrastructure/` isinya implementasi teknis khusus module itu (Drizzle schema + repository).

---

## 5. Struktur Module & Pola Organisasi

Contoh nyata — `modules/catalog/`:

```
catalog/
├── catalog.module.ts
├── index.ts
├── domain/
│   ├── types/               # product.type.ts, category.type.ts, dst — satu file per resource
│   ├── repositories/         # abstract class *.repository.ts — kontrak akses data
│   ├── interfaces/            # abstract class *-service.abstract.ts — kontrak service lintas-module
│   ├── exceptions/<resource>/ # *.exception.ts, dikelompokkan per resource (products/, categories/, dst)
│   └── events/                 # *-created.event.ts — domain event
├── application/
│   └── services/               # *-impl.service.ts — implementasi dari domain/interfaces
├── infrastructure/
│   └── drizzle/
│       ├── schema.ts            # SEMUA tabel module ini dalam 1 file
│       └── repositories/         # *-repository.drizzle.ts — implementasi dari domain/repositories
└── features/
    ├── products/
    ├── categories/
    ├── product-units/
    └── product-unit-prices/
```

Setiap folder di `features/<resource>/` mengikuti pola yang sama (lihat §7).

---

## 6. Pola Domain / Application / Infrastructure / Features

| Layer | Isi | Boleh depend ke | Contoh nyata |
|---|---|---|---|
| `domain` | `abstract class` repository & service, plain `interface`/`type`, `Error`-based exception, event class | Tidak boleh depend ke layer lain dalam module (hanya ke `types/` internal & module lain via `index.ts` publiknya) | `domain/repositories/products.repository.ts` |
| `application` | `@Injectable()` service yang `implements` abstract class dari `domain/interfaces` | `domain/` (repository abstract, types) | `application/services/product-service.impl.ts` |
| `infrastructure` | `@Injectable()` repository yang `implements` abstract class dari `domain/repositories`, pakai Drizzle langsung | `domain/` (types, abstract repo) + `infrastructure/drizzle` root (`ConnectionService`, `Database`) | `infrastructure/drizzle/repositories/products-repository.drizzle.ts` |
| `features` | Command/Query (`@nestjs/cqrs`), Handler (`@CommandHandler`/`@QueryHandler`/`@EventsHandler`), Controller, DTO, Zod validation | `domain/` (repository abstract, exception, types) langsung; boleh juga depend ke `application/services` abstract (jarang) | `features/products/handlers/create-product.handler.ts` |

Catatan penting: **Handler CQRS depend langsung ke `domain/repositories` (abstract class), bukan ke `application/services`.** `application/services` dipakai kalau ada logika yang perlu **diakses module lain** (cross-module read), contoh: `PurchaseItemsService` dipakai oleh `InventoryModule` untuk baca item purchase tanpa Inventory tahu detail Drizzle Procurement.

---

## 7. Pola Feature (per Resource / Use Case)

Feature dikelompokkan per **resource** (`products`, `categories`, `purchases`, `transactions`, dst), bukan per teknis. Struktur baku 1 feature (referensi: `modules/catalog/features/products/`):

```
features/products/
├── commands/
│   └── create-product.command.ts
├── queries/
│   └── get-products.query.ts
├── handlers/
│   ├── create-product.handler.ts
│   ├── get-products.handler.ts
│   └── __test__/
│       └── create-product.spec.ts
└── presentation/
    ├── controllers/
    │   ├── products-main.controller.ts       # write endpoint (POST)
    │   └── products-details.controller.ts    # read endpoint (GET, list/detail)
    ├── dto/
    │   └── create-product.dto.ts
    └── validation/
        └── create-product.zod.validation.ts
```

Pola pemisahan controller: kalau resource punya operasi create **dan** read, umumnya dipisah jadi 2 controller: `*-main.controller.ts` (create/mutasi utama) dan `*-details.controller.ts` (get/list). Untuk resource dengan operasi aksi status (purchases: confirm/receive), ada controller tambahan `*-action.controller.ts`. Kalau resource cuma punya 1 operasi (create saja), cukup 1 controller `*-main.controller.ts` — tidak perlu dipaksa dipecah.

---

## 8. Konvensi CQRS

Semua write & read operation di `features/` **wajib** lewat `@nestjs/cqrs` (`CommandBus`/`QueryBus`), tidak boleh controller manggil repository/service langsung.

**Command** — extends `Command<TResult>` dari `@nestjs/cqrs`, generic-nya adalah return type handler:

```ts
// commands/create-product.command.ts
export class CreateProductCommand extends Command<ProductContract> {
  constructor(public readonly dto: CreateProductDto) {
    super()
  }
}
```

**Query** — sama, extends `Query<TResult>`:

```ts
// queries/get-products.query.ts
export class GetProductsQuery extends Query<{ data: ProductContract[]; pagination: any }> {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    // ...field lain, urut sesuai parameter controller
  ) { super() }
}
```

**Command Handler** — `@CommandHandler(XxxCommand)`, `implements ICommandHandler<XxxCommand>`, inject repository abstract via constructor:

```ts
@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly categoriesRepo: CategoriesRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<ProductContract> {
    // 1. validasi existensi relasi (mis. category harus ada)
    // 2. validasi uniqueness / business rule → throw domain exception
    // 3. panggil repository.create()
    // 4. mapping id internal (number) → public ID string via Identifier.create()
    // 5. return contract (bukan entity internal)
  }
}
```

**Query Handler** — `@QueryHandler(XxxQuery)`, `implements IQueryHandler<XxxQuery>`, pola sama tapi tanpa mutasi, sering ada logic pagination di return.

**Event** — plain class (kebanyakan **tidak** `implements IEvent` secara eksplisit meski ada 1 contoh yang eksplisit — lihat catatan konsistensi di §20), dipublish manual dari controller **setelah** `commandBus.execute()`, bukan dari dalam handler:

```ts
// controller
const result = await this.commandBus.execute<ProductContract>(new CreateProductCommand(dto))
this.eventBus.publish(new ProductCreatedEvent(result))
return { success: true, data: result }
```

Event handler cross-module (`@EventsHandler`) diletakkan di module **consumer**, bukan di module publisher. Contoh: `CreateStockMovementFromPurchaseEvent` didefinisikan di `inventory/domain/events/`, dipublish dari `procurement`'s `PurchasesActionController` (setelah command `ReceivePurchaseOrderCommand`), dan di-handle oleh `inventory/features/stock-movements/handlers/create-stock-movement-from-purchase-event.handler.ts`. Import event lintas-module lewat `index.ts` module (`from '../../../../inventory'`), bukan path internal.

---

## 9. Controller, DTO, Validation, Service, Repository, Interface, Type, Schema

### Controller
- Prefix route selalu nama module (`@Controller('catalog')`, `@Controller('procurement')`), bukan nama resource.
- Selalu inject `CommandBus`/`QueryBus`/`EventBus` dari `@nestjs/cqrs`, tidak pernah inject repository/service langsung ke controller.
- Body validation lewat `@Body(new ZodValidationPipe(XxxZodValidation)) dto: XxxDto` — pipe di-instantiate manual per-parameter (bukan global pipe), karena tiap endpoint punya schema Zod berbeda.
- Query param pakai `@Query('name') val: Type = default` dengan default value eksplisit di signature (bukan `@Query() dto: SomeDto`).
- Error mapping per exception domain lewat `@UseFilters(XxxErrorFilter, YyyErrorFilter)` di level method (bukan global, kecuali filter generik di `app.module.ts`).
- Swagger decorator ditulis manual & lengkap: `@Swagger.ApiTags`, `@Swagger.ApiCreatedResponse`/`ApiResponse` dengan `example` konkret, plus decorator custom reusable (`SwaggerInternalError()`, `SwaggerZodValidationResponse()`, `Swagger<Resource><Case>.single()`) untuk response yang berulang antar endpoint.
- Response envelope selalu `{ success: boolean, data?: ..., pagination?: ..., errors?: ... }` — lihat §15.

### DTO
- Class biasa (bukan pakai `class-validator` decorator), field-nya diketik pakai **domain type**, bukan `string`/`number` polos:
  ```ts
  export class CreateProductDto {
    @Swagger.ApiProperty({ required: true, example: 'dev/es kul kul' })
    name: ProductName        // bukan `name: string`
  }
  ```
- DTO hanya untuk Swagger metadata + shape TypeScript. **Validasi runtime aslinya dari Zod schema terpisah**, bukan dari DTO.

### Validation (Zod)
- File terpisah dari DTO, suffix wajib **`*.zod.validation.ts`**, export const `PascalCase` diakhiri `ZodValidation`:
  ```ts
  // presentation/validation/create-product.zod.validation.ts
  export const CreateProductZodValidation = z.object({
    categoryId: z.string(),
    name: z.string(),
    sku: z.string(),
    barcode: z.string(),
    baseUnit: z.string(),
    costPrice: z.number(),
    sellingPrice: z.number(),
  })
  ```
- Shape Zod schema harus align dengan DTO (field yang sama), tapi **tidak** ada mekanisme otomatis yang menjamin sinkron — kalau ubah satu, ubah juga yang lain secara manual.

### Service (`application/services`)
- Hanya dibuat kalau logika perlu **dipakai lintas module** lewat DI abstraksi (bukan sekadar "logic transaksional 1 use-case" — itu tugas handler).
- Selalu `implements` abstract class dari `domain/interfaces/*.abstract.ts`.
- Konstruktor inject repository abstract, bukan repository Drizzle konkret.

### Repository (abstract & implementasi)
- Abstract class di `domain/repositories/*.repository.ts`, method signature pakai domain types (`Product`, `ProductId`, `CreateProduct`, dst), **bukan** tipe Drizzle langsung.
- Implementasi di `infrastructure/drizzle/repositories/*-repository.drizzle.ts`, `implements` abstract-nya, inject `ConnectionService` lalu simpan `this.db = connection.client`.
- Setiap method `select(...)` selalu eksplisit sebut kolom (`.select({ id: products.id, name: products.name, ... })`) — **tidak pernah** `select *` / `db.query.products.findMany()` tanpa kolom eksplisit.

### Interface / Abstract Class
- Semua kontrak yang dipakai untuk NestJS DI **harus** `abstract class`, bukan `interface` TypeScript biasa — karena `interface` hilang saat compile ke JS dan tidak bisa dipakai sebagai DI token. `interface` polos (`IPurchaseSpecification`) hanya dipakai untuk kontrak internal non-DI (mis. domain specification pattern).

### Type
- 1 file per resource di `domain/types/<resource>.type.ts`.
- Pola baku:
  ```ts
  export interface Product { id: number; categoryId?: number | null; name: string; /* ... */ }
  export type ProductId = Product['id']
  export type ProductName = Product['name']
  export type CreateProduct = Pick<Product, 'categoryId' | 'name' | /* ... */>
  export type ProductContract = Replace<Product, { id: string; categoryId: string | null }>
  ```
  - `Product` (interface) = shape internal, `id` masih `number` (sesuai DB).
  - `Create<Resource>` = `Pick<>` dari field yang dibutuhkan saat insert.
  - `<Resource>Contract` = shape yang **keluar ke API**, pakai `Replace<>` (utility type di `types/utilities/replace.ts`) untuk ubah `id`/FK dari `number` jadi `string` (public identifier ber-prefix, lihat §12).
  - Field individual diexport sebagai type alias (`ProductName = Product['name']`) supaya DTO & command bisa reference field spesifik tanpa import seluruh interface.

### Schema Database (Drizzle)
- 1 file `schema.ts` per module di `infrastructure/drizzle/schema.ts`, isi semua tabel module tsb.
- Tiap module punya `pgSchema('<module_name>')` sendiri (Postgres schema terpisah): `catalog`, `procurement`, `inventory`, `sales`, `system`, `analytics`.
- PK selalu `bigserial('id', { mode: 'number' })` — **auto-increment dari DB**, bukan digenerate di app (ID publik ber-prefix digenerate di layer `Identifier`, lihat §12).
- FK antar tabel dalam module sama pakai `bigint(..., { mode: 'number' }).references(() => otherTable.id)`.
- Index: selalu definisikan `uniqueIndex`/`index` eksplisit untuk kolom yang dipakai `WHERE`/`ORDER BY`/`unique` di repository — bukan mengandalkan default index PK saja.
- Konvensi kolom: `isActive` (soft-delete flag, default `true`), `createdAt`/`updatedAt` (`timestamp({ withTimezone: true }).notNull().defaultNow()`).

---

## 10. Dependency Flow & Aturan Import Antar-Layer

Arah dependency yang benar (dalam 1 module):

```
features/ ──depends on──> domain/  <──implements── application/
   │                         ^                          
   │                         |                          
   └──depends on (jarang)────┘                          
infrastructure/ ──implements──> domain/ (repositories, types)
```

- `domain/` **tidak boleh** import dari `application/`, `infrastructure/`, atau `features/`.
- `application/` boleh import `domain/`, **tidak boleh** import `infrastructure/` (dapat repository lewat DI token abstract, bukan import class Drizzle langsung) atau `features/`.
- `infrastructure/` boleh import `domain/` (untuk implement abstract class & pakai types) dan `infrastructure/drizzle` root (untuk `ConnectionService`/`Database`).
- `features/` boleh import `domain/` module sendiri secara langsung (relative import), dan module lain **hanya lewat `index.ts` publiknya** (`@modules/<other>` atau `'../../../../<other>'` yang resolve ke `index.ts`).

**Aturan cross-module — WAJIB lewat `index.ts`:**

ESLint sudah menegakkan sebagian aturan ini lewat `no-restricted-imports` di `eslint.config.mjs`:

```js
'no-restricted-imports': ['error', {
  patterns: [{
    group: [
      '@/modules/*/domain/*',
      '@/modules/*/services/*',
      '@/modules/*/controller/*',
      '@/infrastructure/*/repository/*',
      '@/infrastructure/*/services/*',
    ],
    message: 'Gunakan public API module (index.ts)'
  }]
}]
```

> Catatan: rule ini pakai pattern `@/modules/*` (alias root), sedangkan import module lain di kode aktual banyak yang pakai **relative path** (`'../../../../inventory'`) — ESLint `no-restricted-imports` **tidak menangkap relative import**, hanya path yang literally match pattern alias di atas. Jadi proteksi ini saat ini **tidak sepenuhnya efektif** untuk semua kasus. Meski begitu, agent tetap **wajib** mengikuti niat aturan ini: import module lain hanya lewat `index.ts`-nya, apapun bentuk path-nya (alias atau relative).

`eslint-plugin-boundaries` ada di `dependencies` (`package.json`) tapi **belum dikonfigurasi** di `eslint.config.mjs` — jangan asumsikan ada enforcement layer-boundary otomatis di luar `no-restricted-imports` di atas. Kalau task melibatkan setup boundaries plugin, itu pekerjaan baru, bukan pola existing yang tinggal diikuti.

---

## 11. Dependency Injection & Provider Registration

Pola standar di `<module>.module.ts`: setiap abstract class (repository/service) di-bind ke implementasi konkretnya lewat `provide`/`useClass`, **dan** implementasi konkretnya didaftarkan lagi sebagai provider biasa (supaya bisa di-`export`/dipakai module lain kalau perlu):

```ts
@Module({
  imports: [DrizzleModule],
  providers: [
    { provide: ProductsRepository, useClass: ProductsRepositoryDrizzle },
    { provide: ProductService, useClass: ProductServiceImpl },

    ProductsRepositoryDrizzle,   // registrasi kelas konkret juga
    CreateProductHandler,        // command handler didaftarkan langsung (bukan lewat token)
    GetProductsHandler,
  ],
  controllers: [ProductsMainController, ProductsDetailsController],
  exports: [ProductService],     // hanya service yang dipakai cross-module yang diexport
})
export class CatalogModule {}
```

Aturan:
- Handler CQRS (`@CommandHandler`/`@QueryHandler`/`@EventsHandler`) **selalu** didaftarkan langsung di `providers` (tidak lewat token `provide`/`useClass`) karena `@nestjs/cqrs` yang menangani registrasi ke bus lewat decorator.
- Repository & service abstrak **selalu** pakai pola `{ provide: AbstractClass, useClass: ConcreteImpl }`.
- Yang di-`exports` dari module hanya **service** yang memang dipakai module lain (lihat `ProcurementModule` yang export `PurchaseItemsService` supaya dipakai `InventoryModule`). Repository **tidak pernah** diexport ke module lain — akses cross-module ke data harus lewat service abstraction, bukan repository langsung.
- Module lain yang butuh provider dari module tsb, `import` module-nya di `imports: []` (mis. `InventoryModule` import `ProcurementModule`, `ProcurementModule` import `CatalogModule`).
- `DrizzleModule` diimport di **setiap** module yang punya repository Drizzle sendiri (bukan cukup sekali di `AppModule`), karena provider Nest per-module scoped kecuali `@Global()`.
- Module infra yang dipakai lintas semua module (`CqrsModule`, `LoggingModule`) di-decorate `@Global()` supaya tidak perlu diimport berulang.

---

## 12. Pola Drizzle Repository & Database Access

Struktur repository Drizzle konsisten:

```ts
@Injectable()
export class ProductsRepositoryDrizzle implements ProductsRepository {
  private readonly db: Database

  constructor(private readonly connection: ConnectionService) {
    this.db = connection.client
  }

  async findById(id: ProductId): Promise<Product | undefined> {
    const result = await this.db
      .select({ id: products.id, name: products.name, /* kolom eksplisit */ })
      .from(products)
      .where(eq(products.id, id))
      .limit(1)

    return result[0]
  }
  // ...
}
```

Konvensi query:
- Filter dinamis (search, pagination, sort) dibangun dengan array `SQL[]` lalu `and(...conditions)`, contoh di `getProducts()`:
  ```ts
  const conditions: SQL[] = []
  if (input.ids) conditions.push(inArray(products.id, input.ids))
  if (input.search) conditions.push(ilike(products.name, `%${input.search}%`))
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  ```
- Pagination selalu manual: `offset = (page - 1) * limit`, lalu `.limit(limit).offset(offset)`.
- Sorting dinamis lewat `asc(table[column])`/`desc(table[column])` dengan default kolom (`?? 'name'`).
- `create()` pakai `.insert(table).values(input).onConflictDoNothing({ target: table.uniqueColumn }).returning({...})`.
- **Semua kolom yang dikembalikan disebut eksplisit** di `.select({...})`/`.returning({...})` — tidak pernah select semua kolom secara implisit.

### Public Identifier (`@core/identifier`)

Ini pola paling penting yang dipakai **di setiap handler**: PK database adalah `number` (`bigserial`), tapi yang keluar/masuk lewat API adalah string ber-prefix, mis. `"PRD-286"`, `"CAT-23"`.

```ts
// src/core/identifier/prefix.ts
export class IdentifierPrefix {
  static readonly CATEGORY = 'CAT'
  static readonly PRODUCT = 'PRD'
  static readonly PRODUCT_UNIT = 'PRDU'
  static readonly PRODUCT_UNIT_PRICE = 'PRDUP'
  static readonly SUPPLIER = 'SUP'
  static readonly PURCHASE = 'PUR'
  static readonly PURCHASE_ITEM = 'PURI'
  static readonly TRANSACTION = 'TRX'
  static readonly PAYMENT = 'PAY'
  static readonly STOCK_MOVEMENT = 'STM'
}
```

```ts
import { Identifier, IdentifierPrefix } from '@core/identifier'

// dari API → internal number, dipanggil di AWAL handler sebelum query DB
const categoryId = Identifier.parse(dto.categoryId).id   // "CAT-23" → 23

// dari internal number → public string, dipanggil SEBELUM return dari handler
Identifier.create(IdentifierPrefix.PRODUCT, result.id)   // 286 → "PRD-286"
```

Aturan wajib:
- **Setiap** ID yang datang dari request (path param, query param, body field FK) harus di-`Identifier.parse(...).id` **sebelum** dipakai query ke repository.
- **Setiap** ID (dan FK) yang keluar dari handler ke controller/response harus di-`Identifier.create(prefix, id)` dengan prefix yang **benar sesuai resource-nya** (lihat §19 anti-pattern — ada bug nyata di kode yang salah pasang prefix).
- Repository selalu bekerja dengan `number` mentah, tidak pernah tahu soal prefix — prefix hanya urusan boundary handler/controller.

---

## 13. Pola Zod Validation

- File: `presentation/validation/<action>-<resource>.zod.validation.ts` (contoh: `create-product.zod.validation.ts`, `create-purchase.zod.validation.ts`).
- Export: `export const <Action><Resource>ZodValidation = z.object({...})` — PascalCase, diakhiri literal `ZodValidation`.
- Dipakai lewat `ZodValidationPipe` (`src/shared/pipes/zod-validation.pipe.ts`) yang generic terhadap `ZodSchema` apapun:
  ```ts
  @Body(new ZodValidationPipe(CreateProductZodValidation)) dto: CreateProductDto
  ```
- Error dari `schema.safeParse()` yang gagal di-`throw` sebagai `ZodError` mentah (bukan di-wrap), lalu ditangkap `ZodErrorFilter` (`@Catch(ZodError)`) di level global (`app.module.ts` → `APP_FILTER`) yang mengubahnya jadi response `400` standar (lihat §15).
- Field di Zod schema **harus sinkron manual** dengan field di DTO — tidak ada generator otomatis dari satu ke yang lain.

---

## 14. Naming Convention

| Elemen | Pola | Contoh |
|---|---|---|
| File umum | `kebab-case.suffix.ts` | `create-product.handler.ts` |
| Command | `<Verb><Resource>Command`, file `<verb>-<resource>.command.ts` | `CreateProductCommand` |
| Query | `<Verb><Resource>Query`, file `<verb>-<resource>.query.ts` | `GetProductsQuery`, `ListCategoriesQuery` |
| Command/Query Handler | `<Verb><Resource>Handler`, file `<verb>-<resource>.handler.ts` | `CreateProductHandler` |
| Event Handler | `<EventName>Handler` (nama event tanpa "Event", + "Handler"), file `<event-name>-event.handler.ts` | `CreateStockMovementFromPurchaseEventHandler` |
| Event | `<Resource><PastTenseVerb>Event`, file `<resource>-<past-verb>.event.ts` | `ProductCreatedEvent`, `SupplierCreatedEvent` |
| DTO | `<Verb><Resource>Dto`, file `<verb>-<resource>.dto.ts` | `CreateProductDto` |
| Controller | `<Resource><Role>Controller` (`Role`: `Main`/`Details`/`Action`), file `<resource>-<role>.controller.ts` | `ProductsMainController`, `PurchasesActionController` |
| Repository (abstract) | `<Resource>Repository` (extends `abstract class`), file `<resource>.repository.ts` | `ProductsRepository` |
| Repository (Drizzle) | `<Resource>RepositoryDrizzle`, file `<resource>-repository.drizzle.ts` | `ProductsRepositoryDrizzle` |
| Service (abstract) | `<Resource>Service` (`abstract class`), file `<resource>-service.abstract.ts` | `ProductService` |
| Service (impl) | `<Resource>ServiceImpl`, file `<resource>-service.impl.ts` | `ProductServiceImpl` |
| Exception | `<Resource><Reason>Exception`, file `<resource>-<reason>.exception.ts` di `domain/exceptions/<resource>/` | `ProductNotFoundException` |
| Error Filter (HTTP) | `<Resource><Reason>ErrorFilter`, file `<resource>-<reason>.filter.ts` di `shared/filters/<resource>/` | `ProductNotFoundErrorFilter` |
| Zod validation | `<Verb><Resource>ZodValidation`, file **`<verb>-<resource>.zod.validation.ts`** (suffix `.zod.validation.ts` wajib) | `CreateProductZodValidation` |
| Domain Type | `interface <Resource>`, alias `<Resource><Field>`, file `<resource>.type.ts` | `Product`, `ProductId`, `ProductContract` |
| Swagger decorator custom | `Swagger<ResponseCase>` (class dgn static method) atau `Swagger<Description>()` (function), file `swagger-<description>.decorator.ts` | `SwaggerProductNotFound`, `SwaggerInternalError()` |
| Test | co-located di `handlers/__test__/<handler-name-tanpa-suffix>.spec.ts` | `handlers/__test__/create-product.spec.ts` |

Style formatting (dari `.prettierrc`): **tab indentation** (bukan spasi — meski beberapa file baru pakai 4-spasi campur tab, ikuti file terdekat), **single quote**, **tanpa semicolon**, `trailingComma: all`.

---

## 15. Error Handling, Logging, Response, Exception

### Response envelope
Semua response API — sukses maupun gagal — pakai bentuk konsisten:

```jsonc
// Sukses
{ "success": true, "data": {...} }
{ "success": true, "data": [...], "pagination": {...} }

// Gagal
{ "success": false, "errors": { "code": "...", "message": "..." } }
```

Response body **otomatis** di-snake_case-kan oleh `SnakeCaseInterceptor` (global, `APP_INTERCEPTOR`) — handler/controller selalu kerja dengan camelCase, tidak perlu manual convert.

### Exception 3-lapis
1. **Domain exception** (`domain/exceptions/<resource>/*.exception.ts`) — `extends Error` (bukan `extends HttpException`), simpan data minimal, expose method `ApiResponse()` (instance) dan `static response(...)` (untuk dipakai di Swagger example):
   ```ts
   export class ProductNotFoundException extends Error {
     public static readonly code = 'PRODUCT_NOT_FOUND'
     public static readonly summary = 'Product not found'
     ApiResponse() { return { code: ..., message: ... } }
     static response(id) { return { code: ..., message: ... } }
   }
   ```
2. **Error Filter per-exception** (`shared/filters/<resource>/*.filter.ts`) — `@Catch(SpecificException)`, translate ke HTTP status yang sesuai + `exception.ApiResponse()`. **Didaftarkan per-endpoint** lewat `@UseFilters(...)` di controller method, bukan global.
3. **Filter generik** (didaftarkan global di `app.module.ts` via `APP_FILTER`, urutan penting — Nest coba filter yang lebih spesifik dulu):
   - `ZodErrorFilter` — `@Catch(ZodError)` → HTTP 400, format `{ code: 'VALIDATION_ERROR', fields, form }` dari `err.flatten()`.
   - `HttpErrorFilter` — `@Catch(HttpException)` → pakai `err.getStatus()`/`err.getResponse()` apa adanya (dipakai untuk `ConflictException`, `NotFoundException` bawaan Nest yang dilempar langsung dari handler, bukan lewat domain exception).
   - `GlobalErrorFilter` — `@Catch()` (tangkap semua sisanya) → selalu HTTP 500, log detail error (termasuk field khusus Postgres: `code`, `detail`, `hint`, `constraint`, dst) lewat `LoggerService`, response ke client selalu digeneralisir jadi `{ code: 'SERVER_ERROR', message: 'Internal Server Error' }` (tidak bocorkan detail internal).

Untuk business rule error yang **bukan** "resource not found/already exists" sederhana (mis. multi-field conflict validation), handler boleh langsung `throw new ConflictException({ code: '...', fields: {...}, message: [...] })` dari `@nestjs/common` — ini akan ditangkap `HttpErrorFilter`, tidak perlu bikin domain exception + filter baru untuk kasus ad-hoc seperti ini.

### Logging
- `LoggerService` (`src/infrastructure/logging/logger.service.ts`) adalah **satu-satunya** cara logging — jangan pakai `console.log` di kode baru (kecuali di gateway WebSocket yang memang sudah pakai `console.log`, itu inkonsistensi lama, jangan ditiru).
- Method tersedia: `.info()`, `.warn()`, `.error()`, `.debug()`, `.http()`, `.verbose()`, `.silly()`, `.access()` — semua terima `Payload` object (`message`, `context`, `requestId`, `http`, `metadata`, `service`, optional `trace`).
- Setiap `write()` log otomatis publish `LogCreatedEvent` lewat `EventBus`, yang di-handle `LogCreatedHandler` untuk broadcast ke `LoggingGateway` (WebSocket, dipakai dashboard log viewer di `views/logging/layout.pug`).
- `AccessLoggingInterceptor` (global) otomatis log semua HTTP request/response — endpoint yang tidak mau di-log pakai decorator `@SkipAccessLog()`.
- `req.system.startTime` (diisi `RequestTimingMiddleware`) dipakai untuk hitung durasi request — field ini di-augment lewat `src/types/express.d.ts`.

---

## 16. Pola Testing

- Test co-located di `features/<resource>/handlers/__test__/<handler>.spec.ts`, hanya untuk **command/query handler** (tidak ada test untuk controller, repository, atau filter saat ini).
- Pakai `@nestjs/testing` `Test.createTestingModule({ providers: [...] }).compile()`, mock repository dengan `{ provide: XxxRepository, useValue: mockObject }` — inject lewat abstract class token, bukan implementasi konkret.
- Struktur `describe(HandlerName) > it('should ...')`, mock dibuat manual dengan `jest.fn()` di `beforeEach`.
- **Peringatan:** test yang ada saat ini (`create-product.spec.ts`, `create-category.spec.ts`, dst) **tidak selalu sinkron dengan handler aktual** — contoh: `create-product.spec.ts` masih mock `categoriesRepoMock.findByName` dan pakai field `categoryName`, padahal handler aktual (`create-product.handler.ts`) sudah pakai `categoriesRepo.findById` dan field `categoryId`. Jangan jadikan spec file sebagai referensi kontrak API yang benar — cek handler-nya langsung. Kalau agent mengubah handler, **update juga spec-nya** supaya tidak makin divergen.
- Jalankan test: `bun run test` (Jest, root `src/`, match `*.spec.ts`), `bun run test:watch`, `bun run test:cov`, `bun run test:e2e` (config terpisah `test/jest-e2e.json` — belum ada file e2e di codebase saat ini).

---

## 17. Konvensi Module Registration & Public Exports (`index.ts`)

Setiap module (kecuali `system`, `analytics` yang masih kosong) punya `index.ts` di root-nya sebagai **satu-satunya public API** yang boleh diimport module lain:

```ts
// modules/catalog/index.ts
export type { Product, ProductId, CreateProduct, ProductContract } from './domain/types/product.type'
export { ProductService } from './domain/interfaces/product-service.abstract'
export { ProductsRepository } from './domain/repositories/products.repository'
export { ProductNotFoundException } from './domain/exceptions/products/product-not-found.exception'
export { ProductCreatedEvent } from './domain/events/product-created.event'
```

Yang **boleh** diexport lewat `index.ts`:
- Domain types & contracts (`export type {...}`)
- Abstract service (untuk DI cross-module)
- Abstract repository (jarang dipakai cross-module langsung, tapi ada preseden)
- Domain exception (dipakai `shared/filters` untuk `@Catch()`)
- Domain event (dipakai module consumer untuk `@EventsHandler`)

Yang **tidak pernah** diexport: implementasi Drizzle repository, service impl konkret, handler, controller, DTO, Zod validation — semua itu detail internal module.

Registrasi module ke `AppModule` (`src/app.module.ts`): tambahkan ke `imports: []`. Urutan tidak signifikan secara fungsional tapi ikuti urutan yang sudah ada (module baru ditambah di akhir list sebelum module yang depend padanya, karena Nest resolve dependency graph otomatis — tapi tetap jaga urutan yang masuk akal untuk keterbacaan).

---

## 18. Command Development

```bash
# Package manager & script runner: Bun
bun install                     # install dependency

# Development
bunx nest start --watch         # = bun run start:dev
bunx nest start --debug --watch # = bun run start:debug

# Build & production
bunx nest build                 # = bun run build
node dist/main                  # = bun run start:prod

# Lint & format
bun run lint                    # eslint --fix di src/apps/libs/test
bun run format                  # prettier --write src/**/*.ts test/**/*.ts

# Testing
bun run test
bun run test:watch
bun run test:cov
bun run test:e2e                # config: test/jest-e2e.json

# Database (Drizzle)
bun run db:generate             # generate migration dari schema.ts semua module → .drizzle/
bun run db:migrate              # jalankan migration
bun run db:push                 # push schema langsung (dev only)
bun run db:studio               # buka Drizzle Studio

# Dependency graph visual
bun run graph-import            # madge → internal/graph.svg & .png

# Nest CLI dengan schematics kustom
bunx nest generate <schematic> <name>   # pakai collection @stock-flow/nest-schematics
                                          # (lihat nest-cli.json: "collection": "@stock-flow/nest-schematics")
```

**Catatan schematics kustom:** `nest-cli.json` mengarah ke `@stock-flow/nest-schematics` (package lokal dari `../tools/nest-schematics`, di-pack via `bun run i:nest-schematics`) yang meng-extend schematics bawaan NestJS, sehingga generator standar NestJS tetap tersedia dan project dapat menambahkan atau mengustomisasi schematic tertentu. Source code schematic berada di `../tools/nest-schematics`; jika agent membutuhkan detail perilakunya, periksa implementasinya secara langsung dan jangan diasumsikan. `nest-cli.json` juga menetapkan `generateOptions: { spec: false, flat: true }`, sehingga generator secara default tidak membuat file spec dan tidak membuat subfolder tambahan.

============================================================

## Custom Zod Schematic

The project uses a custom NestJS schematic for generating Zod validation files.

### Usage

```bash
nest g zod <path>/<name>
```

The final path segment is used as the file name, while the preceding segments define the target directory.

### Example

```bash
nest g zod modules/catalog/features/products/presentation/validation/CreateProduct.zod.validation
```

Generated file:

```js
//src/modules/catalog/features/products/presentation/validation/create-product.zod.validation.ts

import { z } from 'zod'

export const CreateProductZodValidation = z
```

The custom `zod` schematic has fixed `flat` behavior. The generated file is placed directly in the specified directory without creating an additional nested folder.

**Do not manually provide or override the `--flat` option.**

============================================================



`drizzle.config.ts` men-scan schema dari:
```ts
schema: [
  './src/modules/*/infrastructure/drizzle/schema.ts',
  './src/infrastructure/drizzle/schema.ts',
]
```
Jadi module baru **otomatis** ke-include migration selama filenya persis di path `infrastructure/drizzle/schema.ts`.

---

## 19. Aturan Membuat File/Feature Baru

Ikuti urutan ini saat menambah **resource baru** di module yang sudah ada (contoh: menambah resource `payments` di `sales`):

1. **Domain dulu**: `domain/types/payments.type.ts` (interface + alias types + `Create<X>` + `<X>Contract` pakai `Replace<>`), `domain/repositories/payments.repository.ts` (`abstract class`), exception yang relevan di `domain/exceptions/payments/`.
2. **Infrastructure**: tambah tabel di `infrastructure/drizzle/schema.ts` module tsb (jangan bikin file schema baru), lalu `infrastructure/drizzle/repositories/payments-repository.drizzle.ts` implementasi dari abstract repository.
3. **Features**: bikin folder `features/payments/` dengan `commands/`, `handlers/`, `presentation/{controllers,dto,validation}/` mengikuti struktur §7. Command/query handler depend ke `domain/repositories` langsung.
4. **Module registration**: daftarkan repository (`provide`/`useClass`), repository konkret, handler, dan controller di `<module>.module.ts`. Tambahkan `IdentifierPrefix` baru di `src/core/identifier/prefix.ts` kalau resource ini butuh public ID sendiri.
5. **Public export**: kalau ada type/exception/event yang perlu diakses module lain, export lewat `index.ts` module.
6. **Test**: minimal 1 spec file di `handlers/__test__/` untuk command handler yang punya business rule (skip kalau handler cuma passthrough tanpa validasi).
7. Jalankan `bun run db:generate` kalau ada perubahan schema, dan `bun run lint` sebelum selesai.

Untuk **module baru** (bounded context baru), buat sesuai struktur §4–§5 dari nol, register `pgSchema` baru di `schema.ts`, dan tambahkan ke `imports` di `app.module.ts`.

---

## 20. Pola Implementasi yang Harus Ditiru

Gunakan file-file ini sebagai referensi utama karena paling konsisten dan lengkap:

- **CQRS command + handler + controller end-to-end**: `modules/catalog/features/products/` (create) dan `modules/procurement/features/purchases/` (multi-step: create → confirm → receive, contoh command chaining & cross-module event).
- **Query + pagination pattern**: `modules/catalog/features/products/queries/get-products.query.ts` + `handlers/get-products.handler.ts`.
- **Drizzle repository dengan filter dinamis**: `modules/catalog/infrastructure/drizzle/repositories/products-repository.drizzle.ts` (method `getProducts`).
- **Domain exception + filter pairing**: `product-not-found.exception.ts` + `shared/filters/products/product-not-found-error.filter.ts`.
- **Cross-module service abstraction**: `procurement`'s `PurchaseItemsService` (abstract di `domain/interfaces/`, impl di `application/services/`, dipakai `InventoryModule`).
- **Cross-module event handling**: `CreateStockMovementFromPurchaseEvent` (didefinisikan di consumer module `inventory`, dipublish dari `procurement`).
- **Specification pattern untuk business rule status**: `procurement/domain/specification/purchase.specification.ts` — dipakai kalau ada logika "apakah status X boleh transisi ke Y" yang dipakai lebih dari 1 handler.

---

## 21. Anti-Pattern & Hal yang Harus Dihindari

Beberapa hal berikut ada di kode existing tapi **merupakan bug/inkonsistensi, bukan pola yang harus ditiru**. Kalau agent menyentuh file-file ini untuk alasan lain, perbaiki sekalian jika masuk akal — tapi jangan replikasi pola ini ke kode baru:

- **Jangan hardcode public ID.** `procurement/features/purchases/handlers/create-purchase.handler.ts` saat ini melakukan `Identifier.create(IdentifierPrefix.PURCHASE, 827)` dan `Identifier.create(IdentifierPrefix.SUPPLIER, 72736)` — angka hardcoded, seharusnya `result.id` dan `supplierId`. Selalu pakai nilai hasil query/parameter asli.
- **Jangan salah pasang `IdentifierPrefix`.** `sales/features/transactions/handlers/create-transaction.handler.ts` memakai `IdentifierPrefix.CATEGORY` untuk ID transaksi (harusnya `IdentifierPrefix.TRANSACTION`). Selalu double-check prefix sesuai resource yang benar-benar diproses.
- **Jangan panggil function tanpa `()` di template literal.** `todayFormatted` di `shared/libs/day-utils.ts` adalah *function*, tapi beberapa handler (mis. `create-purchase.handler.ts`) memakainya sebagai `` `${todayFormatted}` `` alih-alih `` `${todayFormatted()}` ``. Ini menghasilkan string representasi function, bukan tanggal. Selalu panggil sebagai function.
- **Jangan lupa `implements ICommandHandler<...>`/`IQueryHandler<...>`.** Sebagian besar handler eksplisit `implements`, tapi ada yang tidak (mis. `CreateProductUnitHandler`). Tetap eksplisit — ini membantu type-checking `execute()`.
- **Jangan asumsikan spec file sebagai kontrak yang benar** (lihat §16) — beberapa spec file sudah divergen dari handler aktual.
- **Jangan implementasi `interface` polos untuk sesuatu yang butuh DI token** — harus `abstract class` (lihat §9/Interface).
- **Jangan taruh business logic di controller.** Controller hanya: validasi input (via pipe), panggil `commandBus`/`queryBus`, publish event kalau perlu, bentuk response envelope. Semua business rule (uniqueness check, status transition, kalkulasi total) ada di handler.
- **Jangan query Drizzle tanpa kolom eksplisit** (`select()` kosong / `db.query.x.findMany()`), ikuti pola `select({...})` eksplisit yang konsisten di semua repository existing.
- **Jangan bikin exception filter generik untuk banyak exception.** Pola existing adalah 1 filter = 1 exception spesifik (`@Catch(SpecificException)`), supaya HTTP status & response bisa berbeda per kasus.
- **Jangan jadikan `docs/bisnis-flow.md` sebagai acuan schema** (lihat §1) — dokumen itu belum diupdate sesuai schema Drizzle terbaru.
- **Jangan export implementasi konkret (Drizzle repo, service impl, handler, controller) dari `index.ts` module** — itu melanggar boundary yang dijaga §17.

---

## 22. Agent Instructions

Aturan eksplisit sebelum membuat, mengubah, memindahkan, atau menghapus file di backend ini:

1. **Baca handler/repository/schema yang relevan secara langsung sebelum mengubah apa pun** — jangan andalkan nama file atau dokumentasi ini sebagai pengganti membaca kode. Dokumen ini bisa jadi belum menangkap perubahan terbaru.
2. **Ikuti struktur 4-layer (`domain`/`application`/`infrastructure`/`features`) untuk resource baru** — jangan taruh logika akses DB di luar `infrastructure/drizzle/repositories/`, jangan taruh business rule di controller atau repository.
3. **Selalu tulis command/query + handler untuk operasi baru** — tidak ada jalur "langsung panggil service dari controller" di pola project ini, meski secara teknis NestJS mengizinkan.
4. **Gunakan `Identifier.parse()`/`Identifier.create()` dengan prefix yang benar** untuk setiap ID yang masuk/keluar API boundary. Tambahkan entry baru ke `IdentifierPrefix` (`src/core/identifier/prefix.ts`) untuk resource baru yang butuh public ID.
5. **Jangan mengubah shape response envelope** (`{ success, data, pagination, errors }`) tanpa diminta eksplisit — banyak consumer (frontend, Swagger docs) bergantung pada bentuk ini.
6. **Jangan menambah dependency baru** (npm package) untuk hal yang sudah ada solusinya di codebase (mis. jangan tambah `class-validator` — project sudah pakai Zod; jangan tambah HTTP client lain — sudah ada `@nestjs/axios`) kecuali diminta eksplisit oleh user.
7. **Update `index.ts` module setiap kali menambah type/exception/event/service abstract yang perlu diakses module lain** — jangan biarkan module lain import path internal.
8. **Update provider registration di `<module>.module.ts`** setiap kali menambah repository/service/handler/controller baru — kelas yang tidak didaftarkan akan gagal resolve di runtime.
9. **Jangan menghapus atau memindahkan file `domain/` tanpa memeriksa semua consumer-nya** (repository impl, handler, module lain lewat `index.ts`) — layer ini adalah kontrak yang banyak dipakai.
10. **Kalau ragu antara mengikuti pola existing yang mengandung bug (§21) vs pola "benar" secara umum, ikuti maksud dari pola existing tapi perbaiki bug-nya** — jangan replikasi bug ke tempat baru.
11. **Jalankan `bun run lint` dan (kalau relevan) `bun run test`** setelah perubahan, terutama untuk perubahan di `features/*/handlers/`.
12. **Jangan generate migration (`db:generate`) tanpa perubahan schema yang jelas dan diminta** — migration file di `.drizzle/` bersifat append-only history, hindari membuat migration kosong/tidak perlu.
13. **Kalau task menyentuh `system` atau `analytics`**, sadari bahwa module tsb belum punya implementasi (hanya schema) — bangun struktur lengkap mengikuti §5, jangan asumsikan ada kode existing yang tersembunyi di tempat lain.
14. **Tanyakan ke user hanya kalau requirement bisnis ambigu** (mis. aturan validasi baru yang belum ada presedennya) — untuk pertanyaan "bagaimana pola teknisnya", jawabannya ada di dokumen ini + kode existing, tidak perlu bertanya.
