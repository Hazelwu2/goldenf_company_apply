<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NIcon, useDialog, useMessage } from 'naive-ui'
import { CheckmarkCircle, DownloadOutline } from '@vicons/ionicons5'
import { useApplyStore } from '@/stores/applyStore'
import ReferenceNoCard from '@/components/apply/ReferenceNoCard.vue'
import ApplicationHierarchySummary from '@/components/apply/ApplicationHierarchySummary.vue'
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

// 直接进入这页做画面预览时（例如透过「画面总览」），补一组示范资料，避免空画面。
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
    title: '尚未保存开线编号 / Application number not saved',
    content:
      '建议先复制编号或储存开线确认单，离开后将无法返回此页。 / Copy the number or save the application confirmation before leaving. You cannot return to this page later.',
    positiveText: '留在此页 / Stay',
    negativeText: '仍要离开 / Leave anyway',
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
    message.success('开线确认单已储存 / Application confirmation saved')
  } catch {
    message.error('图片储存失败，请先复制开线编号 / Could not save image; please copy the number')
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <section class="screen">
    <NCard size="large" class="result-card">
      <div class="success-head">
        <span class="success-head__icon" aria-hidden="true">
          <NIcon :component="CheckmarkCircle" size="30" />
        </span>
        <div>
          <h1 class="success-head__title">送出成功</h1>
          <p class="success-head__title-en">Submitted Successfully</p>
        </div>
      </div>

      <section class="preservation" aria-labelledby="save-confirmation-title">
        <div class="preservation__intro">
          <h2 id="save-confirmation-title">请保存您的开线资料</h2>
          <p>Keep your application details</p>
        </div>

        <ReferenceNoCard :reference-no="referenceNo" @copied="markReferenceSaved" />

        <NButton
          type="primary"
          size="large"
          :loading="isDownloading"
          class="preservation__button"
          @click="downloadConfirmationImage"
        >
          <template #icon><NIcon :component="DownloadOutline" aria-hidden="true" /></template>
          <span>
            储存开线确认单
            <small>Save Confirmation</small>
          </span>
        </NButton>

        <p class="preservation__hint">
          PNG 图片包含开线编号、提交时间与申请摘要，方便日后查询。
          <span>
            The PNG includes your application number, submission time, and summary for future
            enquiries.
          </span>
        </p>
      </section>

      <section class="application-details" aria-labelledby="application-details-title">
        <h2 id="application-details-title">
          本次申请
          <span>Application Details</span>
        </h2>

        <dl class="meta-list">
          <div class="meta-list__row">
            <dt>
              提交时间
              <span class="meta-list__dt-en">Submitted At</span>
            </dt>
            <dd>{{ submittedAtText }}</dd>
          </div>
          <div class="meta-list__row meta-list__row--hierarchy">
            <dt>
              组合摘要
              <span class="meta-list__dt-en">Application Type</span>
            </dt>
            <dd><ApplicationHierarchySummary :records="confirmationRecords" /></dd>
          </div>
        </dl>
      </section>

      <div class="reminder">
        <p class="reminder__zh">
          送出后无法自行修改。如需查询或修改申请内容，请提供上方开线编号并联络客服。
        </p>
        <p class="reminder__en">
          This application cannot be edited after submission. To check or modify it, please contact
          customer support and provide the application reference number above.
        </p>
      </div>
    </NCard>

    <div class="success-actions">
      <NButton quaternary @click="backToStart">返回首页，开始新的申请 Back to start</NButton>
    </div>
  </section>
</template>

<style scoped>
.screen {
  width: 100%;
  max-width: 600px;
  min-width: 0;
  margin: 0 auto;
  box-sizing: border-box;
}

.result-card {
  position: relative;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}

.result-card :deep(.n-card__content) {
  min-width: 0;
}

.result-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 24px;
  width: 68px;
  height: 4px;
  border-radius: 0 0 4px 4px;
  background: var(--color-success);
  z-index: 1;
}

.success-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.success-head__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: var(--color-success);
  border: 1px solid var(--color-success-border);
  border-radius: 50%;
  background: var(--color-success-soft);
}

.success-head__title {
  margin: 0 0 2px;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
}

.success-head__title-en {
  margin: 1px 0 0;
  font-size: 14px;
  color: var(--color-text-muted);
}

.preservation {
  min-width: 0;
  padding-top: 2px;
}

.preservation__intro {
  margin-bottom: 18px;
  text-align: center;
}

.preservation__intro h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 18px;
  line-height: 1.4;
}

.preservation__intro p {
  margin: 2px 0 0;
  font-size: 14px;
  color: var(--color-text-muted);
}

.preservation__button {
  width: 100%;
  min-height: 54px;
  margin-top: 18px;
  color: var(--color-on-primary);
}

.preservation__button :deep(.n-button__content),
.preservation__button :deep(.n-button__icon) {
  color: var(--color-on-primary);
}

.preservation__button small {
  display: block;
  margin-top: 1px;
  font-size: 12px;
  font-weight: 400;
}

.preservation__hint {
  margin: 12px 0 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.55;
  text-align: center;
}

.preservation__hint span {
  display: block;
  margin-top: 2px;
  color: var(--color-text-muted);
}

.application-details {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.application-details h2 {
  margin: 0 0 14px;
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.4;
}

.application-details h2 span {
  display: block;
  margin-top: 1px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 400;
}

.meta-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  flex: 1;
  min-width: 0;
  margin: 0;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', 'Roboto Mono', monospace;
}

.reminder {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
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
  .meta-list__row {
    align-items: stretch;
    flex-direction: column;
    gap: 6px;
  }

  .meta-list__row dt {
    width: auto;
  }

  .meta-list__row--hierarchy {
    gap: 8px;
  }

  .success-head {
    justify-content: flex-start;
  }
}
</style>
