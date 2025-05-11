import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase/client';
import './App.css';

// Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const LeadsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);

const CustomersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
  </svg>
);

// Placeholder Components
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">ממשק ניהול</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-blue-100 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">לידים חדשים</h2>
        <p className="text-3xl font-bold text-blue-600">24</p>
      </div>
      <div className="bg-green-100 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">לקוחות פעילים</h2>
        <p className="text-3xl font-bold text-green-600">156</p>
      </div>
      <div className="bg-purple-100 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">הזמנות חודשיות</h2>
        <p className="text-3xl font-bold text-purple-600">38</p>
      </div>
    </div>
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">פעילות אחרונה</h2>
      <div className="bg-white shadow rounded-lg p-4">
        <ul className="divide-y">
          <li className="py-3">לקוח חדש נרשם: דוד כהן</li>
          <li className="py-3">הזמנה #1234 הושלמה</li>
          <li className="py-3">ליד חדש דרך אתר החברה</li>
          <li className="py-3">פגישת שירות נקבעה: 2023-08-15</li>
        </ul>
      </div>
    </div>
  </div>
);

const Leads = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">ניהול לידים</h1>
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <input type="text" placeholder="חיפוש לידים..." className="p-2 border rounded" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">ליד חדש +</button>
        </div>
      </div>
      <table className="min-w-full divide-y">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">טלפון</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מקור</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">יעל לוי</td>
            <td className="px-6 py-4 whitespace-nowrap">050-1234567</td>
            <td className="px-6 py-4 whitespace-nowrap"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">חדש</span></td>
            <td className="px-6 py-4 whitespace-nowrap">אתר</td>
            <td className="px-6 py-4 whitespace-nowrap">01/08/2023</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">יוסי כהן</td>
            <td className="px-6 py-4 whitespace-nowrap">052-7654321</td>
            <td className="px-6 py-4 whitespace-nowrap"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">נוצר קשר</span></td>
            <td className="px-6 py-4 whitespace-nowrap">שיווק</td>
            <td className="px-6 py-4 whitespace-nowrap">29/07/2023</td>
          </tr>
        </tbody>
      </table>
      <div className="p-4 border-t">
        <div className="flex justify-between items-center">
          <div>מציג 1-2 מתוך 2 לידים</div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button className="px-3 py-1 border rounded">הקודם</button>
            <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
            <button className="px-3 py-1 border rounded">הבא</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Customers = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">ניהול לקוחות</h1>
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <input type="text" placeholder="חיפוש לקוחות..." className="p-2 border rounded" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">לקוח חדש +</button>
        </div>
      </div>
      <table className="min-w-full divide-y">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">טלפון</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">אימייל</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">כתובת</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">דוד כהן</td>
            <td className="px-6 py-4 whitespace-nowrap">050-1234567</td>
            <td className="px-6 py-4 whitespace-nowrap">david@example.com</td>
            <td className="px-6 py-4 whitespace-nowrap">רחוב הרצל 15, תל אביב</td>
            <td className="px-6 py-4 whitespace-nowrap"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">פעיל</span></td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">שרה לוי</td>
            <td className="px-6 py-4 whitespace-nowrap">052-7654321</td>
            <td className="px-6 py-4 whitespace-nowrap">sarah@example.com</td>
            <td className="px-6 py-4 whitespace-nowrap">רחוב בן יהודה 42, ירושלים</td>
            <td className="px-6 py-4 whitespace-nowrap"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">פעיל</span></td>
          </tr>
        </tbody>
      </table>
      <div className="p-4 border-t">
        <div className="flex justify-between items-center">
          <div>מציג 1-2 מתוך 2 לקוחות</div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button className="px-3 py-1 border rounded">הקודם</button>
            <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
            <button className="px-3 py-1 border rounded">הבא</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Products = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">ניהול מוצרים</h1>
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <input type="text" placeholder="חיפוש מוצרים..." className="p-2 border rounded" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">מוצר חדש +</button>
        </div>
      </div>
      <table className="min-w-full divide-y">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם המוצר</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קטגוריה</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מחיר</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מלאי</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">מערכת סינון מים פרימיום</td>
            <td className="px-6 py-4 whitespace-nowrap">מסנני מים</td>
            <td className="px-6 py-4 whitespace-nowrap">₪1,299</td>
            <td className="px-6 py-4 whitespace-nowrap">15</td>
            <td className="px-6 py-4 whitespace-nowrap"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">פעיל</span></td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">מסנן מים בסיסי</td>
            <td className="px-6 py-4 whitespace-nowrap">מסנני מים</td>
            <td className="px-6 py-4 whitespace-nowrap">₪499</td>
            <td className="px-6 py-4 whitespace-nowrap">25</td>
            <td className="px-6 py-4 whitespace-nowrap"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">פעיל</span></td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">מחסנית החלפה למסנן</td>
            <td className="px-6 py-4 whitespace-nowrap">מחסניות החלפה</td>
            <td className="px-6 py-4 whitespace-nowrap">₪69</td>
            <td className="px-6 py-4 whitespace-nowrap">100</td>
            <td className="px-6 py-4 whitespace-nowrap"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">פעיל</span></td>
          </tr>
        </tbody>
      </table>
      <div className="p-4 border-t">
        <div className="flex justify-between items-center">
          <div>מציג 1-3 מתוך 3 מוצרים</div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button className="px-3 py-1 border rounded">הקודם</button>
            <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
            <button className="px-3 py-1 border rounded">הבא</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('customers').select('count').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('disconnected');
        } else {
          setConnectionStatus('connected');
        }
      } catch (e) {
        console.error('Connection check failed:', e);
        setConnectionStatus('disconnected');
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              className="md:hidden text-gray-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center">
              <img src="/logo.png" alt="Water Filter Logo" className="h-8 w-auto mr-2" />
              <div className="text-xl font-bold text-blue-600">מערכת CRM למסנני מים</div>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}></div>
              <div className="hidden md:block text-sm text-gray-600">
                {connectionStatus === 'connected' ? 'מחובר לשרת' : 
                 connectionStatus === 'connecting' ? 'מתחבר...' : 
                 'לא מחובר'}
              </div>
              <div className="relative">
                <button className="flex items-center text-sm focus:outline-none">
                  <img className="h-8 w-8 rounded-full" src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" />
                  <span className="hidden md:block mr-2">מנהל מערכת</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`md:block bg-white shadow-lg w-64 fixed inset-y-0 pt-16 transform transition-transform duration-300 ease-in-out z-10 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="px-4 py-6">
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/dashboard" 
                    className={`flex items-center p-3 text-gray-600 rounded hover:bg-blue-50 hover:text-blue-600 ${
                      location.pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <DashboardIcon />
                    <span className="mr-3">ממשק ניהול</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/leads" 
                    className={`flex items-center p-3 text-gray-600 rounded hover:bg-blue-50 hover:text-blue-600 ${
                      location.pathname === '/leads' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <LeadsIcon />
                    <span className="mr-3">לידים</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/customers" 
                    className={`flex items-center p-3 text-gray-600 rounded hover:bg-blue-50 hover:text-blue-600 ${
                      location.pathname === '/customers' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <CustomersIcon />
                    <span className="mr-3">לקוחות</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/products" 
                    className={`flex items-center p-3 text-gray-600 rounded hover:bg-blue-50 hover:text-blue-600 ${
                      location.pathname === '/products' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <ProductsIcon />
                    <span className="mr-3">מוצרים</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="absolute bottom-0 w-full p-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>גרסה 1.0.0</span>
              <a href="#" className="text-blue-600 hover:underline">עזרה</a>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 md:mr-64 pt-16">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">דף לא נמצא</h1>
                  <p>הדף המבוקש אינו קיים.</p>
                  <Link to="/" className="text-blue-600 hover:underline">חזרה לדף הבית</Link>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App; 