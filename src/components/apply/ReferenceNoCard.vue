<script setup lang="ts">
import { NButton, NIcon, useMessage } from 'naive-ui'
import { CopyOutline } from '@vicons/ionicons5'

const props = defineProps<{
  referenceNo: string
}>()

const emit = defineEmits<{ (event: 'copied'): void }>()

const message = useMessage()

async function copy() {
  try {
    await navigator.clipboard.writeText(props.referenceNo)
    emit('copied')
    message.success('已复制开线编号 / Application number copied')
  } catch {
    message.warning('复制失败，请手动选取文字 / Copy failed; please select the text manually')
  }
}
</script>

<template>
  <div class="reference-card">
    <span class="reference-card__label">开线编号 Application Reference No.</span>
    <div class="reference-card__row">
      <span class="reference-card__value">{{ referenceNo }}</span>
      <NButton size="small" secondary @click="copy">
        <template #icon>
          <NIcon :component="CopyOutline" aria-hidden="true" />
        </template>
        复制 Copy
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.reference-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.reference-card__label {
  font-size: 14px;
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

.reference-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
}

.reference-card__value {
  min-width: 0;
  max-width: 100%;
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  font-size: clamp(22px, 5vw, 30px);
  font-weight: 700;
  color: var(--color-primary-pressed);
  letter-spacing: 0.03em;
  overflow-wrap: anywhere;
}

.reference-card :deep(.n-button) {
  min-height: 44px;
  padding-inline: 16px;
}

@media (max-width: 480px) {
  .reference-card__row {
    align-items: stretch;
    flex-direction: column;
  }

  .reference-card :deep(.n-button) {
    width: 100%;
  }
}
</style>
