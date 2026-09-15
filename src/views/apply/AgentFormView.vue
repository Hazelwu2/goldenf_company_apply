<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NCheckbox, NForm, NFormItem, NIcon, NInput } from 'naive-ui'
import { InformationCircleOutline } from '@vicons/ionicons5'
import { useApplyStore } from '@/stores/applyStore'
import { useApplySteps } from '@/composables/useApplySteps'
import CodeInput from '@/components/apply/CodeInput.vue'
import WhitelistTextarea from '@/components/apply/WhitelistTextarea.vue'
import FieldLabel from '@/components/apply/FieldLabel.vue'
import FieldHint from '@/components/apply/FieldHint.vue'
import StepFooterActions from '@/components/apply/StepFooterActions.vue'

const props = defineProps<{ level: 'MA' | 'SMA' }>()

const store = useApplyStore()
const router = useRouter()
const { steps } = useApplySteps()

const form = computed(() => store.agentForm(props.level))
const title = computed(() => (props.level === 'MA' ? '代理 MA' : '总代理 SMA'))
const titleEn = computed(() => (props.level === 'MA' ? 'Agent MA' : 'Super Agent SMA'))
const stepKey = computed(() => (props.level === 'MA' ? 'agent-ma' : 'agent-sma'))
const showSameAsA = computed(() => store.hasLevel('A'))
const idPrefix = computed(() => `field-agent-${props.level.toLowerCase()}`)

function handleSameAsAChange(checked: boolean) {
  store.applySameAsA(props.level, checked)
}

function goBack() {
  const idx = steps.value.findIndex((s) => s.key === stepKey.value)
  const prev = steps.value[idx - 1]
  router.push(prev ? prev.path : '/apply')
}

function goNext() {
  const idx = steps.value.findIndex((s) => s.key === stepKey.value)
  const next = steps.value[idx + 1]
  router.push(next ? next.path : '/apply/confirm')
}
</script>

<template>
  <section class="screen">
    <NCard size="large">
      <template #header>
        <span class="screen__title">{{ title }}</span>
        <span class="screen__title-en">{{ titleEn }}</span>
      </template>
      <template #header-extra>
        <span class="screen__badge">C07</span>
      </template>

      <NForm label-placement="left" label-width="150" require-mark-placement="right-hanging">
        <NFormItem required>
          <template #label><FieldLabel :zh="`${title}代码`" :en="`${titleEn} Code`" /></template>
          <div :id="`${idPrefix}-code`" class="anchor-target field">
            <CodeInput
              v-model="form.code"
              :input-id="`${idPrefix}-code-input`"
              :max-length="12"
              :min-length="2"
              :allow-digits="false"
              placeholder="例如 GFAGENT"
            />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel :zh="`${title}名称`" :en="`${titleEn} Name`" /></template>
          <div class="field">
            <NInput v-model:value="form.name" placeholder="选填" />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="后台账号" en="Admin Account" /></template>
          <div :id="`${idPrefix}-admin-account`" class="anchor-target field">
            <NInput
              :value="form.adminAccount"
              placeholder="6–10 码小写英数"
              @update:value="
                (v: string) =>
                  (form.adminAccount = v
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .slice(0, 10))
              "
            />
            <FieldHint zh="6–10 码小写英数" en="6–10 lowercase alphanumeric characters" />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="后台 IP 白名单" en="Admin IP Whitelist" /></template>
          <div :id="`${idPrefix}-bo-whitelist`" class="anchor-target field">
            <WhitelistTextarea v-model="form.boWhitelist" :disabled="form.sameAsA" />
          </div>
        </NFormItem>

        <NFormItem v-if="showSameAsA" label=" ">
          <NCheckbox :checked="form.sameAsA" @update:checked="handleSameAsAChange">
            与 A 相同 Same as A
            <span class="same-as-a__hint">
              （同步后台白名单与联络 Email，栏位锁定为唯读／Syncs the admin whitelist and contact
              email from A; fields become read-only）
            </span>
          </NCheckbox>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="联络 Email" en="Contact Email" /></template>
          <div :id="`${idPrefix}-email`" class="anchor-target field">
            <NInput v-model:value="form.email" placeholder="选填" :disabled="form.sameAsA" />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="备注" en="Remarks" /></template>
          <div class="field">
            <NInput
              v-model:value="form.remark"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="选填，如有额外需求可在此说明"
            />
            <FieldHint
              zh="可自由填写额外需求，非必填。"
              en="Optional — describe any extra requirements here."
            />
          </div>
        </NFormItem>
      </NForm>

      <div v-if="form.sameAsA" class="same-as-a__banner">
        <NIcon :component="InformationCircleOutline" size="15" />
        <span>
          已与营运商 A 同步后台白名单与联络 Email，取消勾选即可自行填写。
          <br />
          <span class="same-as-a__banner-en">
            Synced with Operator A's admin whitelist and contact email — uncheck to edit manually.
          </span>
        </span>
      </div>
    </NCard>

    <StepFooterActions
      :next-disabled="!store.isAgentValid(props.level)"
      hint="请完整填写必填栏位，并确认格式正确"
      hint-en="Please complete all required fields with valid formats"
      @back="goBack"
      @next="goNext"
    />
  </section>
</template>

<style scoped>
.screen {
  max-width: 720px;
  margin: 0 auto;
}

.field {
  width: 360px;
  max-width: 100%;
}

.screen__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.screen__title-en {
  margin-left: 8px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.screen__badge {
  font-family: ui-monospace, 'SF Mono', 'Roboto Mono', monospace;
  font-size: 13px;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1px 6px;
}

.same-as-a__hint {
  color: var(--color-text-muted);
  font-weight: 400;
  font-size: 14px;
}

.same-as-a__banner {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 4px;
  padding: 10px 12px;
  background: var(--color-primary-soft);
  border: 1px solid var(--color-border-strong);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-primary);
  line-height: 1.6;
}

.same-as-a__banner-en {
  color: var(--color-text-muted);
  font-size: 13px;
}

.anchor-target {
  scroll-margin-top: 96px;
}
</style>
