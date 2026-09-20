<script setup lang="ts">
/** 栏位下方的双语格式错误提示，供单笔与多笔栏位共用。 */
defineProps<{ zh: string; en: string }>()
</script>

<template>
  <div class="field-error" role="alert">
    <span class="field-error__zh">{{ zh }}</span>
    <span class="field-error__en">{{ en }}</span>
  </div>
</template>

<style scoped>
.field-error {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-top: 8px;
  padding: 9px 11px;
  border: 1px solid var(--color-error-border);
  border-radius: 7px;
  background: var(--color-error-soft);
  color: var(--color-error-strong);
}

.field-error__zh {
  font-size: 14px;
  font-weight: 600;
}

.field-error__en {
  font-size: 13px;
}
</style>
