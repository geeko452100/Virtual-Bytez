import { Link } from 'react-router-dom'

export default function AuthLayout({ children }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-[1120px] flex-col px-5">
      <header className="py-6">
        <Link to="/" className="inline-flex items-center gap-2 no-underline text-text-h">
          <span className="font-mono text-xl text-accent">▮</span>
          <span className="font-mono text-[1.35rem] font-bold uppercase tracking-widest">Virtual Bytez</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center py-8">{children}</main>

      <footer className="py-6 text-center text-sm text-text-muted">
        <Link to="/shop" className="text-text-muted no-underline hover:text-text">
          Continue browsing without an account
        </Link>
      </footer>
    </div>
  )
}
