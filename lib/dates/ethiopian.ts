/**
 * Ethiopian Calendar Conversion Utilities
 *
 * Ethiopian calendar (ዘ-አመተ-ምህረት) is 7-8 years behind Gregorian
 * Has 13 months: 12 months of 30 days + Pagume (5-6 days)
 * New Year: Meskerem 1 (September 11 in Gregorian, September 12 in leap years)
 */

export interface ECDate {
  year: number
  month: number  // 1-13 (1=Meskerem, 13=Pagume)
  day: number    // 1-30 (Pagume: 1-5 or 1-6 in leap years)
}

// Ethiopian month names
export const EC_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen'
]

export const EC_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ኃምሌ', 'ነሐሴ', 'ጳጉሜን'
]

/**
 * Check if an Ethiopian year is a leap year
 * Leap year follows same pattern as Gregorian but shifted
 */
export function isEthiopianLeapYear(year: number): boolean {
  return (year + 1) % 4 === 0
}

/**
 * Check if a Gregorian year is a leap year
 */
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

/**
 * Convert Gregorian date to Ethiopian calendar
 * Based on the Coptic/Ethiopian calendar algorithm
 */
export function gregorianToEC(date: Date): ECDate {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Ethiopian New Year starts on September 11 (or 12 in Gregorian leap years)
  const newYearDay = isGregorianLeapYear(year) ? 12 : 11

  let ecYear: number
  let ecMonth: number
  let ecDay: number

  // Calculate Ethiopian year
  if (month < 9 || (month === 9 && day < newYearDay)) {
    ecYear = year - 8
  } else {
    ecYear = year - 7
  }

  // Calculate day of Ethiopian year
  const gregDayOfYear = getDayOfYear(date)
  const ecNewYearGreg = new Date(year, 8, newYearDay) // Sept 11/12
  const ecNewYearDayOfYear = getDayOfYear(ecNewYearGreg)

  let ecDayOfYear: number
  if (gregDayOfYear >= ecNewYearDayOfYear) {
    ecDayOfYear = gregDayOfYear - ecNewYearDayOfYear + 1
  } else {
    // Previous Ethiopian year
    const prevYearDays = isGregorianLeapYear(year - 1) ? 366 : 365
    const prevEcNewYearGreg = new Date(year - 1, 8, isGregorianLeapYear(year - 1) ? 12 : 11)
    const prevEcNewYearDayOfYear = getDayOfYear(prevEcNewYearGreg)
    ecDayOfYear = prevYearDays - prevEcNewYearDayOfYear + gregDayOfYear + 1
  }

  // Convert day of year to month/day
  if (ecDayOfYear <= 360) {
    ecMonth = Math.floor((ecDayOfYear - 1) / 30) + 1
    ecDay = ((ecDayOfYear - 1) % 30) + 1
  } else {
    // Pagume month
    ecMonth = 13
    ecDay = ecDayOfYear - 360
  }

  return { year: ecYear, month: ecMonth, day: ecDay }
}

/**
 * Convert Ethiopian calendar date to Gregorian
 */
export function ecToGregorian(ec: ECDate): Date {
  const { year, month, day } = ec

  // Validate input
  if (month < 1 || month > 13) {
    throw new Error('Invalid Ethiopian month: must be 1-13')
  }
  if (day < 1 || day > 30) {
    throw new Error('Invalid Ethiopian day: must be 1-30 (1-6 for Pagume)')
  }
  if (month === 13 && day > (isEthiopianLeapYear(year) ? 6 : 5)) {
    throw new Error(`Invalid Pagume day for year ${year}`)
  }

  // Calculate Gregorian year
  const gregYear = year + 7 // Most of EC year overlaps with year+7

  // Ethiopian New Year in Gregorian calendar
  const newYearDay = isGregorianLeapYear(gregYear) ? 12 : 11
  const ecNewYear = new Date(gregYear, 8, newYearDay) // Sept 11/12

  // Calculate day offset from EC new year
  let dayOffset: number
  if (month <= 12) {
    dayOffset = (month - 1) * 30 + (day - 1)
  } else {
    // Pagume
    dayOffset = 360 + (day - 1)
  }

  // Add offset to Ethiopian New Year
  const result = new Date(ecNewYear)
  result.setDate(result.getDate() + dayOffset)

  return result
}

/**
 * Get day of year (1-365/366) for a Gregorian date
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Format Ethiopian date as string
 * @param ec Ethiopian date
 * @param locale 'en' or 'am' for month names
 * @param format 'long' | 'short' | 'iso'
 */
export function formatEC(ec: ECDate, locale: 'en' | 'am' = 'en', format: 'long' | 'short' | 'iso' = 'long'): string {
  const monthNames = locale === 'am' ? EC_MONTHS_AM : EC_MONTHS_EN

  if (format === 'iso') {
    // ISO-like format: YYYY-MM-DD
    return `${ec.year}-${String(ec.month).padStart(2, '0')}-${String(ec.day).padStart(2, '0')}`
  } else if (format === 'short') {
    // Short: MM/DD/YYYY
    return `${String(ec.month).padStart(2, '0')}/${String(ec.day).padStart(2, '0')}/${ec.year}`
  } else {
    // Long: Month Day, Year
    return `${monthNames[ec.month - 1]} ${ec.day}, ${ec.year}`
  }
}

/**
 * Parse Ethiopian date string in ISO format (YYYY-MM-DD)
 */
export function parseECDate(dateString: string): ECDate {
  const parts = dateString.split('-')
  if (parts.length !== 3) {
    throw new Error('Invalid Ethiopian date format. Expected YYYY-MM-DD')
  }

  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error('Invalid Ethiopian date: contains non-numeric values')
  }

  return { year, month, day }
}

/**
 * Get current date in Ethiopian calendar
 */
export function getCurrentECDate(): ECDate {
  return gregorianToEC(new Date())
}

/**
 * Compare two Ethiopian dates
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareECDates(a: ECDate, b: ECDate): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1
  if (a.month !== b.month) return a.month < b.month ? -1 : 1
  if (a.day !== b.day) return a.day < b.day ? -1 : 1
  return 0
}

/**
 * Add days to an Ethiopian date
 * This is done by converting to Gregorian, adding days, and converting back
 */
export function addDaysEC(ec: ECDate, days: number): ECDate {
  const greg = ecToGregorian(ec)
  greg.setDate(greg.getDate() + days)
  return gregorianToEC(greg)
}

/**
 * Calculate difference in days between two Ethiopian dates
 */
export function diffDaysEC(a: ECDate, b: ECDate): number {
  const gregA = ecToGregorian(a)
  const gregB = ecToGregorian(b)
  const diff = gregB.getTime() - gregA.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Check if Ethiopian date is valid
 */
export function isValidECDate(ec: ECDate): boolean {
  try {
    if (ec.month < 1 || ec.month > 13) return false
    if (ec.day < 1) return false
    if (ec.month <= 12 && ec.day > 30) return false
    if (ec.month === 13) {
      const maxDay = isEthiopianLeapYear(ec.year) ? 6 : 5
      if (ec.day > maxDay) return false
    }
    // Try conversion to verify it works
    ecToGregorian(ec)
    return true
  } catch {
    return false
  }
}
