<script setup lang="ts">
/** 欄位下方的中英雙語格式提示（比 BilingualHint 更輕量、無邊框，用於一般規則說明）。 */
defineProps<{
  zh: string
  en: string
}>()
</script>

<template>
  <p class="field-hint">
    <span class="field-hint__zh">{{ zh }}</span>
    <span class="field-hint__en">{{ en }}</span>
  </p>
</template>

<style scoped>
.field-hint {
  margin: 6px 2px 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.field-hint__zh {
  font-size: 14px;
  color: var(--color-text-muted);
}

.field-hint__en {
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
