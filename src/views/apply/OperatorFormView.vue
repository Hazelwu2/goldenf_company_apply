<script setup lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NAlert,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NRadio,
  NRadioGroup,
  NSelect,
  useDialog,
} from 'naive-ui'
import { useApplyStore } from '@/stores/applyStore'
import { useApplySteps } from '@/composables/useApplySteps'
import { CURRENCIES, OPERATING_MARKETS, VENDORS } from '@/utils/mockData'
import CodeInput from '@/components/apply/CodeInput.vue'
import WhitelistTextarea from '@/components/apply/WhitelistTextarea.vue'
import VendorGroupedSelect from '@/components/apply/VendorGroupedSelect.vue'
import BilingualHint from '@/components/apply/BilingualHint.vue'
import FieldLabel from '@/components/apply/FieldLabel.vue'
import FieldHint from '@/components/apply/FieldHint.vue'
import StepFooterActions from '@/components/apply/StepFooterActions.vue'

const store = useApplyStore()
const router = useRouter()
const dialog = useDialog()
const { steps } = useApplySteps()

const marketOptions = OPERATING_MARKETS.map((m) => ({ label: m, value: m }))

/** C05：換幣別時，若已選的產品商不支援新幣別，跳確認 dialog，確認後才真正切換並自動取消勾選。 */
function handleCurrencyUpdate(newCurrency: string) {
  const prevCurrency = store.operator.currency
  if (prevCurrency === null || prevCurrency === newCurrency) {
    store.operator.currency = newCurrency
    return
  }

  const incompatible = store.operator.vendorCodes
    .map((code) => VENDORS.find((v) => v.code === code))
    .filter((v): v is (typeof VENDORS)[number] => !!v && !v.currencies.includes(newCurrency))

  if (incompatible.length === 0) {
    store.operator.currency = newCurrency
    return
  }

  const names = incompatible.map((v) => `${v.nameZh}／${v.nameEn}`).join('、')
  dialog.warning({
    title: '切換幣別將移除不相容的產品商',
    content: () =>
      h('div', [
        h('p', { style: 'margin:0 0 6px' }, `以下已選產品商不支援新幣別 ${newCurrency}：`),
        h('p', { style: 'margin:0;color:var(--color-error);font-weight:600' }, names),
        h(
          'p',
          { style: 'margin:6px 0 0;color:var(--color-text-muted);font-size:14px' },
          `The following selected vendors do not support ${newCurrency} and will be deselected.`,
        ),
      ]),
    positiveText: '確認切換並取消勾選',
    negativeText: '取消，維持原幣別',
    onPositiveClick: () => {
      store.operator.currency = newCurrency
      store.operator.vendorCodes = store.operator.vendorCodes.filter(
        (c) => !incompatible.some((v) => v.code === c),
      )
    },
  })
}

function goBack() {
  router.push('/apply')
}

function goNext() {
  const idx = steps.value.findIndex((s) => s.key === 'operator')
  const next = steps.value[idx + 1]
  if (next) router.push(next.path)
}
</script>

<template>
  <section class="screen">
    <NCard size="large" class="screen__card">
      <template #header>
        <span class="screen__title">營運商 A</span>
        <span class="screen__title-en">Operator A</span>
      </template>
      <template #header-extra>
        <span class="screen__badge">C03</span>
      </template>

      <NForm label-placement="left" label-width="150" require-mark-placement="right-hanging">
        <NFormItem required>
          <template #label><FieldLabel zh="幣別" en="Currency" /></template>
          <div id="field-operator-currency" class="anchor-target field">
            <NSelect
              :value="store.operator.currency"
              :options="CURRENCIES"
              placeholder="請選擇幣別"
              @update:value="handleCurrencyUpdate"
            />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="產品商" en="Vendors" /></template>
          <div id="field-operator-vendor" class="anchor-target field">
            <VendorGroupedSelect
              v-model="store.operator.vendorCodes"
              :currency="store.operator.currency"
            />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="營運商代碼" en="Operator Code" /></template>
          <div id="field-operator-code" class="anchor-target field">
            <CodeInput v-model="store.operator.code" input-id="operator-code" />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="營運商名稱" en="Operator Name" /></template>
          <div class="field">
            <NInput v-model:value="store.operator.name" placeholder="選填" />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="後台帳號" en="Admin Account" /></template>
          <div id="field-operator-admin-account" class="anchor-target field">
            <NInput
              :value="store.operator.adminAccount"
              placeholder="6–10 碼小寫英數"
              @update:value="
                (v: string) =>
                  (store.operator.adminAccount = v
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .slice(0, 10))
              "
            />
            <FieldHint zh="6–10 碼小寫英數" en="6–10 lowercase alphanumeric characters" />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="後台白名單" en="Admin Whitelist" /></template>
          <div id="field-operator-bo-whitelist" class="anchor-target field">
            <WhitelistTextarea v-model="store.operator.boWhitelist" />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="API 白名單" en="API Whitelist" /></template>
          <div id="field-operator-api-whitelist" class="anchor-target field">
            <WhitelistTextarea v-model="store.operator.apiWhitelist" />
            <BilingualHint
              zh="限制區域：美國 IP 不得加入 API 白名單。"
              en="Restricted region: IP addresses from the United States must not be added to the API whitelist."
            />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="聯絡 Email" en="Contact Email" /></template>
          <div id="field-operator-email" class="anchor-target field">
            <NInput v-model:value="store.operator.email" placeholder="選填" />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="運營市場" en="Operating Markets" /></template>
          <div id="field-operator-markets" class="anchor-target field">
            <NSelect
              v-model:value="store.operator.operatingMarkets"
              multiple
              :options="marketOptions"
              placeholder="選擇本次營運會涉及的市場（可多選）"
            />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="備註" en="Remarks" /></template>
          <div class="field">
            <NInput
              v-model:value="store.operator.remark"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="選填，如有額外需求可在此說明"
            />
            <FieldHint
              zh="可自由填寫額外需求，非必填。"
              en="Optional — describe any extra requirements here."
            />
          </div>
        </NFormItem>
      </NForm>

      <div class="section-divider">
        <span class="section-divider__zh">站台狀態</span>
        <span class="section-divider__en">Website Status</span>
      </div>

      <NForm label-placement="left" label-width="150">
        <NFormItem required>
          <template #label><FieldLabel zh="站台狀態" en="Website Status" /></template>
          <div id="field-operator-website-status" class="anchor-target">
            <NRadioGroup v-model:value="store.operator.websiteStatus">
              <NRadio value="live">已有網站 <span class="radio-en">Website Live</span></NRadio>
              <NRadio value="in_progress">
                尚在開發中 <span class="radio-en">In Development</span>
              </NRadio>
            </NRadioGroup>
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="站台網址" en="Website URL" /></template>
          <div id="field-operator-website" class="anchor-target field">
            <NInput
              v-model:value="store.operator.website"
              placeholder="https://"
              :disabled="!store.operator.websiteStatus"
            />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="測試帳號" en="Test Account" /></template>
          <div id="field-operator-test-account" class="anchor-target field">
            <NInput
              v-model:value="store.operator.testAccount"
              :disabled="store.operator.websiteStatus !== 'live'"
              placeholder="測試環境登入帳號"
            />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="測試密碼" en="Test Password" /></template>
          <div class="field">
            <NInput
              v-model:value="store.operator.testPassword"
              type="password"
              show-password-on="click"
              :disabled="store.operator.websiteStatus !== 'live'"
              placeholder="測試環境登入密碼"
            />
          </div>
        </NFormItem>
      </NForm>

      <NAlert
        v-if="store.operator.websiteStatus === 'in_progress'"
        type="warning"
        :bordered="false"
        class="website-alert"
      >
        <p class="website-alert__zh">
          待網站完成後，請務必向窗口提供站台網址及測試帳密，以利快速開通。
        </p>
        <p class="website-alert__en">
          Once the website is ready, please be sure to provide the site URL and test credentials to
          your contact so the account can be activated quickly.
        </p>
      </NAlert>
    </NCard>

    <StepFooterActions
      :next-disabled="!store.isOperatorValid"
      hint="請完整填寫必填欄位，並確認格式正確"
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

.section-divider {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 22px 0 16px;
}

.section-divider__zh {
  font-size: 14px;
  color: var(--color-text-muted);
}

.section-divider__en {
  font-size: 13px;
  color: var(--color-text-muted);
}

.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-divider);
}

.radio-en {
  font-size: 13px;
  color: var(--color-text-muted);
}

.website-alert {
  margin-top: 4px;
}

.website-alert__zh {
  margin: 0;
}

.website-alert__en {
  margin: 4px 0 0;
  font-size: 14px;
  opacity: 0.85;
}

.anchor-target {
  scroll-margin-top: 96px;
}
</style>
