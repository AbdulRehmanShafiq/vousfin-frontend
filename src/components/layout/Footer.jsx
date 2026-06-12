export default function Footer() {
  return (
    <footer className="border-t border-glass bg-navy-2 px-6 py-6 text-sm text-text-muted">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <p>? {new Date().getFullYear()} vousFin. AI-powered smart accounting.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-brand-600">Privacy</a>
          <a href="#" className="hover:text-brand-600">Terms</a>
          <a href="#" className="hover:text-brand-600">Support</a>
        </div>
      </div>
    </footer>
  )
}
