<script setup lang="ts">
import { NButton, NModal } from 'naive-ui'
import type { VendorOption } from '@/utils/mockData'

defineProps<{
  show: boolean
  previousCurrency: string
  nextCurrency: string
  remove: VendorOption[]
  keep: VendorOption[]
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    class="currency-change-dialog"
    style="width: min(600px, calc(100vw - 32px)); background: var(--color-surface)"
    :bordered="false"
    :mask-closable="false"
    :closable="false"
    role="dialog"
    aria-modal="true"
    aria-labelledby="currency-change-title"
    @update:show="(visible) => !visible && emit('cancel')"
  >
    <template #header>
      <div class="currency-change-dialog__header">
        <span id="currency-change-title" class="currency-change-dialog__title">
          更换币别将影响已选产品商
        </span>
        <span class="currency-change-dialog__title-en">
          Changing the currency affects selected vendors
        </span>
      </div>
    </template>

    <div class="currency-change-dialog__body">
      <div class="currency-change-dialog__currencies" aria-label="币别变更 Currency change">
        <span>{{ previousCurrency }}</span>
        <span class="currency-change-dialog__arrow" aria-hidden="true">→</span>
        <strong>{{ nextCurrency }}</strong>
      </div>

      <section class="currency-change-dialog__section is-removal" aria-labelledby="remove-vendors-title">
        <div class="currency-change-dialog__section-heading">
          <div>
            <h3 id="remove-vendors-title">将取消勾选</h3>
            <p>Will be removed</p>
          </div>
          <span class="currency-change-dialog__count">{{ remove.length }}</span>
        </div>
        <p class="currency-change-dialog__intro">
          以下产品商不支持 {{ nextCurrency }}，确认后将自动取消勾选。
          <span>These vendors do not support {{ nextCurrency }} and will be deselected.</span>
        </p>
        <ul class="currency-change-dialog__list">
          <li v-for="vendor in remove" :key="vendor.code">
            <span>{{ vendor.nameZh }}</span>
            <span class="currency-change-dialog__status">不支持 {{ nextCurrency }} / Unavailable</span>
          </li>
        </ul>
      </section>

      <section v-if="keep.length" class="currency-change-dialog__section is-keep" aria-labelledby="keep-vendors-title">
        <div class="currency-change-dialog__section-heading">
          <div>
            <h3 id="keep-vendors-title">继续保留</h3>
            <p>Will be kept</p>
          </div>
          <span class="currency-change-dialog__count">{{ keep.length }}</span>
        </div>
        <p class="currency-change-dialog__intro">
          以下产品商支持 {{ nextCurrency }}，会继续保留勾选。
          <span>These vendors support {{ nextCurrency }} and will remain selected.</span>
        </p>
        <ul class="currency-change-dialog__list">
          <li v-for="vendor in keep" :key="vendor.code">
            <span>{{ vendor.nameZh }}</span>
            <span class="currency-change-dialog__status">支持 {{ nextCurrency }} / Kept</span>
          </li>
        </ul>
      </section>
    </div>

    <template #footer>
      <div class="currency-change-dialog__actions">
        <NButton size="large" @click="emit('cancel')">取消，维持原币别 / Cancel</NButton>
        <NButton type="primary" size="large" @click="emit('confirm')">
          确认更换并取消勾选 / Confirm change
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped>
.currency-change-dialog__header {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.currency-change-dialog__title {
  color: var(--color-text);
  font-size: 21px;
  font-weight: 700;
}

.currency-change-dialog__title-en {
  color: var(--color-text-muted);
  font-size: 15px;
}

.currency-change-dialog__body {
  display: grid;
  gap: 18px;
}

.currency-change-dialog__currencies {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: 18px;
  font-weight: 700;
}

.currency-change-dialog__currencies > :is(span:first-child, strong) {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-tag-surface);
}

.currency-change-dialog__currencies strong {
  border-color: var(--color-border-strong);
  color: var(--color-primary);
}

.currency-change-dialog__arrow {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
}

.currency-change-dialog__section {
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  background: var(--color-surface-muted);
}

.currency-change-dialog__section.is-removal {
  border-color: var(--color-warning-border);
  background: var(--color-warning-soft);
}

.currency-change-dialog__section.is-keep {
  border-color: var(--color-success-border);
  background: var(--color-success-soft);
}

.currency-change-dialog__section-heading,
.currency-change-dialog__list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.currency-change-dialog__section-heading h3,
.currency-change-dialog__section-heading p,
.currency-change-dialog__intro {
  margin: 0;
}

.currency-change-dialog__section-heading h3 {
  color: var(--color-text);
  font-size: 16px;
}

.currency-change-dialog__section-heading p,
.currency-change-dialog__intro,
.currency-change-dialog__status {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.currency-change-dialog__count {
  min-width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 700;
}

.currency-change-dialog__intro {
  margin-top: 10px;
  line-height: 1.55;
}

.currency-change-dialog__intro span {
  display: block;
  color: var(--color-text-muted);
  font-size: 13px;
}

.currency-change-dialog__list {
  margin: 12px 0 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  background: var(--color-surface);
  list-style: none;
}

.currency-change-dialog__list li {
  min-height: 42px;
  padding: 8px 10px;
  color: var(--color-text);
  font-weight: 600;
}

.currency-change-dialog__list li + li {
  border-top: 1px solid var(--color-divider);
}

.is-removal .currency-change-dialog__status {
  color: var(--color-warning);
}

.is-keep .currency-change-dialog__status {
  color: var(--color-success);
}

.currency-change-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 520px) {
  .currency-change-dialog__title {
    font-size: 19px;
  }

  .currency-change-dialog__list li,
  .currency-change-dialog__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .currency-change-dialog__status {
    font-size: 13px;
  }

  .currency-change-dialog__actions :deep(.n-button) {
    width: 100%;
  }
}
</style>
