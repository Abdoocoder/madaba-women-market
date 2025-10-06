"use client"

import { Search, Filter, X } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORIES } from "@/lib/mock-data"
import { useLocale } from "@/lib/locale-context"
import type { SortOption } from "@/app/page"
import { useState } from "react"

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
  const [showFilters, setShowFilters] = useState(true)

  const sortOptions = [
    { value: "date-desc", label: t("sort.newest") },
    { value: "price-asc", label: t("sort.priceAsc") },
    { value: "price-desc", label: t("sort.priceDesc") },
    { value: "name-asc", label: t("sort.nameAsc") },
  ]

  const handleClearFilters = () => {
    onSearchChange("")
    onCategoryChange("all")
    onSortChange("date-desc")
  }

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all" || sortOption !== "date-desc"

  return (
    <Card className="border-0 shadow-none md:border md:shadow-sm">
      <CardHeader className="p-0 md:p-6 md:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Filter className="h-5 w-5" />
            {t("filters.categories")}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? t("common.hide") : t("common.show")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`p-0 md:p-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
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
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">{t("filters.categories")}</Label>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 ml-1" />
                  {t("common.clear")}
                </Button>
              )}
            </div>
            <RadioGroup value={selectedCategory} onValueChange={onCategoryChange}>
              <div className="flex items-center space-x-2 space-x-reverse py-2">
                <RadioGroupItem value="all" id="all" className="peer" />
                <Label 
                  htmlFor="all" 
                  className="cursor-pointer font-normal peer-data-[state=checked]:font-semibold peer-data-[state=checked]:text-primary"
                >
                  {t("filters.allCategories")}
                </Label>
              </div>
              {CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2 space-x-reverse py-2">
                  <RadioGroupItem value={category.id} id={category.id} className="peer" />
                  <Label 
                    htmlFor={category.id} 
                    className="cursor-pointer font-normal peer-data-[state=checked]:font-semibold peer-data-[state=checked]:text-primary"
                  >
                    {language === "ar" ? category.nameAr : t(`category.${category.id}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}