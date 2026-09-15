<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { ArrowBackOutline, ArrowForwardOutline } from '@vicons/ionicons5'

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
  },
)

const emit = defineEmits<{ (e: 'back'): void; (e: 'next'): void }>()
</script>

<template>
  <div class="step-footer">
    <div v-if="props.nextDisabled && props.hint" class="step-footer__hint">
      <p class="step-footer__hint-zh">{{ props.hint }}</p>
      <p v-if="props.hintEn" class="step-footer__hint-en">{{ props.hintEn }}</p>
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
        :disabled="props.nextDisabled"
        :loading="props.nextLoading"
        @click="emit('next')"
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
  margin: 0 0 10px;
  text-align: right;
}

.step-footer__hint-zh {
  margin: 0;
  font-size: 14px;
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

</style>
