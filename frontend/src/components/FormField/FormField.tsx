import type { ReactNode } from 'react'
import './FormField.css'

type FormFieldProps = {
  label: string
  children: ReactNode
  className?: string
  hint?: ReactNode
  error?: ReactNode
}

export default function FormField({ label, children, className = '', hint, error }: FormFieldProps) {
  return (
    <label className={`formField${className ? ` ${className}` : ''}`}>
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="formFieldHint">{hint}</span> : null}
      {error ? <span className="formFieldError">{error}</span> : null}
    </label>
  )
}
