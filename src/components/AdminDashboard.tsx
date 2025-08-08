import React, { useState } from 'react';
import { 
  Users, 
  Receipt, 
  Plus, 
  LogOut, 
  BarChart3, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import type { User } from '../App';
import AddCashierForm from './AddCashierForm';
import CashierList from './CashierList';
import TransactionList from './TransactionList';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<'add-cashier' | 'cashiers' | 'transactions'>('add-cashier');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { key: 'add-cashier', label: 'Add Cashier', icon: Plus },
    { key: 'cashiers', label: 'Manage Cashiers', icon: Users },
    { key: 'transactions', label: 'Transactions', icon: Receipt },
  ] as const;

  const renderContent = () => {
    switch (activeView) {
      case 'add-cashier':
        return <AddCashierForm />;
      case 'cashiers':
        return <CashierList />;
      case 'transactions':
        return <TransactionList />;
      default:
        return <AddCashierForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => {
                    setActiveView(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                    activeView === item.key
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Settings size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.adminId}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.key === activeView)?.label}
              </h2>
              <p className="text-sm text-gray-500">
                Welcome back, {user.adminId}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;