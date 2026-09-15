<script setup lang="ts">
import { computed } from 'vue'
import type { ConfirmationRecord } from '@/utils/applicationReview'

const props = defineProps<{
  records: ConfirmationRecord[]
}>()

const hierarchyText = computed(() =>
  props.records
    .map((record, index) => {
      const branch = index === 0 ? '' : `${'   '.repeat(index - 1)}└─ `
      const role = record.role.split(' / ')[0]
      return `${branch}${role} — (${record.code})`
    })
    .join('\n'),
)

const hierarchyLabel = computed(
  () =>
    `本次建立的申请阶层 / Created application hierarchy: ${props.records
      .map((record) => `${record.role}, ${record.code}`)
      .join('; ')}`,
)
</script>

<template>
  <div class="application-hierarchy">
    <pre class="application-hierarchy__tree" :aria-label="hierarchyLabel">{{ hierarchyText }}</pre>
  </div>
</template>

<style scoped>
.application-hierarchy {
  width: 100%;
  padding: 16px 18px;
  box-sizing: border-box;
  border: 1px solid var(--color-border-strong);
  border-radius: 7px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.application-hierarchy__tree {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
