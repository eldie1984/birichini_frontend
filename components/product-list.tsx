"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Product, Category, categoryLabels } from "@/lib/types"
import { Dog, Cat, Bone, Pencil, Trash2, Package, Warehouse, Store, ShoppingCart } from "lucide-react"
import { ProductForm } from "./product-form"

interface ProductListProps {
  products: Product[]
  onUpdate: (id: string, updates: Partial<Omit<Product, "id" | "createdAt">>) => void
  onDelete: (id: string) => void
  onQuickSale?: (id: string) => void
}

const categoryIconMap = {
  perro: Dog,
  gato: Cat,
  accesorio: Bone,
}

const categoryColorMap: Record<Category, string> = {
  perro: "bg-blue-500/10 text-blue-700 border-blue-200",
  gato: "bg-orange-500/10 text-orange-700 border-orange-200",
  accesorio: "bg-gray-500/10 text-gray-700 border-gray-200",
}

export function ProductList({ products, onUpdate, onDelete, onQuickSale }: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No hay productos</h3>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Agrega tu primer producto para comenzar a gestionar tu inventario
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const Icon = categoryIconMap[product.category]
        const profit = product.salePrice - product.purchasePrice
        const profitPercentage = ((profit / product.purchasePrice) * 100).toFixed(1)

        return (
          <Card key={product.id} className="group overflow-hidden transition-shadow hover:shadow-md">
            {product.picture && (
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={product.picture}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`gap-1 ${categoryColorMap[product.category]}`}
                    >
                      <Icon className="h-3 w-3" />
                      {categoryLabels[product.category]}
                    </Badge>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground line-clamp-1">{product.name}</h3>
                  {product.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  {(product.weight || product.picture) && (product.category === "perro" || product.category === "gato") && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      {product.weight && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {product.weight}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Compra</p>
                    <p className="font-semibold text-foreground">
                      ${product.purchasePrice.toLocaleString("es-AR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Venta</p>
                    <p className="font-semibold text-primary">
                      ${product.salePrice.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-2 rounded-lg p-2.5 ${product.stockLocal <= 5 ? "bg-red-50 border border-red-200" : "bg-primary/10 border border-primary/20"}`}>
                    <Store className={`h-5 w-5 ${product.stockLocal <= 5 ? "text-red-500" : "text-primary"}`} />
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Local</p>
                      <p className={`text-lg font-bold ${product.stockLocal <= 5 ? "text-red-600" : "text-primary"}`}>
                        {product.stockLocal} <span className="text-xs font-normal">uds</span>
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 rounded-lg p-2.5 ${product.stockDeposito <= 5 ? "bg-amber-50 border border-amber-200" : "bg-secondary border border-border"}`}>
                    <Warehouse className={`h-5 w-5 ${product.stockDeposito <= 5 ? "text-amber-500" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Deposito</p>
                      <p className={`text-lg font-bold ${product.stockDeposito <= 5 ? "text-amber-600" : "text-foreground"}`}>
                        {product.stockDeposito} <span className="text-xs font-normal">uds</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                  <span className="text-xs font-medium text-green-700">Ganancia por unidad</span>
                  <span className="text-sm font-bold text-green-600">
                    ${profit.toLocaleString("es-AR")} ({profitPercentage}%)
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {onQuickSale && (
                  <Button
                    size="sm"
                    onClick={() => onQuickSale(product.id)}
                    disabled={product.stockLocal === 0 && product.stockDeposito === 0}
                    className="w-full gap-1.5"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Venta
                    {product.stockLocal === 0 && product.stockDeposito > 0 && (
                      <span className="text-xs opacity-75">(desde deposito)</span>
                    )}
                  </Button>
                )}
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <ProductForm
                    initialData={product}
                    onSubmit={(updates) => onUpdate(product.id, updates)}
                    trigger={
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5 bg-transparent">
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent">
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta accion no se puede deshacer. El producto &quot;{product.name}&quot; sera
                          eliminado permanentemente del inventario.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
