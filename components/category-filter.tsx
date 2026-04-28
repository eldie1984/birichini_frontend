"use client"

import { Button } from "@/components/ui/button"
import { Category, categoryLabels } from "@/lib/types"
import { Dog, Cat, Bone, LayoutGrid } from "lucide-react"

interface CategoryFilterProps {
  activeCategory: Category | "all"
  onCategoryChange: (category: Category | "all") => void
}

const categoryIconMap = {
  perro: Dog,
  gato: Cat,
  accesorio: Bone,
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={activeCategory === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange("all")}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        Todos
      </Button>
      {(Object.keys(categoryLabels) as Category[]).map((category) => {
        const Icon = categoryIconMap[category]
        return (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {categoryLabels[category]}
          </Button>
        )
      })}
    </div>
  )
}
