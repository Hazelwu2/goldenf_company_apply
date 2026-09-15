<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CheckmarkOutline, LockClosedOutline } from '@vicons/ionicons5'
import type { ApplyStep } from '@/composables/useApplySteps'

const props = defineProps<{
  steps: ApplyStep[]
}>()

const emit = defineEmits<{
  (e: 'navigate', path: string): void
}>()

function onStepClick(step: ApplyStep) {
  if (step.status === 'done') emit('navigate', step.path)
}
</script>

<template>
  <ol class="stepper" role="list" aria-label="申請進度">
    <li
      v-for="(step, i) in props.steps"
      :key="step.key"
      class="stepper__item"
      :class="`is-${step.status}`"
    >
      <button
        type="button"
        class="stepper__node"
        :disabled="step.status !== 'done'"
        :aria-current="step.status === 'current' ? 'step' : undefined"
        @click="onStepClick(step)"
      >
        <span class="stepper__circle">
          <NIcon v-if="step.status === 'done'" size="14" :component="CheckmarkOutline" />
          <NIcon v-else-if="step.status === 'locked'" size="13" :component="LockClosedOutline" />
          <span v-else>{{ i + 1 }}</span>
        </span>
        <span class="stepper__label">{{ step.label }}</span>
      </button>
      <span v-if="i < props.steps.length - 1" class="stepper__connector" aria-hidden="true" />
    </li>
  </ol>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: flex-start;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.stepper__item {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.stepper__item:last-child {
  flex: 0 0 auto;
}

.stepper__node {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: default;
  font-family: inherit;
  color: inherit;
  text-align: left;
}

.is-done .stepper__node {
  cursor: pointer;
}

.stepper__circle {
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  background: var(--color-surface);
  transition: all 0.2s ease;
}

.stepper__label {
  font-size: 15px;
  white-space: nowrap;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

/* done */
.is-done .stepper__circle {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}
.is-done .stepper__label {
  color: var(--color-text-secondary);
}

/* current */
.is-current .stepper__circle {
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--focus-ring);
}
.is-current .stepper__label {
  color: var(--color-text);
  font-weight: 600;
}

/* locked */
.is-locked .stepper__circle {
  background: var(--color-surface-muted);
  border-color: var(--color-border);
  color: var(--color-text-disabled);
}
.is-locked .stepper__label {
  color: var(--color-text-disabled);
}

.stepper__connector {
  flex: 1 1 auto;
  height: 1.5px;
  background: var(--color-border);
  margin: 0 10px;
  min-width: 16px;
}
.is-done .stepper__connector {
  background: var(--color-primary-suppl);
}

@media (max-width: 680px) {
  .stepper__label {
    display: none;
  }
  .stepper__connector {
    margin: 0 6px;
  }
}
</style>
