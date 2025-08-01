"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

/**
 * A simplified slider component that avoids re-renders.
 * It's specifically designed for range sliders with 2 values.
 */
function Slider({
  className,
  value = [0, 100],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  // Store internal value state to prevent update loops
  const [internalValue, setInternalValue] = React.useState(value);
  
  // Track whether the change is from internal or external source
  const isInternalChange = React.useRef(false);
  
  // Update internal value when prop value changes, but only if it's not from an internal change
  React.useEffect(() => {
    if (!isInternalChange.current) {
      setInternalValue(value);
    }
    // Reset the flag after each render
    isInternalChange.current = false;
  }, [value]);
  
  // Handle value changes in a controlled way
  const handleValueChange = React.useCallback(
    (newValue: number[]) => {
      // Set the flag to indicate this is an internal change
      isInternalChange.current = true;
      setInternalValue(newValue);
      
      // Only call onValueChange if the values actually changed
      if (JSON.stringify(newValue) !== JSON.stringify(value)) {
        onValueChange?.(newValue);
      }
    },
    [onValueChange, value]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={internalValue}
      min={min}
      max={max}
      step={step}
      onValueChange={handleValueChange}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-muted relative grow overflow-hidden rounded-full h-1.5 w-full"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-primary absolute h-full"
        />
      </SliderPrimitive.Track>
      {/* First thumb */}
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      />
      {/* Second thumb */}
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
