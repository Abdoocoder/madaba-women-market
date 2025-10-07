import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface AvatarProps
  extends ComponentProps<"span">,
    VariantProps<typeof avatarVariants> {}

/**
 * Avatar wrapper component
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

/**
 * AvatarImage uses next/image for performance and accessibility
 */
export interface AvatarImageProps extends Omit<ComponentProps<typeof Image>, "src" | "alt"> {
  src: string
  alt?: string
}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt = "User avatar", ...props }, ref) => (
    <Image
      ref={ref as any}
      src={src || "/placeholder-user.jpg"}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      width={64}
      height={64}
      sizes="(max-width: 768px) 40px, (max-width: 1200px) 48px, 64px"
      priority={false}
      {...props}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

/**
 * Fallback initials or placeholder
 */
export const AvatarFallback = forwardRef<HTMLSpanElement, ComponentProps<"span">>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground/70",
        className
      )}
      {...props}
    >
      {children || "?"}
    </span>
  )
)
AvatarFallback.displayName = "AvatarFallback"
