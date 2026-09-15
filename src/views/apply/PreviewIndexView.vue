<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag } from 'naive-ui'
import { useApplyStore } from '@/stores/applyStore'

const store = useApplyStore()
const router = useRouter()

interface PreviewItem {
  id: string
  title: string
  desc: string
  go: () => void
}

const items: PreviewItem[] = [
  {
    id: 'C01',
    title: '選擇申請組合',
    desc: '4 個申請組合選項，未選前下一步 disabled；按下一步後以燈箱確認選擇。',
    go: () => {
      store.resetAll()
      router.push('/apply')
    },
  },
  {
    id: 'C03',
    title: '營運商 A 表單',
    desc: '幣別 → 產品商 → 代碼 → 帳號 → 白名單 → API 白名單 → Email → 運營市場。',
    go: () => {
      store.seedDemoData('SMA_MA_A')
      router.push('/apply/operator')
    },
  },
  {
    id: 'C04',
    title: '產品商分組多選',
    desc: '（位於 C03 內）依支援環境分兩組；不支援目前幣別者 disabled。',
    go: () => {
      store.seedDemoData('A')
      router.push({ path: '/apply/operator', hash: '#field-operator-vendor' })
    },
  },
  {
    id: 'C05',
    title: '換幣別不相容確認',
    desc: '（位於 C03 內）已選 CNY + 產品商後，切換幣別試試看會跳出的確認 dialog。',
    go: () => {
      store.seedDemoData('A')
      router.push({ path: '/apply/operator', hash: '#field-operator-currency' })
    },
  },
  {
    id: 'C06',
    title: '站台狀態（尚在開發中）',
    desc: '（位於 C03 底部）選「尚在開發中」→ 測試帳密 disabled ＋提醒文案。',
    go: () => {
      store.seedDemoData('A', { websiteStatus: 'in_progress' })
      router.push({ path: '/apply/operator', hash: '#field-operator-website-status' })
    },
  },
  {
    id: 'C07',
    title: '代理 MA 表單',
    desc: '含「與 A 相同」勾選（組合含 A 時才出現）。',
    go: () => {
      store.seedDemoData('MA_A')
      router.push('/apply/agent/ma')
    },
  },
  {
    id: 'C07',
    title: '總代理 SMA 表單',
    desc: '三層組合下的最後一個角色表單。',
    go: () => {
      store.seedDemoData('SMA_MA_A')
      router.push('/apply/agent/sma')
    },
  },
  {
    id: 'C08',
    title: '確認送出',
    desc: '摘要＋宣告 checkbox＋安全驗證（自建圖形碼，可測試三態：未輸入／錯誤／正確）。',
    go: () => {
      store.seedDemoData('SMA_MA_A')
      router.push('/apply/confirm')
    },
  },
  {
    id: 'C09',
    title: '整包拒絕',
    desc: '不建立任何資料、不產編號；錯誤摘要含「前往此欄位」錨點跳轉。',
    go: () => {
      store.seedDemoData('SMA_MA_A')
      router.push('/apply/rejected')
    },
  },
  {
    id: 'C10',
    title: '送出成功',
    desc: '大字開線編號＋複製、提交時間、組合摘要，無列印／下載按鈕。',
    go: () => {
      store.seedDemoData('SMA_MA_A')
      store.submitApplication()
      router.push('/apply/success')
    },
  },
]
</script>

<template>
  <section class="screen">
    <header class="screen__header">
      <h1 class="screen__title">畫面總覽</h1>
      <p class="screen__desc">
        點一下直接跳到對應畫面（會先灌入示範資料，方便檢視已填寫／已通過驗證的狀態）。
        這頁純粹是給視覺檢視用的捷徑，不是規格裡的正式畫面。
      </p>
    </header>

    <div class="preview-grid">
      <NCard v-for="(item, i) in items" :key="i" size="small" class="preview-card" hoverable>
        <div class="preview-card__head">
          <NTag size="small" round :bordered="false" type="info">{{ item.id }}</NTag>
          <h2 class="preview-card__title">{{ item.title }}</h2>
        </div>
        <p class="preview-card__desc">{{ item.desc }}</p>
        <NButton size="small" secondary block @click="item.go">前往這個畫面</NButton>
      </NCard>
    </div>
  </section>
</template>

<style scoped>
.screen {
  max-width: 980px;
  margin: 0 auto;
}

.screen__header {
  margin-bottom: 20px;
}

.screen__title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
}

.screen__desc {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 640px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

@media (max-width: 900px) {
  .preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .preview-grid {
    grid-template-columns: 1fr;
  }
}

.preview-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.preview-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.preview-card__desc {
  margin: 0 0 14px;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  min-height: 48px;
}
</style>
