import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="flex flex-col gap-12">
      <div className="mx-auto max-w-[680px] px-0 py-8 pt-8 text-center">
        <p className="mb-4 font-mono text-sm uppercase tracking-widest text-phosphor">
          Est. whenever beige was king
        </p>
        <h1>Vintage tech,<br />customized for you</h1>
        <p className="mx-auto my-4 mb-7 max-w-[540px] text-text-muted">
          Virtual Bytez restores and configures classic computers, audio gear, gaming hardware, and film cameras.
          Pick your finish, mods, and extras — we build it to order.
        </p>
        <Link to="/shop" className="btn btn-primary btn-lg inline-block no-underline">
          Browse the collection
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        <article className="panel rounded-[10px] p-5 text-left">
          <h3>Hand-restored</h3>
          <p className="text-[0.95rem] text-text-muted">Every unit is tested, cleaned, and graded before it ships.</p>
        </article>
        <article className="panel rounded-[10px] p-5 text-left">
          <h3>Real-time pricing</h3>
          <p className="text-[0.95rem] text-text-muted">Options update your total instantly — no surprises at checkout.</p>
        </article>
        <article className="panel rounded-[10px] p-5 text-left">
          <h3>Save your builds</h3>
          <p className="text-[0.95rem] text-text-muted">Sign in to save configurations and reorder your favorite setups.</p>
        </article>
      </div>
    </section>
  )
}
