import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApplyStore } from '@/stores/applyStore'
import type { ApplyStepMeta } from '@/types/apply'

/*
  計算並管理申請流程中步驟條的狀態
*/
export interface ApplyStep extends ApplyStepMeta {
  path: string
}

/**
 * 依選定組合動態產生 Stepper（A → MA → SMA）。
 *
 * 步驟狀態純看當前路由：未到即鎖定、已過即完成（可回頭修改）。
 * 由於各頁「下一步」已卡住未通過的表單，使用者無法跳頁，
 * 故直接以路由位置決定狀態即可符合循序鎖定。
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

    /*
      動態組裝步驟陣列 (list)

      1. 靜態：固定加入「选组合」步驟
      2. 動態：讀取 store.levels 中的設定，依照順序判斷是否加入 (A → MA → SMA)
      3. 最後一步驟：固定加入「確認送出」
    */
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

    // 利用 route.path 計算出使用者目前在哪個步驟
    const currentIndex = list.findIndex((s) => s.path === route.path)

    // 利用 map forloop 所有步驟並更新 status
    return list.map((s, i) => {
      let status: ApplyStepMeta['status']
      if (currentIndex === -1) status = s.status // 當前路由不在步驟清單中，維持原本的 status
      else if (i < currentIndex) status = 'done' // 前幾步（i < currentIndex）已完成，可回頭修改
      else if (i === currentIndex) status = 'current' // 當前頁面 (i === currentIndex) 為正在進行
      else status = 'locked'  // 後續頁面 (i > currentIndex) 尚未到達此頁，鎖定
      return { ...s, status }
    })
  })

  // 計算目前步驟的索引與總步驟數，方便 UI 顯示進度
  const currentIndex = computed(() => steps.value.findIndex((s) => s.status === 'current'))
  const totalSteps = computed(() => steps.value.length)

  return { steps, currentIndex, totalSteps }
}
