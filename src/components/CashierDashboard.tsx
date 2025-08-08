import React from 'react';
import { LogOut, User, Receipt } from 'lucide-react';
import type { User as UserType } from '../App';

interface CashierDashboardProps {
  user: UserType;
  onLogout: () => void;
}

const CashierDashboard: React.FC<CashierDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Receipt className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Cashier Portal</h1>
                <p className="text-sm text-gray-500">Point of Sale System</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome, {user.name}!</h2>
                <p className="text-blue-100">Cashier ID: {user.cashierId}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="text-center py-12">
              <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
                <Receipt size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cashier Portal Coming Soon
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                This section will contain point-of-sale functionality, transaction processing, 
                and cashier-specific tools. Currently, only admin features are implemented.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-6 bg-gray-50 rounded-xl text-center">
                <div className="p-3 bg-green-100 rounded-full inline-block mb-3">
                  <Receipt size={20} className="text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Process Sales</h4>
                <p className="text-sm text-gray-600">Handle customer transactions</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl text-center">
                <div className="p-3 bg-blue-100 rounded-full inline-block mb-3">
                  <User size={20} className="text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">View Profile</h4>
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl text-center">
                <div className="p-3 bg-purple-100 rounded-full inline-block mb-3">
                  <Receipt size={20} className="text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">View Reports</h4>
                <p className="text-sm text-gray-600">Check daily sales</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CashierDashboard;