export type ValidationErrors<T> = Partial<Record<keyof T, string>>

export type Validator<T> = (values: T) => ValidationErrors<T>

type Rule<T> = {
  validate: (value: T) => boolean
  message: string
}

export function requiredText(message: string): Rule<string> {
  return {
    validate: (value) => value.trim().length > 0,
    message,
  }
}

export function optionalEmail(message: string): Rule<string> {
  return {
    validate: (value) => value.trim() === '' || /^\S+@\S+\.\S+$/.test(value.trim()),
    message,
  }
}

export function optionalPhone(message: string): Rule<string> {
  return {
    validate: (value) => value.trim() === '' || /^[0-9+\-\s()]{5,}$/.test(value.trim()),
    message,
  }
}

export function integerField(message: string, options: { min?: number } = {}): Rule<string> {
  return {
    validate: (value) => {
      if (!/^\d+$/.test(value.trim())) return false

      const parsed = Number(value)
      if (!Number.isInteger(parsed)) return false
      if (options.min != null && parsed < options.min) return false
      return true
    },
    message,
  }
}

export function decimalField(message: string, options: { min?: number } = {}): Rule<string> {
  return {
    validate: (value) => {
      if (value.trim() === '') return false
      const parsed = Number(value)
      if (!Number.isFinite(parsed)) return false
      if (options.min != null && parsed < options.min) return false
      return true
    },
    message,
  }
}

export function validateWithSchema<T extends Record<string, string>>(
  values: T,
  schema: Partial<{ [K in keyof T]: Rule<T[K]> }>,
): ValidationErrors<T> {
  const errors: ValidationErrors<T> = {}

  for (const key of Object.keys(schema) as Array<keyof T>) {
    const rule = schema[key]
    if (!rule) continue

    if (!rule.validate(values[key])) {
      errors[key] = rule.message
    }
  }

  return errors
}
