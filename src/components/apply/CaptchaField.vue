<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { NButton, NIcon, NInput, NTooltip } from 'naive-ui'
import { CheckmarkCircleOutline, CloseCircleOutline, RefreshOutline } from '@vicons/ionicons5'

const props = defineProps<{
  code: string
  modelValue: string
  status: 'idle' | 'error' | 'ok'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'refresh'): void
  (e: 'verify', value: string): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let themeObserver: MutationObserver | null = null

function handleInput(value: string) {
  const limitedValue = value.slice(0, props.code.length)
  emit('update:modelValue', limitedValue)
  emit('verify', limitedValue)
}

function themeColor(variable: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !props.code) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  const backgroundColor = themeColor('--color-surface-muted', '#EEEEE7')
  const foregroundColor = themeColor('--color-text', '#252A27')
  const noiseColor = themeColor('--color-text-secondary', '#4B5650')

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, w, h)

  // 干擾線
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = noiseColor
    ctx.globalAlpha = 0.25 + Math.random() * 0.2
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // 字元（各自微旋轉，模擬自建圖形碼）
  const chars = props.code.split('')
  const cellW = w / chars.length
  chars.forEach((ch, i) => {
    const angle = (Math.random() - 0.5) * 0.45
    const x = cellW * i + cellW / 2
    const y = h / 2 + (Math.random() - 0.5) * 6
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.font = '700 22px ui-monospace, "SF Mono", "Roboto Mono", monospace'
    ctx.fillStyle = foregroundColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  })

  // 干擾點
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = noiseColor
    ctx.globalAlpha = Math.random() * 0.3
    ctx.beginPath()
    ctx.arc(Math.random() * w, Math.random() * h, 1, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

watch(
  () => props.code,
  () => nextTick(draw),
)
onMounted(() => {
  draw()
  themeObserver = new MutationObserver(draw)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => themeObserver?.disconnect())
</script>

<template>
  <div class="captcha">
    <div class="captcha__row">
      <canvas ref="canvasRef" width="140" height="44" class="captcha__canvas" aria-hidden="true" />
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton
            quaternary
            circle
            aria-label="換一張驗證碼 Refresh verification code"
            @click="emit('refresh')"
          >
            <template #icon>
              <NIcon :component="RefreshOutline" />
            </template>
          </NButton>
        </template>
        換一張 / Refresh
      </NTooltip>

      <NInput
        :value="modelValue"
        placeholder="請輸入圖形碼 / Enter code"
        class="captcha__input"
        :maxlength="code.length"
        :status="status === 'error' ? 'error' : undefined"
        @update:value="handleInput"
        @blur="emit('verify', modelValue)"
      />
    </div>

    <p class="captcha__feedback" :class="`is-${status}`">
      <template v-if="status === 'ok'">
        <NIcon :component="CheckmarkCircleOutline" size="14" />
        <span>驗證碼正確 <span class="captcha__feedback-en">Verification passed</span></span>
      </template>
      <template v-else-if="status === 'error'">
        <NIcon :component="CloseCircleOutline" size="14" />
        <span>
          驗證碼錯誤，請重新輸入
          <span class="captcha__feedback-en">Incorrect code, please try again</span>
        </span>
      </template>
      <template v-else>
        <span>
          請依圖片輸入驗證碼（不分大小寫）
          <span class="captcha__feedback-en">Enter the code shown above (not case-sensitive)</span>
        </span>
      </template>
    </p>
  </div>
</template>

<style scoped>
.captcha__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.captcha__canvas {
  border-radius: 6px;
  border: 1px solid var(--color-border);
  flex: none;
}

.captcha__input {
  flex: 1;
  min-width: 0;
}

.captcha__input :deep(.n-input__input-el) {
  font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;
  letter-spacing: 0.08em;
}

.captcha__feedback {
  margin: 6px 2px 0;
  font-size: 14px;
  color: var(--color-text-muted);
  display: flex;
  align-items: flex-start;
  gap: 4px;
  min-height: 16px;
}

.captcha__feedback-en {
  display: block;
  font-size: 13px;
  opacity: 0.8;
}

.captcha__feedback.is-ok {
  color: var(--color-success);
}

.captcha__feedback.is-error {
  color: var(--color-error);
}
</style>
