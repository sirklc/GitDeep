export function GitBookIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 5c-1.5-1-4-1.5-7-1v14c3 0 5.5.5 7 1.5V5ZM12 5c1.5-1 4-1.5 7-1v14c-3 0-5.5.5-7 1.5"
      />
    </svg>
  );
}

export function GeminiIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c.5 4 3 6.5 7 7-4 .5-6.5 3-7 7-.5-4-3-6.5-7-7 4-.5 6.5-3 7-7Z"
      />
    </svg>
  );
}

export function GoogleIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h6c0 3.5-2.5 6-6.5 6A7.5 7.5 0 1 1 12 4.5c2 0 3.7.7 5 2" />
    </svg>
  );
}

export function RedisIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" transform="rotate(45 12 12)" />
      <rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)" />
    </svg>
  );
}

export function ClaudeIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        d="M12 3v6M12 15v6M4.2 7.8l5.2 3M14.6 13.2l5.2 3M4.2 16.2l5.2-3M14.6 10.8l5.2-3"
      />
    </svg>
  );
}

export function StripeIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        d="M7 8.2c0-2 2-3.2 4.5-3.2s4.5 1.1 4.5 2.6c0 3.5-9 2-9 5.5 0 1.6 2 2.9 4.5 2.9s4.5-1.2 4.5-3.2"
      />
    </svg>
  );
}

export function CryptomusIcon({ className = "h-6 w-6" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="8" />
      <path
        strokeLinecap="round"
        d="M12 7v10M9.5 9.5h4a2 2 0 1 1 0 4h-5a2 2 0 1 0 0 4h4.5"
      />
    </svg>
  );
}
