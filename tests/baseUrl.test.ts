import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/supabaseClient', () => ({ auth: null, authConfigError: null }))
const { resolveBaseUrl } = await import('../src/api')

describe('resolveBaseUrl (mixed content)', () => {
  it('uses the same-origin /api proxy when an https page is given an http API', () => {
    expect(resolveBaseUrl('http://13.0.0.1:8000', 'https:')).toBe('')
  })
  it('keeps the configured API locally and for https APIs', () => {
    expect(resolveBaseUrl('http://localhost:8000', 'http:')).toBe('http://localhost:8000')
    expect(resolveBaseUrl('https://api.example.org', 'https:')).toBe('https://api.example.org')
  })
})
