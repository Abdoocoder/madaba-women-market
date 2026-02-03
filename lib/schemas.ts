import { z } from "zod"

export const productSchema = z.object({
    nameAr: z.string().min(3, "Arabic name must be at least 3 characters"),
    descriptionAr: z.string().min(10, "Arabic description must be at least 10 characters"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    category: z.string().min(1, "Category is required"),
    stock: z.coerce.number().int().nonnegative("Stock must be a non-negative integer"),
    imageUrl: z.string().optional().nullable(),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const productQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    category: z.string().optional(),
    search: z.string().optional(),
    sellerId: z.string().optional(),
})

export type ProductQueryValues = z.infer<typeof productQuerySchema>
