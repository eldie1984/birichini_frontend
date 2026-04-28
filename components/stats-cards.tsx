"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Product, Category, categoryLabels } from "@/lib/types"
import { Package, DollarSign, TrendingUp, Dog, Cat, Bone } from "lucide-react"

interface StatsCardsProps {
  products: Product[]
}

export function StatsCards({ products }: StatsCardsProps) {
  const totalProducts = products.length
  const totalStock = products.reduce((acc, p) => acc + p.stockDeposito + p.stockLocal, 0)
  const totalStockLocal = products.reduce((acc, p) => acc + p.stockLocal, 0)
  const totalStockDeposito = products.reduce((acc, p) => acc + p.stockDeposito, 0)
  const totalPurchaseValue = products.reduce((acc, p) => acc + p.purchasePrice * (p.stockDeposito + p.stockLocal), 0)
  const totalSaleValue = products.reduce((acc, p) => acc + p.salePrice * (p.stockDeposito + p.stockLocal), 0)
  const potentialProfit = totalSaleValue - totalPurchaseValue

  const countByCategory = (category: Category) =>
    products.filter((p) => p.category === category).length

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Productos</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{totalProducts}</p>
              <p className="mt-1 text-xs text-muted-foreground">{totalStockLocal} local / {totalStockDeposito} deposito</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-accent/20 to-accent/5 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Inventario</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                ${totalPurchaseValue.toLocaleString("es-AR")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Precio de compra</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <DollarSign className="h-6 w-6 text-accent-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ganancia Potencial</p>
              <p className="mt-1 text-3xl font-bold text-green-700">
                ${potentialProfit.toLocaleString("es-AR")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Si vendes todo el stock</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-secondary to-secondary/50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Por Categoria</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Dog className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{countByCategory("perro")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cat className="h-4 w-4 text-accent-foreground" />
                  <span className="text-sm font-semibold">{countByCategory("gato")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{countByCategory("accesorio")}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
