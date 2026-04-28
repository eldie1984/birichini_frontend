"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Category, categoryLabels, Product } from "@/lib/types"
import { Plus, Dog, Cat, Bone } from "lucide-react"

interface ProductFormProps {
  onSubmit: (product: Omit<Product, "id" | "createdAt">) => void
  initialData?: Product
  trigger?: React.ReactNode
}

const categoryIconMap = {
  perro: Dog,
  gato: Cat,
  accesorio: Bone,
}

export function ProductForm({ onSubmit, initialData, trigger }: ProductFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || ("perro" as Category),
    supplier: initialData?.supplier || "",
    purchasePrice: initialData?.purchasePrice?.toString() || "",
    salePrice: initialData?.salePrice?.toString() || "",
    stockDeposito: initialData?.stockDeposito?.toString() || "",
    stockLocal: initialData?.stockLocal?.toString() || "",
    weight: initialData?.weight || "",
    picture: initialData?.picture || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      supplier: formData.supplier || "Sin proveedor",
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      salePrice: parseFloat(formData.salePrice) || 0,
      stockDeposito: parseInt(formData.stockDeposito) || 0,
      stockLocal: parseInt(formData.stockLocal) || 0,
      weight: formData.weight || undefined,
      picture: formData.picture || undefined,
    })
    setFormData({
      name: "",
      description: "",
      category: "perro",
      supplier: "",
      purchasePrice: "",
      salePrice: "",
      stockDeposito: "",
      stockLocal: "",
      weight: "",
      picture: "",
    })
    setOpen(false)
  }

  const showPetFields = formData.category === "perro" || formData.category === "gato"

  const profit = (parseFloat(formData.salePrice) || 0) - (parseFloat(formData.purchasePrice) || 0)
  const profitPercentage =
    formData.purchasePrice && parseFloat(formData.purchasePrice) > 0
      ? ((profit / parseFloat(formData.purchasePrice)) * 100).toFixed(1)
      : "0"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modifica los datos del producto"
              : "Completa los datos para agregar un nuevo producto al inventario"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del producto</Label>
            <Input
              id="name"
              placeholder="Ej: Alimento Premium para Perros"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              placeholder="Describe el producto..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Category) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(categoryLabels) as Category[]).map((category) => {
                    const Icon = categoryIconMap[category]
                    return (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {categoryLabels[category]}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor</Label>
              <Input
                id="supplier"
                placeholder="Ej: Royal Canin, Vital Can..."
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Precio de Compra ($)</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Precio de Venta ($)</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                required
              />
            </div>
          </div>

          {formData.purchasePrice && formData.salePrice && (
            <div
              className={`rounded-lg p-3 ${profit >= 0 ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`}
            >
              <p className="text-sm font-medium">
                Ganancia por unidad: ${profit.toFixed(2)} ({profitPercentage}%)
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stockDeposito">Stock en Deposito</Label>
              <Input
                id="stockDeposito"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stockDeposito}
                onChange={(e) => setFormData({ ...formData, stockDeposito: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockLocal">Stock en Local</Label>
              <Input
                id="stockLocal"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stockLocal}
                onChange={(e) => setFormData({ ...formData, stockLocal: e.target.value })}
                required
              />
            </div>
          </div>

          {showPetFields && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  placeholder="Ej: 15kg, 500g"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="picture">URL de Imagen</Label>
                <Input
                  id="picture"
                  placeholder="https://..."
                  value={formData.picture}
                  onChange={(e) => setFormData({ ...formData, picture: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{initialData ? "Guardar Cambios" : "Agregar Producto"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
