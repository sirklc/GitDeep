export function ArchitectureIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"
      />
    </svg>
  );
}

export function SecurityIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5 4.5 6v5.4c0 4.6 3.1 7.9 7.5 9.1 4.4-1.2 7.5-4.5 7.5-9.1V6L12 3.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4.5" />
    </svg>
  );
}

export function CommunityIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="9" cy="8.5" r="2.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9.5" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 14.2c2.4.2 4 1.9 4 4.3" />
    </svg>
  );
}

export function DocumentationIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 3.5h8l3 3v13.5h-11V3.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5V7h3M9 12h6M9 15.5h6M9 8.5h2.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function GitHubIcon({ className = "h-5 w-5" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.58 2 12.19c0 4.49 2.87 8.3 6.84 9.64.5.1.68-.22.68-.49 0-.24-.01-1.03-.01-1.87-2.78.61-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.55 2.34 1.1 2.91.84.09-.66.35-1.1.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.2 10.2 0 0 0 22 12.19C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function LogoMark({ className = "h-7 w-7" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className}>
      <rect width="28" height="28" rx="8" fill="url(#logoMarkGradient)" />
      <circle cx="9" cy="9.5" r="2" fill="white" fillOpacity="0.95" />
      <circle cx="19" cy="9.5" r="2" fill="white" fillOpacity="0.95" />
      <circle cx="14" cy="19" r="2" fill="white" fillOpacity="0.95" />
      <path
        d="M9 11.5v2a2 2 0 0 0 2 2h1M19 11.5v2a2 2 0 0 1-2 2h-1"
        stroke="white"
        strokeOpacity="0.85"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="logoMarkGradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MenuIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function CloseIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function CoinIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 7.5v9M9.5 9.75c0-1.24 1.12-2.25 2.5-2.25s2.5.7 2.5 1.85-1.12 1.65-2.5 1.65-2.5.55-2.5 1.9 1.12 1.85 2.5 1.85 2.5-1 2.5-2.25" />
    </svg>
  );
}

export function UserIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20c1-3.5 4-5.5 7.5-5.5s6.5 2 7.5 5.5" />
    </svg>
  );
}
