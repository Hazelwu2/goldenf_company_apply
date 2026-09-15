<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NTag, useDialog, useMessage } from 'naive-ui'
import { CheckmarkCircle, DownloadOutline, ImageOutline } from '@vicons/ionicons5'
import { useApplyStore } from '@/stores/applyStore'
import ReferenceNoCard from '@/components/apply/ReferenceNoCard.vue'
import { buildConfirmationImageData } from '@/utils/applicationReview'
import {
  createConfirmationSvg,
  parseConfirmationImageData,
} from '@/utils/applicationConfirmationImage'
import type { ConfirmationImageData } from '@/utils/applicationReview'
import { formatSubmittedAt } from '@/utils/dateTime'

const store = useApplyStore()
const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const hasSavedReference = ref(false)
const isDownloading = ref(false)
const confirmationData = ref<ConfirmationImageData | null>(null)
const SUCCESS_STORAGE_KEY = 'goldenf-company-apply-last-confirmation'

// 直接進入這頁做畫面預覽時（例如透過「畫面總覽」），補一組示範資料，避免空畫面。
onMounted(() => {
  const storedConfirmation = parseConfirmationImageData(
    window.sessionStorage.getItem(SUCCESS_STORAGE_KEY),
  )
  if (!store.referenceNo && storedConfirmation) {
    confirmationData.value = storedConfirmation
    return
  }

  if (!store.referenceNo) {
    if (!store.combo) store.selectCombo('SMA_MA_A')
    store.submitApplication()
  }

  confirmationData.value = buildConfirmationImageData({
    referenceNo: store.referenceNo ?? '—',
    submittedAt: formatSubmittedAt(store.submittedAt),
    levels: store.levels,
    operator: store.operator,
    agentMA: store.agentMA,
    agentSMA: store.agentSMA,
  })
  window.sessionStorage.setItem(SUCCESS_STORAGE_KEY, JSON.stringify(confirmationData.value))
})

const referenceNo = computed(() => confirmationData.value?.referenceNo ?? store.referenceNo ?? '—')
const submittedAtText = computed(
  () => confirmationData.value?.submittedAt ?? formatSubmittedAt(store.submittedAt),
)
const confirmationRecords = computed(() => confirmationData.value?.records ?? [])

function resetAndReturnHome() {
  window.sessionStorage.removeItem(SUCCESS_STORAGE_KEY)
  store.resetAll()
  router.push('/apply')
}

function backToStart() {
  if (hasSavedReference.value) {
    resetAndReturnHome()
    return
  }

  dialog.warning({
    title: '尚未保存開線編號 / Application number not saved',
    content:
      '建議先複製編號或儲存開線確認單，離開後將無法返回此頁。 / Copy the number or save the application confirmation before leaving. You cannot return to this page later.',
    positiveText: '留在此頁 / Stay',
    negativeText: '仍要離開 / Leave anyway',
    onNegativeClick: resetAndReturnHome,
  })
}

function markReferenceSaved() {
  hasSavedReference.value = true
}

async function downloadConfirmationImage() {
  if (!confirmationData.value || isDownloading.value) return
  isDownloading.value = true

  try {
    const svg = createConfirmationSvg(confirmationData.value)
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const image = new Image()

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Image rendering failed'))
      image.src = svgUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable')
    context.drawImage(image, 0, 0)
    URL.revokeObjectURL(svgUrl)

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('PNG generation failed'))
      }, 'image/png')
    })
    const downloadUrl = URL.createObjectURL(pngBlob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `GoldenF-${referenceNo.value}-confirmation.png`
    link.click()
    URL.revokeObjectURL(downloadUrl)
    hasSavedReference.value = true
    message.success('開線確認單已儲存 / Application confirmation saved')
  } catch {
    message.error('圖片儲存失敗，請先複製開線編號 / Could not save image; please copy the number')
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <section class="screen">
    <NCard size="large">
      <div class="success-head">
        <span class="success-head__icon">
          <NIcon :component="CheckmarkCircle" size="34" />
        </span>
        <h1 class="success-head__title">送出成功</h1>
        <p class="success-head__title-en">Submitted Successfully</p>
        <p class="success-head__desc">您的申請已收件，請妥善保存以下開線編號。</p>
        <p class="success-head__desc-en">
          Your application has been received. Please keep the application reference number below.
        </p>
      </div>

      <ReferenceNoCard :reference-no="referenceNo" @copied="markReferenceSaved" />

      <section class="save-confirmation" aria-labelledby="save-confirmation-title">
        <span class="save-confirmation__icon" aria-hidden="true">
          <NIcon :component="ImageOutline" size="25" />
        </span>
        <div class="save-confirmation__content">
          <h2 id="save-confirmation-title">離開前，請先保存開線編號</h2>
          <p class="save-confirmation__title-en">Save your application number before leaving</p>
          <p>
            儲存為 PNG 圖片，內含開線編號、提交時間與申請摘要，方便日後查詢。
          </p>
          <p class="save-confirmation__desc-en">
            Save a PNG with the application number, submission time, and summary for future
            enquiries.
          </p>
        </div>
        <NButton
          type="primary"
          size="large"
          :loading="isDownloading"
          class="save-confirmation__button"
          @click="downloadConfirmationImage"
        >
          <template #icon><NIcon :component="DownloadOutline" /></template>
          <span>
            儲存開線確認單
            <small>Save Confirmation</small>
          </span>
        </NButton>
      </section>

      <dl class="meta-list">
        <div class="meta-list__row">
          <dt>
            提交時間
            <span class="meta-list__dt-en">Submitted At</span>
          </dt>
          <dd>{{ submittedAtText }}</dd>
        </div>
        <div class="meta-list__row">
          <dt>
            組合摘要
            <span class="meta-list__dt-en">Application Type</span>
          </dt>
          <dd>
            <span v-for="record in confirmationRecords" :key="record.role" class="meta-list__tag">
              <NTag size="small" :bordered="false" round>
                {{ record.role }}
              </NTag>
            </span>
          </dd>
        </div>
      </dl>

      <div class="reminder">
        <p class="reminder__zh">
          送出後無法自行修改。如需查詢或修改申請內容，請提供上方開線編號並聯絡客服。
        </p>
        <p class="reminder__en">
          This application cannot be edited after submission. To check or modify it, please contact
          customer support and provide the application reference number above.
        </p>
      </div>
    </NCard>

    <div class="success-actions">
      <NButton quaternary @click="backToStart">返回首頁，開始新的申請 Back to start</NButton>
    </div>
  </section>
</template>

<style scoped>
.screen {
  max-width: 600px;
  margin: 0 auto;
}

.success-head {
  text-align: center;
  margin-bottom: 22px;
}

.success-head__icon {
  display: inline-flex;
  color: var(--color-success);
  margin-bottom: 8px;
}

.success-head__title {
  margin: 0 0 2px;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
}

.success-head__title-en {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.success-head__desc {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-secondary);
}

.success-head__desc-en {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-muted);
}

.meta-list {
  margin: 20px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.save-confirmation {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  padding: 16px;
  border: 1px solid var(--color-success-border);
  border-radius: 9px;
  background: var(--color-success-soft);
  box-shadow: var(--shadow-selected);
}

.save-confirmation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  width: 54px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--color-success);
}

.save-confirmation__icon {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-success);
  background: var(--color-surface);
  border: 1px solid var(--color-success-border);
}

.save-confirmation h2 {
  margin: 0;
  font-size: 16px;
  color: var(--color-text);
}

.save-confirmation p {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.save-confirmation__title-en {
  margin-top: 1px !important;
  font-size: 13px !important;
  color: var(--color-text-muted) !important;
}

.save-confirmation__desc-en {
  margin-top: 2px !important;
  font-size: 13px !important;
  color: var(--color-text-muted) !important;
}

.save-confirmation__button {
  min-height: 48px;
  color: var(--color-on-primary);
}

.save-confirmation__button :deep(.n-button__content),
.save-confirmation__button :deep(.n-button__icon) {
  color: var(--color-on-primary);
}

.save-confirmation__button small {
  display: block;
  margin-top: 1px;
  font-size: 12px;
  font-weight: 400;
}

.meta-list__row {
  display: flex;
  gap: 16px;
  font-size: 15px;
  align-items: center;
}

.meta-list__row dt {
  flex: none;
  width: 84px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
}

.meta-list__dt-en {
  font-size: 13px;
  color: var(--color-text-muted);
}

.meta-list__row dd {
  margin: 0;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', 'Roboto Mono', monospace;
}

.meta-list__tag {
  margin-right: 6px;
  font-family: inherit;
}

.meta-list__tag-en {
  font-size: 13px;
  opacity: 0.75;
  margin-left: 3px;
}

.reminder {
  margin-top: 20px;
  padding: 12px 14px;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.reminder__zh {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.reminder__en {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.success-actions {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

@media (max-width: 680px) {
  .save-confirmation {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .save-confirmation__button {
    grid-column: 1 / -1;
    width: 100%;
  }
}
</style>
