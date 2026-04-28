"use client"

import { useState, useEffect } from "react"
import { Header } from "./header"
import { StatsCards } from "./stats-cards"
import { CategoryFilter } from "./category-filter"
import { ProductForm } from "./product-form"
import { ProductList } from "./product-list"
import { SalesView } from "./sales-view"
import { MovementsView } from "./movements-view"
import { RemitosView } from "./remitos-view"
import { ShortagesView } from "./shortages-view"
import { Product, Category, Sale, InventoryMovement, Location, ShortageItem } from "@/lib/types"
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getSales,
  registerSale,
  getMovements,
  moveInventory,
  getShortages,
  addShortage,
  updateShortage,
  removeShortage,
  clearShortages,
} from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type View = "inventory" | "sales" | "movements" | "remitos" | "shortages"

// Sample data for initial load
const sampleProducts: Omit<Product, "id" | "createdAt">[] = [
  {
    name: "Alimento Premium para Perros",
    description: "Alimento balanceado de alta calidad para perros adultos, 15kg",
    category: "perro",
    supplier: "Royal Canin",
    purchasePrice: 8500,
    salePrice: 12000,
    stockDeposito: 20,
    stockLocal: 5,
  },
  {
    name: "Arena Sanitaria para Gatos",
    description: "Arena aglomerante con control de olores, 10kg",
    category: "gato",
    supplier: "Cat's Best",
    purchasePrice: 3200,
    salePrice: 4800,
    stockDeposito: 30,
    stockLocal: 10,
  },
  {
    name: "Pelota de Juguete",
    description: "Pelota resistente para mascotas, varios colores",
    category: "accesorio",
    supplier: "Pet Toys",
    purchasePrice: 500,
    salePrice: 850,
    stockDeposito: 40,
    stockLocal: 20,
  },
  {
    name: "Collar Antipulgas para Perros",
    description: "Collar con proteccion de hasta 8 meses",
    category: "perro",
    supplier: "Bayer",
    purchasePrice: 2800,
    salePrice: 4200,
    stockDeposito: 10,
    stockLocal: 5,
  },
  {
    name: "Rascador para Gatos",
    description: "Rascador de sisal con plataforma",
    category: "gato",
    supplier: "Pet Toys",
    purchasePrice: 4500,
    salePrice: 7200,
    stockDeposito: 5,
    stockLocal: 3,
  },
  {
    name: "Transportadora Mediana",
    description: "Transportadora plastica para mascotas medianas",
    category: "accesorio",
    supplier: "Ferplast",
    purchasePrice: 6000,
    salePrice: 9500,
    stockDeposito: 8,
    stockLocal: 4,
  },
]

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [shortages, setShortages] = useState<ShortageItem[]>([])
  const [currentView, setCurrentView] = useState<View>("inventory")
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, salesData, movementsData, shortagesData] = await Promise.all([
          getProducts(),
          getSales(),
          getMovements(),
          getShortages(),
        ])

        // Initialize with sample data if no products exist
        if (productsData.length === 0) {
          for (const p of sampleProducts) {
            await addProduct(p)
          }
          const newProducts = await getProducts()
          setProducts(newProducts)
        } else {
          setProducts(productsData)
        }

        setSales(salesData)
        setMovements(movementsData)
        setShortages(shortagesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [])

  const handleAddProduct = async (productData: Omit<Product, "id" | "createdAt">) => {
    const newProduct = await addProduct(productData)
    if (newProduct) {
      setProducts([...products, newProduct])
    }
  }

  const handleUpdateProduct = async (
    id: string,
    updates: Partial<Omit<Product, "id" | "createdAt">>
  ) => {
    const updated = await updateProduct(id, updates)
    if (updated) {
      setProducts(products.map((p) => (p.id === id ? updated : p)))
    }
  }

  const handleDeleteProduct = async (id: string) => {
    const success = await deleteProduct(id)
    if (success) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  const handleRegisterSale = async (productId: string, quantity: number): Promise<Sale | null> => {
    const sale = await registerSale(productId, quantity)
    if (sale) {
      const [newSales, newProducts] = await Promise.all([
        getSales(),
        getProducts(),
      ])
      setSales(newSales)
      setProducts(newProducts)
    }
    return sale
  }

  const handleQuickSale = async (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    // Try to sell from local first, then from deposito
    if (product.stockLocal > 0) {
      await handleRegisterSale(productId, 1)
    } else if (product.stockDeposito > 0) {
      // Move 1 unit from deposito to local and then sell
      const movement = await moveInventory(productId, 1, "deposito", "local")
      if (movement) {
        const [newMovements, newProducts] = await Promise.all([
          getMovements(),
          getProducts(),
        ])
        setMovements(newMovements)
        setProducts(newProducts)
        await handleRegisterSale(productId, 1)
      }
    }
  }

  const handleMoveInventory = async (
    productId: string,
    quantity: number,
    from: Location,
    to: Location
  ): Promise<InventoryMovement | null> => {
    const movement = await moveInventory(productId, quantity, from, to)
    if (movement) {
      const [newMovements, newProducts] = await Promise.all([
        getMovements(),
        getProducts(),
      ])
      setMovements(newMovements)
      setProducts(newProducts)
    }
    return movement
  }

  const handleAddShortage = async (productId: string, quantity: number): Promise<ShortageItem | null> => {
    const shortage = await addShortage(productId, quantity)
    if (shortage) {
      const newShortages = await getShortages()
      setShortages(newShortages)
    }
    return shortage
  }

  const handleUpdateShortage = async (id: string, quantity: number): Promise<ShortageItem | null> => {
    const updated = await updateShortage(id, quantity)
    if (updated) {
      const newShortages = await getShortages()
      setShortages(newShortages)
    }
    return updated
  }

  const handleRemoveShortage = async (id: string): Promise<boolean> => {
    const removed = await removeShortage(id)
    if (removed) {
      const newShortages = await getShortages()
      setShortages(newShortages)
    }
    return removed
  }

  const handleClearShortages = async () => {
    await clearShortages()
    setShortages([])
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentView === "inventory" && (
          <div className="space-y-8">
            <StatsCards products={products} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ProductForm onSubmit={handleAddProduct} />
              </div>
            </div>

            <ProductList
              products={filteredProducts}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
              onQuickSale={handleQuickSale}
            />
          </div>
        )}

        {currentView === "sales" && (
          <SalesView
            products={products}
            sales={sales}
            onRegisterSale={handleRegisterSale}
          />
        )}

        {currentView === "movements" && (
          <MovementsView
            products={products}
            movements={movements}
            onMoveInventory={handleMoveInventory}
          />
        )}

        {currentView === "remitos" && <RemitosView />}

        {currentView === "shortages" && (
          <ShortagesView
            products={products}
            shortages={shortages}
            onAddShortage={handleAddShortage}
            onUpdateShortage={handleUpdateShortage}
            onRemoveShortage={handleRemoveShortage}
            onClearShortages={handleClearShortages}
          />
        )}
      </main>
    </div>
  )
}