# PetLog

PetLog 是一個為多貓家庭設計的寵物健康紀錄系統，支援每隻寵物的個別健康管理。此應用結合日曆視圖與 LINE Notify 提醒功能，協助飼主追蹤日常活動與醫療事件，如疫苗接種、洗澡、用藥紀錄等。

本專案目標是提供：

- 多隻寵物的個別健康紀錄
- 清晰的日曆介面查看過往與即將到來的活動
- LINE Notify 整合提醒功能，避免遺漏重要行程
- 預計加入 AI 功能，如 Whisper 語音轉文字與 GPT 文字摘要，簡化記錄流程

技術架構採用前後端整合的單一 monorepo：

- **後端**：Golang + MongoDB，採用 Clean Architecture 與 Domain-Driven Design
- **前端**：Next.js + React，放置於 `./web` 目錄下
