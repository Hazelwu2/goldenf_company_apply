<script setup lang="ts">
/**
 * 独立于栏位格式提示之外的中英双语提示区块（例如地区限制说明）。
 * 纯文字提示，不做任何验证逻辑。
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
