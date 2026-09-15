<script setup lang="ts">
import { computed } from 'vue'
import type { CompanyLevel } from '@/types/apply'

/**
 * 组织阶层示意图：让使用者理解 SMA / MA / A 三个角色的上下关系，
 * 纯说明用途，不含任何内部代号（GF_MA 等）。
 */
const props = withDefaults(
  defineProps<{
    levels?: CompanyLevel[]
    compact?: boolean
  }>(),
  {
    levels: () => ['SMA', 'MA', 'A'],
    compact: false,
  },
)

const hierarchyOrder: CompanyLevel[] = ['SMA', 'MA', 'A']
const levelLabel: Record<CompanyLevel, string> = {
  SMA: '总代理 SMA',
  MA: '代理 MA',
  A: '营运商 A',
}

const visibleLevels = computed(() => hierarchyOrder.filter((level) => props.levels.includes(level)))
const treeText = computed(() =>
  visibleLevels.value
    .map((level, index) => `${index === 0 ? '' : `${'   '.repeat(index - 1)}└─ `}${levelLabel[level]}`)
    .join('\n'),
)
const hierarchyLabel = computed(() => `申请阶层：${visibleLevels.value.map((level) => levelLabel[level]).join('，')}`)
</script>

<template>
  <div class="org-hierarchy" :class="{ 'is-compact': compact }">
    <pre class="org-hierarchy__tree" :aria-label="hierarchyLabel">{{ treeText }}</pre>

    <div v-if="!compact" class="org-hierarchy__text">
      <p class="org-hierarchy__zh">
        SMA、MA 是用来管理下层帐号的代理阶层；A 是实际串接产品商及营运站台的营运商。
      </p>
      <p class="org-hierarchy__en">
        SMA and MA are agent levels used to manage subordinate accounts. A is the operator that
        integrates vendors and operates the website.
      </p>
      <p class="org-hierarchy__zh">
        请依照本次需要建立的完整阶层选择申请组合。每次申请最多建立一组资料。
      </p>
      <p class="org-hierarchy__en">
        Select the application type based on the complete hierarchy you need to create. Each
        application can create only one set of records.
      </p>
    </div>
  </div>
</template>

<style scoped>
.org-hierarchy {
  display: grid;
  grid-template-columns: minmax(300px, 0.86fr) minmax(0, 1.14fr);
  gap: 32px;
  padding: 24px 26px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-muted);
  box-shadow: var(--shadow-card);
  margin-bottom: 20px;
}

.org-hierarchy__tree {
  width: fit-content;
  min-width: 174px;
  margin: 0 auto;
  padding: 16px 18px;
  border: 1px solid var(--color-border-strong);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.8;
  white-space: pre;
  align-self: center;
}

.org-hierarchy.is-compact {
  display: block;
  width: 100%;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  background: var(--color-surface-muted);
}

.org-hierarchy.is-compact .org-hierarchy__tree {
  min-width: 190px;
}

.org-hierarchy__text {
  flex: 1;
  min-width: 0;
}

.org-hierarchy__zh {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.org-hierarchy__en {
  margin: 3px 0 12px;
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.65;
}

.org-hierarchy__en:last-child {
  margin-bottom: 0;
}

@media (max-width: 720px) {
  .org-hierarchy {
    grid-template-columns: 1fr;
    gap: 22px;
    padding: 22px 18px;
  }
}
</style>
