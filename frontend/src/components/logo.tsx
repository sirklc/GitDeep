import React from 'react'

export const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                <rect width="28" height="28" rx="7" fill="url(#logo-gradient)" />
                <path
                    d="M8 14C8 10.686 10.686 8 14 8C15.657 8 17.156 8.672 18.243 9.757L20 8V13H15L16.879 11.121C16.161 10.418 15.134 10 14 10C11.791 10 10 11.791 10 14C10 16.209 11.791 18 14 18C15.657 18 17.083 17.024 17.732 15.618L19.595 16.493C18.59 18.678 16.476 20 14 20C10.686 20 8 17.314 8 14Z"
                    fill="white"
                />
                <defs>
                    <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ffffff" />
                        <stop offset="1" stopColor="#888888" />
                    </linearGradient>
                </defs>
            </svg>
            <span className="font-bold text-lg tracking-tight text-foreground font-display">
                GitDeep
            </span>
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string }) => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <rect width="28" height="28" rx="7" fill="url(#logo-icon-gradient)" />
        <path
            d="M8 14C8 10.686 10.686 8 14 8C15.657 8 17.156 8.672 18.243 9.757L20 8V13H15L16.879 11.121C16.161 10.418 15.134 10 14 10C11.791 10 10 11.791 10 14C10 16.209 11.791 18 14 18C15.657 18 17.083 17.024 17.732 15.618L19.595 16.493C18.59 18.678 16.476 20 14 20C10.686 20 8 17.314 8 14Z"
            fill="white"
        />
        <defs>
            <linearGradient id="logo-icon-gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="1" stopColor="#888888" />
            </linearGradient>
        </defs>
    </svg>
)
