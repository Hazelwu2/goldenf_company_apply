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

const entries = computed(() =>
  splitWhitelist(props.modelValue).map((ip) => ({ ip, valid: isValidWhitelistEntry(ip) })),
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
    <div v-if="entries.length" class="whitelist__tags">
      <NTag
        v-for="(entry, i) in entries"
        :key="`${entry.ip}-${i}`"
        size="small"
        :type="entry.valid ? 'default' : 'error'"
        round
      >
        {{ entry.ip }}
      </NTag>
      <span class="whitelist__count">共 {{ entries.length }} 筆</span>
    </div>
  </div>
</template>

<style scoped>
.whitelist__field :deep(textarea) {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  font-size: 15px;
}

.whitelist__tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.whitelist__tags :deep(.n-tag__content) {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.whitelist__count {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-left: 2px;
}
</style>
