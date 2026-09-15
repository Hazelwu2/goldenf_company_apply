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
    title: '选择申请组合',
    desc: '4 个申请组合选项，未选前下一步 disabled；按下一步后以灯箱确认选择。',
    go: () => {
      store.resetAll()
      router.push('/apply')
    },
  },
  {
    id: 'C03',
    title: '营运商 A 表单',
    desc: '币别 → 产品商 → 代码 → 账号 → 白名单 → API 白名单 → Email → 运营市场。',
    go: () => {
      store.seedDemoData('SMA_MA_A')
      router.push('/apply/operator')
    },
  },
  {
    id: 'C04',
    title: '产品商分组多选',
    desc: '（位于 C03 内）依支援环境分两组；不支援目前币别者 disabled。',
    go: () => {
      store.seedDemoData('A')
      router.push({ path: '/apply/operator', hash: '#field-operator-vendor' })
    },
  },
  {
    id: 'C05',
    title: '换币别不相容确认',
    desc: '（位于 C03 内）已选 CNY + 产品商后，切换币别试试看会跳出的确认 dialog。',
    go: () => {
      store.seedDemoData('A')
      router.push({ path: '/apply/operator', hash: '#field-operator-currency' })
    },
  },
  {
    id: 'C06',
    title: '站台状态（尚在开发中）',
    desc: '（位于 C03 底部）选「尚在开发中」→ 测试账密 disabled ＋提醒文案。',
    go: () => {
      store.seedDemoData('A', { websiteStatus: 'in_progress' })
      router.push({ path: '/apply/operator', hash: '#field-operator-website-status' })
    },
  },
  {
    id: 'C07',
    title: '代理 MA 表单',
    desc: '含「与 A 相同」勾选（组合含 A 时才出现）。',
    go: () => {
      store.seedDemoData('MA_A')
      router.push('/apply/agent/ma')
    },
  },
  {
    id: 'C07',
    title: '总代理 SMA 表单',
    desc: '三层组合下的最后一个角色表单。',
    go: () => {
      store.seedDemoData('SMA_MA_A')
      router.push('/apply/agent/sma')
    },
  },
  {
    id: 'C08',
    title: '确认送出',
    desc: '摘要＋宣告 checkbox＋安全验证（自建图形码，可测试三态：未输入／错误／正确）。',
    go: () => {
      store.seedDemoData('SMA_MA_A')
      router.push('/apply/confirm')
    },
  },
  {
    id: 'C09',
    title: '整包拒绝',
    desc: '不建立任何资料、不产编号；错误摘要含「前往此栏位」锚点跳转。',
    go: () => {
      store.seedDemoData('SMA_MA_A')
      router.push('/apply/rejected')
    },
  },
  {
    id: 'C10',
    title: '送出成功',
    desc: '大字开线编号＋复制、提交时间、组合摘要，以及 PNG 开线确认单。',
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
      <h1 class="screen__title">画面总览</h1>
      <p class="screen__desc">
        点一下直接跳到对应画面（会先灌入示范资料，方便检视已填写／已通过验证的状态）。
        这页纯粹是给视觉检视用的捷径，不是规格里的正式画面。
      </p>
    </header>

    <div class="preview-grid">
      <NCard v-for="(item, i) in items" :key="i" size="small" class="preview-card" hoverable>
        <div class="preview-card__head">
          <NTag size="small" round :bordered="false" type="info">{{ item.id }}</NTag>
          <h2 class="preview-card__title">{{ item.title }}</h2>
        </div>
        <p class="preview-card__desc">{{ item.desc }}</p>
        <NButton size="small" secondary block @click="item.go">前往这个画面</NButton>
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
