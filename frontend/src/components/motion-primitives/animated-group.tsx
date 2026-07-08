'use client'
import React from 'react'
import { motion, type Variants } from 'framer-motion'

interface AnimatedGroupProps {
    children: React.ReactNode
    className?: string
    variants?: {
        container?: Variants
        item?: Variants
    }
}

export const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
    children,
    className,
    variants,
}) => {
    const containerVariants: Variants = variants?.container ?? {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0,
            },
        },
    }

    const itemVariants: Variants = variants?.item ?? {
        hidden: { opacity: 0, y: 16 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', bounce: 0.3, duration: 1 },
        },
    }

    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {React.Children.map(children, (child, i) => (
                <motion.div key={i} variants={itemVariants}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    )
}
