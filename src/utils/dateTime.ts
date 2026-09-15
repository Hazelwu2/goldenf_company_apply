function formatUtcOffset(timezoneOffsetMinutes: number): string {
  const totalMinutes = Math.abs(timezoneOffsetMinutes)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const sign = timezoneOffsetMinutes <= 0 ? '+' : '-'
  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`
}

export function formatSubmittedAt(
  value: string | null,
  timezoneOffsetMinutes?: number,
): string {
  if (!value) return '—'
  const instant = new Date(value)
  if (Number.isNaN(instant.getTime())) return '—'
  const offset = timezoneOffsetMinutes ?? instant.getTimezoneOffset()
  const localTime = new Date(instant.getTime() - offset * 60_000)
  const pad = (number: number) => String(number).padStart(2, '0')
  const dateTime = `${localTime.getUTCFullYear()}/${pad(localTime.getUTCMonth() + 1)}/${pad(localTime.getUTCDate())} ${pad(localTime.getUTCHours())}:${pad(localTime.getUTCMinutes())}`
  return `${dateTime} (${formatUtcOffset(offset)})`
}
