<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { NIcon, NInput, NTag } from 'naive-ui'
import { AlertCircleOutline } from '@vicons/ionicons5'
import { splitEntries } from '@/utils/validators'
import FieldHint from './FieldHint.vue'
import RequiredFieldError from './RequiredFieldError.vue'
import { buildMultiValueInputView } from './multiValueInputModel'

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
    externalStatus?: 'error'
    ariaDescribedby?: string
    showRequiredError?: boolean
  }>(),
  { disabled: false, mono: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const draft = ref('')
const generatedInputId = useId()
const resolvedInputId = computed(() => props.inputId ?? `multi-value-${generatedInputId}`)

const inputView = computed(() =>
  buildMultiValueInputView(props.modelValue, props.validate, props.errorZh, props.errorEn),
)

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

/**
 * 单行 input 会依 HTML 的 value sanitization 规则移除换行，
 * 直接读 value 会把「一行一笔」的贴上内容黏成一笔无效资料。
 * 因此改从剪贴簿取原始文字，赶在浏览器清理之前自行切分。
 */
function handlePaste(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text') ?? ''
  if (!pasted || !/[\s,;]/.test(pasted)) return
  event.preventDefault()
  commitDraft(`${draft.value}${pasted}`)
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

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    commitDraft(draft.value)
    return
  }
  if (event.key === 'Backspace') handleBackspace()
}
</script>

<template>
  <div class="multi-value">
    <div
      v-if="modelValue.length"
      class="multi-value__tags"
      :class="{ 'is-mono': props.mono }"
      :role="inputView.tagsRole"
    >
      <div
        v-for="(item, i) in inputView.items"
        :key="`${item.entry}-${i}`"
        class="multi-value__tag-item"
        :class="{ 'is-invalid': !item.valid }"
        :aria-invalid="!item.valid ? 'true' : undefined"
      >
        <NTag
          size="small"
          round
          :type="item.valid ? 'default' : 'error'"
          :closable="!props.disabled"
          :disabled="props.disabled"
          @close="removeAt(i)"
        >
          <NIcon
            v-if="!item.valid"
            class="multi-value__tag-icon"
            :component="AlertCircleOutline"
            size="15"
            :aria-hidden="inputView.errorIconAriaHidden"
          />
          {{ item.entry }}
        </NTag>
      </div>
    </div>
    <div
      v-if="inputView.summary"
      class="multi-value__summary"
      :role="inputView.alertRole"
      :aria-live="inputView.alertLive"
    >
      <NIcon
        class="multi-value__summary-icon"
        :component="AlertCircleOutline"
        size="16"
        :aria-hidden="inputView.summaryIconAriaHidden"
      />
      <span class="multi-value__summary-copy">
        <span class="multi-value__summary-zh">{{ inputView.summary.zh }}</span>
        <span class="multi-value__summary-en">{{ inputView.summary.en }}</span>
      </span>
    </div>
    <NInput
      :input-props="{
        id: resolvedInputId,
        onPaste: handlePaste,
        'aria-invalid':
          inputView.inputStatus === 'error' || props.externalStatus === 'error'
            ? 'true'
            : undefined,
        'aria-describedby': props.ariaDescribedby,
      }"
      :value="draft"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      :status="inputView.inputStatus ?? props.externalStatus"
      class="multi-value__field"
      :class="{ 'is-mono': props.mono }"
      @update:value="handleInput"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    <RequiredFieldError
      v-if="props.showRequiredError && props.ariaDescribedby"
      :id="props.ariaDescribedby"
    />
    <FieldHint v-if="props.hintZh && props.hintEn" :zh="props.hintZh" :en="props.hintEn" />
  </div>
</template>

<style scoped>
.multi-value__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.multi-value__tag-item {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: 100%;
}

/*
 * NTag 预设 white-space: nowrap 且高度固定，长 Email 或完整 IPv6 会超出栏位，
 * 再被卡片的 overflow: hidden 裁掉，连移除钮都点不到。
 * 改为限制宽度并允许在标签内换行，完整值与移除钮都保持可见。
 */
.multi-value__tags :deep(.n-tag) {
  max-width: 100%;
  height: auto;
  min-height: 22px;
  align-items: center;
  padding-top: 2px;
  padding-bottom: 2px;
}

.multi-value__tags :deep(.n-tag__content) {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.5;
}

.multi-value__tags :deep(.n-tag__close) {
  align-self: center;
}

.multi-value__tag-icon {
  flex: none;
  margin-right: 4px;
  color: var(--color-error);
}

.multi-value__tags.is-mono :deep(.n-tag__content),
.multi-value__field.is-mono :deep(input) {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
}

.multi-value__field.is-mono :deep(input) {
  font-size: 15px;
}

.multi-value__summary {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  margin-bottom: 6px;
  padding: 0 2px;
  color: var(--color-error-strong);
  line-height: 1.35;
}

.multi-value__summary-icon {
  flex: none;
  align-self: center;
  color: var(--color-error);
}

.multi-value__summary-copy {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 6px;
  min-width: 0;
}

.multi-value__summary-zh {
  font-size: 13px;
  font-weight: 600;
}

.multi-value__summary-en {
  min-width: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
