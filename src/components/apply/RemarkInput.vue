<script setup lang="ts">
/**
 * 客戶備註輸入：最多 250 字，字數顯示在提示列右側（不放在輸入框內，避免蓋到文字）。
 * 營運商 A、代理 MA、總代理 SMA 共用。
 */
import { computed } from 'vue'
import { NInput } from 'naive-ui'
import FieldHint from './FieldHint.vue'
import { REMARK_MAX_LENGTH } from '@/utils/validators'

const props = defineProps<{
  modelValue: string
  countId: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

// 與原生 maxlength 同樣以字串長度計算，確保字數顯示與可輸入上限一致
const count = computed(() => props.modelValue.length)
</script>

<template>
  <NInput
    :value="modelValue"
    type="textarea"
    :autosize="{ minRows: 2, maxRows: 4 }"
    :maxlength="REMARK_MAX_LENGTH"
    placeholder="选填，如有额外需求可在此说明"
    :input-props="{ 'aria-describedby': countId }"
    @update:value="(value: string) => emit('update:modelValue', value)"
  />
  <div class="remark-input__footer">
    <FieldHint
      zh="可自由填写额外需求，非必填，最多 250 字。"
      en="Optional — describe any extra requirements here, up to 250 characters."
    />
    <span
      :id="countId"
      class="remark-input__count"
      :aria-label="`已输入 ${count} / ${REMARK_MAX_LENGTH} 字 / ${count} of ${REMARK_MAX_LENGTH} characters used`"
    >
      {{ count }} / {{ REMARK_MAX_LENGTH }}
    </span>
  </div>
</template>

<style scoped>
.remark-input__footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.remark-input__count {
  flex: none;
  margin-top: 6px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}
</style>
