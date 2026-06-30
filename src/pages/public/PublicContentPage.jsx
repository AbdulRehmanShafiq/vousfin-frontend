import { Link } from 'react-router-dom'
import PublicLayout from './PublicLayout'
import { CONTENT } from './publicContent'

/**
 * Renders one company/legal doc from publicContent by key. Used for /about,
 * /contact, /careers, /blog, /privacy, /terms, /security, /gdpr.
 */
export default function PublicContentPage({ doc }) {
  const data = CONTENT[doc]
  if (!data) {
    return (
      <PublicLayout title="Not found">
        <p className="text-[#A89B8C]">That page doesn’t exist. <Link to="/" className="text-[#C8A96E] underline">Go home</Link>.</p>
      </PublicLayout>
    )
  }

  const ctaIsInternal = data.cta && data.cta.href?.startsWith('/')

  return (
    <PublicLayout title={data.title}>
      <article className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{data.title}</h1>
        {data.updated && <p className="mt-2 text-sm text-[#6B6259]">{data.updated}</p>}
        {data.intro && <p className="mt-5 text-lg leading-relaxed text-[#C9BFB2]">{data.intro}</p>}

        <div className="mt-10 space-y-10">
          {data.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold text-[#F5F0E8]">{s.heading}</h2>
              {(s.body || []).map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed text-[#A89B8C]">{p}</p>
              ))}
              {s.list && (
                <ul className="mt-3 space-y-2">
                  {s.list.map((li) => (
                    <li key={li} className="flex gap-2 leading-relaxed text-[#A89B8C]">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8A96E]" />
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {data.cta && (
          <div className="mt-12">
            {ctaIsInternal ? (
              <Link to={data.cta.href} className="inline-flex rounded-lg border border-[#C8A96E]/30 bg-[#C8A96E]/10 px-4 py-2 text-[#F5F0E8] hover:bg-[#C8A96E]/20">
                {data.cta.label}
              </Link>
            ) : (
              <a href={data.cta.href} className="inline-flex rounded-lg border border-[#C8A96E]/30 bg-[#C8A96E]/10 px-4 py-2 text-[#F5F0E8] hover:bg-[#C8A96E]/20">
                {data.cta.label}
              </a>
            )}
          </div>
        )}
      </article>
    </PublicLayout>
  )
}
