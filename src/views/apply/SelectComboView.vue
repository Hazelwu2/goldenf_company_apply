<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NModal } from 'naive-ui'
import { COMBO_OPTIONS, useApplyStore } from '@/stores/applyStore'
import { useApplySteps } from '@/composables/useApplySteps'
import ComboRadioCard from '@/components/apply/ComboRadioCard.vue'
import OrgHierarchyDiagram from '@/components/apply/OrgHierarchyDiagram.vue'
import StepFooterActions from '@/components/apply/StepFooterActions.vue'

const store = useApplyStore()
const router = useRouter()
const { steps } = useApplySteps()
const showConfirmation = ref(false)

function goNext() {
  if (store.comboOption) showConfirmation.value = true
}

function confirmNext() {
  // steps[0] 是「選組合」本身，steps[1] 就是這個組合的第一個表單頁
  const next = steps.value[1]
  if (next) {
    showConfirmation.value = false
    router.push(next.path)
  }
}
</script>

<template>
  <section class="screen">
    <header class="screen__header">
      <div class="screen__heading-block">
        <p class="screen__eyebrow">申請設定 · APPLICATION SETUP</p>
        <h1 class="screen__title">選擇申請組合</h1>
        <p class="screen__title-en">Select Application Type</p>
      </div>
      <div class="screen__intro">
        <p class="screen__desc">
          請選擇本次要開線的組合。只能選以下四種固定組合，選定後即決定後續需要填寫的表單內容。
        </p>
        <p class="screen__desc-en">
          Select the combination to open this time. Only the four fixed combinations below are
          allowed; your selection determines the form content that follows.
        </p>
      </div>
    </header>

    <OrgHierarchyDiagram />

    <div class="combo-grid" role="radiogroup" aria-label="申請組合">
      <ComboRadioCard
        v-for="option in COMBO_OPTIONS"
        :key="option.key"
        :option="option"
        :selected="store.combo === option.key"
        @select="store.selectCombo(option.key)"
      />
    </div>

    <StepFooterActions
      :show-back="false"
      :next-disabled="!store.combo"
      hint="請先選擇一種申請組合"
      hint-en="Please select an application type first"
      @next="goNext"
    />

    <NModal
      v-model:show="showConfirmation"
      preset="card"
      class="combo-confirm"
      style="width: min(520px, calc(100vw - 32px)); background: var(--color-surface)"
      :bordered="false"
      :mask-closable="false"
      :closable="false"
      role="dialog"
      aria-modal="true"
    >
      <template #header>
        <div class="combo-confirm__header">
          <span>確認申請組合</span>
          <span class="combo-confirm__header-en">Confirm Application Type</span>
        </div>
      </template>

      <template v-if="store.comboOption">
        <p class="combo-confirm__lead">你選擇的是</p>
        <p class="combo-confirm__lead-en">You have selected</p>

        <div class="combo-confirm__selection">
          <strong>{{ store.comboOption.title }}</strong>
          <span>{{ store.comboOption.titleEn }}</span>
        </div>

        <OrgHierarchyDiagram :levels="store.comboOption.levels" compact />

        <p class="combo-confirm__hint">請確認以上申請組合是否正確。</p>
        <p class="combo-confirm__hint-en">Please confirm that the application type above is correct.</p>
      </template>

      <template #footer>
        <div class="combo-confirm__actions">
          <NButton ghost size="large" @click="showConfirmation = false">
            返回修改&nbsp; Back
          </NButton>
          <NButton type="primary" size="large" @click="confirmNext">
            確認並繼續&nbsp; Confirm & Continue
          </NButton>
        </div>
      </template>
    </NModal>
  </section>
</template>

<style scoped>
.screen {
  max-width: 920px;
  margin: 0 auto;
}

.screen__header {
  display: grid;
  grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1.28fr);
  gap: 44px;
  align-items: end;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.screen__eyebrow {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-primary);
}

.screen__title {
  margin: 0 0 4px;
  font-size: clamp(26px, 3.2vw, 34px);
  font-weight: 700;
  letter-spacing: -0.035em;
  color: var(--color-text);
}

.screen__title-en {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-muted);
}

.screen__desc {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.screen__desc-en {
  margin: 7px 0 0;
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.65;
}

.combo-grid {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  gap: 12px;
}

@media (max-width: 640px) {
  .screen__header {
    grid-template-columns: 1fr;
    gap: 18px;
    align-items: start;
  }

  .screen__title {
    font-size: 28px;
  }
}

.combo-confirm {
  width: min(520px, calc(100vw - 32px));
  border-radius: 10px;
}

.combo-confirm__header {
  display: flex;
  flex-direction: column;
  color: var(--color-text);
  font-size: 20px;
  font-weight: 700;
}

.combo-confirm__header-en {
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 15px;
  font-weight: 400;
}

.combo-confirm__lead,
.combo-confirm__lead-en,
.combo-confirm__hint,
.combo-confirm__hint-en {
  margin: 0;
}

.combo-confirm__lead {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.combo-confirm__lead-en,
.combo-confirm__hint-en {
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 15px;
}

.combo-confirm__selection {
  display: flex;
  flex-direction: column;
  margin: 14px 0 18px;
  padding-left: 14px;
  border-left: 3px solid var(--color-primary);
}

.combo-confirm__selection strong {
  color: var(--color-text);
  font-size: 19px;
}

.combo-confirm__selection span {
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 15px;
}

.combo-confirm__hint {
  margin-top: 18px;
  color: var(--color-text-secondary);
  font-size: 16px;
}

.combo-confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 520px) {
  .combo-confirm__actions {
    flex-direction: column-reverse;
  }

  .combo-confirm__actions :deep(.n-button) {
    width: 100%;
  }
}
</style>
