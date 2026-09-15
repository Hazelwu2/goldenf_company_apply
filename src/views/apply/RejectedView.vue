<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NTag } from 'naive-ui'
import { CloseCircleOutline } from '@vicons/ionicons5'
import { useApplyStore } from '@/stores/applyStore'
import ErrorSummaryPanel, { type SubmitErrorItem } from '@/components/apply/ErrorSummaryPanel.vue'

const store = useApplyStore()
const router = useRouter()

const levelLabel: Record<string, string> = { A: '营运商 A', MA: '代理 MA', SMA: '总代理 SMA' }
const levelLabelEn: Record<string, string> = {
  A: 'Operator A',
  MA: 'Agent MA',
  SMA: 'Super Agent SMA',
}

/**
 * 示范用错误摘要：实际串接后，这里会改成 Create API 回传的逐笔错误。
 * 目前先依已选组合带出对应角色的代表性错误，方便检视「角色．栏位．讯息＋前往此栏位」的版型。
 */
const errors = computed<SubmitErrorItem[]>(() => {
  const list: SubmitErrorItem[] = []
  if (store.hasLevel('A')) {
    list.push({
      level: 'A',
      fieldLabel: '营运商代码',
      fieldLabelEn: 'Operator Code',
      message: '代码「' + (store.operator.code || 'GF0') + '」格式不符，不得包含数字 0',
      messageEn: `Code "${store.operator.code || 'GF0'}" is invalid — digit 0 is not allowed.`,
      routePath: '/apply/operator',
      anchorId: 'field-operator-code',
    })
    list.push({
      level: 'A',
      fieldLabel: '后台账号',
      fieldLabelEn: 'Admin Account',
      message: '账号需为 6–10 码小写英数字元',
      messageEn: 'Account must be 6–10 lowercase alphanumeric characters.',
      routePath: '/apply/operator',
      anchorId: 'field-operator-admin-account',
    })
  }
  if (store.hasLevel('MA')) {
    list.push({
      level: 'MA',
      fieldLabel: '后台 IP 白名单',
      fieldLabelEn: 'Admin IP Whitelist',
      message: '存在无法辨识的 IP 格式，请确认每一笔皆为合法 IP',
      messageEn: 'One or more entries are not valid IP addresses. Please check each entry.',
      routePath: '/apply/agent/ma',
      anchorId: 'field-agent-ma-bo-whitelist',
    })
  }
  if (store.hasLevel('SMA')) {
    list.push({
      level: 'SMA',
      fieldLabel: '总代理代码',
      fieldLabelEn: 'Super Agent Code',
      message: '代码重复，已被其他总代理使用',
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
          <h1 class="reject-head__title">送出失败，整包未建立</h1>
          <p class="reject-head__title-en">Submission Failed — No Records Were Created</p>
          <p class="reject-head__desc">
            本次申请采「全有全无」：只要任一笔资料有误，就不会建立任何资料、也不会产生开线编号。
            您先前填写的所有内容都已保留，修正后可直接重新送出。
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

      <h2 class="section-title">错误摘要<span class="section-title__en">Error Summary</span></h2>
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
