<script setup lang="ts">
/**
 * 獨立於欄位格式提示之外的中英雙語提示區塊（例如地區限制說明）。
 * 純文字提示，不做任何驗證邏輯。
 */
defineProps<{
  zh: string
  en: string
}>()
</script>

<template>
  <div class="bilingual-hint">
    <p class="bilingual-hint__zh">{{ zh }}</p>
    <p class="bilingual-hint__en">{{ en }}</p>
  </div>
</template>

<style scoped>
.bilingual-hint {
  margin-top: 10px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-muted);
  box-shadow: var(--shadow-card);
}

.bilingual-hint__zh {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.bilingual-hint__en {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
