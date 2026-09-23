<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { GitNetworkOutline } from '@vicons/ionicons5'
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
  <div
    class="org-hierarchy"
    :class="{ 'is-compact': compact }"
    role="group"
    aria-label="申请阶层说明 / Application Hierarchy"
  >
    <header class="org-hierarchy__header">
      <span class="org-hierarchy__icon" aria-hidden="true">
        <NIcon :component="GitNetworkOutline" size="22" />
      </span>
      <div>
        <p class="org-hierarchy__title">申请阶层说明</p>
        <p class="org-hierarchy__title-en">Application Hierarchy</p>
      </div>
    </header>

    <div class="org-hierarchy__body">
      <pre class="org-hierarchy__tree" :aria-label="hierarchyLabel">{{ treeText }}</pre>

      <div v-if="!compact" class="org-hierarchy__text">
        <div class="org-hierarchy__summary">
          <p class="org-hierarchy__zh">
            SMA、MA 是用来管理下层帐号的代理阶层；A 是实际串接产品商及营运站台的营运商。
          </p>
          <p class="org-hierarchy__en">
            SMA and MA are agent levels used to manage subordinate accounts. A is the operator that
            integrates vendors and operates the website.
          </p>
        </div>
        <div class="org-hierarchy__notice">
          <p class="org-hierarchy__zh">
            请依照本次需要建立的完整阶层选择申请组合。每次申请最多建立一组资料。
          </p>
          <p class="org-hierarchy__en">
            Select the application type based on the complete hierarchy you need to create. Each
            application can create only one set of records.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.org-hierarchy {
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card-hover);
}

.org-hierarchy::before {
  position: absolute;
  top: 0;
  left: 22px;
  width: 72px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--color-primary);
  content: '';
}

.org-hierarchy__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 22px 16px;
  border-bottom: 1px solid var(--color-divider);
}

.org-hierarchy__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-primary-suppl);
  border-radius: 8px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.org-hierarchy__title,
.org-hierarchy__title-en {
  margin: 0;
}

.org-hierarchy__title {
  color: var(--color-text);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.org-hierarchy__title-en {
  margin-top: 1px;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.4;
}

.org-hierarchy__body {
  display: grid;
  grid-template-columns: minmax(300px, 0.86fr) minmax(0, 1.14fr);
  gap: 32px;
  padding: 22px;
}

.org-hierarchy__tree {
  width: fit-content;
  min-width: 174px;
  margin: 0 auto;
  padding: 16px 18px;
  border: 1px solid var(--color-primary-suppl);
  border-radius: 8px;
  background: var(--color-primary-soft);
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.8;
  white-space: pre;
  align-self: center;
}

.org-hierarchy.is-compact {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  box-shadow: var(--shadow-card);
}

.org-hierarchy.is-compact .org-hierarchy__header {
  padding: 14px 16px 12px;
}

.org-hierarchy.is-compact .org-hierarchy__icon {
  width: 34px;
  height: 34px;
}

.org-hierarchy.is-compact .org-hierarchy__body {
  display: block;
  padding: 16px;
}

.org-hierarchy.is-compact .org-hierarchy__tree {
  min-width: 190px;
}

.org-hierarchy__text {
  min-width: 0;
}

.org-hierarchy__summary {
  padding: 2px 0 4px;
}

.org-hierarchy__notice {
  margin-top: 14px;
  padding: 12px 14px;
  border-left: 3px solid var(--color-primary-suppl);
  border-radius: 0 6px 6px 0;
  background: var(--color-surface-muted);
}

.org-hierarchy__zh {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.org-hierarchy__en {
  margin: 3px 0 0;
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.65;
}

@media (max-width: 720px) {
  .org-hierarchy__body {
    grid-template-columns: 1fr;
    gap: 22px;
    padding: 20px 18px;
  }

  .org-hierarchy__header {
    padding-inline: 18px;
  }

  .org-hierarchy::before {
    left: 18px;
  }
}
</style>
