import { expect, test } from 'bun:test'
import { api } from './api'

test('api client exposes all 17 GET endpoints and zero cron POST jobs', () => {
  const keys = Object.keys(api)
  expect(keys).toHaveLength(17)
  expect(keys).not.toContain('dailySync')
  expect(keys).not.toContain('weeklySync')
})
