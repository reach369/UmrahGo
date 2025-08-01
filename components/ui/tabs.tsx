"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-col gap-2" : "flex-row gap-4",
        className
      )}
      {...props}
    />
  )
}

function TabsList({
  className,
  scrollable = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  scrollable?: boolean
}) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const checkScroll = React.useCallback(() => {
    if (listRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = listRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
      setShowControls(scrollWidth > clientWidth)
    }
  }, [])

  React.useEffect(() => {
    if (scrollable) {
      checkScroll()
      window.addEventListener('resize', checkScroll)
      return () => window.removeEventListener('resize', checkScroll)
    }
  }, [scrollable, checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    if (listRef.current) {
      const { clientWidth } = listRef.current
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2
      listRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      setTimeout(checkScroll, 100)
    }
  }

  return (
    <div className={cn("relative", scrollable && "flex items-center")}>
      {scrollable && showControls && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <TabsPrimitive.List
        ref={listRef}
        data-slot="tabs-list"
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-[3px]",
          scrollable && "overflow-x-auto scrollbar-hide snap-x snap-mandatory w-full",
          className
        )}
        onScroll={scrollable ? checkScroll : undefined}
        {...props}
      />
      {scrollable && showControls && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function TabsTrigger({
  className,
  responsive = false,
  icon,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  responsive?: boolean
  icon?: React.ReactNode
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-responsive={responsive}
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        responsive && "flex-col sm:flex-row",
        className
      )}
      {...props}
    >
      {icon}
      {props.children}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
