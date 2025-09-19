# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用開發指令

### 後端 (Go)
```bash
# 啟動後端 API 伺服器
go run ./cmd/petlog
# 或使用 task runner
task dev:backend

# 執行測試（包含 race condition 檢測）
go test -v -race ./...
# 或使用 task runner
task test

# 產生 Swagger API 文件
task gen:swagger

# 編譯專案
task build
```

### 前端 (Next.js)
```bash
# 進入前端目錄
cd web

# 啟動開發伺服器（使用 Turbopack）
pnpm dev

# 建置生產版本
pnpm build

# 執行 ESLint 檢查
pnpm lint

# 啟動生產伺服器
pnpm start
```

### 全端開發
```bash
# 同時啟動前後端（需要 task）
task dev
```

## 專案架構

### Clean Architecture 分層設計
專案採用嚴格的 Clean Architecture 設計，各層職責明確分離：

- **Domain 層** (`internal/domain/`)：純領域模型與業務規則
  - `model/`：領域實體（僅包含 json tag，不可有資料庫相關標籤）
  - `repository/`：倉儲介面定義
  - `errors.go`：標準錯誤定義

- **Usecase 層** (`internal/usecase/`)：應用業務邏輯
  - `command/`：寫入操作（創建、更新、刪除）
  - `query/`：查詢操作
  - `behavior/`：複雜業務行為

- **Endpoint 層** (`internal/endpoint/`)：Go-kit endpoint
  - 負責 DTO 與領域模型之間的轉換
  - 處理請求驗證

- **Transport 層** (`internal/transport/`)：HTTP 處理
  - 使用 Gin 框架
  - 處理路由定義與 HTTP 協議轉換

- **Infrastructure 層** (`internal/infra/`)：外部服務實作
  - `mongodb/`：MongoDB 資料庫實作
  - 包含持久化模型與 `toDomain`/`fromDomain` 轉換

### 前端架構 (Next.js App Router)
- **路由結構** (`web/src/app/`)：使用 App Router
- **元件組織** (`web/src/components/`)：功能垂直切分
- **API 整合** (`web/src/lib/api/`)：統一 axios 封裝，自動處理 Auth0 token
- **狀態管理**：TanStack React Query
- **表單處理**：React Hook Form + Zod 驗證
- **UI 框架**：Shadcn UI + Radix UI + Tailwind CSS

## 開發規範

### Go 後端
- **依賴注入**：使用 google/wire
- **Mock 測試**：使用 uber-go/mock，在 interface 檔案頂部加入 `//go:generate` 指令
- **錯誤處理**：明確檢查 err，使用 `errors.Is` 判斷標準錯誤
- **命名規範**：
  - Interface 以用途命名（如 `PetRepository`）
  - Context 參數一律命名為 `c`
  - Package 名稱小寫單字，與目錄一致

### 前端
- **禁止 default export**：統一使用 named export
- **路徑導入**：使用絕對路徑 (`@/`)
- **檔案命名**：
  - 資料夾：kebab-case
  - React 元件：PascalCase
  - 工具/型別：kebab-case
- **TypeScript**：所有 API contract 皆需明確型別定義

### 通用規範
- **註解語言**：所有註解、記錄、commit message 使用正體中文
- **Git commit**：清楚描述變更內容，使用正體中文
- **環境變數**：透過 `.env.local` 管理，參考 `.env.example`

## 重要注意事項

1. **領域模型純淨性**：Domain 層的 model 絕不可包含資料庫相關標籤（如 bson、gorm）
2. **分層隔離**：各層之間透過介面通訊，不可跨層直接依賴實作
3. **API 認證**：前端所有 API 呼叫自動帶入 Auth0 access token
4. **測試優先**：新功能需包含單元測試，關鍵流程需有整合測試
5. **程式碼格式**：
   - Go：執行 `gofmt` 與 `goimports`
   - 前端：執行 `pnpm lint`