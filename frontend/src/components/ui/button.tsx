import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zv-orange focus-visible:ring-offset-2 focus-visible:ring-offset-zv-black disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-zv-orange text-zv-black hover:bg-zv-orange-soft',
        outline:
          'border border-zv-border-strong bg-transparent text-white hover:border-zv-orange hover:bg-zv-orange/10 hover:text-white',
        secondary: 'bg-white text-zv-black hover:bg-zv-ink-100',
        ghost: 'text-zv-ink-300 hover:bg-white/5 hover:text-white',
        destructive: 'bg-zv-orange text-zv-black hover:bg-zv-orange-soft',
        link: 'text-zv-orange underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 text-sm',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-7 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { Button };
export default Button;
