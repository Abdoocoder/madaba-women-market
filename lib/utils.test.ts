import { describe, it, expect } from 'vitest'
import { formatCurrency, interpolateTranslation } from './utils'

describe('formatCurrency', () => {
    it('should format numbers correctly to JOD', () => {
        expect(formatCurrency(10.5)).toBe('10.50 د.أ')
        expect(formatCurrency(100)).toBe('100.00 د.أ')
        expect(formatCurrency(0)).toBe('0.00 د.أ')
    })
})

describe('interpolateTranslation', () => {
    it('should replace placeholders with provided params', () => {
        const translation = 'Hello {name}!'
        const params = { name: 'World' }
        expect(interpolateTranslation(translation, params)).toBe('Hello World!')
    })

    it('should handle multiple placeholders', () => {
        const translation = '{greeting} {name}!'
        const params = { greeting: 'Hi', name: 'John' }
        expect(interpolateTranslation(translation, params)).toBe('Hi John!')
    })

    it('should return empty string if translation is missing', () => {
        expect(interpolateTranslation('', { name: 'test' })).toBe('')
    })
})
