<script setup lang="ts">
import type { ComboOption } from '@/types/apply'

const props = defineProps<{
  option: ComboOption
  selected: boolean
}>()

const emit = defineEmits<{ (e: 'select'): void }>()
</script>

<template>
  <button
    type="button"
    class="combo-card"
    :class="{ 'is-selected': selected }"
    role="radio"
    :aria-checked="selected"
    @click="emit('select')"
  >
    <span class="combo-card__selector" aria-hidden="true">
      <span class="combo-card__radio" />
    </span>

    <div class="combo-card__content">
      <div class="combo-card__head">
        <div>
          <h3 class="combo-card__title">{{ props.option.title }}</h3>
          <p class="combo-card__title-en">{{ props.option.titleEn }}</p>
        </div>
        <div class="combo-card__levels" aria-label="建立層級">
          <span v-for="level in props.option.levels" :key="level" class="combo-card__level">
            {{ level }}
          </span>
        </div>
      </div>

      <p class="combo-card__desc">{{ props.option.description }}</p>
      <p class="combo-card__desc-en">{{ props.option.descriptionEn }}</p>
    </div>

  </button>
</template>

<style scoped>
.combo-card {
  position: relative;
  width: 100%;
  min-height: 126px;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  padding: 22px 24px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: var(--color-surface);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
  box-shadow:
    0 1px 0 rgba(37, 42, 39, 0.04),
    var(--shadow-card);
}

.combo-card:last-child {
  border-bottom: 1px solid var(--color-border);
}

.combo-card:hover {
  background: var(--color-surface-hover);
  transform: translate(-1px, -1px);
  box-shadow:
    0 2px 0 rgba(37, 42, 39, 0.04),
    var(--shadow-card-hover);
}

.combo-card:focus-visible {
  z-index: 1;
  outline: 3px solid var(--focus-ring);
  outline-offset: -3px;
}

.combo-card.is-selected {
  background: var(--color-primary-soft);
  border-color: var(--color-border-strong);
  box-shadow:
    inset 4px 0 0 var(--color-primary),
    var(--shadow-selected);
}

.combo-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 10px;
}

.combo-card__levels {
  display: flex;
  flex-direction: row-reverse;
  gap: 5px;
  flex: none;
}

.combo-card__level {
  min-width: 30px;
  height: 24px;
  padding: 0 7px;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  background: var(--color-tag-surface);
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 700;
}

.combo-card__selector {
  padding-top: 2px;
}

.combo-card__radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--color-control-border);
  display: inline-block;
  background: var(--color-surface);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.is-selected .combo-card__radio {
  border-color: var(--color-primary);
  box-shadow: inset 0 0 0 4px var(--color-surface);
  background: var(--color-primary);
}

.combo-card__title {
  margin: 0 0 3px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.combo-card__title-en {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-muted);
}

.combo-card__desc {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.65;
}

.combo-card__desc-en {
  margin: 3px 0 0;
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

@media (max-width: 700px) {
  .combo-card {
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 12px;
    padding: 20px 18px;
  }

  .combo-card__head {
    flex-direction: column;
    gap: 10px;
  }

}

@media (prefers-reduced-motion: reduce) {
  .combo-card,
  .combo-card:hover {
    transform: none;
    transition: none;
  }
}
</style>
