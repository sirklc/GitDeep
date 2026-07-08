'use client'
import React, { useRef, useEffect } from 'react'

interface InfiniteSliderProps {
    children: React.ReactNode
    gap?: number
    speed?: number
    speedOnHover?: number
    reverse?: boolean
    className?: string
}

export const InfiniteSlider: React.FC<InfiniteSliderProps> = ({
    children,
    gap = 16,
    speed = 30,
    speedOnHover,
    reverse = false,
    className,
}) => {
    const sliderRef = useRef<HTMLDivElement>(null)
    const animRef = useRef<Animation | null>(null)

    useEffect(() => {
        const slider = sliderRef.current
        if (!slider) return

        const totalWidth = slider.scrollWidth / 2
        const duration = (totalWidth / speed) * 1000

        const keyframes = reverse
            ? [{ transform: `translateX(-${totalWidth}px)` }, { transform: 'translateX(0)' }]
            : [{ transform: 'translateX(0)' }, { transform: `translateX(-${totalWidth}px)` }]

        const anim = slider.animate(keyframes, {
            duration,
            iterations: Infinity,
            easing: 'linear',
        })

        animRef.current = anim

        const onEnter = () => {
            if (speedOnHover !== undefined && animRef.current) {
                const newDuration = (totalWidth / speedOnHover) * 1000
                animRef.current.effect?.updateTiming({ duration: newDuration })
            }
        }
        const onLeave = () => {
            if (speedOnHover !== undefined && animRef.current) {
                animRef.current.effect?.updateTiming({ duration })
            }
        }

        slider.addEventListener('mouseenter', onEnter)
        slider.addEventListener('mouseleave', onLeave)

        return () => {
            anim.cancel()
            slider.removeEventListener('mouseenter', onEnter)
            slider.removeEventListener('mouseleave', onLeave)
        }
    }, [speed, speedOnHover, reverse])

    const items = React.Children.toArray(children)

    return (
        <div className={`overflow-hidden ${className ?? ''}`}>
            <div
                ref={sliderRef}
                className="flex w-max"
                style={{ gap: `${gap}px` }}
            >
                {items.map((child, i) => (
                    <div key={i} className="shrink-0">{child}</div>
                ))}
                {items.map((child, i) => (
                    <div key={`dup-${i}`} aria-hidden className="shrink-0">{child}</div>
                ))}
            </div>
        </div>
    )
}
