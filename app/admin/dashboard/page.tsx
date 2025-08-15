"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { addCashier, getStorageData } from "@/lib/storage"
import type { Cashier } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, LogOut, Plus, Mail, Phone, MapPin } from "lucide-react"

export default function AdminDashboardPage() {
  const { isAuthenticated, userRole, userName, logout } = useAuth()
  const router = useRouter()

  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [isAddingCashier, setIsAddingCashier] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    address: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") {
      router.push("/admin/login")
      return
    }
    loadCashiers()
  }, [isAuthenticated, userRole, router])

  const loadCashiers = () => {
    const data = getStorageData()
    setCashiers(data.cashiers)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const { name, mobileNumber, address, email, password } = formData

    if (!name.trim() || !mobileNumber.trim() || !address.trim() || !email.trim() || !password.trim()) {
      return "All fields are required"
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address"
    }

    if (!/^\d{10,}$/.test(mobileNumber.replace(/\D/g, ""))) {
      return "Please enter a valid mobile number (at least 10 digits)"
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters long"
    }

    if (cashiers.some((cashier) => cashier.email === email.trim())) {
      return "A cashier with this email already exists"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      addCashier({
        name: formData.name.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        address: formData.address.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })

      setSuccess("Cashier added successfully!")
      setFormData({
        name: "",
        mobileNumber: "",
        address: "",
        email: "",
        password: "",
      })
      setIsAddingCashier(false)
      loadCashiers()
    } catch (err) {
      setError("Failed to add cashier. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated || userRole !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
         
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cashiers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cashiers.length}</div>
                <p className="text-xs text-muted-foreground">Active cashier accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Badge variant="secondary">Active</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cashier Management</CardTitle>
                  <CardDescription>Add new cashiers to the system</CardDescription>
                </div>
                <Button onClick={() => setIsAddingCashier(!isAddingCashier)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isAddingCashier ? "Cancel" : "Add Cashier"}
                </Button>
              </div>
            </CardHeader>

            {isAddingCashier && (
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Cashier Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input
                        id="mobileNumber"
                        name="mobileNumber"
                        placeholder="Enter mobile number"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Enter full address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Adding Cashier..." : "Add Cashier"}
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Cashiers</CardTitle>
              <CardDescription>View all cashiers in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {cashiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No cashiers registered yet</p>
                  <p className="text-sm">Add your first cashier to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {cashiers.map((cashier) => (
                    <div key={cashier.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{cashier.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {cashier.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {cashier.mobileNumber}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {cashier.address}
                          </div>
                        </div>
                        <Badge variant="secondary">ID: {cashier.id}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
