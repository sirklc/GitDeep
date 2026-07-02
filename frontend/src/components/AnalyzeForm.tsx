import { useState, type FormEvent } from 'react'
import { useLocale } from '../i18n'

interface Props {
  busy: boolean
  onSubmit: (url: string) => void
}

export default function AnalyzeForm({ busy, onSubmit }: Props) {
  const { t } = useLocale()
  const [url, setUrl] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
      <label htmlFor="repo-url" className="sr-only">
        GitHub repository URL
      </label>
      <input
        id="repo-url"
        type="url"
        required
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={t.analyze.placeholder}
        className="min-h-12 flex-1 rounded-xl border border-edge bg-panel px-4 font-mono text-sm text-ink placeholder:text-ink-muted/60 transition-colors duration-200 focus:border-primary focus:outline-2 focus:outline-primary"
      />
      <button
        type="submit"
        disabled={busy}
        className="min-h-12 cursor-pointer rounded-xl bg-primary px-6 font-semibold text-white transition-colors duration-200 hover:bg-violet-500 focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? t.analyze.busy : t.analyze.button}
      </button>
    </form>
  )
}
