<script setup lang="ts">
import { computed, h } from 'vue'
import { NSelect, NTag } from 'naive-ui'
import { groupVendorsForCurrency } from '@/utils/vendorAvailability'
import type { Vendor } from '@/utils/vendors'
import FieldHint from './FieldHint.vue'
import { getVendorSelectionHint } from '@/utils/vendorSelectionHint'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    vendors: Vendor[]
    currency: string | null
    /** 產品商清單還沒準備好（載入中、失敗、空清單）時停用。 */
    disabled?: boolean
    /** 停用時要顯示的說明文字；沒給就用預設文字。 */
    placeholder?: string
    /** 清單還沒準備好時由外層顯示載入狀態，這裡就不顯示選擇提示。 */
    showHint?: boolean
    status?: 'error'
    ariaDescribedby?: string
  }>(),
  {
    disabled: false,
    placeholder: undefined,
    showHint: true,
    status: undefined,
    ariaDescribedby: undefined,
  },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const selectionHint = computed(() => getVendorSelectionHint(props.currency))

const isDisabled = computed(() => !props.currency || props.disabled)

const placeholderText = computed(() => {
  if (props.disabled && props.placeholder) return props.placeholder
  return props.currency
    ? '选择产品商（可多选） / Select vendors'
    : '请先选择币别 / Select currency first'
})

function renderOptionLabel(vendor: Vendor, unavailable: boolean) {
  return () =>
    h('div', { class: ['vendor-option', { 'is-unavailable': unavailable }] }, [
      h('span', { class: 'vendor-option__name' }, [
        h('span', { class: 'vendor-option__name-zh' }, vendor.name),
      ]),
      unavailable
        ? h(
            NTag,
            {
              class: ['vendor-option__badge', 'vendor-option__badge--unavailable'],
              size: 'tiny',
              bordered: false,
              type: 'warning',
            },
            {
              default: () => `不支持 ${props.currency} / Unavailable`,
            },
          )
        : h(
            NTag,
            {
              class: 'vendor-option__badge',
              size: 'tiny',
              bordered: false,
              type: vendor.demo ? 'success' : 'default',
            },
            {
              default: () =>
                vendor.demo
                  ? '正式＋测试 / Prod. + Test'
                  : '仅正式 / Production',
            },
          ),
    ])
}

function renderSelectedTag({
  option,
  handleClose,
}: {
  option: Record<string, unknown>
  handleClose: () => void
}) {
  const name = typeof option.name === 'string' ? option.name : String(option.value ?? '')

  return h(
    NTag,
    {
      class: 'vendor-selection-tag',
      closable: !option.disabled,
      title: name,
      onClose: handleClose,
    },
    { default: () => name },
  )
}

const options = computed(() => {
  const groups = groupVendorsForCurrency(props.vendors, props.currency)

  const build = (vendors: Vendor[], unavailable = false) =>
    vendors.map((v) => ({
      value: v.code,
      code: v.code,
      name: v.name,
      label: renderOptionLabel(v, unavailable),
      disabled: unavailable,
    }))

  return [
    groups.officialTest.length > 0
      ? {
      type: 'group' as const,
      key: 'official_test',
      label: '正式与测试环境 / Production & Test',
          children: build(groups.officialTest),
        }
      : null,
    groups.officialOnly.length > 0
      ? {
      type: 'group' as const,
      key: 'official_only',
      label: '仅正式环境 / Production Only',
          children: build(groups.officialOnly),
        }
      : null,
    groups.unavailable.length > 0
      ? {
          type: 'group' as const,
          key: 'unavailable',
          label: `不支持 ${props.currency} / Unavailable for ${props.currency}`,
          children: build(groups.unavailable, true),
        }
      : null,
  ].filter((group) => group !== null)
})

/** 搜尋比對名稱與內部代碼（代碼不顯示，但仍可用來搜尋）。 */
function filterVendor(pattern: string, option: Record<string, unknown>) {
  const needle = pattern.trim().toLowerCase()
  if (!needle) return true
  return [option.name, option.code].some(
    (field) => typeof field === 'string' && field.toLowerCase().includes(needle),
  )
}
</script>

<template>
  <div class="vendor-grouped-select" :class="{ 'is-disabled': isDisabled }">
    <NSelect
      :value="modelValue"
      multiple
      filterable
      :filter="filterVendor"
      :render-tag="renderSelectedTag"
      max-tag-count="responsive"
      :options="options"
      :disabled="isDisabled"
      :status="props.status"
      :aria-invalid="props.status === 'error' ? 'true' : undefined"
      :aria-describedby="props.ariaDescribedby"
      :placeholder="placeholderText"
      @update:value="(v: string[]) => emit('update:modelValue', v)"
    />
    <FieldHint v-if="props.showHint" :zh="selectionHint.zh" :en="selectionHint.en" />
  </div>
</template>

<style>
/* 下拉选项由 render function 产生、会被 teleport 到 body，
   scoped style 的 data-v 属性套不到，这里改用全域 class。 */
.vendor-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
  padding-block: 2px;
}
.vendor-option__name {
  color: var(--color-text);
  font-size: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.3;
  min-width: 0;
}
.vendor-option__name-zh {
  font-weight: 500;
}
.vendor-option__name-en {
  font-size: 13px;
  color: var(--color-text-muted);
}

.vendor-option__badge {
  flex: none;
  height: auto;
  min-height: 22px;
  padding: 2px 8px;
  border-radius: 5px;
}

.vendor-option__badge .n-tag__content {
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
}

.vendor-option.is-unavailable {
  cursor: not-allowed;
}

.n-base-select-option.n-base-select-option--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.vendor-option__name-zh,
.vendor-option__name-en {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vendor-selection-tag {
  max-width: min(164px, 100%);
}

.vendor-selection-tag .n-tag__content {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vendor-grouped-select.is-disabled .n-base-selection {
  border-style: dashed;
  background: var(--color-surface-muted);
  cursor: not-allowed;
}

.vendor-grouped-select.is-disabled .n-base-selection .n-base-selection-label,
.vendor-grouped-select.is-disabled .n-base-selection .n-base-selection-placeholder {
  color: var(--color-text-disabled);
}
</style>
