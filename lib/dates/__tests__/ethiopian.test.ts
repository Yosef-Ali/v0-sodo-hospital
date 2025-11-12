import {
  gregorianToEC,
  ecToGregorian,
  formatEC,
  parseECDate,
  isValidECDate,
  compareECDates,
  diffDaysEC,
  addDaysEC,
  type ECDate,
} from '../ethiopian'

describe('Ethiopian Calendar Conversions', () => {
  describe('gregorianToEC', () => {
    it('converts Ethiopian New Year correctly', () => {
      // Sept 11, 2024 = Meskerem 1, 2017 EC
      const greg = new Date(2024, 8, 11)
      const ec = gregorianToEC(greg)
      expect(ec).toEqual({ year: 2017, month: 1, day: 1 })
    })

    it('converts middle of month correctly', () => {
      // Sept 25, 2024 = Meskerem 15, 2017 EC
      const greg = new Date(2024, 8, 25)
      const ec = gregorianToEC(greg)
      expect(ec).toEqual({ year: 2017, month: 1, day: 15 })
    })

    it('converts Pagume month correctly', () => {
      // Sept 5, 2024 = Pagume 5, 2016 EC (last day of prev year)
      const greg = new Date(2024, 8, 5)
      const ec = gregorianToEC(greg)
      expect(ec.month).toBe(13) // Pagume
    })

    it('converts Christmas (Genna) correctly', () => {
      // Jan 7, 2025 = Tahsas 29, 2017 EC
      const greg = new Date(2025, 0, 7)
      const ec = gregorianToEC(greg)
      expect(ec.month).toBe(4) // Tahsas
    })
  })

  describe('ecToGregorian', () => {
    it('converts Ethiopian New Year correctly', () => {
      const ec: ECDate = { year: 2017, month: 1, day: 1 }
      const greg = ecToGregorian(ec)
      expect(greg.getMonth()).toBe(8) // September (0-indexed)
      expect(greg.getDate()).toBe(11)
      expect(greg.getFullYear()).toBe(2024)
    })

    it('throws error for invalid month', () => {
      const ec: ECDate = { year: 2017, month: 14, day: 1 }
      expect(() => ecToGregorian(ec)).toThrow('Invalid Ethiopian month')
    })

    it('throws error for invalid Pagume day', () => {
      const ec: ECDate = { year: 2017, month: 13, day: 7 }
      expect(() => ecToGregorian(ec)).toThrow('Invalid Pagume day')
    })
  })

  describe('round-trip conversions', () => {
    it('converts Gregorian -> EC -> Gregorian correctly', () => {
      const dates = [
        new Date(2024, 0, 1),   // Jan 1, 2024
        new Date(2024, 5, 15),  // June 15, 2024
        new Date(2024, 11, 25), // Dec 25, 2024
      ]

      dates.forEach(originalDate => {
        const ec = gregorianToEC(originalDate)
        const backToGreg = ecToGregorian(ec)

        expect(backToGreg.getFullYear()).toBe(originalDate.getFullYear())
        expect(backToGreg.getMonth()).toBe(originalDate.getMonth())
        expect(backToGreg.getDate()).toBe(originalDate.getDate())
      })
    })
  })

  describe('formatEC', () => {
    const ec: ECDate = { year: 2017, month: 1, day: 15 }

    it('formats in English long format', () => {
      expect(formatEC(ec, 'en', 'long')).toBe('Meskerem 15, 2017')
    })

    it('formats in Amharic long format', () => {
      expect(formatEC(ec, 'am', 'long')).toBe('መስከረም 15, 2017')
    })

    it('formats in ISO format', () => {
      expect(formatEC(ec, 'en', 'iso')).toBe('2017-01-15')
    })

    it('formats in short format', () => {
      expect(formatEC(ec, 'en', 'short')).toBe('01/15/2017')
    })
  })

  describe('parseECDate', () => {
    it('parses valid ISO date', () => {
      const ec = parseECDate('2017-01-15')
      expect(ec).toEqual({ year: 2017, month: 1, day: 15 })
    })

    it('throws error for invalid format', () => {
      expect(() => parseECDate('2017/01/15')).toThrow('Invalid Ethiopian date format')
    })

    it('throws error for non-numeric values', () => {
      expect(() => parseECDate('2017-01-XX')).toThrow('non-numeric values')
    })
  })

  describe('isValidECDate', () => {
    it('validates correct dates', () => {
      expect(isValidECDate({ year: 2017, month: 1, day: 15 })).toBe(true)
      expect(isValidECDate({ year: 2017, month: 13, day: 5 })).toBe(true)
    })

    it('rejects invalid months', () => {
      expect(isValidECDate({ year: 2017, month: 0, day: 1 })).toBe(false)
      expect(isValidECDate({ year: 2017, month: 14, day: 1 })).toBe(false)
    })

    it('rejects invalid days', () => {
      expect(isValidECDate({ year: 2017, month: 1, day: 31 })).toBe(false)
      expect(isValidECDate({ year: 2017, month: 13, day: 7 })).toBe(false)
    })
  })

  describe('compareECDates', () => {
    it('compares dates correctly', () => {
      const a: ECDate = { year: 2017, month: 1, day: 1 }
      const b: ECDate = { year: 2017, month: 1, day: 15 }
      const c: ECDate = { year: 2017, month: 1, day: 1 }

      expect(compareECDates(a, b)).toBe(-1) // a < b
      expect(compareECDates(b, a)).toBe(1)  // b > a
      expect(compareECDates(a, c)).toBe(0)  // a === c
    })
  })

  describe('addDaysEC', () => {
    it('adds days correctly within same month', () => {
      const ec: ECDate = { year: 2017, month: 1, day: 1 }
      const result = addDaysEC(ec, 14)
      expect(result).toEqual({ year: 2017, month: 1, day: 15 })
    })

    it('adds days across months', () => {
      const ec: ECDate = { year: 2017, month: 1, day: 25 }
      const result = addDaysEC(ec, 10)
      expect(result).toEqual({ year: 2017, month: 2, day: 5 })
    })
  })

  describe('diffDaysEC', () => {
    it('calculates difference correctly', () => {
      const a: ECDate = { year: 2017, month: 1, day: 1 }
      const b: ECDate = { year: 2017, month: 1, day: 15 }
      expect(diffDaysEC(a, b)).toBe(14)
      expect(diffDaysEC(b, a)).toBe(-14)
    })
  })
})
