"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES } from "@/lib/mock-data"
import { useLocale } from "@/lib/locale-context"
import type { SortOption } from "@/app/page"

interface ProductFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  sortOption: SortOption
  onSortChange: (sort: SortOption) => void
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortChange,
}: ProductFiltersProps) {
  const { t, language } = useLocale()

  const sortOptions = [
    { value: "date-desc", label: t("sort.newest") },
    { value: "price-asc", label: t("sort.priceAsc") },
    { value: "price-desc", label: t("sort.priceDesc") },
    { value: "name-asc", label: t("sort.nameAsc") },
  ]

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="search" className="text-base font-semibold mb-3 block">
          {t("filters.search")}
        </Label>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder={t("filters.search")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">{t("filters.sortBy")}</Label>
        <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder={t("filters.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">{t("filters.categories")}</Label>
        <RadioGroup value={selectedCategory} onValueChange={onCategoryChange}>
          <div className="flex items-center space-x-2 space-x-reverse mb-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="cursor-pointer font-normal">
              {t("filters.allCategories")}
            </Label>
          </div>
          {CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center space-x-2 space-x-reverse mb-2">
              <RadioGroupItem value={category.id} id={category.id} />
              <Label htmlFor={category.id} className="cursor-pointer font-normal">
                {language === "ar" ? category.nameAr : t(`category.${category.id}`)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
