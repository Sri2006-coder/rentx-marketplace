import * as React from "react"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="peer h-5 w-5 appearance-none rounded-md border border-white/20 bg-black/20 checked:bg-primary checked:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
        {...props}
      />
      <Check className="pointer-events-none absolute h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
