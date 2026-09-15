<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NCheckbox, NIcon, NTag } from 'naive-ui'
import {
  AlertCircleOutline,
  EyeOffOutline,
  EyeOutline,
  PencilOutline,
  ShieldCheckmarkOutline,
} from '@vicons/ionicons5'
import { useApplyStore } from '@/stores/applyStore'
import { useApplySteps } from '@/composables/useApplySteps'
import { VENDORS } from '@/utils/mockData'
import { buildApplicationReview } from '@/utils/applicationReview'
import CaptchaField from '@/components/apply/CaptchaField.vue'
import StepFooterActions from '@/components/apply/StepFooterActions.vue'

const store = useApplyStore()
const router = useRouter()
const { steps } = useApplySteps()

const vendorNames = Object.fromEntries(VENDORS.map((vendor) => [vendor.code, vendor.nameZh]))
const reviewSections = computed(() =>
  buildApplicationReview({
    levels: store.levels,
    operator: store.operator,
    agentMA: store.agentMA,
    agentSMA: store.agentSMA,
    vendorNames,
  }),
)
const revealedSecrets = ref(new Set<string>())

function toggleSecret(sectionLevel: string, fieldKey: string) {
  const key = `${sectionLevel}-${fieldKey}`
  const next = new Set(revealedSecrets.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  revealedSecrets.value = next
}

function isSecretVisible(sectionLevel: string, fieldKey: string) {
  return revealedSecrets.value.has(`${sectionLevel}-${fieldKey}`)
}

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
        <span class="screen__title">确认送出</span>
        <span class="screen__title-en">Confirm & Submit</span>
      </template>
      <template #header-extra>
        <span class="screen__badge">C08</span>
      </template>

      <p class="screen__lead">
        本次将建立 <strong>{{ reviewSections.length }}</strong> 笔资料，送出后系统会产生
        <strong>1 个开线编号</strong>，请再次确认以下内容：
      </p>
      <p class="screen__lead-en">
        This submission will create <strong>{{ reviewSections.length }}</strong> record(s). One
        application reference number will be generated after submission. Please review every field
        below:
      </p>

      <div class="review-sections">
        <section
          v-for="section in reviewSections"
          :key="section.level"
          class="review-section"
          :aria-labelledby="`review-${section.level}`"
        >
          <header class="review-section__header">
            <div>
              <h2 :id="`review-${section.level}`" class="review-section__title">
                {{ section.titleZh }}
              </h2>
              <span class="review-section__title-en">{{ section.titleEn }}</span>
            </div>
            <NButton text type="primary" @click="router.push(section.editPath)">
              <template #icon><NIcon :component="PencilOutline" /></template>
              返回修改 <span class="review-section__edit-en">Edit</span>
            </NButton>
          </header>

          <dl class="review-fields">
            <div v-for="field in section.fields" :key="field.key" class="review-field">
              <dt>
                <span>{{ field.labelZh }}</span>
                <span class="review-field__label-en">{{ field.labelEn }}</span>
              </dt>
              <dd>
                <div v-if="Array.isArray(field.value)" class="review-field__tags">
                  <NTag v-for="item in field.value" :key="item" size="small" round>
                    {{ item }}
                  </NTag>
                </div>
                <div v-else-if="field.kind === 'secret'" class="review-field__secret">
                  <code>{{ isSecretVisible(section.level, field.key) ? field.secretValue : field.value }}</code>
                  <NButton
                    text
                    size="small"
                    :aria-label="
                      isSecretVisible(section.level, field.key)
                        ? '隐藏测试密码 Hide test password'
                        : '显示测试密码 Show test password'
                    "
                    @click="toggleSecret(section.level, field.key)"
                  >
                    <template #icon>
                      <NIcon
                        :component="
                          isSecretVisible(section.level, field.key) ? EyeOffOutline : EyeOutline
                        "
                      />
                    </template>
                    {{ isSecretVisible(section.level, field.key) ? '隐藏 Hide' : '显示 Show' }}
                  </NButton>
                </div>
                <a
                  v-else-if="field.kind === 'link'"
                  :href="field.value"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ field.value }}
                </a>
                <span v-else :class="{ 'review-field__mono': ['code', 'adminAccount'].includes(field.key) }">
                  {{ field.value }}
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div class="declaration">
        <NCheckbox
          :checked="store.declarationChecked"
          @update:checked="(v: boolean) => (store.declarationChecked = v)"
        >
          我已确认以上资料正确无误，送出后将无法自行修改，如需异动须联络客服并提供开线编号。
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
            安全验证
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
      next-label="确认送出"
      next-label-en="Confirm & Submit"
      :next-disabled="!store.canSubmit"
      hint="请勾选宣告并通过安全验证后才能送出"
      hint-en="Please check the declaration and pass the security verification to submit"
      @back="goBack"
      @next="handleSubmit"
    />

    <button type="button" class="preview-link" @click="previewRejection">
      <NIcon :component="AlertCircleOutline" size="13" />
      预览：整包拒绝画面（仅供画面检视，非实际送出结果）
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

.review-sections {
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-section {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: var(--color-surface-muted);
}

.review-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-divider);
  background: var(--color-surface-hover);
}

.review-section__title {
  display: inline;
  margin: 0;
  font-size: 16px;
  color: var(--color-text);
}

.review-section__title-en,
.review-section__edit-en {
  margin-left: 5px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.review-fields {
  margin: 0;
  padding: 4px 14px;
}

.review-field {
  display: grid;
  grid-template-columns: minmax(118px, 0.38fr) minmax(0, 1fr);
  gap: 18px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-divider);
  font-size: 15px;
}

.review-field:last-child {
  border-bottom: 0;
}

.review-field dt {
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.review-field__label-en {
  font-size: 13px;
  color: var(--color-text-muted);
}

.review-field dd {
  min-width: 0;
  margin: 0;
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.review-field dd a {
  color: var(--color-primary);
  text-underline-offset: 3px;
}

.review-field dd a:hover {
  color: var(--color-primary-hover);
}

.review-field__mono,
.review-field__secret code {
  font-family: ui-monospace, 'SF Mono', 'Roboto Mono', monospace;
}

.review-field__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.review-field__secret {
  display: flex;
  align-items: center;
  gap: 10px;
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

@media (max-width: 560px) {
  .review-field {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .review-field dt {
    flex-direction: row;
    align-items: baseline;
    gap: 6px;
  }
}
</style>
