<script setup lang="ts">
import { NButton, NIcon, NTag } from 'naive-ui'
import { AlertCircleOutline, ArrowForwardOutline } from '@vicons/ionicons5'

export interface SubmitErrorItem {
  level: 'A' | 'MA' | 'SMA'
  fieldLabel: string
  fieldLabelEn: string
  message: string
  messageEn: string
  routePath: string
  anchorId?: string
}

const props = defineProps<{
  errors: SubmitErrorItem[]
}>()

const emit = defineEmits<{ (e: 'goto', item: SubmitErrorItem): void }>()

const levelLabel: Record<SubmitErrorItem['level'], string> = {
  A: '营运商 A',
  MA: '代理 MA',
  SMA: '总代理 SMA',
}
const levelLabelEn: Record<SubmitErrorItem['level'], string> = {
  A: 'Operator A',
  MA: 'Agent MA',
  SMA: 'Super Agent SMA',
}
</script>

<template>
  <ul class="error-summary" role="list">
    <li v-for="(item, i) in props.errors" :key="i" class="error-summary__item">
      <NIcon :component="AlertCircleOutline" size="18" class="error-summary__icon" />
      <div class="error-summary__body">
        <div class="error-summary__meta">
          <NTag size="small" round :bordered="false">
            {{ levelLabel[item.level] }}
            <span class="error-summary__role-en">{{ levelLabelEn[item.level] }}</span>
          </NTag>
          <span class="error-summary__field">
            {{ item.fieldLabel }}
            <span class="error-summary__field-en">{{ item.fieldLabelEn }}</span>
          </span>
        </div>
        <p class="error-summary__message">{{ item.message }}</p>
        <p class="error-summary__message-en">{{ item.messageEn }}</p>
      </div>
      <NButton text type="error" size="small" @click="emit('goto', item)">
        前往此栏位 Go to field
        <template #icon>
          <NIcon :component="ArrowForwardOutline" />
        </template>
      </NButton>
    </li>
  </ul>
</template>

<style scoped>
.error-summary {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.error-summary__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--color-error-border);
  background: var(--color-error-soft);
  border-radius: 8px;
}

.error-summary__icon {
  color: var(--color-error);
  flex: none;
  margin-top: 2px;
}

.error-summary__body {
  flex: 1;
  min-width: 0;
}

.error-summary__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.error-summary__role-en {
  font-size: 13px;
  opacity: 0.75;
  margin-left: 3px;
}

.error-summary__field {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.error-summary__field-en {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted);
  margin-left: 4px;
}

.error-summary__message {
  margin: 0;
  font-size: 15px;
  color: var(--color-error-strong);
}

.error-summary__message-en {
  margin: 2px 0 0;
  font-size: 14px;
  color: var(--color-error);
}
</style>
