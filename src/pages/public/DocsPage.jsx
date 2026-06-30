import { Link } from 'react-router-dom'
import PublicLayout from './PublicLayout'
import { DOC_SECTIONS } from './docsContent'

/**
 * DocsPage — end-to-end "how VousFin works and how to use it" guide with a
 * sticky table of contents. Data-driven from docsContent.js.
 */
export default function DocsPage() {
  return (
    <PublicLayout title="Documentation">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Documentation</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#C9BFB2]">
          A complete guide to how VousFin works and how to use every part of it — from signing up to
          running payroll, reconciling banks and asking the AI assistant.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Table of contents */}
        <nav aria-label="Table of contents" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B6259]">On this page</p>
          <ul className="space-y-2">
            {DOC_SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-[#A89B8C] transition-colors hover:text-[#C8A96E]">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="min-w-0 max-w-3xl space-y-12">
          {DOC_SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-display text-2xl font-semibold text-[#F5F0E8]">{s.title}</h2>
              {(s.body || []).map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed text-[#A89B8C]">{p}</p>
              ))}
              {s.steps && (
                <ol className="mt-4 space-y-3">
                  {s.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 leading-relaxed text-[#A89B8C]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C8A96E]/30 text-xs text-[#C8A96E]">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              {s.list && (
                <ul className="mt-4 space-y-2">
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

          <div className="border-t border-[#C8A96E]/[0.08] pt-8">
            <Link to="/register" className="inline-flex rounded-lg border border-[#C8A96E]/30 bg-[#C8A96E]/10 px-4 py-2 text-[#F5F0E8] hover:bg-[#C8A96E]/20">
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
