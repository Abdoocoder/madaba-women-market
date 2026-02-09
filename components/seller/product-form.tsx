"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORIES } from "@/lib/mock-data"
import { CldUploadWidget } from 'next-cloudinary'
import type { Product } from "@/lib/types"
import { useLocale } from "@/lib/locale-context"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, type ProductFormValues } from "@/lib/schemas"

interface ProductFormProps {
  product?: Product
  onSubmit: (data: Partial<Product>, imageUrl?: string) => void
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { t } = useLocale()
  const [imagePreview, setImagePreview] = useState(product?.image || null)
  const [imageUrl, setImageUrl] = useState<string | undefined>(product?.image)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nameAr: product?.nameAr || "",
      descriptionAr: product?.descriptionAr || "",
      price: product?.price ?? 0,
      category: product?.category || "",
      stock: product?.stock ?? 0,
      imageUrl: product?.image || null,
    },
  })

  // Determine valid numeric values for controlled inputs if needed, 
  // but with register() we rely on RHF.
  // We'll watch category to control the Select.
  const selectedCategory = watch("category")

  const handleImageUpload = (result: unknown) => {
    // Type assertion for Cloudinary result
    const cloudinaryResult = result as { info?: { secure_url: string } };
    const url = cloudinaryResult.info!.secure_url
    setImagePreview(url)
    setImageUrl(url)
    setValue("imageUrl", url)
  }

  const handleUploadError = (error: unknown) => {
    console.error('❌ Cloudinary upload error:', error)
  }

  const onFormSubmit = (data: ProductFormValues) => {
    const submissionData = {
      ...data,
      nameAr: data.nameAr,
      descriptionAr: data.descriptionAr,
      price: data.price,
      stock: data.stock,
      category: data.category,
    }
    onSubmit(submissionData, imageUrl)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? t("seller.editProduct") : t("seller.addProduct")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("product.image")}</Label>
            {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_uploads"}
                onSuccess={handleImageUpload}
                onError={handleUploadError}
                options={{
                  folder: "madaba-women-market",
                  resourceType: "image",
                  maxFileSize: 5000000, // 5MB
                  clientAllowedFormats: ["png", "jpg", "jpeg", "webp"]
                }}
              >
                {({ open }) => (
                  <div
                    className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer relative hover:bg-muted/50 transition-colors"
                    onClick={() => open()}
                  >
                    {imagePreview ? (
                      <Image src={imagePreview} alt={t("product.image")} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover rounded-lg" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p>{t("product.uploadImage")}</p>
                        <p className="text-xs">{t("product.recommendedSize")}</p>
                      </div>
                    )}
                  </div>
                )}
              </CldUploadWidget>
            ) : (
              <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-100">
                <div className="text-center text-muted-foreground">
                  <p>{t("product.uploadDisabled")}</p>
                  <p className="text-xs">{t("product.cloudinaryNotConfigured")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameAr">{t("product.name")}</Label>
            <Input
              id="nameAr"
              {...register("nameAr")}
            />
            {errors.nameAr && <p className="text-sm text-destructive">{errors.nameAr.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionAr">{t("product.description")}</Label>
            <Textarea
              id="descriptionAr"
              rows={3}
              {...register("descriptionAr")}
            />
            {errors.descriptionAr && <p className="text-sm text-destructive">{errors.descriptionAr.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t("product.price")} (د.أ)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">{t("product.stock")}</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t("product.category")}</Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => setValue("category", val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filtersShared.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {product ? t("seller.saveChanges") : t("seller.addProduct")}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
