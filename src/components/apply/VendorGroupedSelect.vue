<script setup lang="ts">
import { computed, h } from 'vue'
import { NSelect, NTag } from 'naive-ui'
import { VENDORS } from '@/utils/mockData'

const props = defineProps<{
  modelValue: string[]
  currency: string | null
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

function renderOptionLabel(vendor: (typeof VENDORS)[number]) {
  return () =>
    h('div', { class: 'vendor-option' }, [
      h('span', { class: 'vendor-option__name' }, [
        h('span', { class: 'vendor-option__name-zh' }, vendor.nameZh),
        h('span', { class: 'vendor-option__name-sep' }, '／'),
        h('span', { class: 'vendor-option__name-en' }, vendor.nameEn),
      ]),
      h(
        NTag,
        {
          size: 'tiny',
          round: true,
          bordered: false,
          type: vendor.env === 'official_test' ? 'success' : 'default',
        },
        { default: () => (vendor.env === 'official_test' ? '正式＋測試' : '僅正式環境') },
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
  const nameZh = typeof option.nameZh === 'string' ? option.nameZh : String(option.value ?? '')
  const nameEn = typeof option.nameEn === 'string' ? option.nameEn : nameZh

  return h(
    NTag,
    {
      class: 'vendor-selection-tag',
      closable: !option.disabled,
      title: nameZh === nameEn ? nameZh : `${nameZh}／${nameEn}`,
      onClose: handleClose,
    },
    { default: () => nameZh },
  )
}

const options = computed(() => {
  const disabledFor = (vendor: (typeof VENDORS)[number]) =>
    props.currency != null && !vendor.currencies.includes(props.currency)

  const build = (env: (typeof VENDORS)[number]['env']) =>
    VENDORS.filter((v) => v.env === env).map((v) => ({
      value: v.code,
      code: v.code,
      nameZh: v.nameZh,
      nameEn: v.nameEn,
      label: renderOptionLabel(v),
      disabled: disabledFor(v),
    }))

  return [
    {
      type: 'group' as const,
      key: 'official_test',
      label: '支援正式環境＋測試環境',
      children: build('official_test'),
    },
    {
      type: 'group' as const,
      key: 'official_only',
      label: '僅支援正式環境',
      children: build('official_only'),
    },
  ]
})

/** 搜尋比對中文名稱／英文名稱／內部代碼（代碼不顯示，但仍可用來搜尋）。 */
function filterVendor(pattern: string, option: Record<string, unknown>) {
  const needle = pattern.trim().toLowerCase()
  if (!needle) return true
  return [option.nameZh, option.nameEn, option.code].some(
    (field) => typeof field === 'string' && field.toLowerCase().includes(needle),
  )
}
</script>

<template>
  <NSelect
    :value="modelValue"
    multiple
    filterable
    :filter="filterVendor"
    :render-tag="renderSelectedTag"
    max-tag-count="responsive"
    :options="options"
    :disabled="!props.currency"
    :placeholder="props.currency ? '選擇產品商（可多選）' : '請先選擇幣別'"
    @update:value="(v: string[]) => emit('update:modelValue', v)"
  />
</template>

<style>
/* 下拉選項由 render function 產生、會被 teleport 到 body，
   scoped style 的 data-v 屬性套不到，這裡改用全域 class。 */
.vendor-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
.vendor-option__name {
  color: var(--color-text);
  font-size: 15px;
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
}
.vendor-option__name-zh {
  font-weight: 500;
}
.vendor-option__name-sep {
  color: var(--color-border);
}
.vendor-option__name-en {
  color: var(--color-text-muted);
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
</style>
