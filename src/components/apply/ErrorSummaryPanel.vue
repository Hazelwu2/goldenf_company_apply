<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NTag } from 'naive-ui'
import { AlertCircleOutline, ArrowForwardOutline } from '@vicons/ionicons5'
import {
  groupSubmitErrors,
  type SubmitErrorItem,
  type SubmitErrorLevel,
} from '@/utils/submitErrors'

const props = defineProps<{
  errors: SubmitErrorItem[]
}>()

const emit = defineEmits<{ (e: 'goto', item: SubmitErrorItem): void }>()

const levelLabel: Record<SubmitErrorLevel, string> = {
  A: '营运商 A',
  MA: '代理 MA',
  SMA: '总代理 SMA',
}
const levelLabelEn: Record<SubmitErrorLevel, string> = {
  A: 'Operator A',
  MA: 'Agent MA',
  SMA: 'Super Agent SMA',
}

const groups = computed(() => groupSubmitErrors(props.errors))

function errorCountEn(count: number) {
  return `${count} ${count === 1 ? 'error' : 'errors'}`
}

function itemKey(item: SubmitErrorItem) {
  return [item.level, item.routePath, item.anchorId, item.fieldLabel, item.message].join(':')
}
</script>

<template>
  <div class="error-summary">
    <section
      v-for="group in groups"
      :key="group.level"
      class="error-summary__group"
      :aria-labelledby="`error-group-${group.level}`"
    >
      <div class="error-summary__group-head">
        <h3 :id="`error-group-${group.level}`" class="error-summary__group-title">
          {{ levelLabel[group.level] }}
          <span class="error-summary__group-title-en">{{ levelLabelEn[group.level] }}</span>
        </h3>
        <NTag size="small" type="error" :bordered="false" round>
          {{ group.errors.length }} 个错误
          <span class="error-summary__count-en">{{ errorCountEn(group.errors.length) }}</span>
        </NTag>
      </div>

      <ul class="error-summary__list" role="list">
        <li v-for="item in group.errors" :key="itemKey(item)" class="error-summary__item">
          <NIcon
            :component="AlertCircleOutline"
            size="18"
            class="error-summary__icon"
            aria-hidden="true"
          />
          <div class="error-summary__body">
            <div class="error-summary__meta">
              <span class="error-summary__field">
                {{ item.fieldLabel }}
                <span class="error-summary__field-en">{{ item.fieldLabelEn }}</span>
              </span>
            </div>
            <p class="error-summary__message">{{ item.message }}</p>
            <p class="error-summary__message-en">{{ item.messageEn }}</p>
          </div>
          <NButton
            text
            type="error"
            size="small"
            class="error-summary__action"
            @click="emit('goto', item)"
          >
            前往此栏位 Go to field
            <template #icon>
              <NIcon :component="ArrowForwardOutline" aria-hidden="true" />
            </template>
          </NButton>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.error-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-summary__group {
  min-width: 0;
}

.error-summary__group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-error-border);
}

.error-summary__group-title {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  color: var(--color-text);
}

.error-summary__group-title-en,
.error-summary__count-en {
  margin-left: 5px;
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted);
}

.error-summary__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-summary__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--color-error-border);
  background: var(--color-error-soft);
  border-radius: 7px;
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

.error-summary__action {
  flex: none;
  min-height: 44px;
  align-self: center;
}

@media (max-width: 600px) {
  .error-summary__group-head {
    align-items: flex-start;
  }

  .error-summary__item {
    flex-wrap: wrap;
  }

  .error-summary__action {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
