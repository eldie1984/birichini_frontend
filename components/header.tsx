"use client"

import { useState, useEffect } from "react"
import { PawPrint, Package, ShoppingCart, ArrowLeftRight, FileText, AlertTriangle, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authApi, isAuthenticated, getStoredUser } from "@/lib/api"

type View = "inventory" | "sales" | "movements" | "remitos" | "shortages"

interface HeaderProps {
  currentView: View
  onViewChange: (view: View) => void
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
    setUser(getStoredUser())
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    const response = await authApi.login(username, password)
    if (response.error) {
      setLoginError(response.error)
    } else {
      setIsLoggedIn(true)
      setUser(response.data?.user)
      setShowLoginModal(false)
      setUsername("")
      setPassword("")
    }
  }

  const handleLogout = async () => {
    await authApi.logout()
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <PawPrint className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Birichini</h1>
              <p className="text-xs text-muted-foreground">Pet Shop</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Button
              variant={currentView === "inventory" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("inventory")}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventario</span>
            </Button>
            <Button
              variant={currentView === "sales" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("sales")}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Ventas</span>
            </Button>
            <Button
              variant={currentView === "movements" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("movements")}
              className="gap-2"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">Movimientos</span>
            </Button>
            <Button
              variant={currentView === "remitos" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("remitos")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Remitos</span>
            </Button>
            <Button
              variant={currentView === "shortages" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("shortages")}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Faltantes</span>
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            {isLoggedIn && user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowLoginModal(true)} className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Iniciar Sesion</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Contrasena</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-500">{loginError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowLoginModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Iniciar Sesion
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}