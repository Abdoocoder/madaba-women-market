import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} د.أ`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("ar-JO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
