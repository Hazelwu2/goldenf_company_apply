import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import type {
  AgentFormState,
  ComboKey,
  ComboOption,
  CompanyLevel,
  OperatorFormState,
} from '@/types/apply'
import { COMBO_LEVELS } from '@/types/apply'
import {
  isValidAdminAccount,
  isValidAgentCode,
  isValidEmail,
  isValidOperatorCode,
  isValidWhitelist,
  isValidWebsiteSection,
} from '@/utils/validators'
import { getCaptchaStatus } from '@/utils/captcha'

export const COMBO_OPTIONS: ComboOption[] = [
  {
    key: 'SMA_MA_A',
    title: '建立总代理、代理及营运商',
    titleEn: 'Create SMA + MA + A',
    levels: ['A', 'MA', 'SMA'],
    description: '建立一个完整代理阶层，包含 1 个总代理 SMA、1 个代理 MA 及 1 个营运商 A。 ',
    descriptionEn: 'Create a complete hierarchy with one SMA, one MA, and one operator A.',
  },
  {
    key: 'MA_A',
    title: '建立代理及营运商',
    titleEn: 'Create MA + A',
    levels: ['A', 'MA'],
    description: '建立 1 个代理 MA，以及由此 MA 管理的 1 个营运商 A。 ',
    descriptionEn: 'Create one MA and one operator A managed by this MA.',
  },
  {
    key: 'MA',
    title: '只建立代理',
    titleEn: 'Create MA only',
    levels: ['MA'],
    description: '本次只建立 1 个代理 MA，不建立营运商 A。 ',
    descriptionEn: 'Create one MA only, without creating an operator A.',
  },
  {
    key: 'A',
    title: '只建立营运商',
    titleEn: 'Create A only',
    levels: ['A'],
    description: '本次只建立 1 个营运商 A，不建立新的 SMA 或 MA。 ',
    descriptionEn: 'Create one operator A only, without creating a new SMA or MA.',
  },
]
/**
 * 内部业务逻辑：没有上层代理时，一律挂在系统预设的根代理底下。
 * 这是后端 parent_code 的推导依据，纯内部代号，不对外显示（画面上不出现这个字串）。
 */
const ROOT_PARENT_CODE = 'GF_MA'

function emptyOperatorForm(): OperatorFormState {
  return {
    currency: null,
    vendorCodes: [],
    code: '',
    name: '',
    adminAccount: '',
    boWhitelist: '',
    apiWhitelist: '',
    email: '',
    operatingMarkets: [],
    websiteStatus: null,
    website: '',
    testAccount: '',
    testPassword: '',
    remark: '',
  }
}

function emptyAgentForm(): AgentFormState {
  return {
    code: '',
    name: '',
    adminAccount: '',
    boWhitelist: '',
    email: '',
    sameAsA: false,
    remark: '',
  }
}

export const useApplyStore = defineStore('apply', () => {
  // ---- 申请组合 ----
  const combo = ref<ComboKey | null>(null)

  const levels = computed<CompanyLevel[]>(() => (combo.value ? COMBO_LEVELS[combo.value] : []))
  const comboOption = computed(() => COMBO_OPTIONS.find((o) => o.key === combo.value) ?? null)
  const hasLevel = (level: CompanyLevel) => levels.value.includes(level)

  function selectCombo(key: ComboKey) {
    combo.value = key
  }

  // ---- 各角色表单 ----
  const operator = reactive<OperatorFormState>(emptyOperatorForm())
  const agentMA = reactive<AgentFormState>(emptyAgentForm())
  const agentSMA = reactive<AgentFormState>(emptyAgentForm())

  function agentForm(level: 'MA' | 'SMA'): AgentFormState {
    return level === 'MA' ? agentMA : agentSMA
  }

  /** 「与 A 相同」勾选时，同步 A 的 bo_whitelist / email 到该角色，并锁住手动输入。 */
  function applySameAsA(level: 'MA' | 'SMA', checked: boolean) {
    const form = agentForm(level)
    form.sameAsA = checked
    if (checked) {
      form.boWhitelist = operator.boWhitelist
      form.email = operator.email
    }
  }

  // 若 A 的白名单 / Email 之后又修改，且 MA／SMA 仍勾选「与 A 相同」，保持同步
  function syncSameAsA() {
    for (const level of ['MA', 'SMA'] as const) {
      const form = agentForm(level)
      if (form.sameAsA) {
        form.boWhitelist = operator.boWhitelist
        form.email = operator.email
      }
    }
  }

  watch(() => [operator.boWhitelist, operator.email], syncSameAsA)

  // ---- 验证（仅格式，对应规格 §3） ----
  const isOperatorValid = computed(() => {
    const f = operator
    if (!f.currency) return false
    if (f.vendorCodes.length === 0) return false
    if (!isValidOperatorCode(f.code)) return false
    if (!isValidAdminAccount(f.adminAccount)) return false
    if (!isValidWhitelist(f.boWhitelist)) return false
    if (!isValidWhitelist(f.apiWhitelist)) return false
    if (!isValidEmail(f.email)) return false
    if (f.operatingMarkets.length === 0) return false
    if (!isValidWebsiteSection(f.websiteStatus, f.website, f.testAccount, f.testPassword))
      return false
    return true
  })

  function isAgentValid(level: 'MA' | 'SMA'): boolean {
    const f = agentForm(level)
    if (!isValidAgentCode(f.code)) return false
    if (!isValidAdminAccount(f.adminAccount)) return false
    if (!isValidWhitelist(f.boWhitelist)) return false
    if (!isValidEmail(f.email)) return false
    return true
  }

  // ---- parent_code 推导（§5，内部栏位，画面不显示、不对使用者提及） ----
  const parentCodeMap = computed<Partial<Record<CompanyLevel, string>>>(() => {
    const map: Partial<Record<CompanyLevel, string>> = {}
    switch (combo.value) {
      case 'A':
        map.A = ROOT_PARENT_CODE
        break
      case 'MA':
        map.MA = ROOT_PARENT_CODE
        break
      case 'MA_A':
        map.A = agentMA.code || '—'
        map.MA = ROOT_PARENT_CODE
        break
      case 'SMA_MA_A':
        map.A = agentMA.code || '—'
        map.MA = agentSMA.code || '—'
        map.SMA = ROOT_PARENT_CODE
        break
    }
    return map
  })

  // ---- 宣告 + 安全验证（C08，前端 state，不进 payload） ----
  const declarationChecked = ref(false)
  const captchaInput = ref('')
  const captchaCode = ref('')
  const captchaStatus = ref<'idle' | 'error' | 'ok'>('idle')

  function regenerateCaptcha() {
    const chars = 'ACDEFGHJKLMNPQRTUVWXY2346789'
    captchaCode.value = Array.from(
      { length: 5 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('')
    captchaInput.value = ''
    captchaStatus.value = 'idle'
  }

  function verifyCaptcha(input = captchaInput.value) {
    captchaStatus.value = getCaptchaStatus(input, captchaCode.value)
  }

  const canSubmit = computed(() => declarationChecked.value && captchaStatus.value === 'ok')

  // ---- 送出结果 ----
  const referenceNo = ref<string | null>(null)
  const submittedAt = ref<string | null>(null)

  function submitApplication() {
    const prefix =
      combo.value === 'SMA_MA_A'
        ? 'SMA'
        : combo.value === 'MA_A'
          ? 'MA'
          : combo.value === 'MA'
            ? 'MA'
            : 'A'
    const rand = Math.floor(100000 + Math.random() * 900000)
    referenceNo.value = `GF-${prefix}-${rand}`
    submittedAt.value = new Date().toISOString()
  }

  function resetAll() {
    combo.value = null
    Object.assign(operator, emptyOperatorForm())
    Object.assign(agentMA, emptyAgentForm())
    Object.assign(agentSMA, emptyAgentForm())
    declarationChecked.value = false
    captchaInput.value = ''
    captchaCode.value = ''
    captchaStatus.value = 'idle'
    referenceNo.value = null
    submittedAt.value = null
  }

  /**
   * 仅供「画面总览」预览使用：灌入一组合理的示范资料，方便检视已填写／已通过验证的状态。
   * 不会呼叫任何 API，纯粹是前端假资料。
   */
  function seedDemoData(
    key: ComboKey,
    options?: { websiteStatus?: OperatorFormState['websiteStatus'] },
  ) {
    resetAll()
    combo.value = key
    const levelsForCombo = COMBO_LEVELS[key]

    if (levelsForCombo.includes('A')) {
      // 尚在开发中时，站台三栏必须留空（与表单规则一致），否则示范资料会卡在无法送出的状态。
      const websiteStatus = options?.websiteStatus ?? 'live'
      const isLive = websiteStatus === 'live'

      Object.assign(operator, {
        currency: 'CNY',
        vendorCodes: ['PP', 'JILI'],
        code: 'GFA1',
        name: '',
        adminAccount: 'gfdemo01',
        boWhitelist: '203.0.113.10, 198.51.100.0/24',
        apiWhitelist: '203.0.113.10',
        email: 'ops@goldenf-demo.example',
        operatingMarkets: ['CN', 'VN'],
        websiteStatus,
        website: isLive ? 'https://a.gfdemo-example.com' : '',
        testAccount: isLive ? 'testuser01' : '',
        testPassword: isLive ? 'Tt123456' : '',
        remark: '',
      } satisfies OperatorFormState)
    }
    if (levelsForCombo.includes('MA')) {
      Object.assign(agentMA, {
        code: 'MAGOLD',
        name: '',
        adminAccount: 'gfma0001',
        boWhitelist: '203.0.113.20',
        email: 'ma@goldenf-demo.example',
        sameAsA: false,
        remark: '',
      } satisfies AgentFormState)
    }
    if (levelsForCombo.includes('SMA')) {
      Object.assign(agentSMA, {
        code: 'SMAROOT',
        name: '',
        adminAccount: 'gfsma001',
        boWhitelist: '203.0.113.30',
        email: 'sma@goldenf-demo.example',
        sameAsA: false,
        remark: '',
      } satisfies AgentFormState)
    }
  }

  return {
    combo,
    levels,
    comboOption,
    hasLevel,
    selectCombo,

    operator,
    agentMA,
    agentSMA,
    agentForm,
    applySameAsA,
    syncSameAsA,

    isOperatorValid,
    isAgentValid,
    parentCodeMap,

    declarationChecked,
    captchaInput,
    captchaCode,
    captchaStatus,
    regenerateCaptcha,
    verifyCaptcha,
    canSubmit,

    referenceNo,
    submittedAt,
    submitApplication,
    resetAll,
    seedDemoData,
  }
})
