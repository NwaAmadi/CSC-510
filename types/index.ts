export interface Admin {
  adminId: string
  password: string
}

export interface Cashier {
  id: string
  name: string
  mobileNumber: string
  address: string
  email: string
  password: string
  createdAt: string
}

export interface Transaction {
  id: string
  cashierId: string
  cashierName: string
  amount: number
  type: "sale" | "refund" | "void" |'payment' |'income' | 'expense'
  description: string
  timestamp: string
}

export interface AppData {
  admin: Admin
  cashiers: Cashier[]
  transactions: Transaction[]
}

export type UserRole = "admin" | "cashier" | null

export interface AuthState {
  isAuthenticated: boolean
  userRole: UserRole
  userId: string | null
  userName: string | null
}
