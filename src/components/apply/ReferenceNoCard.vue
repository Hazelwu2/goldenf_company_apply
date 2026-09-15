<script setup lang="ts">
import { NButton, NIcon, useMessage } from 'naive-ui'
import { CopyOutline } from '@vicons/ionicons5'

const props = defineProps<{
  referenceNo: string
}>()

const message = useMessage()

async function copy() {
  try {
    await navigator.clipboard.writeText(props.referenceNo)
    message.success('已複製開線編號')
  } catch {
    message.warning('複製失敗，請手動選取文字')
  }
}
</script>

<template>
  <div class="reference-card">
    <span class="reference-card__label">開線編號 Application Reference No.</span>
    <div class="reference-card__row">
      <span class="reference-card__value">{{ referenceNo }}</span>
      <NButton size="small" secondary @click="copy">
        <template #icon>
          <NIcon :component="CopyOutline" />
        </template>
        複製 Copy
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.reference-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 24px;
  border-radius: 8px;
  background: var(--color-success-soft);
  border: 1px solid var(--color-success-border);
  box-shadow: var(--shadow-card);
}

.reference-card__label {
  font-size: 14px;
  color: var(--color-success);
  letter-spacing: 0.02em;
}

.reference-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.reference-card__value {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  font-size: clamp(22px, 5vw, 30px);
  font-weight: 700;
  color: var(--color-primary-pressed);
  letter-spacing: 0.03em;
  word-break: break-all;
}
</style>
