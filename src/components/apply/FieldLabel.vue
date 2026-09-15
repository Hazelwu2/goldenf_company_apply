<script setup lang="ts">
/** NFormItem #label 插槽用的中英雙語標籤（中文為主、英文為輔助小字）。 */
defineProps<{
  zh: string
  en: string
}>()
</script>

<template>
  <span class="field-label">
    <span class="field-label__zh">{{ zh }}</span>
    <span class="field-label__en">{{ en }}</span>
  </span>
</template>

<style scoped>
.field-label {
  display: inline-flex;
  flex-direction: column;
  line-height: 1.35;
  padding: 2px 0;
}

.field-label__zh {
  font-size: 16px;
  color: var(--color-text);
}

.field-label__en {
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
