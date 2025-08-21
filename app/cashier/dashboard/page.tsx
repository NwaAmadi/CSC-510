'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import type { Transaction } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Receipt, DollarSign, Calendar, User, Trash2 } from 'lucide-react'

export default function CashierDashboardPage() {
  const { isAuthenticated, userRole, logout } = useAuth()
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'sale' as 'sale' | 'refund' | 'void',
    description: '',
  })
  const [transactionError, setTransactionError] = useState('')
  const [transactionSuccess, setTransactionSuccess] = useState('')
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'cashier') {
      router.push('/cashier/login')
      return
    }
    loadData()

    const transactionsSubscription = supabase
      .channel('custom-cashier-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(transactionsSubscription)
    }
  }, [isAuthenticated, userRole, router])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
      if (transactionsError) throw transactionsError
      setTransactions(transactionsData as Transaction[])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransactionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTransactionForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTransactionTypeChange = (value: 'sale' | 'refund' | 'void') => {
    setTransactionForm((prev) => ({ ...prev, type: value }))
  }

  const validateTransactionForm = () => {
    const { amount, description } = transactionForm

    if (!amount.trim() || !description.trim()) {
      return 'Amount and description are required'
    }

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount greater than 0'
    }

    if (description.trim().length < 3) {
      return 'Description must be at least 3 characters long'
    }

    return null
  }

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTransactionError('')
    setTransactionSuccess('')
    setIsSubmittingTransaction(true)

    const validationError = validateTransactionForm()
    if (validationError) {
      setTransactionError(validationError)
      setIsSubmittingTransaction(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: user?.id,
          cashierName: user?.user_metadata.username,
          amount: Number.parseFloat(transactionForm.amount),
          type: transactionForm.type,
          description: transactionForm.description.trim(),
        },
      ])
      if (error) throw error

      setTransactionSuccess('Transaction added successfully!')
      setTransactionForm({
        amount: '',
        type: 'sale',
        description: '',
      })
      setIsAddingTransaction(false)
    } catch (err: any) {
      setTransactionError(err.message)
    } finally {
      setIsSubmittingTransaction(false)
    }
  }

  const handleRemoveTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', transactionId)
      if (error) throw error
    } catch (err: any) {
      setTransactionError(err.message)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-100 text-green-800'
      case 'refund':
        return 'bg-red-100 text-red-800'
      case 'void':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const totalTransactionAmount = transactions?.reduce((sum, transaction) => {
    return transaction.type === 'sale' ? sum + transaction.amount : sum - transaction.amount
  }, 0)

  if (!isAuthenticated || userRole !== 'cashier') {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions?.length}</div>
                <p className="text-xs text-muted-foreground">All time transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalTransactionAmount || 0)}</div>
                <p className="text-xs text-muted-foreground">Net transaction value</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="new-transaction">New Transaction</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Complete list of all transactions in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No transactions found</p>
                      <p className="text-sm">Transaction history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions
                        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((transaction) => (
                          <div
                            key={transaction.id}
                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                                  <Receipt className="w-5 h-5 text-secondary-foreground" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">Transaction #{transaction.id}</h3>
                                  <p className="text-sm text-muted-foreground">by {transaction.cashierName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">
                                  {transaction.type === 'sale' ? '+' : '-'}
                                  {formatCurrency(transaction.amount)}
                                </div>
                                <Badge className={getTransactionTypeColor(transaction.type)}>
                                  {transaction.type.toUpperCase()}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="font-medium">{transaction.description}</p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Date:</span>
                                  <span className="font-medium">{formatDate(transaction.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Cashier ID:</span>
                                  <span className="font-medium">{transaction.user_id}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveTransaction(transaction.id)}
                              className="mt-4"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new-transaction" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Transaction</CardTitle>
                  <CardDescription>Add a new transaction to the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTransactionSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter amount"
                          value={transactionForm.amount}
                          onChange={handleTransactionInputChange}
                          disabled={isSubmittingTransaction}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Transaction Type</Label>
                        <Select
                          value={transactionForm.type}
                          onValueChange={handleTransactionTypeChange}
                          disabled={isSubmittingTransaction}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sale">Sale</SelectItem>
                            <SelectItem value="refund">Refund</SelectItem>
                            <SelectItem value="void">Void</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Enter transaction description"
                        value={transactionForm.description}
                        onChange={handleTransactionInputChange}
                        disabled={isSubmittingTransaction}
                        rows={3}
                      />
                    </div>

                    {transactionError && (
                      <Alert variant="destructive">
                        <AlertDescription>{transactionError}</AlertDescription>
                      </Alert>
                    )}

                    {transactionSuccess && (
                      <Alert>
                        <AlertDescription>{transactionSuccess}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" disabled={isSubmittingTransaction}>
                      {isSubmittingTransaction ? 'Submitting...' : 'Add Transaction'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
