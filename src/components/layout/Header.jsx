import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { cn } from '../../lib/cn'
import Button from '../ui/Button'

const navLinkClass = ({ isActive }) =>
  cn(
    'rounded-md border border-transparent px-3.5 py-2 text-text transition-colors hover:border-border hover:bg-surface hover:text-text-h',
    isActive && 'border-border bg-surface text-text-h',
  )

export default function Header() {
  const { itemCount, toggleCart } = useCart()
  const { isAuthenticated, isAdmin, profile, signOut, isConfigured } = useAuth()

  return (
    <header className="flex flex-wrap items-center gap-6 border-b border-border py-5 max-md:flex-col max-md:items-stretch">
      <div className="min-w-[200px] flex-1 text-left">
        <Link to="/" className="inline-flex items-center gap-2 no-underline text-text-h">
          <span className="font-mono text-xl text-accent">▮</span>
          <span className="font-mono text-[1.35rem] font-bold uppercase tracking-widest">Virtual Bytez</span>
        </Link>
        <p className="mt-1 text-sm text-text-muted">Curated vintage tech, built your way</p>
      </div>

      <nav className="flex gap-2 max-md:order-3" aria-label="Main">
        <NavLink to="/" className={navLinkClass} end>
          Home
        </NavLink>
        <NavLink to="/shop" className={navLinkClass}>
          Shop
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/account" className={navLinkClass}>
            Account
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin" className={navLinkClass}>
            Admin
          </NavLink>
        )}
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>{profile?.full_name ?? profile?.email ?? 'Signed in'}</span>
            <Button variant="default" size="sm" onClick={signOut} disabled={!isConfigured}>
              Sign out
            </Button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-sm no-underline">
            Sign in
          </Link>
        )}

        <button
          type="button"
          className="relative rounded-md border border-accent-border bg-accent-bg px-4 py-2 font-mono text-accent max-md:self-start"
          onClick={() => toggleCart(true)}
        >
          Cart
          {itemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-bold text-bg">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
