'use client'
import React from 'react'
import { motion, type Variants } from 'framer-motion'

interface TextEffectProps {
    children: string
    preset?: 'fade-in-blur' | 'slide-up' | 'fade'
    as?: keyof React.JSX.IntrinsicElements
    className?: string
    speedSegment?: number
    delay?: number
    per?: 'word' | 'char' | 'line'
}

const presets: Record<string, { container: Variants; item: Variants }> = {
    'fade-in-blur': {
        container: {
            hidden: {},
            visible: {
                transition: {
                    staggerChildren: 0.05,
                },
            },
        },
        item: {
            hidden: { opacity: 0, filter: 'blur(12px)', y: 8 },
            visible: {
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                transition: { type: 'spring', bounce: 0.3, duration: 1.2 },
            },
        },
    },
    'slide-up': {
        container: {
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
        },
        item: {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        },
    },
    fade: {
        container: {
            hidden: {},
            visible: { transition: { staggerChildren: 0.03 } },
        },
        item: {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.4 } },
        },
    },
}

export const TextEffect: React.FC<TextEffectProps> = ({
    children,
    preset = 'fade-in-blur',
    as: Tag = 'p',
    className,
    speedSegment = 1,
    delay = 0,
    per = 'word',
}) => {
    const { container, item } = presets[preset] ?? presets['fade-in-blur']

    const segments = per === 'char'
        ? children.split('')
        : per === 'line'
            ? children.split('\n')
            : children.split(' ')

    const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.p

    return (
        <MotionTag
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                ...container,
                visible: {
                    ...(container.visible as object),
                    transition: {
                        staggerChildren: 0.05 / speedSegment,
                        delayChildren: delay,
                    },
                },
            }}
        >
            {segments.map((segment, i) => (
                <motion.span key={i} variants={item} className="inline-block">
                    {segment}
                    {per === 'word' && i < segments.length - 1 ? '\u00a0' : ''}
                </motion.span>
            ))}
        </MotionTag>
    )
}
