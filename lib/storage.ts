import type { AppData, Cashier, Transaction } from "@/types"

const STORAGE_KEY = "cashier_management_data"

const defaultData: AppData = {
  admin: {
    adminId: "gospel",
    password: "gospel",
  },
  cashiers: [],
  transactions: [
    {
      id: "3572672682",
      cashierId: "victor",
      cashierName: "head accountant",
      amount: 150.0,
      type: "sale",
      description: "Annual restock",
      timestamp: new Date().toISOString(),
    },
    {
      id: "16375527881",
      cashierId: "freedom",
      cashierName: "head accountant",
      amount: 650.0,
      type: "void",
      description: "Office maintainance",
      timestamp: new Date().toISOString(),
    },
  ],
}

export const getStorageData = (): AppData => {
  if (typeof window === "undefined") return defaultData

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
      return defaultData
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return defaultData
  }
}

export const saveStorageData = (data: AppData): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

export const addCashier = (cashier: Omit<Cashier, "id" | "createdAt">): void => {
  const data = getStorageData()
  const newCashier: Cashier = {
    ...cashier,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  data.cashiers.push(newCashier)
  saveStorageData(data)
}

export const addTransaction = (transaction: Omit<Transaction, "id" | "timestamp">): void => {
  const data = getStorageData()
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  }
  data.transactions.push(newTransaction)
  saveStorageData(data)
}

export const validateAdmin = (adminId: string, password: string): boolean => {
  const data = getStorageData()
  return data.admin.adminId === adminId && data.admin.password === password
}

export const validateCashier = (email: string, password: string): Cashier | null => {
  const data = getStorageData()
  const cashier = data.cashiers.find((c) => c.email === email && c.password === password) 
  return cashier || null
}
