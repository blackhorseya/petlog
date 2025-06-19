---
description: 
globs: 
alwaysApply: true
---
# PetLog ── 專案目錄結構規範

_(Clean Architecture + DDD、Go Monorepo、Next.js 前端、IaC)_

---

## 1. 頂層結構

petlog/
├── cmd/ ── 可執行程式進入點
├── configs/ ── 靜態設定檔（YAML / env）
├── internal/ ── 應用核心程式碼（私有）
├── api/ ── API 合約（OpenAPI / Proto / GraphQL）
├── web/ ── Next.js 前端
├── deployments/ ── 基礎設施與部署檔
├── scripts/ ── 開發／CI 輔助腳本
├── test/ ── 整合 / 端對端測試
├── Makefile ── 標準建置／執行入口
└── go.mod

---

## 2. 各資料夾規則

| 目錄           | **必須放**                     | **禁止放**        | 備註                                                       |
| -------------- | ------------------------------ | ----------------- | ---------------------------------------------------------- |
| `cmd/`         | `main.go`、組裝程式            | 商業邏輯          | 一個子目錄代表一個 binary (`cmd/server`、`cmd/migrate`…)。 |
| `configs/`     | `*.yaml`、`.env*` 範本         | Go 程式碼         | 僅放預設值；機密透過環境變數 / Secrets Manager。           |
| `internal/`    | 所有核心 Go 套件               | `main.go`         | 其他模組不可 import；結構見 §3。                           |
| `api/`         | 合約來源檔                     | 執行碼            | 生成程式包請放 `internal/`。                               |
| `web/`         | Next.js 原始碼                 | 編譯後檔案        | 使用 PNPM/Turbo；`out/`、`.next/` 忽略於 VCS。             |
| `deployments/` | Terraform、K8s、docker-compose | 應用程式碼        | `deployments/terraform/environments/` 依環境配置。         |
| `scripts/`     | Shell/Go/Python 工具           | >100 行複雜流水線 | 檔名用動詞開頭 (`init_db.sh`)；保持可重入。                |
| `test/`        | 整合 / E2E 測試                | 單元測試          | 單元測試放原檔旁。                                         |

---

## 3. `internal/` 詳細結構

internal/
├── domain/ // Entity / Value Object / Repository 介面
│ ├── pet/
│ ├── healthlog/
│ └── shared/
├── usecase/ // 應用層（Go-kit service 改名 usecase）
│ ├── pet_usecase.go
│ └── healthlog_usecase.go
├── endpoint/ // Go-kit endpoint（ctx→in / out→struct）
│ ├── pet_endpoint.go
│ └── healthlog_endpoint.go
├── transport/ // 轉接層（Gin HTTP、gRPC…）
│ └── gin/
│ ├── pet_handler.go
│ └── healthlog_handler.go
├── repository/ // 外部介面實作（Mongo、Redis…）
│ ├── pet_mongo.go
│ └── healthlog_mongo.go
└── config/ // AppConfig struct + Viper 讀取
├── config.go
└── loader.go

**分層規定**

- `domain/` **禁止** 依賴框架或資料庫。
- `usecase/` 組織業務流程，**不含** HTTP 細節。
- `endpoint/` 專責 DTO 轉換。
- `transport/` 處理路由／中介軟體，轉呼 endpoint。
- `repository/` 實作 `domain.Repository`，可呼叫 DB／外 API。

---

## 4. 前端 `web/` 結構 (Next.js)

web/
├── public/ // 靜態資源
└── src/
├── app/ // App Router
├── components/ // 可重用 UI
├── features/ // 垂直切分模組 (pet, healthlog…)
├── services/ // 共用 API client
├── store/ // 狀態管理（可選）
├── lib/ // 通用工具
├── constants/ // 路徑、列舉常數
└── styles/ // Tailwind / CSS Modules

- 每個 `features/**/api.ts` 透過共用 `services/http.ts` 呼叫後端。
- UI 元件純呈現，商業規則留在後端。

---

## 5. 部署 `deployments/`

deployments/
├── terraform/
│ ├── main.tf
│ ├── modules/
│ │ └── mongo/
│ └── environments/
│ ├── dev/ → terraform.tfvars
│ └── prod/ → terraform.tfvars
├── docker-compose.yaml
└── k8s/
└── manifests/

- **禁止** 直寫機密；請用 Secrets Manager。
- Modules 保持小而可重用；各環境共用 module。

---

## 6. 規範與工具

| 項目     | 規則                                                           |
| -------- | -------------------------------------------------------------- |
| Imports  | `internal/*` 不得被 repo 外導入。                              |
| Tests    | 單元測試與程式碼同層；整合測試放 `/test`。                     |
| Makefile | 提供 `run、test、lint、migrate、proto、web` 等目標。           |
| CI       | 分開 workflow：`ci-go.yml`、`ci-web.yml`、`ci-terraform.yml`。 |
| 版本     | Tag 自 repo root；前後端同版號。                               |

---

## 7. 未來擴充多 Bounded Context

若出現第二個 Context（如 **auth**）：

internal/
├── auth/
│ ├── domain/
│ ├── usecase/
│ ├── endpoint/
│ ├── transport/
│ └── repository/
├── domain/ // 仍為 PetLog 專屬
└── …

---
