import { z } from 'zod'

/** Must match backend PASSWORD_REGEX in vousfin-backend-main/config/constants.js */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export const PASSWORD_HINT =
  'At least 8 characters with uppercase, lowercase, a number, and a symbol (e.g. Uzair123@)'

export const passwordZodRule = () =>
  z.string().regex(PASSWORD_REGEX, PASSWORD_HINT)
