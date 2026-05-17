import type { ReactNode } from 'react'
import './PageHeader.css'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
}

export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="pageHeaderBlock">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <div className="pageHeaderText">
        <h2>{title}</h2>
        {description ? <div className="pageHeaderDescription">{description}</div> : null}
      </div>
      {actions ? <div className="pageHeaderActions">{actions}</div> : null}
    </header>
  )
}
