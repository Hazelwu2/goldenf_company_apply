<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { AlertCircleOutline, ArrowBackOutline, ArrowForwardOutline } from '@vicons/ionicons5'

const props = withDefaults(
  defineProps<{
    backLabel?: string
    backLabelEn?: string
    showBack?: boolean
    nextLabel?: string
    nextLabelEn?: string
    nextDisabled?: boolean
    nextLoading?: boolean
    hint?: string
    hintEn?: string
    /** 保留停用视觉，但允许触发错误栏位导引。 */
    allowDisabledAttempt?: boolean
  }>(),
  {
    backLabel: '上一步',
    backLabelEn: 'Back',
    showBack: true,
    nextLabel: '下一步',
    nextLabelEn: 'Next',
    nextDisabled: false,
    nextLoading: false,
    hint: '',
    hintEn: '',
    allowDisabledAttempt: false,
  },
)

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'next'): void
  (e: 'invalid-next'): void
}>()

function handleNext() {
  if (props.nextLoading) return
  if (props.nextDisabled) {
    emit('invalid-next')
    return
  }
  emit('next')
}
</script>

<template>
  <div class="step-footer">
    <div v-if="props.nextDisabled && props.hint" class="step-footer__hint">
      <NIcon
        class="step-footer__hint-icon"
        :component="AlertCircleOutline"
        size="18"
        aria-hidden="true"
      />
      <div class="step-footer__hint-copy">
        <p class="step-footer__hint-zh">{{ props.hint }}</p>
        <p v-if="props.hintEn" class="step-footer__hint-en">{{ props.hintEn }}</p>
      </div>
    </div>
    <div class="step-footer__actions">
      <NButton v-if="props.showBack" quaternary @click="emit('back')">
        <template #icon>
          <NIcon :component="ArrowBackOutline" />
        </template>
        <span class="step-footer__btn-label">
          {{ props.backLabel }}
          <span class="step-footer__btn-en">{{ props.backLabelEn }}</span>
        </span>
      </NButton>
      <div v-else />
      <NButton
        type="primary"
        :disabled="props.nextDisabled && !props.allowDisabledAttempt"
        :class="{ 'is-disabled-attempt': props.nextDisabled && props.allowDisabledAttempt }"
        :title="
          props.nextDisabled && props.allowDisabledAttempt
            ? '定位第一个未完成栏位 / Go to the first invalid field'
            : undefined
        "
        :loading="props.nextLoading"
        @click="handleNext"
      >
        <span class="step-footer__btn-label">
          {{ props.nextLabel }}
          <span class="step-footer__btn-en">{{ props.nextLabelEn }}</span>
        </span>
        <template #icon>
          <NIcon :component="ArrowForwardOutline" />
        </template>
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.step-footer {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid var(--color-divider);
}

.step-footer__hint {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  margin: 0 0 12px auto;
  padding: 8px 10px;
  border: 1px solid var(--color-warning-border);
  border-radius: 6px;
  background: var(--color-warning-soft);
  text-align: left;
}

.step-footer__hint-icon {
  flex: none;
  margin-top: 1px;
  color: var(--color-warning);
}

.step-footer__hint-copy {
  min-width: 0;
}

.step-footer__hint-zh {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-warning);
}

.step-footer__hint-en {
  margin: 1px 0 0;
  font-size: 13px;
  color: var(--color-warning);
}

.step-footer__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.step-footer__btn-label {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.step-footer__btn-en {
  font-size: 13px;
  opacity: 0.75;
  font-weight: 400;
}

.is-disabled-attempt {
  cursor: pointer;
  opacity: 0.5;
  filter: saturate(0.65);
}

</style>
