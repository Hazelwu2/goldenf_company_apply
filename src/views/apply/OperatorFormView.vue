<script setup lang="ts">
import { computed, ref } from 'vue'
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
} from 'naive-ui'
import { useApplyStore } from '@/stores/applyStore'
import { useApplySteps } from '@/composables/useApplySteps'
import { CURRENCIES } from '@/utils/mockData'
import { getCurrencyChangeImpact } from '@/utils/currencyChangeImpact'
import { operatingMarketOptions } from '@/utils/operatingMarkets'
import { isValidEmailEntry, isValidWebsiteUrl, isValidWhitelistEntry } from '@/utils/validators'
import CodeInput from '@/components/apply/CodeInput.vue'
import MultiValueInput from '@/components/apply/MultiValueInput.vue'
import VendorGroupedSelect from '@/components/apply/VendorGroupedSelect.vue'
import BilingualHint from '@/components/apply/BilingualHint.vue'
import FieldLabel from '@/components/apply/FieldLabel.vue'
import FieldHint from '@/components/apply/FieldHint.vue'
import FieldError from '@/components/apply/FieldError.vue'
import StepFooterActions from '@/components/apply/StepFooterActions.vue'
import CurrencyChangeDialog from '@/components/apply/CurrencyChangeDialog.vue'

const store = useApplyStore()
const router = useRouter()
const { steps } = useApplySteps()
const pendingCurrency = ref<string | null>(null)
const currencyChangeImpact = computed(() =>
  pendingCurrency.value
    ? getCurrencyChangeImpact(store.operator.vendorCodes, pendingCurrency.value)
    : { remove: [], keep: [] },
)

const marketOptions = operatingMarketOptions

/** 有输入内容才显示格式错误，避免使用者还在输入时就跳错。 */
const showWebsiteUrlError = computed(
  () =>
    store.operator.websiteStatus === 'live' &&
    store.operator.website.trim().length > 0 &&
    !isValidWebsiteUrl(store.operator.website),
)

/** C05：换币别时，若已选的产品商不支援新币别，跳确认 dialog，确认后才真正切换并自动取消勾选。 */
function handleCurrencyUpdate(newCurrency: string) {
  const prevCurrency = store.operator.currency
  if (prevCurrency === null || prevCurrency === newCurrency) {
    store.operator.currency = newCurrency
    return
  }

  const impact = getCurrencyChangeImpact(store.operator.vendorCodes, newCurrency)

  if (impact.remove.length === 0) {
    store.operator.currency = newCurrency
    return
  }

  pendingCurrency.value = newCurrency
}

function cancelCurrencyChange() {
  pendingCurrency.value = null
}

function confirmCurrencyChange() {
  if (!pendingCurrency.value) return
  store.operator.currency = pendingCurrency.value
  store.operator.vendorCodes = currencyChangeImpact.value.keep.map((vendor) => vendor.code)
  pendingCurrency.value = null
}

/** 切离「已有网站」时清空站台三栏，避免留下已停用却无法清除的残值。 */
function handleWebsiteStatusUpdate(status: 'live' | 'in_progress') {
  store.operator.websiteStatus = status
  if (status === 'live') return
  store.operator.website = ''
  store.operator.testAccount = ''
  store.operator.testPassword = ''
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
    <CurrencyChangeDialog
      :show="pendingCurrency !== null"
      :previous-currency="store.operator.currency ?? ''"
      :next-currency="pendingCurrency ?? ''"
      :remove="currencyChangeImpact.remove"
      :keep="currencyChangeImpact.keep"
      @cancel="cancelCurrencyChange"
      @confirm="confirmCurrencyChange"
    />
    <NCard size="large" class="screen__card">
      <template #header>
        <span class="screen__title">营运商 A</span>
        <span class="screen__title-en">Operator A</span>
      </template>
      <template #header-extra>
        <span class="screen__badge">C03</span>
      </template>

      <NForm label-placement="left" label-width="150" require-mark-placement="right-hanging">
        <NFormItem required>
          <template #label><FieldLabel zh="币别" en="Currency" /></template>
          <div id="field-operator-currency" class="anchor-target field">
            <NSelect
              :value="store.operator.currency"
              :options="CURRENCIES"
              placeholder="请选择币别"
              @update:value="handleCurrencyUpdate"
            />
            <FieldHint
              zh="先选择币别，再选择产品商。"
              en="Choose a currency first, then select vendors."
            />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="产品商" en="Vendors" /></template>
          <div id="field-operator-vendor" class="anchor-target field">
            <VendorGroupedSelect
              v-model="store.operator.vendorCodes"
              :currency="store.operator.currency"
            />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="营运商代码" en="Operator Code" /></template>
          <div id="field-operator-code" class="anchor-target field">
            <CodeInput v-model="store.operator.code" input-id="operator-code" />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="营运商名称" en="Operator Name" /></template>
          <div class="field">
            <NInput v-model:value="store.operator.name" placeholder="选填" />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="后台账号" en="Admin Account" /></template>
          <div id="field-operator-admin-account" class="anchor-target field">
            <NInput
              :value="store.operator.adminAccount"
              placeholder="6–10 码小写英数"
              @update:value="
                (v: string) =>
                  (store.operator.adminAccount = v
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .slice(0, 10))
              "
            />
            <FieldHint zh="6–10 码小写英数" en="6–10 lowercase alphanumeric characters" />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="后台白名单" en="Admin Whitelist" /></template>
          <div id="field-operator-bo-whitelist" class="anchor-target field">
            <MultiValueInput
              v-model="store.operator.boWhitelist"
              :validate="isValidWhitelistEntry"
              mono
              placeholder="输入 IP 后按 Enter，或以逗号、换行贴上多笔"
              hint-zh="可输入一笔或多笔 IP，输入后会成为独立项目，可单独移除。"
              hint-en="Enter one or more IP addresses; each becomes a separate item that can be removed individually."
              error-zh="IP 格式错误"
              error-en="Invalid IP format"
            />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="API 白名单" en="API Whitelist" /></template>
          <div id="field-operator-api-whitelist" class="anchor-target field">
            <MultiValueInput
              v-model="store.operator.apiWhitelist"
              :validate="isValidWhitelistEntry"
              mono
              placeholder="输入 IP 后按 Enter，或以逗号、换行贴上多笔"
              hint-zh="可输入一笔或多笔 IP，输入后会成为独立项目，可单独移除。"
              hint-en="Enter one or more IP addresses; each becomes a separate item that can be removed individually."
              error-zh="IP 格式错误"
              error-en="Invalid IP format"
            />
            <BilingualHint
              zh="限制区域：美国 IP 不得加入 API 白名单。"
              en="Restricted region: IP addresses from the United States must not be added to the API whitelist."
            />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="联络 Email" en="Contact Email" /></template>
          <div id="field-operator-email" class="anchor-target field">
            <MultiValueInput
              v-model="store.operator.emails"
              :validate="isValidEmailEntry"
              input-id="operator-email-input"
              placeholder="选填，输入 Email 后按 Enter，或以逗号、分号贴上多笔"
              hint-zh="选填。可输入一笔或多笔 Email，输入后会成为独立项目，可单独移除。"
              hint-en="Optional. Enter one or more email addresses; each becomes a separate item that can be removed individually."
              error-zh="Email 格式错误"
              error-en="Invalid email format"
            />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="通讯软体" en="Chat Software" /></template>
          <div id="field-operator-chat-software" class="anchor-target field">
            <NRadioGroup v-model:value="store.operator.chatSoftware">
              <NRadio value="Teams">Teams</NRadio>
              <NRadio value="telegram">Telegram</NRadio>
            </NRadioGroup>
            <FieldHint
              zh="请选择后续开线联系使用的通讯软体。"
              en="Choose the chat app used for follow-up communication."
            />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="通讯群组" en="Chat Group" /></template>
          <div id="field-operator-chat-group" class="anchor-target field">
            <NInput
              v-model:value="store.operator.chatGroup"
              placeholder="请输入 Telegram 或 Teams 的群组名称"
            />
            <FieldHint
              zh="填写上方通讯软体中，用于开线联系的群组名称。"
              en="Enter the group name in the selected chat app used for this application."
            />
          </div>
        </NFormItem>

        <NFormItem required>
          <template #label><FieldLabel zh="运营市场" en="Operating Markets" /></template>
          <div id="field-operator-markets" class="anchor-target field">
            <NSelect
              v-model:value="store.operator.operatingMarkets"
              multiple
              filterable
              :options="marketOptions"
              placeholder="可多选，请选择站台主要经营的市场"
            />
            <FieldHint
              zh="请选择站台主要经营的市场，填写正确有助于加快审核开通。"
              en="Select the markets where your site mainly operates. Accurate selections help speed up approval."
            />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="备注" en="Remarks" /></template>
          <div class="field">
            <NInput
              v-model:value="store.operator.remark"
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

      <div class="section-divider">
        <span class="section-divider__zh">站台状态</span>
        <span class="section-divider__en">Website Status</span>
      </div>

      <NForm label-placement="left" label-width="150">
        <NFormItem required>
          <template #label><FieldLabel zh="站台状态" en="Website Status" /></template>
          <div id="field-operator-website-status" class="anchor-target">
            <NRadioGroup
              :value="store.operator.websiteStatus"
              @update:value="handleWebsiteStatusUpdate"
            >
              <NRadio value="live">已有网站 <span class="radio-en">Website Live</span></NRadio>
              <NRadio value="in_progress">
                尚在开发中 <span class="radio-en">In Development</span>
              </NRadio>
            </NRadioGroup>
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="站台网址" en="Website URL" /></template>
          <div id="field-operator-website" class="anchor-target field">
            <NInput
              v-model:value="store.operator.website"
              placeholder="https://"
              :disabled="store.operator.websiteStatus !== 'live'"
            />
            <FieldHint
              zh="选择「已有网站」时，站台网址、测试账号与测试密码三者必须一起填写。"
              en="When the site is live, the website URL, test account, and test password must all be provided together."
            />
            <FieldError
              v-if="showWebsiteUrlError"
              zh="请输入完整网址，需包含 https://"
              en="Enter a complete URL including https://"
            />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="测试账号" en="Test Account" /></template>
          <div id="field-operator-test-account" class="anchor-target field">
            <NInput
              v-model:value="store.operator.testAccount"
              :disabled="store.operator.websiteStatus !== 'live'"
              placeholder="测试环境登入账号"
            />
          </div>
        </NFormItem>

        <NFormItem>
          <template #label><FieldLabel zh="测试密码" en="Test Password" /></template>
          <div class="field">
            <NInput
              v-model:value="store.operator.testPassword"
              type="password"
              show-password-on="click"
              :disabled="store.operator.websiteStatus !== 'live'"
              placeholder="测试环境登入密码"
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
          待网站完成后，请务必向窗口提供站台网址及测试账密，以利快速开通。
        </p>
        <p class="website-alert__en">
          Once the website is ready, please be sure to provide the site URL and test credentials to
          your contact so the account can be activated quickly.
        </p>
      </NAlert>
    </NCard>

    <StepFooterActions
      :next-disabled="!store.isOperatorValid"
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
