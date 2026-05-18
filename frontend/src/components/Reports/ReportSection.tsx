import type { ReactNode } from 'react'
import '../../pages/Reports/Reports.css'

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
        API: <code>{api}</code>
      </p>
      {children}
    </section>
  )
}
