"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Product, Sale, categoryLabels } from "@/lib/types"
import { Search, ShoppingCart, Dog, Cat, Bone, Plus, Minus, Receipt, Store } from "lucide-react"

interface SalesViewProps {
  products: Product[]
  sales: Sale[]
  onRegisterSale: (productId: string, quantity: number) => Sale | null | Promise<Sale | null>
}

const categoryIconMap = {
  perro: Dog,
  gato: Cat,
  accesorio: Bone,
}

export function SalesView({ products, sales, onRegisterSale }: SalesViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)
  const [lastSale, setLastSale] = useState<Sale | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      product.stockLocal > 0
  )

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  const handleConfirmSale = async () => {
    if (!selectedProduct) return
    const sale = await onRegisterSale(selectedProduct.id, quantity)
    if (sale) {
      setLastSale(sale)
      setShowConfirm(true)
      setSelectedProduct(null)
      setQuantity(1)
    }
  }

  const todaySales = sales.filter((sale) => {
    const today = new Date()
    return sale.date.toDateString() === today.toDateString()
  })

  const todayTotal = todaySales.reduce((acc, sale) => acc + sale.total, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas de hoy</p>
                <p className="text-2xl font-bold">{todaySales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total del dia</p>
                <p className="text-2xl font-bold text-green-700">
                  ${todayTotal.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos para vender..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredProducts.map((product) => {
              const Icon = categoryIconMap[product.category]
              const isSelected = selectedProduct?.id === product.id

              return (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
                  onClick={() => handleSelectProduct(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            {categoryLabels[product.category]}
                          </span>
                        </div>
                        <h3 className="mt-1 font-medium text-foreground line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-lg font-bold text-primary">
                            ${product.salePrice.toLocaleString("es-AR")}
                          </p>
                          <Badge variant="secondary" className="gap-1">
                            <Store className="h-3 w-3" />
                            {product.stockLocal}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {searchQuery
                    ? "No se encontraron productos"
                    : "No hay productos disponibles en el local"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Registrar Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct ? (
                <>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${selectedProduct.salePrice.toLocaleString("es-AR")} por unidad
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stock disponible: {selectedProduct.stockLocal}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Cantidad</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={selectedProduct.stockLocal}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.min(
                              selectedProduct.stockLocal,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setQuantity(Math.min(selectedProduct.stockLocal, quantity + 1))
                        }
                        disabled={quantity >= selectedProduct.stockLocal}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/10 p-4">
                    <p className="text-sm text-muted-foreground">Total a cobrar</p>
                    <p className="text-3xl font-bold text-primary">
                      ${(selectedProduct.salePrice * quantity).toLocaleString("es-AR")}
                    </p>
                  </div>

                  <Button className="w-full gap-2" size="lg" onClick={handleConfirmSale}>
                    <ShoppingCart className="h-5 w-5" />
                    Confirmar Venta
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-3 text-muted-foreground">
                    Selecciona un producto para registrar una venta
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {todaySales.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ultimas ventas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {todaySales
                  .slice(-5)
                  .reverse()
                  .map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium line-clamp-1">{sale.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {sale.quantity} x ${sale.unitPrice.toLocaleString("es-AR")}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        ${sale.total.toLocaleString("es-AR")}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Venta registrada</DialogTitle>
            <DialogDescription>La venta se ha registrado exitosamente</DialogDescription>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-3 rounded-lg bg-green-500/10 p-4">
              <p className="font-medium">{lastSale.productName}</p>
              <p className="text-sm text-muted-foreground">
                {lastSale.quantity} unidad(es) x ${lastSale.unitPrice.toLocaleString("es-AR")}
              </p>
              <p className="text-2xl font-bold text-green-700">
                Total: ${lastSale.total.toLocaleString("es-AR")}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowConfirm(false)}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
