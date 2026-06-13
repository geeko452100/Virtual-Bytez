import { PORTFOLIO_PROJECTS_URL } from '../../lib/config'

export default function BackToPortfolio({ className = '' }) {
  return (
    <a
      href={PORTFOLIO_PROJECTS_URL}
      className={`inline-flex items-center gap-2 font-mono text-sm text-text-muted no-underline transition-colors hover:text-accent ${className}`}
      aria-label="Return to portfolio"
    >
      <span aria-hidden="true">&lt;--</span>
      <span>Portfolio</span>
    </a>
  )
}
