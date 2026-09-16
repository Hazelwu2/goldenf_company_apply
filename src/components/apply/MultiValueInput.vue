<script setup lang="ts">
import { computed, ref } from 'vue'
import { NInput, NTag } from 'naive-ui'
import { splitEntries } from '@/utils/validators'
import FieldHint from './FieldHint.vue'

/**
 * 可填多笔的栏位：输入或贴上后以逗号、分号、空白或换行切成一个个标签，
 * 各自可单独移除。值以阵列保存，形状与 API payload 一致。
 * 供后台白名单、API 白名单与联络 Email 共用。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string[]
    /** 单笔项目的格式验证，用来标示格式错误的项目。 */
    validate: (entry: string) => boolean
    /** 格式错误提示（中文）。 */
    errorZh: string
    /** 格式错误提示（英文）。 */
    errorEn: string
    hintZh?: string
    hintEn?: string
    placeholder?: string
    disabled?: boolean
    inputId?: string
    /** IP、代码等机器值以等宽字体呈现。 */
    mono?: boolean
  }>(),
  { disabled: false, mono: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const draft = ref('')

const invalidEntries = computed(() => props.modelValue.filter((entry) => !props.validate(entry)))

/** 将草稿内容切成多笔并加入，重复值略过。 */
function commitDraft(raw: string) {
  const additions = splitEntries(raw).filter((entry) => !props.modelValue.includes(entry))
  if (additions.length > 0) emit('update:modelValue', [...props.modelValue, ...additions])
  draft.value = ''
}

/** 一输入到分隔字元就立刻成为标签，贴上多笔时也能一次拆开。 */
function handleInput(value: string) {
  if (/[\s,;]/.test(value)) {
    commitDraft(value)
    return
  }
  draft.value = value
}

function handleBlur() {
  if (draft.value.trim()) commitDraft(draft.value)
}

function removeAt(index: number) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}

/** 输入框为空时按退格，移除最后一笔，符合一般标签输入的操作习惯。 */
function handleBackspace() {
  if (draft.value === '' && props.modelValue.length > 0) {
    removeAt(props.modelValue.length - 1)
  }
}
</script>

<template>
  <div class="multi-value">
    <div v-if="modelValue.length" class="multi-value__tags" :class="{ 'is-mono': props.mono }">
      <NTag
        v-for="(entry, i) in modelValue"
        :key="`${entry}-${i}`"
        size="small"
        round
        :type="props.validate(entry) ? 'default' : 'error'"
        :closable="!props.disabled"
        :disabled="props.disabled"
        @close="removeAt(i)"
      >
        {{ entry }}
      </NTag>
    </div>
    <NInput
      :input-props="{ id: props.inputId }"
      :value="draft"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      class="multi-value__field"
      :class="{ 'is-mono': props.mono }"
      @update:value="handleInput"
      @blur="handleBlur"
      @keydown.enter.prevent="commitDraft(draft)"
      @keydown.backspace="handleBackspace"
    />
    <FieldHint v-if="props.hintZh && props.hintEn" :zh="props.hintZh" :en="props.hintEn" />
    <div v-if="invalidEntries.length" class="multi-value__error" role="alert">
      <span class="multi-value__error-zh">{{ props.errorZh }}</span>
      <span class="multi-value__error-en">{{ props.errorEn }}</span>
    </div>
  </div>
</template>

<style scoped>
.multi-value__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
}

.multi-value__tags.is-mono :deep(.n-tag__content),
.multi-value__field.is-mono :deep(input) {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
}

.multi-value__field.is-mono :deep(input) {
  font-size: 15px;
}

.multi-value__error {
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

.multi-value__error-zh {
  font-size: 14px;
  font-weight: 600;
}

.multi-value__error-en {
  font-size: 13px;
}
</style>
