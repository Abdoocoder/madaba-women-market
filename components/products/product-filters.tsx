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
import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export interface ProductFiltersProps {
  searchQuery?: string
  onSearchChange?: (value: string) => void
  selectedCategory?: string
  onCategoryChange?: (value: string) => void
  sortOption?: string
  onSortChange?: (value: string) => void
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortChange
}: ProductFiltersProps = {}) {
  const { t, language } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [showFilters, setShowFilters] = useState(true)

  // Determine if we are in controlled mode (props provided) or URL mode
  const isControlled = onSearchChange !== undefined

  // Get values from Props (controlled) or URL (uncontrolled)
  const currentSearch = isControlled ? searchQuery : (searchParams.get('search') || "")
  const currentCategory = isControlled ? selectedCategory : (searchParams.get('category') || "all")
  const currentSort = isControlled ? sortOption : (searchParams.get('sort') || "date-desc")

  const [localSearch, setLocalSearch] = useState(currentSearch || "")

  // Sync local state with source if it changes
  useEffect(() => {
    setLocalSearch(currentSearch || "")
  }, [currentSearch])

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all" && value !== "") {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    return params.toString()
  }

  const handleSearch = useDebouncedCallback((term: string) => {
    if (isControlled && onSearchChange) {
      onSearchChange(term)
    } else {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (term) {
          params.set('search', term)
        } else {
          params.delete('search')
        }
        router.push(`?${params.toString()}`, { scroll: false })
      })
    }
  }, 300)

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    handleSearch(value)
  }

  const handleCategoryChange = (value: string) => {
    if (isControlled && onCategoryChange) {
      onCategoryChange(value)
    } else {
      startTransition(() => {
        router.push(`?${createQueryString('category', value)}`, { scroll: false })
      })
    }
  }

  const handleSortChange = (value: string) => {
    if (isControlled && onSortChange) {
      onSortChange(value)
    } else {
      startTransition(() => {
        router.push(`?${createQueryString('sort', value)}`, { scroll: false })
      })
    }
  }

  const handleClearFilters = () => {
    setLocalSearch("")
    if (isControlled) {
      onSearchChange?.("")
      onCategoryChange?.("all")
      onSortChange?.("date-desc") // Default sort
    } else {
      startTransition(() => {
        router.push('?', { scroll: false })
      })
    }
  }

  const sortOptions = [
    { value: "date-desc", label: t("sortShared.newest") },
    { value: "price-asc", label: t("sortShared.priceAsc") },
    { value: "price-desc", label: t("sortShared.priceDesc") },
    { value: "name-asc", label: t("sortShared.nameAsc") },
  ]

  const hasActiveFilters =
    (currentSearch !== "") ||
    (currentCategory !== "all") ||
    (currentSort !== "date-desc")

  return (
    <Card className={`border-0 shadow-none md:border md:shadow-sm ${isPending ? 'opacity-70' : ''} transition-opacity`}>
      <CardHeader className="p-0 md:p-6 md:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Filter className="h-5 w-5" />
            {t("filtersShared.categories")}
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
              {t("filtersShared.search")}
            </Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={t("filtersShared.search")}
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">{t("filtersShared.sortBy")}</Label>
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("filtersShared.sortBy")} />
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
              <Label className="text-base font-semibold">{t("filtersShared.categories")}</Label>
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
            <RadioGroup value={currentCategory} onValueChange={handleCategoryChange}>
              <div className="flex items-center space-x-2 space-x-reverse py-2">
                <RadioGroupItem value="all" id="all" className="peer" />
                <Label
                  htmlFor="all"
                  className="cursor-pointer font-normal peer-data-[state=checked]:font-semibold peer-data-[state=checked]:text-primary"
                >
                  {t("filtersShared.allCategories")}
                </Label>
              </div>
              {CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2 space-x-reverse py-2">
                  <RadioGroupItem value={category.id} id={category.id} className="peer" />
                  <Label
                    htmlFor={category.id}
                    className="cursor-pointer font-normal peer-data-[state=checked]:font-semibold peer-data-[state=checked]:text-primary"
                  >
                    {language === "ar" ? category.nameAr : t(`categoriesShared.${category.id}`)}
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
