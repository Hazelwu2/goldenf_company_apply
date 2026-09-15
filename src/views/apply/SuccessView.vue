<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NTag } from 'naive-ui'
import { CheckmarkCircle } from '@vicons/ionicons5'
import { useApplyStore } from '@/stores/applyStore'
import ReferenceNoCard from '@/components/apply/ReferenceNoCard.vue'

const store = useApplyStore()
const router = useRouter()

const levelLabel: Record<string, string> = { A: '營運商 A', MA: '代理 MA', SMA: '總代理 SMA' }
const levelLabelEn: Record<string, string> = {
  A: 'Operator A',
  MA: 'Agent MA',
  SMA: 'Super Agent SMA',
}

// 直接進入這頁做畫面預覽時（例如透過「畫面總覽」），補一組示範資料，避免空畫面。
onMounted(() => {
  if (!store.referenceNo) {
    if (!store.combo) store.selectCombo('SMA_MA_A')
    store.submitApplication()
  }
})

const submittedAtText = computed(() => {
  if (!store.submittedAt) return '—'
  const d = new Date(store.submittedAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

function backToStart() {
  store.resetAll()
  router.push('/apply')
}
</script>

<template>
  <section class="screen">
    <NCard size="large">
      <div class="success-head">
        <span class="success-head__icon">
          <NIcon :component="CheckmarkCircle" size="34" />
        </span>
        <h1 class="success-head__title">送出成功</h1>
        <p class="success-head__title-en">Submitted Successfully</p>
        <p class="success-head__desc">您的申請已收件，請妥善保存以下開線編號。</p>
        <p class="success-head__desc-en">
          Your application has been received. Please keep the application reference number below.
        </p>
      </div>

      <ReferenceNoCard :reference-no="store.referenceNo ?? '—'" />

      <dl class="meta-list">
        <div class="meta-list__row">
          <dt>
            提交時間
            <span class="meta-list__dt-en">Submitted At</span>
          </dt>
          <dd>{{ submittedAtText }}</dd>
        </div>
        <div class="meta-list__row">
          <dt>
            組合摘要
            <span class="meta-list__dt-en">Application Type</span>
          </dt>
          <dd>
            <span v-for="level in store.levels" :key="level" class="meta-list__tag">
              <NTag size="small" :bordered="false" round>
                {{ levelLabel[level] }}
                <span class="meta-list__tag-en">{{ levelLabelEn[level] }}</span>
              </NTag>
            </span>
          </dd>
        </div>
      </dl>

      <div class="reminder">
        <p class="reminder__zh">
          送出後無法自行修改。如需查詢或修改申請內容，請提供上方開線編號並聯絡客服。
        </p>
        <p class="reminder__en">
          This application cannot be edited after submission. To check or modify it, please contact
          customer support and provide the application reference number above.
        </p>
      </div>
    </NCard>

    <div class="success-actions">
      <NButton quaternary @click="backToStart">返回首頁，開始新的申請 Back to start</NButton>
    </div>
  </section>
</template>

<style scoped>
.screen {
  max-width: 600px;
  margin: 0 auto;
}

.success-head {
  text-align: center;
  margin-bottom: 22px;
}

.success-head__icon {
  display: inline-flex;
  color: var(--color-success);
  margin-bottom: 8px;
}

.success-head__title {
  margin: 0 0 2px;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
}

.success-head__title-en {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.success-head__desc {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-secondary);
}

.success-head__desc-en {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-muted);
}

.meta-list {
  margin: 20px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-list__row {
  display: flex;
  gap: 16px;
  font-size: 15px;
  align-items: center;
}

.meta-list__row dt {
  flex: none;
  width: 84px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
}

.meta-list__dt-en {
  font-size: 13px;
  color: var(--color-text-muted);
}

.meta-list__row dd {
  margin: 0;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', 'Roboto Mono', monospace;
}

.meta-list__tag {
  margin-right: 6px;
  font-family: inherit;
}

.meta-list__tag-en {
  font-size: 13px;
  opacity: 0.75;
  margin-left: 3px;
}

.reminder {
  margin-top: 20px;
  padding: 12px 14px;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.reminder__zh {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.reminder__en {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.success-actions {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}
</style>
