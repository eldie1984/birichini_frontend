"use client"

import React from "react"

import { useState, useMemo } from "react"
import { Product, ShortageItem, Category, categoryLabels } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertTriangle,
  Search,
  Plus,
  Minus,
  Trash2,
  Download,
  Dog,
  Cat,
  Package,
  ClipboardList,
  FileDown,
  ChevronDown,
  Building2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShortagesViewProps {
  products: Product[]
  shortages: ShortageItem[]
  onAddShortage: (productId: string, quantity: number) => ShortageItem | null | Promise<ShortageItem | null>
  onUpdateShortage: (id: string, quantity: number) => ShortageItem | null | Promise<ShortageItem | null>
  onRemoveShortage: (id: string) => boolean | Promise<boolean>
  onClearShortages: () => void | Promise<void>
}

const categoryIconMap: Record<Category, React.ReactNode> = {
  perro: <Dog className="h-4 w-4" />,
  gato: <Cat className="h-4 w-4" />,
  accesorio: <Package className="h-4 w-4" />,
}

export function ShortagesView({
  products,
  shortages,
  onAddShortage,
  onUpdateShortage,
  onRemoveShortage,
  onClearShortages,
}: ShortagesViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Filter products with low stock or all products for manual selection
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [products, searchQuery])

  // Products with low stock (total <= 10)
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stockLocal + p.stockDeposito <= 10)
  }, [products])

  const totalItems = shortages.reduce((sum, s) => sum + s.quantityToOrder, 0)
  const totalCost = shortages.reduce(
    (sum, s) => sum + s.quantityToOrder * s.purchasePrice,
    0
  )

  const handleQuantityChange = (productId: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, value) }))
  }

  const handleAddToShortage = (product: Product) => {
    const quantity = quantities[product.id] || 1
    onAddShortage(product.id, quantity)
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
  }

  const isInShortageList = (productId: string) => {
    return shortages.some((s) => s.productId === productId)
  }

  // Group shortages by supplier
  const shortagesBySupplier = useMemo(() => {
    return shortages.reduce(
      (acc, item) => {
        const supplier = item.supplier || "Sin proveedor"
        if (!acc[supplier]) acc[supplier] = []
        acc[supplier].push(item)
        return acc
      },
      {} as Record<string, ShortageItem[]>
    )
  }, [shortages])

  const suppliers = Object.keys(shortagesBySupplier).sort()

  const downloadShortageList = () => {
    downloadShortageListBySupplier()
  }

  const downloadShortageListBySupplier = (supplier?: string) => {
    if (shortages.length === 0) return

    const date = new Date().toLocaleDateString("es-AR")
    const itemsToDownload = supplier 
      ? shortagesBySupplier[supplier] || []
      : shortages

    if (itemsToDownload.length === 0) return

    const totalItemsDownload = itemsToDownload.reduce((sum, s) => sum + s.quantityToOrder, 0)
    const totalCostDownload = itemsToDownload.reduce(
      (sum, s) => sum + s.quantityToOrder * s.purchasePrice,
      0
    )

    let content = `LISTA DE PEDIDOS - BIRICHINI PET SHOP\n`
    content += `Fecha: ${date}\n`
    if (supplier) {
      content += `Proveedor: ${supplier}\n`
    }
    content += `${"=".repeat(60)}\n\n`

    if (supplier) {
      // Single supplier - group by category
      const byCategory = itemsToDownload.reduce(
        (acc, item) => {
          if (!acc[item.category]) acc[item.category] = []
          acc[item.category].push(item)
          return acc
        },
        {} as Record<Category, ShortageItem[]>
      )

      for (const category of Object.keys(byCategory) as Category[]) {
        content += `${categoryLabels[category].toUpperCase()}\n`
        content += `${"-".repeat(40)}\n`

        for (const item of byCategory[category]) {
          const subtotal = item.quantityToOrder * item.purchasePrice
          content += `- ${item.productName}\n`
          content += `  Cantidad: ${item.quantityToOrder} uds\n`
          content += `  Precio unitario: $${item.purchasePrice.toLocaleString("es-AR")}\n`
          content += `  Subtotal: $${subtotal.toLocaleString("es-AR")}\n\n`
        }
      }
    } else {
      // All suppliers - group by supplier then category
      for (const sup of suppliers) {
        const supplierItems = shortagesBySupplier[sup]
        const supplierTotal = supplierItems.reduce(
          (sum, s) => sum + s.quantityToOrder * s.purchasePrice,
          0
        )

        content += `\n${"*".repeat(60)}\n`
        content += `PROVEEDOR: ${sup.toUpperCase()}\n`
        content += `${"*".repeat(60)}\n\n`

        const byCategory = supplierItems.reduce(
          (acc, item) => {
            if (!acc[item.category]) acc[item.category] = []
            acc[item.category].push(item)
            return acc
          },
          {} as Record<Category, ShortageItem[]>
        )

        for (const category of Object.keys(byCategory) as Category[]) {
          content += `${categoryLabels[category].toUpperCase()}\n`
          content += `${"-".repeat(40)}\n`

          for (const item of byCategory[category]) {
            const subtotal = item.quantityToOrder * item.purchasePrice
            content += `- ${item.productName}\n`
            content += `  Cantidad: ${item.quantityToOrder} uds\n`
            content += `  Precio unitario: $${item.purchasePrice.toLocaleString("es-AR")}\n`
            content += `  Subtotal: $${subtotal.toLocaleString("es-AR")}\n\n`
          }
        }

        content += `SUBTOTAL ${sup}: $${supplierTotal.toLocaleString("es-AR")}\n`
      }
    }

    content += `\n${"=".repeat(60)}\n`
    content += `TOTAL DE PRODUCTOS: ${totalItemsDownload} unidades\n`
    content += `COSTO TOTAL ESTIMADO: $${totalCostDownload.toLocaleString("es-AR")}\n`

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const filename = supplier 
      ? `pedido-${supplier.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`
      : `pedido-birichini-completo-${new Date().toISOString().split("T")[0]}.txt`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock bajo</p>
              <p className="text-2xl font-bold text-foreground">
                {lowStockProducts.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En lista de pedido</p>
              <p className="text-2xl font-bold text-foreground">
                {shortages.length}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({totalItems} uds)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <FileDown className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Costo estimado</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalCost.toLocaleString("es-AR")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Agregar productos al pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {lowStockProducts.length > 0 && !searchQuery && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  Productos con stock bajo
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.slice(0, 5).map((p) => (
                    <Badge
                      key={p.id}
                      variant="outline"
                      className="cursor-pointer border-amber-300 bg-white hover:bg-amber-100"
                      onClick={() => {
                        setSearchQuery(p.name)
                      }}
                    >
                      {p.name} ({p.stockLocal + p.stockDeposito})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {filteredProducts.map((product) => {
                const inList = isInShortageList(product.id)
                const totalStock = product.stockLocal + product.stockDeposito
                const quantity = quantities[product.id] || 1

                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      inList
                        ? "border-primary/30 bg-primary/5"
                        : totalStock <= 10
                          ? "border-amber-200 bg-amber-50/50"
                          : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          totalStock <= 10 ? "bg-amber-100" : "bg-muted"
                        }`}
                      >
                        {categoryIconMap[product.category]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Stock: L{product.stockLocal} / D{product.stockDeposito} |
                          Costo: ${product.purchasePrice.toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!inList && (
                        <>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-transparent"
                              onClick={() =>
                                handleQuantityChange(product.id, quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  product.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="h-7 w-14 text-center"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-transparent"
                              onClick={() =>
                                handleQuantityChange(product.id, quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToShortage(product)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Agregar
                          </Button>
                        </>
                      )}
                      {inList && (
                        <Badge variant="secondary">En lista</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
              {filteredProducts.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No se encontraron productos
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shortage list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Lista de pedido
            </CardTitle>
            <div className="flex gap-2">
              {shortages.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearShortages}
                    className="bg-transparent text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Limpiar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">
                        <Download className="mr-1 h-4 w-4" />
                        Descargar
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadShortageListBySupplier()}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Descargar todo
                      </DropdownMenuItem>
                      {suppliers.length > 1 && (
                        <>
                          <DropdownMenuSeparator />
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            Por proveedor
                          </div>
                          {suppliers.map((supplier) => (
                            <DropdownMenuItem 
                              key={supplier} 
                              onClick={() => downloadShortageListBySupplier(supplier)}
                            >
                              <Building2 className="mr-2 h-4 w-4" />
                              {supplier}
                              <span className="ml-auto text-xs text-muted-foreground">
                                ({shortagesBySupplier[supplier].length})
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {shortages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No hay productos en la lista de pedido
                </p>
                <p className="text-sm text-muted-foreground">
                  Busca y agrega productos desde la izquierda
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortages.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                              {categoryIconMap[item.category]}
                            </div>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">
                                ${item.purchasePrice.toLocaleString("es-AR")} c/u
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {item.supplier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() =>
                                onUpdateShortage(
                                  item.id,
                                  Math.max(1, item.quantityToOrder - 1)
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantityToOrder}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() =>
                                onUpdateShortage(item.id, item.quantityToOrder + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          $
                          {(
                            item.quantityToOrder * item.purchasePrice
                          ).toLocaleString("es-AR")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onRemoveShortage(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total del pedido</p>
                    <p className="text-xs text-muted-foreground">
                      {totalItems} productos
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    ${totalCost.toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
