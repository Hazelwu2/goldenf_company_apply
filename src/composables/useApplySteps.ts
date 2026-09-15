import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApplyStore } from '@/stores/applyStore'
import type { ApplyStepMeta } from '@/types/apply'

export interface ApplyStep extends ApplyStepMeta {
  path: string
}

/**
 * 依目前選定的組合，動態產生 Stepper 步驟（步驟數＝實際頁數）。
 * 填寫順序固定 A → MA → SMA；狀態只看「目前路由落在第幾步」——
 * 還沒走到的步驟一律 locked，已經走過的步驟一律 done（可點回去修改），
 * 這與「A 未通過前 MA LOCKED」的循序鎖定語意一致：因為每一步的「下一步」
 * 按鈕本身就擋掉了未通過的表單，使用者不可能在沒通過 A 的狀況下站到 MA 那一步。
 */
export function useApplySteps() {
  const store = useApplyStore()
  const route = useRoute()

  const steps = computed<ApplyStep[]>(() => {
    const list: ApplyStep[] = [
      { key: 'select', label: '選組合', path: '/apply', status: 'upcoming' },
    ]

    for (const level of store.levels) {
      if (level === 'A') {
        list.push({
          key: 'operator',
          label: '營運商 A',
          path: '/apply/operator',
          status: 'upcoming',
        })
      } else if (level === 'MA') {
        list.push({
          key: 'agent-ma',
          label: '代理 MA',
          path: '/apply/agent/ma',
          status: 'upcoming',
        })
      } else if (level === 'SMA') {
        list.push({
          key: 'agent-sma',
          label: '總代理 SMA',
          path: '/apply/agent/sma',
          status: 'upcoming',
        })
      }
    }

    list.push({ key: 'confirm', label: '確認送出', path: '/apply/confirm', status: 'upcoming' })

    const currentIndex = list.findIndex((s) => s.path === route.path)

    return list.map((s, i) => {
      let status: ApplyStepMeta['status']
      if (currentIndex === -1) status = s.status
      else if (i < currentIndex) status = 'done'
      else if (i === currentIndex) status = 'current'
      else status = 'locked'
      return { ...s, status }
    })
  })

  const currentIndex = computed(() => steps.value.findIndex((s) => s.status === 'current'))
  const totalSteps = computed(() => steps.value.length)

  return { steps, currentIndex, totalSteps }
}
