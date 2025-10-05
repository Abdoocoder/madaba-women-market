"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const CarouselContext = React.createContext<{
  currentIndex: number
  setCurrentIndex: (index: number) => void
  itemsLength: number
} | null>(null)

const useCarousel = () => {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel")
  }
  return context
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: {
    align?: "start" | "center" | "end"
    loop?: boolean
  }
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, opts, children, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [itemsLength, setItemsLength] = React.useState(0)

    React.useEffect(() => {
      const items = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === CarouselContent
      )
      if (React.isValidElement(items) && items.props && typeof items.props === 'object' && 'children' in items.props) {
        setItemsLength(React.Children.count(items.props.children))
      }
    }, [children])

    const value = {
      currentIndex,
      setCurrentIndex,
      itemsLength,
    }

    return (
      <CarouselContext.Provider value={value}>
        <div
          ref={ref}
          className={cn("relative", className)}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { currentIndex } = useCarousel()
  
  return (
    <div className="overflow-hidden" ref={ref} {...props}>
      <div
        className={cn("flex transition-transform duration-200", className)}
        style={{
          transform: `translateX(-${(100 / React.Children.count(children)) * currentIndex}%)`,
        }}
      >
        {children}
      </div>
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { currentIndex, setCurrentIndex, itemsLength } = useCarousel()

  const handlePrevious = () => {
    setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : itemsLength - 1)
  }

  return (
    <button
      ref={ref}
      className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background",
        className
      )}
      onClick={handlePrevious}
      {...props}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
      >
        <path
          d="m8.842 3.135.058.069L12.15 6.45a.5.5 0 0 1 .058.638l-.058.069L8.9 10.404a.5.5 0 0 1-.765-.638L8.193 9.696 11.043 7.5H2.5a.5.5 0 0 1-.09-.992L2.5 6.5h8.543L8.193 4.304a.5.5 0 0 1 .58-.808l.069.058z"
          fill="currentColor"
        />
      </svg>
      <span className="sr-only">Previous slide</span>
    </button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { currentIndex, setCurrentIndex, itemsLength } = useCarousel()

  const handleNext = () => {
    setCurrentIndex(currentIndex < itemsLength - 1 ? currentIndex + 1 : 0)
  }

  return (
    <button
      ref={ref}
      className={cn(
        "absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background",
        className
      )}
      onClick={handleNext}
      {...props}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
      >
        <path
          d="m6.158 3.135-.058.069L3.85 6.45a.5.5 0 0 0-.058.638l.058.069L6.1 10.404a.5.5 0 0 0 .765-.638L6.807 9.696 3.957 7.5H12.5a.5.5 0 0 0 .09-.992L12.5 6.5H3.957l2.85-2.196a.5.5 0 0 0-.58-.808l-.069.058z"
          fill="currentColor"
        />
      </svg>
      <span className="sr-only">Next slide</span>
    </button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselProps,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}