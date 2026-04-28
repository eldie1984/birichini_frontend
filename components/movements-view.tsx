"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import { Product, InventoryMovement, Location, locationLabels, categoryLabels } from "@/lib/types"
import {
  Search,
  ArrowLeftRight,
  Warehouse,
  Store,
  ArrowRight,
  Package,
  Dog,
  Cat,
  Bone,
  Plus,
  Minus,
} from "lucide-react"

interface MovementsViewProps {
  products: Product[]
  movements: InventoryMovement[]
  onMoveInventory: (productId: string, quantity: number, from: Location, to: Location) => InventoryMovement | null | Promise<InventoryMovement | null>
}

const categoryIconMap = {
  perro: Dog,
  gato: Cat,
  accesorio: Bone,
}

export function MovementsView({ products, movements, onMoveInventory }: MovementsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [direction, setDirection] = useState<"deposito-local" | "local-deposito">("deposito-local")
  const [showConfirm, setShowConfirm] = useState(false)
  const [lastMovement, setLastMovement] = useState<InventoryMovement | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
    if (product.stockDeposito > 0) {
      setDirection("deposito-local")
    } else if (product.stockLocal > 0) {
      setDirection("local-deposito")
    }
  }

  const handleConfirmMovement = async () => {
    if (!selectedProduct) return
    const from = direction === "deposito-local" ? "deposito" : "local"
    const to = direction === "deposito-local" ? "local" : "deposito"
    const movement = await onMoveInventory(selectedProduct.id, quantity, from, to)
    if (movement) {
      setLastMovement(movement)
      setShowConfirm(true)
      setSelectedProduct(null)
      setQuantity(1)
    }
  }

  const maxQuantity =
    selectedProduct
      ? direction === "deposito-local"
        ? selectedProduct.stockDeposito
        : selectedProduct.stockLocal
      : 0

  const todayMovements = movements.filter((m) => {
    const today = new Date()
    return m.date.toDateString() === today.toDateString()
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ArrowLeftRight className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Movimientos hoy</p>
                <p className="text-2xl font-bold">{todayMovements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Warehouse className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total en Deposito</p>
                <p className="text-2xl font-bold">
                  {products.reduce((acc, p) => acc + p.stockDeposito, 0)} uds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total en Local</p>
                <p className="text-2xl font-bold">
                  {products.reduce((acc, p) => acc + p.stockLocal, 0)} uds
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
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredProducts.map((product) => {
              const Icon = categoryIconMap[product.category]
              const isSelected = selectedProduct?.id === product.id
              const totalStock = product.stockDeposito + product.stockLocal

              return (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""} ${totalStock === 0 ? "opacity-50" : ""}`}
                  onClick={() => totalStock > 0 && handleSelectProduct(product)}
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
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            <Warehouse className="h-3 w-3" />
                            {product.stockDeposito}
                          </Badge>
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
                <Package className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No se encontraron productos</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Mover Inventario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct ? (
                <>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="font-medium">{selectedProduct.name}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="gap-1">
                        <Warehouse className="h-3 w-3" />
                        Deposito: {selectedProduct.stockDeposito}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Store className="h-3 w-3" />
                        Local: {selectedProduct.stockLocal}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Direccion del movimiento</Label>
                    <Select
                      value={direction}
                      onValueChange={(v: "deposito-local" | "local-deposito") => {
                        setDirection(v)
                        setQuantity(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="deposito-local"
                          disabled={selectedProduct.stockDeposito === 0}
                        >
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4" />
                            <ArrowRight className="h-3 w-3" />
                            <Store className="h-4 w-4" />
                            <span>Deposito a Local</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="local-deposito"
                          disabled={selectedProduct.stockLocal === 0}
                        >
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            <ArrowRight className="h-3 w-3" />
                            <Warehouse className="h-4 w-4" />
                            <span>Local a Deposito</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cantidad a mover (max: {maxQuantity})</Label>
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
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))
                        }
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/10 p-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center">
                        {direction === "deposito-local" ? (
                          <Warehouse className="mx-auto h-6 w-6 text-muted-foreground" />
                        ) : (
                          <Store className="mx-auto h-6 w-6 text-muted-foreground" />
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {direction === "deposito-local" ? "Deposito" : "Local"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <span className="text-lg font-bold">{quantity}</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        {direction === "deposito-local" ? (
                          <Store className="mx-auto h-6 w-6 text-primary" />
                        ) : (
                          <Warehouse className="mx-auto h-6 w-6 text-primary" />
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {direction === "deposito-local" ? "Local" : "Deposito"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleConfirmMovement}
                    disabled={maxQuantity === 0}
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                    Confirmar Movimiento
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ArrowLeftRight className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-3 text-muted-foreground">
                    Selecciona un producto para mover inventario
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {todayMovements.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ultimos movimientos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {todayMovements
                  .slice(-5)
                  .reverse()
                  .map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium line-clamp-1">{movement.productName}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{locationLabels[movement.from]}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{locationLabels[movement.to]}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{movement.quantity} uds</Badge>
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
            <DialogTitle>Movimiento registrado</DialogTitle>
            <DialogDescription>El movimiento de inventario se ha registrado exitosamente</DialogDescription>
          </DialogHeader>
          {lastMovement && (
            <div className="space-y-3 rounded-lg bg-primary/10 p-4">
              <p className="font-medium">{lastMovement.productName}</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  {lastMovement.from === "deposito" ? (
                    <Warehouse className="mx-auto h-6 w-6" />
                  ) : (
                    <Store className="mx-auto h-6 w-6" />
                  )}
                  <p className="text-xs mt-1">{locationLabels[lastMovement.from]}</p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <span className="text-lg font-bold">{lastMovement.quantity}</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div className="text-center">
                  {lastMovement.to === "deposito" ? (
                    <Warehouse className="mx-auto h-6 w-6" />
                  ) : (
                    <Store className="mx-auto h-6 w-6" />
                  )}
                  <p className="text-xs mt-1">{locationLabels[lastMovement.to]}</p>
                </div>
              </div>
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
