<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { AlertCircleOutline } from '@vicons/ionicons5'

/** 栏位下方的双语格式错误提示，供单笔与多笔栏位共用。 */
defineProps<{ zh: string; en: string; id?: string }>()
</script>

<template>
  <div :id="id" class="field-error" role="alert">
    <NIcon
      class="field-error__icon"
      :component="AlertCircleOutline"
      size="18"
      aria-hidden="true"
    />
    <span class="field-error__copy">
      <span class="field-error__zh">{{ zh }}</span>
      <span class="field-error__en">{{ en }}</span>
    </span>
  </div>
</template>

<style scoped>
.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 0 2px;
  color: var(--color-error-strong);
}

:global(:root.theme-dark) .field-error {
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  padding: 9px 11px;
  border: 1px solid var(--color-error-border);
  border-radius: 7px;
  background: var(--color-error-soft);
}

.field-error__icon {
  flex: none;
  color: var(--color-error);
}

:global(:root.theme-dark) .field-error__icon {
  margin-top: 1px;
}

.field-error__copy {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 8px;
  min-width: 0;
}

.field-error__zh {
  font-size: 14px;
  font-weight: 700;
}

.field-error__en {
  font-size: 13px;
}
</style>
