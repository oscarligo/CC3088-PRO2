import type { ReactNode } from 'react'
import './ReportSection.css'

type ReportSectionProps = {
  title: string
  api: string
  children: ReactNode
}

export default function ReportSection({ title, api, children }: ReportSectionProps) {
  return (
    <section className="reportPanel">
      <h3>{title}</h3>
      <p className="muted">
        Endpoint: <code>{api}</code>
      </p>
      {children}
    </section>
  )
}
