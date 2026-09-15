<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NCheckbox, NIcon, NTag } from 'naive-ui'
import { AlertCircleOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5'
import { useApplyStore } from '@/stores/applyStore'
import { useApplySteps } from '@/composables/useApplySteps'
import CaptchaField from '@/components/apply/CaptchaField.vue'
import StepFooterActions from '@/components/apply/StepFooterActions.vue'

const store = useApplyStore()
const router = useRouter()
const { steps } = useApplySteps()

const levelLabel: Record<string, string> = { A: '營運商 A', MA: '代理 MA', SMA: '總代理 SMA' }
const levelLabelEn: Record<string, string> = {
  A: 'Operator A',
  MA: 'Agent MA',
  SMA: 'Super Agent SMA',
}

const records = computed(() =>
  store.levels.map((level) => {
    const codeName =
      level === 'A' ? store.operator.code : store.agentForm(level as 'MA' | 'SMA').code
    const displayName =
      level === 'A'
        ? store.operator.name || store.operator.code
        : store.agentForm(level as 'MA' | 'SMA').name || store.agentForm(level as 'MA' | 'SMA').code
    return {
      level,
      roleLabel: levelLabel[level],
      roleLabelEn: levelLabelEn[level],
      code: codeName || '—',
      name: displayName || '—',
    }
  }),
)

onMounted(() => {
  if (!store.captchaCode) store.regenerateCaptcha()
})

function goBack() {
  const idx = steps.value.findIndex((s) => s.key === 'confirm')
  const prev = steps.value[idx - 1]
  router.push(prev ? prev.path : '/apply')
}

function handleSubmit() {
  if (!store.canSubmit) return
  store.submitApplication()
  router.push('/apply/success')
}

function previewRejection() {
  router.push('/apply/rejected')
}
</script>

<template>
  <section class="screen">
    <NCard size="large">
      <template #header>
        <span class="screen__title">確認送出</span>
        <span class="screen__title-en">Confirm & Submit</span>
      </template>
      <template #header-extra>
        <span class="screen__badge">C08</span>
      </template>

      <p class="screen__lead">
        本次將建立 <strong>{{ records.length }}</strong> 筆資料，送出後系統會產生
        <strong>1 個開線編號</strong>，請再次確認以下內容：
      </p>
      <p class="screen__lead-en">
        This submission will create <strong>{{ records.length }}</strong> record(s). One application
        reference number will be generated after submission. Please review the details below:
      </p>

      <ul class="record-list">
        <li v-for="r in records" :key="r.level" class="record-list__item">
          <NTag size="small" :bordered="false" round>
            {{ r.roleLabel }}
            <span class="record-list__role-en">{{ r.roleLabelEn }}</span>
          </NTag>
          <span class="record-list__code">{{ r.code }}</span>
          <span class="record-list__name">{{ r.name }}</span>
        </li>
      </ul>

      <div class="declaration">
        <NCheckbox
          :checked="store.declarationChecked"
          @update:checked="(v: boolean) => (store.declarationChecked = v)"
        >
          我已確認以上資料正確無誤，送出後將無法自行修改，如需異動須聯絡客服並提供開線編號。
          <br />
          <span class="declaration__en">
            I confirm the information above is correct. Once submitted, it cannot be self-edited —
            to make changes, please contact customer support and provide the application reference
            number.
          </span>
        </NCheckbox>
      </div>

      <div class="captcha-block">
        <div class="captcha-block__label">
          <NIcon :component="ShieldCheckmarkOutline" size="15" />
          <span>
            安全驗證
            <span class="captcha-block__label-en">Security Verification</span>
          </span>
        </div>
        <CaptchaField
          :code="store.captchaCode"
          :status="store.captchaStatus"
          :model-value="store.captchaInput"
          @update:model-value="(v: string) => (store.captchaInput = v)"
          @refresh="store.regenerateCaptcha"
          @verify="store.verifyCaptcha"
        />
      </div>
    </NCard>

    <StepFooterActions
      next-label="確認送出"
      next-label-en="Confirm & Submit"
      :next-disabled="!store.canSubmit"
      hint="請勾選宣告並通過安全驗證後才能送出"
      hint-en="Please check the declaration and pass the security verification to submit"
      @back="goBack"
      @next="handleSubmit"
    />

    <button type="button" class="preview-link" @click="previewRejection">
      <NIcon :component="AlertCircleOutline" size="13" />
      預覽：整包拒絕畫面（僅供畫面檢視，非實際送出結果）
    </button>
  </section>
</template>

<style scoped>
.screen {
  max-width: 720px;
  margin: 0 auto;
}

.screen__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.screen__title-en {
  margin-left: 8px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.screen__badge {
  font-family: ui-monospace, 'SF Mono', 'Roboto Mono', monospace;
  font-size: 13px;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1px 6px;
}

.screen__lead {
  margin: 0 0 4px;
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.screen__lead-en {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.record-list {
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-list__item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 15px;
}

.record-list__role-en {
  font-size: 13px;
  opacity: 0.75;
  margin-left: 4px;
}

.record-list__code {
  font-family: ui-monospace, 'SF Mono', 'Roboto Mono', monospace;
  font-weight: 700;
  color: var(--color-text);
}

.record-list__name {
  color: var(--color-text-muted);
  flex: 1;
}

.declaration {
  padding: 14px;
  background: var(--color-warning-soft);
  border: 1px solid var(--color-warning-border);
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 18px;
}

.declaration__en {
  display: inline-block;
  margin-top: 4px;
  font-size: 14px;
  color: var(--color-warning);
}

.captcha-block {
  padding-top: 4px;
}

.captcha-block__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.captcha-block__label-en {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted);
}

.preview-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 16px;
  background: none;
  border: none;
  font-size: 14px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
}

.preview-link:hover {
  color: var(--color-error);
}
</style>
