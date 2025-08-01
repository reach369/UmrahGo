import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Create a local ref to access input element
    const inputRef = React.useRef<HTMLInputElement>(null);
    // Combine refs
    const combinedRef = useCombinedRefs(ref, inputRef);
    
    // Handle the case where a component changes from uncontrolled to controlled
    const [isControlled] = React.useState(props.value !== undefined);
    
    // Remove value prop if the input was initialized as uncontrolled
    const adjustedProps = { ...props };
    if (!isControlled && props.value !== undefined) {
      delete adjustedProps.value;
    }
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={combinedRef}
        {...adjustedProps}
      />
    )
  }
)
Input.displayName = "Input"

// Utility function to combine refs
function useCombinedRefs<T>(...refs: React.Ref<T>[]) {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        (ref as React.MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

export { Input } 