import { createRouter, createWebHistory } from 'vue-router'
import { useApplyStore } from '@/stores/applyStore'

declare module 'vue-router' {
  interface RouteMeta {
    /** 对应 Wireframe 的画面编号，纯标示用 */
    screenId?: string
    /** Stepper 显示文字；不需要进 Stepper 的页面（C09/C10/preview）留空 */
    stepLabel?: string
    /** 需要先选好组合才能进入 */
    requiresCombo?: true
    /** 需要组合里包含此 level 才能进入（C03 / C07） */
    requiresLevel?: 'A' | 'MA' | 'SMA'
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 96 }
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: '/apply',
    },
    {
      path: '/apply',
      name: 'select-combo',
      component: () => import('@/views/apply/SelectComboView.vue'),
      meta: { screenId: 'C01', stepLabel: '选择申请组合' },
    },
    {
      path: '/apply/operator',
      name: 'operator-form',
      component: () => import('@/views/apply/OperatorFormView.vue'),
      meta: { screenId: 'C03', stepLabel: '营运商 A', requiresCombo: true, requiresLevel: 'A' },
    },
    {
      path: '/apply/agent/ma',
      name: 'agent-ma-form',
      component: () => import('@/views/apply/AgentFormView.vue'),
      props: { level: 'MA' },
      meta: { screenId: 'C07', stepLabel: '代理 MA', requiresCombo: true, requiresLevel: 'MA' },
    },
    {
      path: '/apply/agent/sma',
      name: 'agent-sma-form',
      component: () => import('@/views/apply/AgentFormView.vue'),
      props: { level: 'SMA' },
      meta: { screenId: 'C07', stepLabel: '总代理 SMA', requiresCombo: true, requiresLevel: 'SMA' },
    },
    {
      path: '/apply/confirm',
      name: 'confirm',
      component: () => import('@/views/apply/ConfirmView.vue'),
      meta: { screenId: 'C08', stepLabel: '确认送出', requiresCombo: true },
    },
    {
      path: '/apply/rejected',
      name: 'rejected',
      component: () => import('@/views/apply/RejectedView.vue'),
      meta: { screenId: 'C09' },
    },
    {
      path: '/apply/success',
      name: 'success',
      component: () => import('@/views/apply/SuccessView.vue'),
      meta: { screenId: 'C10' },
    },
    {
      path: '/apply/preview',
      name: 'preview',
      component: () => import('@/views/apply/PreviewIndexView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/apply',
    },
  ],
})

router.beforeEach((to) => {
  if (!to.meta.requiresCombo) return true

  const store = useApplyStore()
  if (!store.combo) {
    return { name: 'select-combo' }
  }
  if (to.meta.requiresLevel && !store.hasLevel(to.meta.requiresLevel)) {
    return { name: 'select-combo' }
  }
  return true
})

export default router
