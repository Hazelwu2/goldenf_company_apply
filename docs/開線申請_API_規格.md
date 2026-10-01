# 開線申請 API 規格

[TOC]

本文件定義開線申請前端期望的 API request、response、欄位驗證及前後端責任。內容描述完整理想流程，包含尚未排期的功能。

- **本文件是開線申請 API 格式的唯一維護版本**（取代 `COMPANY_APPLY_API.md`、`開線申請_API_規格_合併.md`）。
- 產品商下拉選單的顯示與互動規則以 [產品商下拉選單規格](產品商下拉選單規格.md) 為準。
- 第 8 節之後的「舊版紀錄」「封存 Q&A」僅供查閱，不再維護；與前面章節衝突時以前面章節為準。

## 1. 共通規則

### 1.1 API 清單

| 使用端 | 功能 | Method | Path |
| --- | --- | --- | --- |
| 客戶表單 | 建立開線申請 | `POST` | `/api/v1/company_apply/create` |
| 後台 2.0 | 查詢開線申請清單 | `POST` | `/api/v1/company_apply/list` |
| 後台 2.0 | 編輯單筆申請資料 | `POST` | `/api/v1/company_apply/update` |
| 後台 2.0 | 刪除多筆申請資料 | `POST` | `/api/v1/company_apply/delete` |
| 客戶表單 | 取得產品商清單，下拉選單用 | `GET` | `/api/v1/company_apply/vendor/list` |
| 客戶表單 | 取得幣值轉換清單，下拉選單用 | `POST` | `/api/v1/company_apply/exchange/list` |

### 1.2 共通 response 外層

成功：

```json
{
  "status": 1,
  "message": "成功",
  "data": {}
}
```

失敗：

```json
{
  "status": 0,
  "message": "錯誤訊息",
  "data": {}
}
```

`status` 是 API 執行結果，不是開線申請的處理狀態。

- 只有 `status` 為 `1` 代表成功，其他值（例如 `0`、`2`）一律視為失敗；前端比對時容許數字或字串。
- HTTP 狀態碼只會是 `200` 或 `500`：業務失敗（含驗證失敗）為 HTTP 200 + `status` 非 1；HTTP 500 視為伺服器錯誤，不讀取 body。
- 客戶表單呼叫 API 不需要送任何自訂 header（不送 `lang`、token）。

### 1.3 申請組合

`combination` 僅接受以下值：

| `combination` | `records` 必須包含的角色 |
| --- | --- |
| `SMA + MA + A` | SMA、MA、A |
| `MA + A` | MA、A |
| `MA` | MA |
| `A` | A |

一張申請只建立一組階層，不支援在同一張申請中批量建立多個 MA。

### 1.4 角色與類型

| 角色 | `company_level` | `type` | 說明 |
| --- | --- | --- | --- |
| 營運商 | `A` | `operator` | 實際串接產品商及營運站台的角色 |
| 代理 | `MA` | `company` | 管理下層營運商的代理角色 |
| 總代理 | `SMA` | `company` | 管理下層代理的總代理角色 |

新規格統一使用 A、MA、SMA，不使用 OP 表示營運商。

### 1.5 上層代碼

| `combination 申請組合` | record | `parent_code` |
| --- | --- | --- |
| `A` | A | `GF_MA` |
| `MA` | MA | `GF_MA` |
| `MA + A` | MA | `GF_MA` |
| `MA + A` | A | 本次申請的 MA `code` |
| `SMA + MA + A` | SMA | `GF_MA` |
| `SMA + MA + A` | MA | 本次申請的 SMA `code` |
| `SMA + MA + A` | A | 本次申請的 MA `code` |

### 1.6 處理狀態

每筆 A、MA、SMA record 各自擁有一個狀態，後台可以自由切換：

| 值 | 顯示名稱 |
| --- | --- |
| `vendor_pending` | 待原廠設置 |
| `pending` | 待確認 |
| `data_missing` | 資料需補充 |
| `finish` | 已完成 |
| `cancel` | 取消申請 |

客戶建立申請時，最外層 `status` 固定傳 `pending`。

## 2. 建立開線申請 API

```http
POST /api/v1/company_apply/create
Content-Type: application/json
```

### 2.1 Request

```json
{
  "combination": "MA + A",
  "status": "pending",
  "records": [
    {
      "company_level": "A",
      "type": "operator",
      "code": "OP9",
      "name": "好運營運站",
      "parent_code": "MA12",
      "admin_account": "op9admin",
      "bo_whitelist": ["192.168.1.10"],
      "api_whitelist": ["203.0.113.55"],
      "emails": ["ops@example.com"],
      "currency": "VND",
      "vendors": ["CQ9", "JDB"],
      "operating_markets": ["VN", "TH"],
      "website": "https://example.com",
      "test_account": "tester01",
      "test_password": "password123",
      "chat_software": "telegram",
      "chat_group": "GoldenF 開線群組",
      "merchant_memo": "",
    },
    {
      "company_level": "MA",
      "type": "company",
      "code": "MA12",
      "name": "某某科技",
      "parent_code": "GF_MA",
      "admin_account": "maadmin",
      "bo_whitelist": ["192.168.1.10"],
      "emails": ["ops@example.com"],
      "merchant_memo": ""
    }
  ]
}
```

### 2.2 最外層欄位

| 欄位 | 中文名稱 | 型別 | 必填 | 驗證規則 |
| --- | --- | --- | :---: | --- |
| `combination` | 角色組合 | string | 是 | 僅接受 `SMA + MA + A`、`MA + A`、`MA`、`A` |
| `status` | 申請狀態 | string | 是 | 客戶表單固定傳 `pending`；Create API 不接受其他值 |
| `records` | 申請資料 | array | 是 | 本次客戶申請的資料 |

### 2.3 A／MA／SMA 共用欄位

| 欄位 | 中文名稱 | 型別 | 必填 | 說明與驗證規則 |
| --- | --- | --- | :---: | --- |
| `company_level` | 申請資料所屬公司別層級 | string | 是 | 僅接受 `A`、`MA`、`SMA` |
| `type` | 類型 | string | 是 | 僅接受 `operator`、`company`；A 必須為 `operator`，MA／SMA 必須為 `company` |
| `code` | 營運商或代理代碼 | string | 是 | - `A`：2～4 個英數字符且不得包含 `0` <br/>- `MA／SMA`：2～12 個英數字符，統一轉為大寫<br/>不得與系統、同一前端請求參數內其他 record，或開線申請書資料表既有代碼重複 |
| `name` | 營運商或代理名稱 | string | 否 | 空值或未傳時，以 `code` 作為名稱 |
| `parent_code` | 父層代碼 | string | 否 | 空值或未傳時預設為 `GF_MA`；多層組合仍須符合本文件 1.5 的上下層關係；後台可再修改 |
| `admin_account` | 後台管理者帳號 | string | 是 | 6～10 個小寫英數字符 |
| `bo_whitelist` | 後台 IP 白名單 | string[] | 是 | 必須為非空陣列；每一筆須符合後端接受的 IP 或 CIDR 格式；不驗證 IP 所屬地區 |
| `emails` | 聯絡電子郵件 | string[] | 否 | 可接受空陣列；有值時逐筆驗證 Email 格式 |
| `merchant_memo` | 客戶備註 | string | 否 | 空值可接受；最多 250 個字，前後端皆須限制 |
| `business_memo` | 業務歷程備註 | object[] | 否 | 空陣列可接受；供小明在後台新增附帶建立時間與建立人的工作日記 |

`business_memo` 陣列 item 格式：

```json
{
  "created_at": 1788514888000,
  "memo": "2026/09/04 客戶取消開線",
  "created_by": "小明"
}
```

| 欄位 | 中文名稱 | 型別 | 必填 | 說明 |
| --- | --- | --- | :---: | --- |
| `created_at` | 建立時間 | integer | 是 | 備註建立時間，使用 Unix timestamp 毫秒 |
| `memo` | 備註內容 | string | 是 | 小明在後台填寫的工作日記內容 |
| `created_by` | 建立人 | string | 是 | 建立此筆備註的內部人員名稱 |

代碼重複驗證包含三個範圍：

1. 既有系統內已存在的 A／MA／SMA 代碼。
2. 同一次 Create API payload 的其他 records。
3. 開線申請書資料表中已存在的代碼。

比較代碼是否重複時須忽略英文字母大小寫。

「與 A 相同」只是一項前端操作。前端送出前會把 A 的 Email 與後台白名單複製到 MA／SMA；`same_as_a` 不送後端。

### 2.4 僅營運商 A 使用的欄位

| 欄位 | 中文名稱 | 型別 | 必填 | 說明與驗證規則 |
| --- | --- | --- | :---: | --- |
| `currency` | 營運商幣別 | string | 是 | 幣別必須存在於「系統／幣值轉換清單」 |
| `vendors` | 申請開通的產品商 | string[] | 是 | 必須為非空陣列；每個 Vendor code 必須存在且可申請，並支援 `currency` 指定的幣別 |
| `api_whitelist` | 營運商 API IP 白名單 | string[] | 是 | 必須為非空陣列；每一筆須符合 IP 或 CIDR 格式；不驗證 IP 所屬地區，也不阻擋美國 IP |
| `operating_markets` | 營運市場 | string[] | 是 | 必須為非空陣列；傳國家／地區代碼，不傳中英文顯示名稱，例如 `["TH", "VN"]` |
| `website` | 站台網址 | string | 否 | 有值時驗證 URL 格式；與測試帳號、測試密碼全空或全有 |
| `test_account` | 站台測試帳號 | string | 否 | `website` 有值時必填 |
| `test_password` | 站台測試密碼 | string | 否 | `website` 有值時必填；不需加密保存 |
| `chat_software` | 通訊軟體 | string | 是 | 僅接受 `Teams` 或 `telegram` |
| `chat_group` | 通訊群組 | string | 是 | Telegram 或 Teams 的群組名稱 |

### 2.5 網站資料驗證

`website_status` 是前端畫面狀態，不送後端。後端須按下列規則驗證：

- `website`、`test_account`、`test_password` 全部為空：代表網站尚在開發中，允許送出。
- 三個欄位全部有值：代表已有網站，允許送出。
- 只填其中一項或兩項：驗證失敗。

### 2.6 原子性

Create API 採全有全無：

- 任一 record 驗證失敗時，不建立任何 record。
- 驗證失敗時，不產生開線編號。
- 全部通過後，才一次建立整組資料。

### 2.7 開線編號

格式：

```text
APY-yyyymmdd-[當日流水號]
```

範例：

```text
APY-20260911-0001
```

規則：

- `APY` 為固定前綴，代表 Apply。
- 日期以台北時間 UTC+8 計算。
- 流水號每天從 `0001` 開始。
- 超過第 9999 筆時允許使用五碼以上，例如 `10000`。
- 後端必須保證並行提交時不會產生重複編號。
- 同一次多角色申請拆出的所有 records 共用同一個 `reference_no`。
- 後端額外處理欄位

| 參數 | 中文名稱 | 型別 | 規則 |
| :--- | :--- | :--- | :--- |
| `role` | 角色 | String | - 當`company_level: 'A'` 則帶`op`<br/>- 當`company_level: 'MA or SMA'`, 則帶 `agent` |
| `version` | 版本號 | String | 建立 key 值。僅 A 使用；MA／SMA 是否也要帶這個 key（值給空字串），待後端確認 |
| `sort` | 排序 | Number | 帶 `0` |
| `mongodb` | MongoDB | String | 建立 key 值 |
| `mongodb_rep` | MongoDB Rep | String | 建立 key 值 |
| `postgresql`= | PostgreSQL | String | 建立 key 值 |
| `group` | 群組 | Array[String] | 建立 key 值 |
| `seamless_host` | host | String | 建立 key 值 |
| `seamless_wtoken` | WToken | String | 建立 key 值 |
| `k8s_group` | K8s 部署群組 | String | 建立 key 值 |
| `business_memo` | 業務歷程備註 | Array[Object] | 建立 key 值 |
| `background` | 資料是否完善 | Boolean | 供前端清單頁顯示 |

### 2.8 成功 response

`created_at` 由後端產生。每筆 record 各自回傳 `status`。

```json
{
  "status": 1,
  "message": "成功",
  "data": {
    "reference_no": "APY-20260911-0001",
    "created_at": 1789056000,
    "records": [
      {
        "_id": "68c157000000000000000001",
        "company_level": "A",
        "type": "operator",
        "code": "OP9",
        "status": "pending"
      },
      {
        "_id": "68c157000000000000000002",
        "company_level": "MA",
        "type": "company",
        "code": "MA12",
        "status": "pending"
      }
    ]
  }
}
```

### 2.9 驗證失敗 response

```json
{
  "status": 0,
  "data": {
    "errors": {
      "A": [
        {
          "code": "GFA0",
          "field": "code",
          "message": "代碼「GFA0」格式不符，不得包含數字 0。",
          "message_en": "Code \"GFA0\" is invalid. Digit 0 is not allowed."
        },
        {
          "code": "GFA0",
          "field": "admin_account",
          "message": "帳號需為 6～10 個小寫英數字元。",
          "message_en": "Account must be 6–10 lowercase alphanumeric characters."
        }
      ],
      "MA": [
        {
          "code": "MA12",
          "field": "bo_whitelist",
          "message": "無法辨識的 IP 格式，請確認每一筆皆為合法 IP  格式。",
          "message_en": "One or more entries are not valid IP or CIDR addresses. Please check each entry."
        }
      ],
      "SMA": [
        {
          "code": "SMAROOT",
          "field": "code",
          "message": "代碼重複，已被其他總代理使用。",
          "message_en": "This code is already used by another super agent."
        }
      ]
    }
  },
  "message": "apply validation failed."
}
```

`data.errors` 以角色分組：key 為 `A`、`MA`、`SMA`，value 為該角色的錯誤陣列；只有出錯的角色會出現。

| 錯誤欄位 | 中文名稱 | 必填 | 說明 |
| --- | --- | :---: | --- |
| `code` | 角色代碼 | 是 | 使用者實際填寫的角色代碼 |
| `field` | 錯誤欄位 | 是 | 驗證失敗的 request key；例：產品商使用 `vendors` |
| `message` | 中文錯誤訊息 | 是 | 中文錯誤訊息 |
| `message_en` | 英文錯誤訊息 | 是 | 英文錯誤訊息 |

前端以「角色 key + `field`」對應欄位顯示名稱、頁面路徑與 HTML anchor；中英錯誤訊息直接顯示 `message`／`message_en`，前端不自行翻譯。後端不回傳 `routePath`、`anchorId`、`fieldLabel` 或 `fieldLabelEn`，這些由前端自行定義。

## 3. 取得產品商清單-下拉選單 API

> 產品商下拉選單的顯示、分組與互動規則以 [產品商下拉選單規格](產品商下拉選單規格.md) 為準，本節只描述 API 格式。

```http
GET /api/v1/company_apply/vendor/list
```

此端點專供開線申請表使用。後端須回傳所有產品商的精簡資料，由前端判斷哪些產品商可以出現在下拉選單。

現有 Vendor API 包含串接金鑰、錢包設定、IP 白名單及其他內部設定，不可直接原樣提供給客戶端表單。專用端點只回傳本節定義的欄位。

### 3.1 Response

```json
{
  "status": 1,
  "message": "成功",
  "data": {
    "totalCount": 1,
    "currentPage": 0,
    "perPage": 0,
    "list": [
      {
        "code": "betby",
        "name": "BETBY 體育／BETBY",
        "status": "online",
        "status_v3": "decommission",
        "demo": true,
        "support": {
          "v2": true,
          "v3": false
        },
        "currency": {
          "VND": {
            "vendor": "VND",
            "rate": "",
            "gf_support": false,
            "decimal": ""
          }
        }
      }
    ]
  }
}
```

`data.list` 為前端實際使用的產品商清單。`totalCount`、`currentPage`、`perPage` 保留既有 API 外層格式；申請表不依賴這三個欄位進行產品商篩選。

### 3.2 產品商欄位

| 欄位 | 中文名稱 | 型別 | 必填 | 說明 |
| --- | --- | --- | :---: | --- |
| `code` | 產品商代碼 | string | 是 | 前端提交開線申請時放入 `records[].vendors` 的值 |
| `name` | 產品商名稱 | string | 是 | 下拉選單顯示名稱，可包含中英文名稱 |
| `status` | 產品商狀態 | string | 是 | 前端篩選使用，規則見 [產品商下拉選單規格](產品商下拉選單規格.md) |
| `status_v3` | 產品商 v3 狀態 | string | 是 | 申請表不使用 |
| `demo` | 是否提供測試環境 | boolean | 是 | 前端依此分組（正式與測試／僅正式），規則見 [產品商下拉選單規格](產品商下拉選單規格.md) |
| `support` | 支援版本 | object | 是 | 至少必須包含 boolean 型別的 `v2`；`v3` 可一併回傳 |
| `currency` | 原廠支援幣別 | object | 是 | 以幣別代碼為 key 的物件，value 為該幣別設定；前端以使用者選擇的幣別代碼讀取對應項目 |

### 3.3 `support` 欄位

```json
{
  "v2": true,
  "v3": false
}
```

| 欄位 | 中文名稱 | 型別 | 必填 | 說明 |
|---|---|---|:---:|---|
| `v2` | 是否支援 2.0 | boolean | 是 | 可選產品商必須為 `true` |
| `v3` | 是否支援 3.0 | boolean | 否 | 申請表目前不使用，可保留供後續擴充 |

### 3.4 `currency` 欄位

`currency` 沿用現有 Vendor API 的格式：以幣別代碼為 key 的 object，不轉成陣列。

```json
{
  "VND": {
    "vendor": "VND",
    "rate": "",
    "gf_support": false,
    "decimal": ""
  }
}
```

每一筆幣別資料格式：

| 欄位 | 中文名稱 | 型別 | 必填 | 說明 |
| --- | --- | --- | :---: | --- |
| `vendor` | 原廠支援幣別 | string | 是 | 非空字串才代表產品商原廠支援該幣別 |
| `rate` | 匯率 | string | 是 | 原資料值；申請表不使用此欄位進行篩選 |
| `gf_support` | GF 是否支援 | boolean | 是 | 申請表不使用此欄位進行篩選 |
| `decimal` | 小數位設定 | string | 是 | 原資料值；申請表不使用此欄位進行篩選 |

產品商原廠支援某幣別的判斷標準只有該幣別項目的 `vendor` 必須有值且不為空字串。`gf_support` 不需要為 `true`。

### 3.5 前端篩選規則

已移至 [產品商下拉選單規格](產品商下拉選單規格.md)（第 3 節），此處不再重複。

### 3.6 不可回傳的內部欄位

專供客戶表單使用的 `/api/v1/company_apply/vendor/list` 不得回傳下列內部資料：

- `request_params`，包含 `public_key`、`private_key`、`operator_id`、`brand_id`、`redirect_url`、`js` 等串接設定。
- `ip_whitelist`、`filter_ip`。
- `wallet_type`、`wallet_code`、`account_delimiter`。
- `betlog_field`、`settled`、`language`。
- `memo`、`pull_data`、`seamless_enable`、`bonus`。
- `created_time`、`updated_time`。
- 其他申請表不需要的內部欄位。

### 3.7 Motivation 特例

~~- 使用者選擇 Motivation 時，前端在 `vendors` 傳 Motivation 的原始 code。~~
~~- 後端保存並原樣回傳 Motivation，不轉成 CQ9。~~
~~- 內部人員實際開線時自行判斷並改開 CQ9。~~

> 待討論： Motivation 要不要歸類回 cq9？申請書可以顯示 Motivation，但送回後台 開線申請書的資料都會存回 cq9

## 4. 取得幣別轉換清單-下拉選單 API

```http
POST /api/v1/company_apply/exchange/list
Content-Type: application/json
```

此端點專供開線申請表的幣別下拉選單使用。後端須一次回傳所有幣值轉換資料，不分頁。

### 4.1 Request

不傳 `currentPage`、`perPage` 或其他分頁參數：

```json
{}
```

### 4.2 Response

```json
{
  "status": 1,
  "message": "成功",
  "data": {
    "list": [
      {
        "code": "VND",
        "name": "越南盾",
        "memo": ""
      },
      {
        "code": "USD",
        "name": "美元",
        "memo": ""
      }
    ]
  }
}
```

### 4.3 幣別-下拉選單需要欄位

| 欄位 | 中文名稱 | 型別 | 必填 | 說明 |
| --- | --- | --- | :---: | --- |
| `code` | 幣別代碼 | string | 是 | 幣別下拉選單的值；前端提交申請時放入 A record 的 `currency` |
| `name` | 幣別名稱 | string | 是 | 幣別下拉選單的顯示名稱 |
| `memo` | 幣別備註 | string | 是 | 幣別補充說明；沒有內容時回傳空字串 |

### 4.4 不需回傳的欄位

表單專用 API 不需回傳現有幣值轉換 API 的下列欄位：

- `_id`
- `rate`
- `min_transfer`
- `totalCount`
- `currentPage`
- `perPage`

前端只依賴 `data.list` 及每筆資料的 `code`、`name`、`memo`。

## 5. 查詢後台開線申請清單 API

```http
POST /api/v1/company_apply/list
Content-Type: application/json
```

### 5.1 資料顯示單位

後台一列代表一筆拆分後的 A、MA 或 SMA record，而不是整張開線申請：

- `SMA + MA + A` 顯示三列。
- `MA + A` 顯示兩列。
- 每列有自己的 MongoDB `_id` 與 `status`。
- 同一張申請拆出的 records 共用 `reference_no` 與 `combination`。

### 5.2 Request body

```json
{
  "currentPage": 1,
  "perPage": 20,
  "field": [],
  "filter": {
    "vendors": ["CQ9"],
    "currency": "CNY"
  }
}
```

| 參數 | 中文名稱 | 型別 | 必填 | 規則 |
| --- | --- | --- | :---: | --- |
| `currentPage` | 頁碼 | integer | 否 | 沿用後台 2.0 分頁規則 |
| `perPage` | 每頁筆數 | integer | 否 | 每頁回傳的資料筆數 |
| `field` | 需要欄位 | array | 否 | 空陣列表示給全部欄位 |
| `filter.reference_no` | 開線編號 | string | 否 | 依開線編號搜尋；精確搜尋 |
| `filter.start_time` | 提交開始時間 | timestamp | 否 | 可單獨使用；給 0 表示不限時間 |
| `filter.end_time` | 提交結束時間 | timestamp | 否 | 可單獨使用 |
| `filter.code` | 公司別代碼 | string | 否 | 營商代碼、代理代碼，`模糊搜尋`，忽略英文字母大小寫 |
| `filter.status` | 狀態 | string | 否 | 篩選該列 record 的處理狀態；沒給 key 值表示全部 |
| `filter.vendors` | 產品商 | array | 否 | 產品商代碼；record 只要包含該產品商即符合；沒給 key 值表示全部 |
| `filter.currency` | 幣別 | string | 否 | 幣別精確比對；沒給 key 值表示全部 |
| `filter.company_level` | 角色層級 | string | 否 | 僅判斷角色，接受 `A`、`MA`、`SMA` ；沒給 key 值表示全部 |

時間規則：

- `start_time: 0`、`end_time: 帶最新時間` ：查詢全部日期。
- 同時傳入 `start_time`, `end_time`：包含起訖時間。
- Timestamp 的儲存與查詢方式沿用後台 2.0 既有規則。

多個篩選條件同時傳入時採 AND。例如 `filter.vendors: ["CQ9"]` 加 `filter.currency: "CNY"` 只回傳同時符合 CQ9 與 CNY 的 records。

### 5.3 Response

```json
{
  "status": 1,
  "message": "成功",
  "data": {
    "totalCount": 1,
    "currentPage": 1,
    "perPage": 20,
    "list": [
      {
        "_id": "68c157000000000000000001",
        "reference_no": "APY-20260911-0001",
        "combination": "MA + A",
        "company_level": "A",
        "code": "OP9",
        "status": "pending",
        "currency": "VND",
        "vendors": ["CQ9", "JDB"],
        "created_at": 1788936096000,
        "updated_at": 1788936096000,
        "name": "公司別名稱",
        "type": "operator",
        "parent_code": "MA12",
        "version": "2",
        "sort": 0,
        "admin_account": "op9admin",
        "admin_name": "管理員帳號",
        "role": "op",
        "bo_whitelist": ["1.1.1.1"],
        "website": "www.ddd.eee",
        "chat_software": "telegram",
        "chat_group": "group name",
        "mongodb": "mongodb",
        "mongodb_rep": "mongodb_rep",
        "postgresql": "postgresql",
        "group": ['group1'],
        "seamless_host": "host",
        "seamless_wtoken": "wtoken",
        "k8s_group": "test",
        "merchant_memo": "",
        "business_memo": [
            {
              "created_at": 1788514888000,
              "memo": "2026/09/04 客戶取消開線",
              "created_by": "小明"
            },
            {
              "created_at": 1788514922000,
              "memo": "2026/09/01 等客戶補資料",
              "created_by": "小明"
            }
        ],
        "emails": [],
        "background": true
      }
    ]
  }
}
```

沒有符合資料時，回傳 HTTP 200，`data.list` 為空陣列：

```json
{
  "status": 1,
  "message": "成功",
  "data": {
    "totalCount": 0,
    "currentPage": 1,
    "perPage": 20,
    "list": []
  }
}
```

## 6. 編輯單筆申請資料 API

```http
POST /api/v1/company_apply/update
Content-Type: application/json
```

後台以 MongoDB `_id` 識別一筆拆分後的 record。

### 6.1 Request

```json
{
  "_id": "68c157000000000000000001",
  "reference_no": "APY-20260911-0001",
  "combination": "MA + A",
  "status": "vendor_pending",
  "company_level": "A",
  "type": "operator",
  "code": "OP9",
  "name": "好運營運站",
  "parent_code": "MA12",
  "admin_account": "op9admin",
  "bo_whitelist": ["192.168.1.10"],
  "api_whitelist": ["203.0.113.55"],
  "emails": ["ops@example.com"],
  "currency": "VND",
  "vendors": ["CQ9", "JDB"],
  "operating_markets": ["VN", "TH"],
  "website": "https://example.com",
  "test_account": "tester01",
  "test_password": "password123",
  "chat_software": "telegram",
  "chat_group": "GoldenF 開線群組",
  "merchant_memo": "",
  "version": "2",
  "sort": 0,
  "mongodb": "mongodb",
  "mongodb_rep": "mongodb_rep",
  "postgresql": "postgresql",
  "group": [],
  "seamless_host": "host",
  "seamless_wtoken": "wtoken",
  "k8s_group": "k8s_group",
  "admin_name": "op9admin",
  "role": "op",
  "background": true,
  "business_memo": [
    {
      "created_at": 1788514888000,
      "memo": "2026/09/04 客戶取消開線",
      "created_by": "小明"
    },
    {
      "created_at": 1788514922000,
      "memo": "2026/09/01 等客戶補資料",
      "created_by": "小明"
    }
  ]
}
```

規則：

- `reference_no`、`combination` 必填，必須原封不動帶入目前的值，後端不更新這兩個欄位。
- `created_at`、`updated_at` 由後端維護，前端不傳。
- 其他申請欄位與 `status` 均可修改。
- 修改不保留舊值、修改人或修改時間歷程。
- 驗證規則與 Create API 的對應角色一致。
- 後台補填欄位 `sort`、`admin_name`、`role`、`background`：A／MA／SMA 皆選填。
- 後台補填欄位 `version`、`mongodb`、`mongodb_rep`、`postgresql`、`group`、`seamless_host`、`seamless_wtoken`、`k8s_group`：僅 A 使用，選填、不擋送出；實際開線走到「批量添加代理階層」時才會驗證。MA／SMA 不傳。
- MA／SMA 不傳【僅 A】欄位（`currency`、`vendors`、`api_whitelist`、`operating_markets`、`website`、`test_account`、`test_password`、`chat_software`、`chat_group`，以及上一條的後台補填欄位）。
- **待後端確認**：MA／SMA 編輯時，前端是否仍要把【僅 A】欄位以空值傳給 API。

### 6.2 Response

```json
{
  "status": 1,
  "message": "成功",
  "data": {
    "_id": "68c157000000000000000001",
    "reference_no": "APY-20260911-0001",
    "combination": "MA + A",
    "company_level": "A",
    "status": "vendor_pending"
  }
}
```

找不到指定 `_id` 時回傳 HTTP 200，`data` 為空陣列：

```json
{
  "status": 1,
  "message": "成功",
  "data": []
}
```

## 7. 刪除多筆申請資料 API

```http
POST /api/v1/company_apply/delete
Content-Type: application/json
```

### 7.1 Request

```json
{
  "_id": ["68c157000000000000000001"]
}
```

### 7.2 規則

- 只刪除指定 `_id` 的 record。
- 不連帶刪除相同 `reference_no` 的其他 records。
- 採實體刪除，沒有復原功能。
- 不保留刪除人、刪除時間或被刪除內容。
- 已刪除的 `reference_no` 不重新使用。

### 7.3 Response

```json
{
  "status": 1,
  "message": "成功",
  "data": []
}
```

## 8. 前後端責任邊界

### 8.1 前端負責

- 申請組合選擇與表單步驟。
- 「網站尚在開發中」的畫面狀態。
- 「MA／SMA 與 A 相同」的欄位複製。
- `/api/v1/company_apply/vendor/list` 的產品商與幣別篩選（規則見 [產品商下拉選單規格](產品商下拉選單規格.md)）。
- 將後端錯誤的「角色 key + `field`」對應至欄位名稱、頁面路徑及 HTML anchor。
- 產生並下載「開線申請書」與「批量添加代理階層」Excel。

### 8.2 後端負責

- 重新驗證所有 request 欄位，不信任前端驗證結果。
- 驗證 `combination` 與 `records` 的角色、數量及上下層關係。
- 以原子操作建立整組 records。
- 產生唯一的 `reference_no`。
- 保存、查詢、編輯與刪除拆分後的 records。
- 依權限向後台原文回傳 `test_password`，供閱讀、編輯與前端匯出 Excel。

### 8.3 後端不需要處理

- `website_status`。
- `same_as_a`。
- Motivation 轉 CQ9。
- `routePath`、`anchorId` 或 UI 欄位標題。
- Excel 填值或匯出。
- Excel 是否曾被下載的紀錄。
- 修改與刪除歷程。

## 舊版紀錄中與新版不同的內容（原文保留）

> 以下到文件結尾皆為封存內容，不再維護；與第 1～8 節衝突時以第 1～8 節為準。

共計需要請後端做出 4隻 API

## 線上申請開線表單 API

- API URL POST `/api/v1/company_apply/create`

### Payload

> payload：前端送去給 API 的實際參數

前端預計會送的請求

```json=
{
  "combination": "MA + A",
  "status": "pending",
  "records": [
    {
      "company_level": "A",
      "type": "operator",
      "code": "OP9",
      "name": "好運營運站",
      "parent_code": "GF_MA",
      "admin_account": "op9admin",
      "bo_whitelist": ["192.168.1.10"],
      "api_whitelist": ["203.0.113.55"],
      "email": ["ops@example.com"],
      "currency": "VND",
      "vendor_codes": ["CQ9", "JDB"],
      "operating_markets": ["VN", "TH"],
      "website": "https://example.com",
      "test_account": "tester01",
      "test_password": "password123"
      "merchant_remark": ""
    },
    {
      "company_level": "MA",
      "type": "company",
      "code": "MA12",
      "name": "某某科技",
      "parent_code": "GF_MA",
      "admin_account": "maadmin",
      "bo_whitelist": ["192.168.1.10"],
      "email": ["ops@example.com"],
      "merchant_remark": ""
    }
  ]
}
```

### API 欄位規則

#### A／MA／SMA 共用

| API 欄位 | 用途 | 必填 | 請後端驗證的規則 |
| --- | --- | :---: | --- |
| `email` | 聯絡電子郵件 | 否 | 空值可接受；有值時驗證 Email 格式 |
| `memo` | 備註 | 否 | 陣列格式，空值可接受。小明在線時備註用的，需要有時間段，`小明日記` |

### 僅營運商 A 使用

> MA／SMA 不需要 currency、vendor_codes、api_whitelist、website、test_account、test_password。

### 成功 Response

```json=
{
  "status": 1,
  "data": {
    "reference_no": "OA-20260904-0001",
    "records": [
      {
        "id": 8101,
        "company_level": "A",
        "code": "OP9",
        "status": "pending_review"
      },
      {
        "id": 8102,
        "company_level": "MA",
        "code": "MA12",
        "status": "pending_review"
      }
    ]
  },
  "message": "Application created."
}
```

### 失敗 Response

![image](https://hackmd.io/_uploads/B1fnvyO_Gg.png)

因 UI 需要，錯誤需要告訴前端

- company_level：是 SMA / MA / A 哪一筆資料有誤
- code：代碼，使用者實際填寫的營商 / 代理代碼
- field：實際前端送的 API Key，哪個欄位有誤
- message：實際錯誤訊息

```json=
{
  "status": 0,
  "data": {
    "errors": [
        {
        "company_level": "A",
        "code": "OP9",
        "field": "vendors",
        "vendor_code": "JDB"
        "message": "JDB 不支援 VND。"
      },
    ]
  },
  "message": "Application validation failed."
}
```

## 規則

![image](https://hackmd.io/_uploads/B13V_J_OGe.png)

- 「已有網站／尚在開發中」、「與 A 相同」、驗證碼皆為前端狀態，不會實際傳參數給 Create API

Parent Code

```
- 第一次會自動帶 parent_code：[sma, ma, a], [ma, a]
- 不自動帶 parent_code：[a], [ma]
```

> 260910 最後結論：前端自動帶入階層，如果是只單開一個沒有階層，前端幫忙代入 GF_MA。給小明三次機會，如果醜三的話就把自動帶入 parent_code 取消，填死他！

## 業務/開線申請書 - 編輯 API

POST `/api/v1/company_apply/update`

### Payload

前端預計會送的請求

A

```json=
{
    "id": "xxx",
    "company_level": "A",
    "type": "operator",
    "code": "OP9",
    "name": "好運營運站",
    "parent_code": "GF_MA",
    "admin_account": "op9admin",
    "bo_whitelist": ["192.168.1.10"],
    "api_whitelist": ["203.0.113.55"],
    "email": "ops@example.com",
    "currency": "VND",
    "vendor_codes": ["CQ9", "JDB"],
    "operating_markets": ["VN", "TH"],
    "website": "https://example.com",
    "test_account": "tester01",
    "test_password": "password123",
    "status": "cancel",
    "chat_software": "",
    "chat_group": "",
    "mongodb": "",
    "mongodb_rep": "",
    "postgresql": "",
    "k8s_group": "",
    "merchant_remark": "",
    "memo": [
        {
            "created_at": 1788514888000,
            "memo": "2026/09/04 客戶取消開線",
            "created_by": "小明"
        },
        {
            "created_at": 1788514922000,
            "memo": "2026/09/01 等客戶補資料",
            "created_by": "小明"
        }
    ]
}
```

SMA / MA

```json=
{
    "company_level": "MA",
    "type": "company",
    "code": "MA12",
    "name": "某某科技",
    "parent_code": "GF_MA",
    "admin_account": "maadmin",
    "bo_whitelist": ["192.168.1.10"],
    "email": "ops@example.com",
    "status": "finish",
    "merchant_remark": "",
    "memo": [
         {
            "created_at": 1788514922000,
            "memo": "2026/09/01 等客戶補資料",
            "created_by": "小明"
        }
    ]
}
```

## 業務/開線申請書 - 刪除 API

- 前端傳那筆 `mongo _id`，才能避免刪除一整份申請，不能設定刪除 `reference_no` 開線編號
- 設定權限：再次確認密碼

```json=
{
    _id: "xxxxxx"
}
```

## 導出時要多產生的欄位(前端看的)

- 狀態：啟用
- 環境：2

## 給前端看 - 批量添加代理階層(type:operator) 現有規格

| API 欄位 | 用途 | 必填 | 後端驗證規則 | 前端驗證規則 |
| --- | --- | ---: | --- | --- |
| `company` | 批次資料陣列 | 是 | 必須存在 | 上傳表格最多 100 筆 |
| `code` | 公司別／營運商代碼 | 是 | 必填、`alpha_dash`；預檢不得與既有公司代碼重複；正式建立時限 2–4 碼且僅英數 | 必填、不得與既有公司或 Excel 內重複、不得含 `0`、長度 2–4 |
| `name` | 公司別與營運商名稱 | 是 | 必填 | 必填 |
| `currency` | 幣別 | 是 | 必填 | 必填，必須是系統既有幣別代碼 |
| `version` | 環境版本 | 是 | 必填，僅接受 `2` 或 `3` | 必填，僅接受 `2` 或 `3`，拒絕 `2.0`、`3.0` |
| `parent_code` | 父層公司代碼 | 是 | 必填；須存在；若狀態為 `online`，父層也必須可啟用 | 必填，必須在公司父層清單內 |
| `sort` | 排序 | 否 | 無明確 validator；建立公司時轉為整數 | 未填時自動送 `0` |
| `admin_account` | 管理者帳號 | 是 | 必填、最少 5 碼、僅小寫英數；不得與同公司既有帳號重複 | 必填、不得與既有帳號重複、長度 6–10 |
| `admin_name` | 管理者名稱 | 是 | 必填、最少 2 碼 | 必填、最少 2 碼 |
| `bo_whitelist` | 後台白名單 IP 陣列 | 否 | 陣列；正式建立時逐筆驗 IPv4 或 CIDR `/0`–`/32` | 可空；以逗號、分號、空白或換行切分；僅接受 IPv4 與 CIDR `/24`–`/32`；會去除重複值 |
| `website` | 網站 | 否 | 欄位必須存在、字串 | 可空 |
| `memo` | 備註 | 否 | 欄位必須存在、字串 | 可空 |
| `chat_software` | 通訊軟體 | 是 | 預檢必填；正式建立只要求欄位存在且為字串 | 必填，必須為系統既有通訊軟體代碼 |
| `chat_group` | 通訊群組名稱 | 是 | 必填；正式建立要求欄位存在且為字串 | 必填 |
| `mongodb` | MongoDB 營運商資料庫群組 | 是 | 必填；預檢及正式建立均確認群組存在；預檢還要求狀態為 `online` | 必填，必須是既有且 `online` 的 MongoDB 群組名稱 |
| `mongodb_rep` | MongoDB 報表資料庫群組 | 是 | 同 `mongodb` | 必填，必須是既有且 `online` 的 MongoDB Rep 群組名稱 |
| `postgresql` | PostgreSQL 資料庫群組 | 是 | 必填；依 `version` 驗證 `postgresql` 或 `postgresql_v3` 群組存在且 `online` | 必填，必須是既有且 `online` 的 PostgreSQL 群組名稱 |
| `group` | 分群 | 否 | 欄位必須存在且為陣列 | 可空；逗號切分為陣列，非空時須為系統既有分群代碼 |
| `seamless_host` | 類單一 Host | 否 | 欄位必須存在 | Excel 欄位名稱為 `host`，可空；送 API 時改名 |
| `seamless_wtoken` | 類單一 WToken | 否 | 欄位必須存在 | Excel 欄位名稱為 `wtoken`，可空；送 API 時改名 |
| `k8s_group` | K8S 群組 | 是 | 預檢必填；建立營運商時使用此代碼更新 K8S 群組關聯 | 必填，須是系統既有且啟用中的 K8S 群組 |
| `type` | 公司類型 | 是，固定值 | 必填，僅可為 `operator` | 前端固定送 `operator` |
| `status` | 狀態 | 是，固定值 | 必填，僅可為 `online`、`maintain`、`decommission` | 前端固定送 `online` |
| `role` | 管理者角色 | 是，固定值 | 必填 | 前端固定送 `op` |
| `gToken` | 二次確認／驗證 Token | 否 | 此 Controller 未見欄位 validator | 由確認密碼流程帶入；有值才附加至公司建立的 FormData |
| `file` | 開線申請書 | 否 | 公司建立 API 讀取上傳檔案並儲存 | 接受 `.xls`、`.xlsx`、`.csv`，上限 5 MB |

## 封存 Q&A

### 260904 會議結論

#### 1. `美國 IP 不得加入 API 白名單`：後端需要也一起驗證嗎？目前走規則是使用者自行驗證，要系統阻擋嗎？

==260904 會議結論==：畫面上仍需提示禁止填入美國 IP，前後端不需驗證 IP 是否為美國，仍由使用者驗證
![image](https://hackmd.io/_uploads/rkfuLy__Gg.png)

#### 2. `company_level` 是否接受作為 SMA／MA／A 的層級欄位？要

#### 3. 運營市場，前端要傳國家代碼？要，用 [mledoze/countries](https://github.com/mledoze/countries)，全球最完整的國家/地區資料庫。提醒：澳門、香港要特別獨立選項讓 user 選

![image](https://hackmd.io/_uploads/HyqFLk_dMg.png)

#### 4. 前端請求 `/api/v1/company_apply/vendor/list` API，需要多回傳「測試環境」，以便組成產品商多選下拉

![image](https://hackmd.io/_uploads/HkYnLJu_Gx.png)

#### 5. 待 PM 與 小明確認開線完後的動作，後台是否需要`狀態欄位`？結論：==需要==

#### 6. Alisa 提出當使用者刪除時，但當狀態是 `待原廠設置`，可以跳出溫馨提醒對方。PM 與 USER `小明` 確認不需溫馨提醒設置

#### 7. parent_code 規則

- 單獨 A／MA 掛 GF_MA
- MA + A：MA 掛 GF_MA，A 掛本次 MA
- SMA + MA + A：SMA 掛 GF_MA，MA 掛 SMA，A 掛 MA

### 260916 實際開發細節討論

#### ❓ Q1 - Vendor 特例：Motivation 真人在 Excel 中是獨立列，但會議內容說實際開線需開在 CQ9 下方。API 應採哪種方式？

- A. /api/v1/company_apply/vendor/list 不回傳 Motivation，只回 CQ9
- B. 回傳 Motivation，但提交申請時前端轉成 CQ9 code
- C. 回傳 Motivation code，後端建立申請時轉成 CQ9
- D. Motivation 與 CQ9 都照原 code 保存

> 結論：D，是額外存 motivation，使用者小明自己看到就自己開線時轉換變 cq9，前端送 motivation，後端回傳 motivation，不必額外轉換

#### ❓ Q27 - 產品商與幣別篩選：後台列表中的產品商與幣別是否都採精確比對？

```
vendor_code=CQ9
currency=CNY
```

若同一張申請選了多個產品商，只要其中包含 CQ9 就列出。多個條件同時傳入時採 AND，例如「CQ9 且 CNY」。
➡️ 建議如上。這可以支援你說的「同幣別一次通知產品負責人開線」。

#### ❓ Q28 - Motivation 轉換結果：客戶選 Motivation 時，後端建立申請要轉成 CQ9。若客戶同時勾選 CQ9 與 Motivation，最後是否只保存一筆 CQ9？

另外，後台是否需要知道客戶原本選的是 Motivation？

- A. 不需要，只保存轉換後的 CQ9
- B. 需要，同時保存原始選擇與實際開線 Vendor

> 特例 Vendor：Motivation 真人 附屬在 CQ9 下方（開線需開在 CQ9），正式站無此獨立產品商。

➡️ 建議 B，否則後台無法還原客戶原始意圖；可分成：

```
{
  "requested_vendor_codes": ["MOTIVATION"],
  "provisioning_vendor_codes": ["CQ9"]
}
```

如果前後台永遠只關心實際開線項目，才選 A。

> 結論：C. 就只傳 motivation，使用者選什麼就傳什麼

#### ❓ Q29 - 編輯 API 的內容範圍：後台「編輯」是否可修改整張申請的所有內容，包括

- 申請組合
- A／MA／SMA code
- Vendor 與幣別
- 官網與測試帳密
- 白名單與 Email
- 狀態

還是申請組合與開線編號建立後不可修改？
➡️ 建議開線編號永遠不可修改；申請組合也不可修改。其他申請內容與狀態可以編輯。若要更換組合，刪除後重新建立較安全。

> 結論：開線編號、申請組合不可更改，其他可更改

#### ❓ Q34 - Create API 完整外層：目前已知前端會送固定的 pending。完整 payload 是否為

```json=
{
  "status": "pending",
  "records": [
    {
      "company_level": "A",
      "type": "operator"
    }
  ]
}
```

還是 status 放在其他位置？
➡️ 建議確認以上格式；records 順序建議固定為 A → MA → SMA，和目前前端填寫順序一致。

> 結論：外層放 status

#### ❓ Q40 - 雙語錯誤訊息：失敗頁目前同時顯示中文與英文。後端是否要回傳

```
{
  "message": "JDB 不支援 VND。",
  "message_en": "JDB does not support VND."
}
```

➡️ 建議後端提供 message 與 message_en；否則前端只能移除英文錯誤訊息，或自行翻譯。

#### 開線申請書是否要一起改名「後台營運商帳號」叫「管理員帳號」？
>
> 結論：討論後決定不改，比較容易讓客戶分辨，也怕後續改流程，會給客戶這份開線申請書做留存的話，這樣會比較清楚知道這都是後台帳號。

## 前端預計修改 260922

1. 開線申請書

- [ ] 「營運商設置」區塊新增營運商名稱==優先==

1. 表單

- [ ] 錯誤訊息不明顯，更改配色試試看
- [ ] 產品商下拉選單：不支持的幣別改顯示方式，太醜了
- [ ] 建立營運商-後台白名單、API 白名單：可加上 hint 說明用途，加入 IP 方可使用我司後台、請求 API
- [ ] 與 Brian 確認下拉選單 API 格式是否可行，再開始接 Mock API

1. 後台

- [ ] 優化：SMA , MA 加上按鈕，可以一次把值帶到添加代理的頁面
- [ ] 與 Brian 確認欄位會怎麼存、怎麼處理這些欄位？有些是營運商有、代理沒有，是會給空的 key 還是完全不產生 key 值？例：`mongodb`, `postgresql`

必填問題

- [x] 小明每次都會一次把所有欄位填好嗎？如果表單設定必填，就變成要一次填好欄位。

> 260922 結論： 改為選填，因為最後走到批量添加代理階層或添加代理階層，都還是會被阻擋。改選填對小明來說會比較好操作

1. Excel 文件

- [ ] 消滅兩份重複的 hackmd

1. Serve 部署

- [ ] 請祥佑先架設，給祥佑 repo，並綁上 domain==優先==

> 260922 小明回覆：台灣IP 可探訪此表單
