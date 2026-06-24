import { useTranslation } from 'react-i18next'
import AppearanceCard from '@/components/settings/AppearanceCard'
import ModulesCard from '@/components/settings/ModulesCard'
import { cn } from '@/utils/cn'

/*
 * AppearancePage — theming + language preference.
 * Route: /settings/appearance
 * NFR-USE-01: Urdu i18n language switcher wired here.
 */
export default function AppearancePage() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  const switchLang = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('vf_lang', lang)
    document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Appearance</h1>
        <p className="text-text-secondary mt-1">Choose how VousFin looks. Your theme is saved on this device.</p>
      </div>

      <AppearanceCard />

      {/* Navigation modules — show only what this business uses */}
      <ModulesCard />

      {/* Language switcher — NFR-USE-01 */}
      <div className="premium-card p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-text-primary">Language</h3>
          <p className="mt-1 text-[13px] text-text-secondary">
            Choose your display language. Applies to key labels across the app.
          </p>
        </div>
        <div className="flex gap-3" role="group" aria-label="Language selection">
          {[
            { code: 'en', label: 'English' },
            { code: 'ur', label: 'اردو' },
          ].map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={currentLang === code}
              onClick={() => switchLang(code)}
              className={cn(
                'px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                currentLang === code
                  ? 'btn-gradient border-transparent'
                  : 'btn-outline text-text-secondary hover:text-text-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
