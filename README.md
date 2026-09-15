# GoldenF Company Apply

GoldenF Company Apply 是一套以 Vue 3 製作的「開線申請」前端網站。使用者可以選擇要建立的帳號階層，依序填寫營運商 A、代理 MA、總代理 SMA 的資料，在送出前完成檢查，最後取得開線編號與可下載的開線確認單。

這份 README 寫給第一次接觸此專案的同事。從安裝、啟動、架構到常見修改位置，都可以在這裡找到。

> 目前專案是前端流程與介面原型，尚未串接正式後端 API。送出結果、開線編號與錯誤頁均由瀏覽器端模擬，不可視為正式資料。

## 目錄

- [這個專案解決什麼問題](#這個專案解決什麼問題)
- [目前具備的功能](#目前具備的功能)
- [技術組成](#技術組成)
- [快速開始](#快速開始)
- [常用指令](#常用指令)
- [如何操作與檢視畫面](#如何操作與檢視畫面)
- [專案架構](#專案架構)
- [程式如何運作](#程式如何運作)
- [路由與頁面](#路由與頁面)
- [表單規則](#表單規則)
- [狀態與瀏覽器儲存](#狀態與瀏覽器儲存)
- [UI 與主題規範](#ui-與主題規範)
- [測試與品質檢查](#測試與品質檢查)
- [常見開發工作](#常見開發工作)
- [部署到 Vercel](#部署到-vercel)
- [目前限制與後端串接提醒](#目前限制與後端串接提醒)
- [疑難排解](#疑難排解)

## 這個專案解決什麼問題

開線申請可能包含一到三層帳號，而且每種組合需要填寫的頁面不同。此專案把流程拆成清楚的步驟，避免使用者漏填或誤解上下層關係。

目前支援四種固定組合：

| 組合 | 會建立的資料 | 表單順序 |
|---|---|---|
| `A` | 只建立營運商 A | A |
| `MA` | 只建立代理 MA | MA |
| `MA_A` | 建立代理 MA 與營運商 A | A → MA |
| `SMA_MA_A` | 建立完整三層階層 | A → MA → SMA |

使用者填寫時從下層往上層走，成功頁則從上層往下層顯示階層：

```text
總代理 SMA
└─ 代理 MA
   └─ 營運商 A
```

## 目前具備的功能

- 固定四種申請組合，依組合動態產生步驟。
- 營運商、代理、總代理表單與欄位驗證。
- 產品商依環境分組，並依幣別停用不支援的選項。
- 切換幣別時提醒並移除不相容的產品商。
- MA／SMA 可沿用營運商 A 的後台白名單與聯絡 Email。
- IPv4、IPv6、CIDR 白名單格式檢查，只列出格式錯誤的項目。
- 送出前列出所有非空白欄位，敏感密碼預設遮蔽。
- 圖形驗證碼輸入滿五碼後立即驗證。
- 成功頁產生模擬開線編號，顯示使用者時區與建立代碼階層。
- 可複製開線編號，或下載不含敏感資料的 PNG 開線確認單。
- 淺色、深色、跟隨系統三種顯示模式。
- 簡體中文為主要介面語言，英文為輔助說明。
- `/apply/preview` 提供內部畫面總覽與示範資料捷徑。

## 技術組成

| 技術 | 用途 |
|---|---|
| Vue 3 | 頁面與元件 |
| TypeScript | 型別檢查與資料結構 |
| Vite | 開發伺服器與正式建置 |
| Vue Router | 多步驟頁面路由與進入條件 |
| Pinia | 整份申請表的前端狀態 |
| Naive UI | 表單、按鈕、卡片、對話框等基礎元件 |
| Ionicons | 介面圖示 |
| Node Test Runner | 工具函式與資料轉換測試 |
| ESLint、Oxlint | 程式碼品質檢查 |

## 快速開始

### 1. 準備環境

需要以下工具：

- Node.js `22.18.0` 以上，或 `24.12.0` 以上。
- Yarn Classic `1.x`。專案已提交 `yarn.lock`，請優先使用 Yarn，避免套件版本漂移。
- 建議使用 VS Code，並安裝 [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)。

確認版本：

```bash
node --version
yarn --version
```

### 2. 安裝套件

```bash
yarn install
```

### 3. 啟動開發環境

```bash
yarn dev
```

終端機會顯示實際網址，通常是 `http://localhost:5173`。如果 5173 已被占用，Vite 會自動改用 5174 或其他可用連接埠。

開啟首頁：

```text
http://localhost:5173/apply
```

想直接檢查各個完成狀態，可開啟：

```text
http://localhost:5173/apply/preview
```

## 常用指令

| 指令 | 作用 |
|---|---|
| `yarn dev` | 啟動 Vite 開發伺服器與熱更新 |
| `yarn test` | 執行 `tests/` 內全部測試 |
| `yarn type-check` | 只執行 Vue／TypeScript 型別檢查 |
| `yarn lint` | 執行 Oxlint 與 ESLint，並自動修正可修正項目 |
| `yarn build-only` | 只建立正式版靜態檔案 |
| `yarn build` | 同時執行型別檢查與正式建置 |
| `yarn preview` | 在本機預覽 `dist/` 正式建置結果 |
| `yarn format` | 使用 Prettier 格式化 `src/` |

提交程式碼前至少執行：

```bash
yarn lint
yarn test
yarn build
```

## 如何操作與檢視畫面

一般流程：

1. 進入 `/apply` 選擇申請組合。
2. 在確認燈箱再次確認階層。
3. 依 Stepper 順序填寫組合需要的表單。
4. 在確認頁檢查所有將送出的資料。
5. 勾選聲明並輸入圖形驗證碼。
6. 送出後保存開線編號，或下載開線確認單。

開發時可以使用 `/apply/preview`：

- 每張卡片都會先灌入合理的示範資料，再跳到指定頁面。
- 這個頁面只是內部檢視工具，不是正式客戶流程。
- 成功與失敗結果目前都是前端模擬。

## 專案架構

```text
goldenf_company_apply/
├── src/
│   ├── main.ts                      # 建立 Vue、Pinia 與 Router
│   ├── App.vue                      # 全站外框、主題切換、固定 Stepper
│   ├── router/index.ts              # 路由、頁面懶載入與進入條件
│   ├── stores/applyStore.ts         # 整份申請的狀態、驗證與模擬送出
│   ├── types/apply.ts               # 組合、階層、表單的 TypeScript 型別
│   ├── views/apply/                 # 每一個流程頁面
│   ├── components/apply/            # 可重複使用的表單與摘要元件
│   ├── composables/useApplySteps.ts # 依組合產生 Stepper 步驟
│   ├── theme/                       # 色票、字型與 Naive UI 主題設定
│   └── utils/                       # 驗證、示範資料、摘要與圖片產生器
├── tests/                           # Node Test Runner 測試
├── docs/UI_DESIGN_SYSTEM.md         # UI 設計規範與交付檢查表
├── AGENTS.md                        # Codex 等代理工具的專案規則入口
├── CLAUDE.md                        # Claude 的專案規則入口
├── vite.config.ts                   # Vite 與 `@` 路徑別名
├── eslint.config.ts                 # ESLint／Oxlint 設定
└── package.json                     # 指令、套件與 Node 版本需求
```

白話來說：

- `views` 是「整頁畫面」。要找某一步長什麼樣子，先來這裡。
- `components` 是「可重複拼裝的小零件」，例如欄位標籤、白名單輸入框、驗證碼與階層圖。
- `store` 是「這張申請單目前填了什麼」。跨頁資料都放在 Pinia Store，而不是各頁自己保存。
- `utils` 是「不依賴畫面的純邏輯」，例如格式驗證、時間顯示與下載圖片內容。
- `theme` 是「全站視覺規則」。要改顏色或字型，不要散落修改各元件的色碼。
- `router` 是「流程交通規則」。它決定網址對應哪一頁，也阻止使用者跳進不屬於目前組合的頁面。

## 程式如何運作

```text
使用者選擇組合
       │
       ▼
Pinia Apply Store 保存跨頁資料
       │
       ├── useApplySteps 產生正確步驟
       ├── Router Guard 阻止不合法跳頁
       ├── 各表單頁讀寫對應資料
       └── validators 檢查欄位格式
       │
       ▼
ConfirmView 建立完整送出前摘要
       │
       ▼
前端模擬送出並產生開線編號
       │
       ▼
SuccessView 顯示階層與產生 PNG 確認單
```

### 狀態來源

`src/stores/applyStore.ts` 是流程的主要資料來源，負責：

- 目前選擇的組合與實際階層。
- A、MA、SMA 三份表單資料。
- 表單是否符合送出條件。
- MA／SMA 與 A 的欄位同步。
- 內部 `parent_code` 推導。
- 驗證碼狀態。
- 模擬開線編號與提交時間。
- 畫面總覽需要的示範資料。

### 頁面與純邏輯分工

頁面只負責顯示與使用者操作。可重複測試的資料整理放在 `src/utils/`：

- `validators.ts`：代碼、帳號、Email、IP／CIDR 格式。
- `applicationReview.ts`：把 Store 資料轉成確認頁與成功頁需要的安全摘要。
- `applicationConfirmationImage.ts`：檢查暫存摘要並建立 SVG，再由頁面轉成 PNG。
- `captcha.ts`：判斷驗證碼的 idle、正確、錯誤狀態。
- `dateTime.ts`：依瀏覽器時區格式化提交時間。
- `mockData.ts`：幣別、產品商與營運市場的示範選項。

## 路由與頁面

| 網址 | Vue 頁面 | 用途 |
|---|---|---|
| `/apply` | `SelectComboView.vue` | 選擇四種申請組合 |
| `/apply/operator` | `OperatorFormView.vue` | 填寫營運商 A |
| `/apply/agent/ma` | `AgentFormView.vue` | 填寫代理 MA |
| `/apply/agent/sma` | `AgentFormView.vue` | 填寫總代理 SMA |
| `/apply/confirm` | `ConfirmView.vue` | 檢查完整資料、聲明與驗證碼 |
| `/apply/rejected` | `RejectedView.vue` | 模擬整包拒絕結果 |
| `/apply/success` | `SuccessView.vue` | 顯示開線編號、階層與下載確認單 |
| `/apply/preview` | `PreviewIndexView.vue` | 內部畫面檢視入口 |

`router.beforeEach` 會檢查：

- 還沒選組合時，不能直接進入後續表單。
- 目前組合沒有該階層時，不能直接進入其表單。
- 不存在的網址會回到 `/apply`。

專案使用 `createWebHistory`，因此部署平台必須把未知路徑回寫到 `index.html`，否則重新整理深層網址可能得到 404。

## 表單規則

目前前端驗證規則定義在 `src/utils/validators.ts`：

| 欄位 | 規則 |
|---|---|
| 營運商代碼 | 2–4 碼英數字，不可包含數字 `0` |
| MA／SMA 代碼 | 1–12 碼英文字母，不接受數字 |
| 後台帳號 | 6–10 碼小寫英數字 |
| 白名單 | 至少一筆合法 IPv4 或 IPv6，可附 CIDR |
| Email | 選填；有填寫時必須符合一般 Email 格式 |
| 營運商產品商 | 至少選一個，且必須支援目前幣別 |
| 營運市場 | 至少選一個 |
| 站台狀態 | 必選；若為已有網站，站台網址必填 |
| 驗證碼 | 五碼，不分大小寫；輸入完整時立即驗證 |

這些都只是前端檢查。正式 API 仍必須在伺服器端重新驗證，不能相信瀏覽器傳來的結果。

## 狀態與瀏覽器儲存

### 只存在記憶體的資料

Pinia Store 目前沒有持久化外掛。重新整理表單頁後，已填資料會消失，路由可能因沒有組合而回到 `/apply`。

### Local Storage

主題偏好保存在：

```text
goldenf-company-apply-theme
```

可用值為 `system`、`light`、`dark`。

### Session Storage

成功頁的安全摘要暫存在：

```text
goldenf-company-apply-last-confirmation
```

用途是讓使用者在同一個分頁重新整理成功頁時仍能看到開線編號。摘要只包含開線編號、提交時間、階層與代碼，不包含名稱、密碼、後台帳號、Email 或白名單。關閉分頁後瀏覽器會清除這份資料。

## UI 與主題規範

修改任何頁面、顏色、字體、間距、互動或響應式行為前，先閱讀：

- [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md)

目前視覺方向是低彩度森林綠搭配暖灰表面，避免高飽和藍色與大面積純白造成視覺疲勞。主要原則：

- 所有客戶看得到的文字使用簡體中文與英文雙語。
- 中文為主要資訊，英文為輔助資訊，但英文不可小到難以閱讀。
- 顏色使用 `src/theme/tokens.ts` 與 `App.vue` 的語意變數。
- 元件內不要新增零散的十六進位色碼。
- 必須同時檢查淺色、深色、桌面與手機寬度。
- 可操作項目要有清楚焦點狀態與可理解的中英無障礙名稱。

`AGENTS.md` 與 `CLAUDE.md` 都會引導 AI 工具先閱讀同一份 UI 規範，避免不同工具各自猜測設計。

## 測試與品質檢查

測試使用 Node 內建 Test Runner，不需要額外測試框架。

```bash
yarn test
```

目前測試涵蓋：

- 確認頁包含所有應送出的非空欄位。
- 未啟用的網站帳密不會出現在確認頁。
- 測試密碼預設遮蔽。
- 下載摘要排除敏感資料。
- 確認單 SVG 會跳脫使用者輸入，避免 XML／HTML 注入。
- Session Storage 摘要格式檢查。
- 提交時間與正負、半小時 UTC 時區。
- 驗證碼在完整輸入前保持 idle，完整後立即判斷。

完整建置檢查：

```bash
yarn lint
yarn test
yarn build
```

`yarn lint` 會自動修改可修正的格式問題，執行後請再查看 `git diff`。

## 常見開發工作

### 新增或修改表單欄位

1. 在 `src/types/apply.ts` 更新表單型別。
2. 在 `src/stores/applyStore.ts` 的空白表單與驗證邏輯加入欄位。
3. 在對應的 `OperatorFormView.vue` 或 `AgentFormView.vue` 加入輸入元件。
4. 在 `src/utils/applicationReview.ts` 決定確認頁是否與如何顯示。
5. 若欄位需要送到 API，更新未來的 payload 轉換層。
6. 新增測試並執行完整品質檢查。

敏感欄位必須預設遮蔽，也不得放入可下載確認單。

### 修改申請組合或步驟

同步檢查以下位置：

- `COMBO_LEVELS`：組合實際包含的階層。
- `COMBO_OPTIONS`：使用者看到的組合名稱與說明。
- `useApplySteps.ts`：Stepper 順序與路徑。
- `router/index.ts`：頁面路由與進入限制。
- `parentCodeMap`：送出時的上下層關係。

### 修改幣別、產品商或市場

編輯 `src/utils/mockData.ts`。產品商必須提供：

- `code`：內部識別碼。
- `nameZh`、`nameEn`：顯示名稱。
- `env`：`official_test` 或 `official_only`。
- `currencies`：支援幣別清單。

正式串接後，建議由 API 提供這些選項，但保留相同資料形狀，畫面元件便不需要重寫。

### 修改全站顏色或字型

1. 先閱讀 `docs/UI_DESIGN_SYSTEM.md`。
2. 修改 `src/theme/tokens.ts` 原始色票。
3. 同步修改 `src/theme/theme-overrides.ts` 的 Naive UI 對應。
4. 若語意 CSS 變數有變動，同步修改 `src/App.vue`。
5. 檢查淺色與深色模式，不要只看其中一種。

### 新增頁面

1. 在 `src/views/` 建立頁面。
2. 在 `src/router/index.ts` 註冊懶載入路由。
3. 若它屬於申請流程，在 route meta 與 `useApplySteps.ts` 加入步驟。
4. 複用既有元件與語意色，不要複製一套新的視覺系統。

## 部署到 Vercel

在 Vercel 匯入 Git 儲存庫後使用以下設定：

| 設定 | 值 |
|---|---|
| Framework Preset | `Vite` |
| Install Command | `yarn install` 或自動偵測 |
| Build Command | `yarn build` |
| Output Directory | `dist` |

不要選 VitePress。VitePress 是文件網站框架，本專案是以 Vite 建置的 Vue 單頁應用程式。

因為 Router 使用 History 模式，Vercel 必須把所有前端路由改寫到 `/index.html`。若尚未設定，可在專案根目錄加入：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

目前專案不需要環境變數。未來接 API 時，前端可公開的 Vite 變數必須以 `VITE_` 開頭；機密金鑰不可放在前端環境變數中。

## 目前限制與後端串接提醒

目前尚未具備：

- 正式 Create API 呼叫。
- 伺服器端資料驗證與重複代碼檢查。
- 真正由後端建立的開線編號。
- 伺服器端 CAPTCHA 或其他機器人防護。
- 資料庫保存、申請進度查詢與權限控管。
- 正式幣別、產品商、市場清單 API。

串接後端時建議：

1. 把 Store 轉成明確的 API payload，不要直接送出整個 reactive 物件。
2. 由後端重新驗證每個欄位與上下層 `parent_code`。
3. 由後端回傳不可猜測且可追蹤的正式開線編號。
4. 將 API 的欄位錯誤轉成目前錯誤摘要需要的角色、欄位與訊息格式。
5. 成功頁只顯示後端實際建立的資料，不使用前端隨機結果。
6. CAPTCHA 必須改為伺服器端驗證；目前版本只能提供操作流程展示，沒有安全防護效果。

## 疑難排解

### `yarn` 使用了錯誤 Node 版本

症狀可能是安裝失敗、Vite 無法啟動或 TypeScript 出現不相容錯誤。先確認：

```bash
node --version
```

若使用 nvm：

```bash
nvm install 22
nvm use 22
yarn install
```

### 開發網址不是 5173

Vite 發現連接埠被占用時會自動改用下一個，例如 5174。請以終端機印出的 `Local` 網址為準。

### 直接開啟後續頁面卻回到 `/apply`

這是預期行為。路由守衛要求先選擇申請組合；請從 `/apply` 開始，或在開發環境透過 `/apply/preview` 灌入示範資料。

### 重新整理後表單資料消失

目前 Pinia 沒有持久化表單內容。只有主題偏好放在 Local Storage，成功頁安全摘要放在 Session Storage。若正式需求要保留草稿，需要另行設計保存期限、資料加密與清除規則。

### Vercel 深層網址重新整理出現 404

這代表 SPA rewrite 尚未設定。請依照[部署到 Vercel](#部署到-vercel)章節加入 rewrite，重新部署後再測試 `/apply/preview`。

## 開發交付檢查表

- [ ] 客戶可見中文為簡體中文，並保留清楚英文對照。
- [ ] 新欄位已加入型別、Store、驗證、確認摘要與測試。
- [ ] 敏感資料不會出現在可分享或可下載內容。
- [ ] 淺色與深色模式皆可閱讀。
- [ ] 375、768、1024、1440 px 寬度沒有水平捲動。
- [ ] 鍵盤焦點順序合理，按鈕與圖示有可理解名稱。
- [ ] `yarn lint`、`yarn test`、`yarn build` 全部通過。
- [ ] 已用 `/apply/preview` 或完整流程手動檢查修改範圍。

## 相關文件

- [UI 設計系統](docs/UI_DESIGN_SYSTEM.md)
- [Codex／通用代理規則](AGENTS.md)
- [Claude 專案規則](CLAUDE.md)
