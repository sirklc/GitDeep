import React from 'react'
import Image from 'next/image'

export const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <Image 
                src="/images/logosiyah.png" 
                alt="GitDeep Logo" 
                width={128} 
                height={128} 
                className="shrink-0 block dark:hidden w-auto h-7" 
            />
            <Image 
                src="/images/logobeyaz.png" 
                alt="GitDeep Logo" 
                width={128} 
                height={128} 
                className="shrink-0 hidden dark:block w-auto h-7" 
            />
            <span className="font-bold text-lg tracking-tight text-foreground font-display">
                GitDeep
            </span>
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string }) => (
    <>
        <Image 
            src="/images/logosiyah.png" 
            alt="GitDeep Logo" 
            width={128} 
            height={128} 
            className={`block dark:hidden object-contain ${className || ''}`}
        />
        <Image 
            src="/images/logobeyaz.png" 
            alt="GitDeep Logo" 
            width={128} 
            height={128} 
            className={`hidden dark:block object-contain ${className || ''}`}
        />
    </>
)

