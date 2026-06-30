import { describe, it, expect } from 'vitest'
import { isHowToQuery } from './intent'

describe('isHowToQuery', () => {
  it.each([
    ['how do i create an invoice', true],
    ['how to reconcile the bank', true],
    ['where do i see who owes me', true],
    ['can i export my customers', true],
    ['why is my balance negative', true],
    ['invoices', false],
    ['reconcile', false],
    ['how', false], // too short
  ])('classifies "%s" -> %s', (q, expected) => {
    expect(isHowToQuery(q)).toBe(expected)
  })
})
