<script setup lang="ts">
import { computed } from 'vue'
import { NInput } from 'naive-ui'
import { normalizeCodeInput } from '@/utils/validators'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    inputId?: string
    /** 最大长度，预设 4（营运商代码规则）。代理代码请传 12。 */
    maxLength?: number
    /** 最小长度，仅用于字数提示与过短警示，预设 2。 */
    minLength?: number
    /** 是否允许数字，预设 true（营运商与代理代码皆为英数）。 */
    allowDigits?: boolean
    /** 是否提示不可含数字 0，预设 true（营运商代码规则）。代理代码请传 false。 */
    disallowZero?: boolean
  }>(),
  {
    placeholder: undefined,
    inputId: undefined,
    maxLength: 4,
    minLength: 2,
    allowDigits: true,
    disallowZero: true,
  },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

function handleInput(raw: string) {
  emit(
    'update:modelValue',
    normalizeCodeInput(raw, { maxLength: props.maxLength, allowDigits: props.allowDigits }),
  )
}

const length = computed(() => props.modelValue.length)
const isTooShort = computed(() => length.value > 0 && length.value < props.minLength)

const hintZh = computed(() => {
  const charset = props.allowDigits ? '英数' : '英文'
  const zeroNote = props.allowDigits && props.disallowZero ? '．不可含数字 0' : ''
  return `${charset} ${props.minLength}–${props.maxLength} 码．自动转大写${zeroNote}`
})

const hintEn = computed(() => {
  const charset = props.allowDigits ? 'alphanumeric characters' : 'letters'
  const zeroNote = props.allowDigits && props.disallowZero ? ', digit 0 not allowed' : ''
  return `${props.minLength}–${props.maxLength} ${charset}, auto-uppercase${zeroNote}`
})
</script>

<template>
  <div class="code-input">
    <NInput
      :input-props="{ id: props.inputId }"
      :value="modelValue"
      :placeholder="placeholder ?? '例如 GFAB'"
      class="code-input__field"
      @update:value="handleInput"
    />
    <p class="code-input__hint" :class="{ 'is-warn': isTooShort }">
      <span class="code-input__count">{{ length }}/{{ props.maxLength }}</span>
      <span class="code-input__rule">{{ hintZh }}</span>
    </p>
    <p class="code-input__hint-en">{{ hintEn }}</p>
  </div>
</template>

<style scoped>
.code-input__field :deep(.n-input__input-el) {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.code-input__hint {
  margin: 6px 2px 0;
  font-size: 14px;
  color: var(--color-text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  align-items: baseline;
}

.code-input__count {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.code-input__hint.is-warn .code-input__count {
  color: var(--color-warning);
}

.code-input__hint-en {
  margin: 1px 2px 0;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
