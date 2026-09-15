<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NTag } from 'naive-ui'
import { CloseCircleOutline } from '@vicons/ionicons5'
import { useApplyStore } from '@/stores/applyStore'
import ErrorSummaryPanel, { type SubmitErrorItem } from '@/components/apply/ErrorSummaryPanel.vue'

const store = useApplyStore()
const router = useRouter()

const levelLabel: Record<string, string> = { A: '營運商 A', MA: '代理 MA', SMA: '總代理 SMA' }
const levelLabelEn: Record<string, string> = {
  A: 'Operator A',
  MA: 'Agent MA',
  SMA: 'Super Agent SMA',
}

/**
 * 示範用錯誤摘要：實際串接後，這裡會改成 Create API 回傳的逐筆錯誤。
 * 目前先依已選組合帶出對應角色的代表性錯誤，方便檢視「角色．欄位．訊息＋前往此欄位」的版型。
 */
const errors = computed<SubmitErrorItem[]>(() => {
  const list: SubmitErrorItem[] = []
  if (store.hasLevel('A')) {
    list.push({
      level: 'A',
      fieldLabel: '營運商代碼',
      fieldLabelEn: 'Operator Code',
      message: '代碼「' + (store.operator.code || 'GF0') + '」格式不符，不得包含數字 0',
      messageEn: `Code "${store.operator.code || 'GF0'}" is invalid — digit 0 is not allowed.`,
      routePath: '/apply/operator',
      anchorId: 'field-operator-code',
    })
    list.push({
      level: 'A',
      fieldLabel: '後台帳號',
      fieldLabelEn: 'Admin Account',
      message: '帳號需為 6–10 碼小寫英數字元',
      messageEn: 'Account must be 6–10 lowercase alphanumeric characters.',
      routePath: '/apply/operator',
      anchorId: 'field-operator-admin-account',
    })
  }
  if (store.hasLevel('MA')) {
    list.push({
      level: 'MA',
      fieldLabel: '後台 IP 白名單',
      fieldLabelEn: 'Admin IP Whitelist',
      message: '存在無法辨識的 IP 格式，請確認每一筆皆為合法 IP',
      messageEn: 'One or more entries are not valid IP addresses. Please check each entry.',
      routePath: '/apply/agent/ma',
      anchorId: 'field-agent-ma-bo-whitelist',
    })
  }
  if (store.hasLevel('SMA')) {
    list.push({
      level: 'SMA',
      fieldLabel: '總代理代碼',
      fieldLabelEn: 'Super Agent Code',
      message: '代碼重複，已被其他總代理使用',
      messageEn: 'This code is already used by another super agent.',
      routePath: '/apply/agent/sma',
      anchorId: 'field-agent-sma-code',
    })
  }
  return list
})

function goto(item: SubmitErrorItem) {
  router.push({ path: item.routePath, hash: `#${item.anchorId}` })
}

function backToEdit() {
  const first = errors.value[0]
  router.push(first ? { path: first.routePath, hash: `#${first.anchorId}` } : '/apply')
}

function resubmit() {
  router.push('/apply/confirm')
}
</script>

<template>
  <section class="screen">
    <NCard size="large">
      <div class="reject-head">
        <span class="reject-head__icon">
          <NIcon :component="CloseCircleOutline" size="28" />
        </span>
        <div>
          <h1 class="reject-head__title">送出失敗，整包未建立</h1>
          <p class="reject-head__title-en">Submission Failed — No Records Were Created</p>
          <p class="reject-head__desc">
            本次申請採「全有全無」：只要任一筆資料有誤，就不會建立任何資料、也不會產生開線編號。
            您先前填寫的所有內容都已保留，修正後可直接重新送出。
          </p>
          <p class="reject-head__desc-en">
            This application is all-or-nothing: if any record has an error, nothing is created and
            no application reference number is generated. Everything you entered has been kept — fix
            the issues below and resubmit.
          </p>
        </div>
      </div>

      <div class="role-status">
        <NTag
          v-for="level in store.levels"
          :key="level"
          size="small"
          type="error"
          :bordered="false"
          round
        >
          {{ levelLabel[level] }}：未建立
          <span class="role-status__en">{{ levelLabelEn[level] }}: Not Created</span>
        </NTag>
      </div>

      <h2 class="section-title">錯誤摘要<span class="section-title__en">Error Summary</span></h2>
      <ErrorSummaryPanel :errors="errors" @goto="goto" />
    </NCard>

    <div class="reject-actions">
      <NButton quaternary @click="backToEdit">返回修改 Edit</NButton>
      <NButton type="primary" @click="resubmit">重新送出 Resubmit</NButton>
    </div>
  </section>
</template>

<style scoped>
.screen {
  max-width: 720px;
  margin: 0 auto;
}

.reject-head {
  display: flex;
  gap: 14px;
  margin-bottom: 18px;
}

.reject-head__icon {
  flex: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-error-soft);
  color: var(--color-error);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.reject-head__title {
  margin: 4px 0 2px;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.reject-head__title-en {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.reject-head__desc {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.reject-head__desc-en {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.role-status {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.role-status__en {
  font-size: 13px;
  opacity: 0.8;
  margin-left: 4px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 10px;
}

.section-title__en {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted);
}

.reject-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
</style>
