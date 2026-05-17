import type { ReactNode } from 'react'
import './StatusMessage.css'

type StatusMessageProps = {
  kind?: 'loading' | 'error' | 'empty' | 'info'
  children: ReactNode
}

export default function StatusMessage({ kind = 'info', children }: StatusMessageProps) {
  return (
    <p className={`statusMessage ${kind === 'error' ? 'isError' : ''} ${kind === 'loading' ? 'isLoading' : ''}`} role={kind === 'error' ? 'alert' : undefined}>
      {children}
    </p>
  )
}
