import type { ReactNode } from 'react'
import './FormField.css'

type FormFieldProps = {
  label: string
  children: ReactNode
  className?: string
}

export default function FormField({ label, children, className = '' }: FormFieldProps) {
  return (
    <label className={`formField${className ? ` ${className}` : ''}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  )
}
