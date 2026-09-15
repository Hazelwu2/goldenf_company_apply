<script setup lang="ts">
import { computed } from 'vue'
import { NInput, NTag } from 'naive-ui'
import { isValidWhitelistEntry, splitWhitelist } from '@/utils/validators'
import FieldHint from './FieldHint.vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
  inputId?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const invalidEntries = computed(() =>
  splitWhitelist(props.modelValue).filter((ip) => !isValidWhitelistEntry(ip)),
)
</script>

<template>
  <div class="whitelist">
    <NInput
      :input-props="{ id: props.inputId }"
      :value="modelValue"
      type="textarea"
      :disabled="disabled"
      :placeholder="
        placeholder ?? '可多筆，以逗號、空白或換行分隔，例如：\n203.0.113.10\n198.51.100.0/24'
      "
      :autosize="{ minRows: 2, maxRows: 5 }"
      class="whitelist__field"
      @update:value="(v: string) => emit('update:modelValue', v)"
    />
    <FieldHint
      zh="可輸入一筆或多筆 IP，請使用逗號、空白或換行分隔。"
      en="Enter one or multiple IP addresses, separated by commas, spaces, or line breaks."
    />
    <div v-if="invalidEntries.length" class="whitelist__error" role="alert">
      <div class="whitelist__error-message">
        <span class="whitelist__error-zh">IP 格式錯誤</span>
        <span class="whitelist__error-en">Invalid IP format</span>
      </div>
      <div class="whitelist__tags">
        <NTag
          v-for="(ip, i) in invalidEntries"
          :key="`${ip}-${i}`"
          size="small"
          type="error"
          round
        >
          {{ ip }}
        </NTag>
      </div>
    </div>
  </div>
</template>

<style scoped>
.whitelist__field :deep(textarea) {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  font-size: 15px;
}

.whitelist__error {
  margin-top: 8px;
  padding: 9px 11px;
  border: 1px solid var(--color-error-border);
  border-radius: 7px;
  background: var(--color-error-soft);
}

.whitelist__error-message {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-bottom: 7px;
  color: var(--color-error-strong);
}

.whitelist__error-zh {
  font-size: 14px;
  font-weight: 600;
}

.whitelist__error-en {
  font-size: 13px;
}

.whitelist__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.whitelist__tags :deep(.n-tag__content) {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}
</style>
