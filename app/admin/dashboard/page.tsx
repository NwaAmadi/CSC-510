
'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Plus, Mail, Trash2 } from 'lucide-react'

interface Cashier {
  id: number;
  name: string;
  email: string;
}

export default function AdminDashboardPage() {
  const router = useRouter()

  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [isAddingCashier, setIsAddingCashier] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cashiers');
        if (!response.ok) {
          throw new Error('Failed to fetch cashiers');
        }
        const data = await response.json();
        setCashiers(data);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchCashiers();
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const { name, email, password } = formData

    if (!name.trim() || !email.trim() || !password.trim()) {
      return 'All fields are required'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address'
    }

    if (cashiers.some((cashier) => cashier.email === email.trim())) {
      return 'A cashier with this email already exists'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register/cashier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add cashier');
      }

      setSuccess('Cashier added successfully!')
      setFormData({
        name: '',
        email: '',
        password: '',
      })
      setIsAddingCashier(false)
      // Refetch cashiers to update the list
      const fetchResponse = await fetch('http://localhost:5000/api/cashiers');
      const data = await fetchResponse.json();
      setCashiers(data);

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCashier = async (cashierId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cashiers/${cashierId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete cashier');
      }

      setCashiers(cashiers.filter((cashier) => cashier.id !== cashierId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Add Cashier Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cashier Management</CardTitle>
                  <CardDescription>Add new cashiers to the system</CardDescription>
                </div>
                <Button onClick={() => setIsAddingCashier(!isAddingCashier)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isAddingCashier ? 'Cancel' : 'Add Cashier'}
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
                    {isLoading ? 'Adding Cashier...' : 'Add Cashier'}
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>

          {/* Registered Cashiers */}
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
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveCashier(cashier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
