import { httpClient } from '@/api/httpClient'
import { loadMockCurrencies } from '@/mocks/currencyApi'

export interface CurrencyOption {
  value: string
  label: string
  memo: string
}

export interface CurrencyApiDependencies {
  mode?: 'mock' | 'live'
  mockRequest?: () => Promise<unknown>
  client?: CurrencyHttpClient
}

export interface CurrencyHttpClient {
  post(
    url: string,
    body: unknown,
    config: { headers: { 'Content-Type': string } },
  ): Promise<{ data: unknown }>
}

export interface CurrencyApiItem {
  code: string
  name: string
  memo: string
}

export interface CurrencyApiResponse {
  status: number
  message: string
  data: { list: CurrencyApiItem[] }
}

export function isCurrencySelectionAvailable(
  options: CurrencyOption[],
  selectedCurrency: string | null,
): boolean {
  return (
    selectedCurrency !== null && options.some((currency) => currency.value === selectedCurrency)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCurrencyApiItem(value: unknown): value is CurrencyApiItem {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.name === 'string' &&
    typeof value.memo === 'string'
  )
}

function isCurrencyApiResponse(value: unknown): value is CurrencyApiResponse {
  if (!isRecord(value) || typeof value.status !== 'number' || typeof value.message !== 'string') {
    return false
  }
  if (!isRecord(value.data) || !Array.isArray(value.data.list)) return false
  return value.data.list.every(isCurrencyApiItem)
}

export async function getCurrencies(
  dependencies: CurrencyApiDependencies = {},
): Promise<CurrencyOption[]> {
  const configuredMode = (import.meta as ImportMeta & { env?: { VITE_API_MODE?: string } }).env
    ?.VITE_API_MODE
  const mode = dependencies.mode ?? (configuredMode === 'live' ? 'live' : 'mock')
  const response =
    mode === 'live'
      ? (
          await (dependencies.client ?? httpClient).post(
            '/api/v1/exchange/list',
            {},
            { headers: { 'Content-Type': 'application/json' } },
          )
        )?.data
      : await (dependencies.mockRequest ?? loadMockCurrencies)()

  if (!isCurrencyApiResponse(response) || response.status !== 1) {
    throw new Error('Invalid currency response')
  }

  return response.data.list.map((currency) => ({
    value: currency.code,
    label: `${currency.code} ${currency.name}`,
    memo: currency.memo,
  }))
}
