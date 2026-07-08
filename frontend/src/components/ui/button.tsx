import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
}

const buttonVariants = ({
    variant = 'default',
    size = 'default',
    className = '',
}: {
    variant?: ButtonProps['variant']
    size?: ButtonProps['size']
    className?: string
} = {}) => {
    const base =
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer'

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
        default:
            'bg-primary text-primary-foreground shadow hover:bg-primary-strong active:scale-95',
        outline:
            'border border-border bg-transparent hover:bg-muted text-foreground active:scale-95',
        ghost:
            'hover:bg-muted text-foreground active:scale-95',
        link: 'text-primary underline-offset-4 hover:underline',
    }

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6 text-base',
        icon: 'h-9 w-9',
    }

    return cn(base, variants[variant ?? 'default'], sizes[size ?? 'default'], className)
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
        const classes = buttonVariants({ variant, size, className })

        if (asChild && React.isValidElement(props.children)) {
            return React.cloneElement(props.children as React.ReactElement<{ className?: string; ref?: React.Ref<unknown> }>, {
                className: cn(classes, (props.children as React.ReactElement<{ className?: string }>).props.className),
                ref,
            })
        }

        return (
            <button
                className={classes}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
