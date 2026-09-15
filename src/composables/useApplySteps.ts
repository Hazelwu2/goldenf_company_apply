import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApplyStore } from '@/stores/applyStore'
import type { ApplyStepMeta } from '@/types/apply'

export interface ApplyStep extends ApplyStepMeta {
  path: string
}

/**
 * 依目前选定的组合，动态产生 Stepper 步骤（步骤数＝实际页数）。
 * 填写顺序固定 A → MA → SMA；状态只看「目前路由落在第几步」——
 * 还没走到的步骤一律 locked，已经走过的步骤一律 done（可点回去修改），
 * 这与「A 未通过前 MA LOCKED」的循序锁定语意一致：因为每一步的「下一步」
 * 按钮本身就挡掉了未通过的表单，使用者不可能在没通过 A 的状况下站到 MA 那一步。
 */
export function useApplySteps() {
  const store = useApplyStore()
  const route = useRoute()

  const steps = computed<ApplyStep[]>(() => {
    const list: ApplyStep[] = [
      {
        key: 'select',
        label: '选组合',
        labelEn: 'Select Type',
        path: '/apply',
        status: 'upcoming',
      },
    ]

    for (const level of store.levels) {
      if (level === 'A') {
        list.push({
          key: 'operator',
          label: '营运商 A',
          labelEn: 'Operator A',
          path: '/apply/operator',
          status: 'upcoming',
        })
      } else if (level === 'MA') {
        list.push({
          key: 'agent-ma',
          label: '代理 MA',
          labelEn: 'Agent MA',
          path: '/apply/agent/ma',
          status: 'upcoming',
        })
      } else if (level === 'SMA') {
        list.push({
          key: 'agent-sma',
          label: '总代理 SMA',
          labelEn: 'Super Agent SMA',
          path: '/apply/agent/sma',
          status: 'upcoming',
        })
      }
    }

    list.push({
      key: 'confirm',
      label: '确认送出',
      labelEn: 'Review & Submit',
      path: '/apply/confirm',
      status: 'upcoming',
    })

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
