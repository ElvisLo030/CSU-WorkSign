# 正修工讀簽 — CSU WorkSign

正修科技大學兼職人員個人資料蒐集告知聲明同意書的線上簽署與 PDF 匯出小工具。

線上版本：[csu-worksign.elvislo.tw](https://csu-worksign.elvislo.tw)

> 本工具為非官方個人作品，與正修科技大學無隸屬關係。同意書文件版權屬正修學校財團法人正修科技大學所有。

---

## 功能

- 線上填寫身分證統一編號、民國年月日，以及手寫簽名
- 簽名畫布支援 Retina / HiDPI 螢幕與觸控裝置（行動版友善）
- 一鍵預覽 PDF 或直接下載
- **所有資料僅存在於瀏覽器記憶體**，PDF 產生後立即清除，絕不上傳至任何伺服器
- 開發輔助工具（`DevToolbar`）：可暫存身分證號與簽名至 `localStorage`，重新整理後自動還原；目前 UI 已隱藏，邏輯保留供日後啟用

---

## 技術棧

| 類別 | 套件 / 版本 |
|------|-------------|
| 框架 | [Astro](https://astro.build/) ^5.7 (Static Site Generation) |
| 語言 | TypeScript (Strict mode) |
| 樣式 | [Tailwind CSS](https://tailwindcss.com/) ^4.1 |
| PDF 生成 | [pdf-lib](https://pdf-lib.js.org/) ^1.17 |
| 簽名畫布 | [signature_pad](https://github.com/szimek/signature_pad) ^5.0 |
| 套件管理 | pnpm |
| CI/CD | GitHub Actions → GitHub Pages |

---

## 本地開發

### 前置需求

- Node.js 22+（建議使用 `nvm` 管理）
- pnpm

### 安裝與啟動

```bash
# 安裝相依套件
pnpm install

# 啟動開發伺服器（預設 http://localhost:4321）
pnpm dev
```

### 建置

```bash
pnpm build
```

靜態產物輸出至 `dist/`，可直接部署至任何靜態主機。

### 本地預覽建置結果

```bash
pnpm preview
```

---

## 專案結構

```
src/
├── components/
│   ├── ConsentText.astro      # 同意書條文本文
│   ├── DateField.astro        # 民國年月日輸入欄位
│   ├── DevToolbar.astro       # 開發輔助工具列（UI 已隱藏，邏輯保留）
│   ├── DownloadButton.astro   # 下載 / 預覽按鈕
│   ├── IdNumberField.astro    # 身分證字號輸入欄位
│   ├── PreviewModal.astro     # PDF 預覽 Modal
│   ├── PrivacyNotice.astro    # 隱私聲明提示
│   └── SignatureCanvas.astro  # 手寫簽名畫布
├── layouts/
│   └── BaseLayout.astro       # 頁面基礎布局
├── pages/
│   └── index.astro            # 主頁面
├── services/
│   ├── DateService.ts         # 民國日期轉換
│   ├── PdfService.ts          # PDF 合成邏輯
│   ├── SignatureService.ts    # 簽名畫布操作封裝
│   └── validators/
│       ├── DateValidator.ts   # 民國日期驗證
│       └── IdValidator.ts     # 台灣身分證字號驗證
├── styles/
│   └── global.css
├── types/
│   └── index.ts               # 共用型別定義
└── utils/
    └── download.ts            # PDF 下載輔助
public/
└── form.pdf                   # 原始同意書 PDF 模板
```

---

## 部署

本專案透過 GitHub Actions 自動部署至 GitHub Pages，並使用自訂網域 `csu-worksign.elvislo.tw`。

每次推送至 `main` 分支時自動觸發建置與部署流程，設定檔位於 `.github/workflows/deploy.yml`。

---

## 隱私保證

本工具採純前端架構，**不含任何後端、資料庫或第三方追蹤**：

- 身分證號、簽名等個人資料僅存在於瀏覽器記憶體（JavaScript 變數）
- PDF 下載後，相關資料即隨頁面生命週期結束而銷毀
- Blob URL 於使用後立即 `revokeObjectURL` 釋放

---

## 授權

本工具原始碼以 MIT 授權釋出，個人自由使用與修改。  
同意書文件本身版權屬正修學校財團法人正修科技大學所有。
