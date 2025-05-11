import React, { useState } from 'react';
import { MainLayout } from '../../shared/ui/layout/MainLayout';
import { Container } from '../../shared/ui/layout/Container';
import { PageHeader } from '../../shared/ui/layout/PageHeader';
import { useRtlDirection } from '../../shared/utils/rtl';
import { sidebarItems, userMenuItems, notifications } from '../../shared/data/mockData.tsx';
import { Logo } from '../../shared/components/Logo';
import { Alert } from '../../shared/ui/feedback/Alert';

interface TabProps {
  id: string;
  label: string;
}

// Simple Tabs component
const Tabs: React.FC<{
  tabs: TabProps[];
  activeTab: string;
  onChange: (id: string) => void;
}> = ({ tabs, activeTab, onChange }) => {
  const isRtl = useRtlDirection();
  
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className={`flex ${isRtl ? 'space-x-reverse' : 'space-x-8'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Placeholder components for different tabs
const CustomerForm = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-lg font-medium mb-4">פרטי לקוח</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">שם פרטי</label>
        <input type="text" className="w-full p-2 border rounded" defaultValue="משה" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">שם משפחה</label>
        <input type="text" className="w-full p-2 border rounded" defaultValue="כהן" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
        <input type="email" className="w-full p-2 border rounded" defaultValue="moshe@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
        <input type="tel" className="w-full p-2 border rounded" defaultValue="050-1234567" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
        <input type="text" className="w-full p-2 border rounded" defaultValue="רחוב הרצל 10, תל אביב" />
      </div>
    </div>
    <div className="mt-6 flex justify-end">
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">שמור שינויים</button>
    </div>
  </div>
);

const CustomerOrders = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-lg font-medium mb-4">הזמנות</h2>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מס׳ הזמנה</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        <tr>
          <td className="px-6 py-4 whitespace-nowrap">1001</td>
          <td className="px-6 py-4 whitespace-nowrap">15/03/2023</td>
          <td className="px-6 py-4 whitespace-nowrap">₪1,250</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">הושלם</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            <button className="text-blue-600 hover:text-blue-900">צפה</button>
          </td>
        </tr>
        <tr>
          <td className="px-6 py-4 whitespace-nowrap">1002</td>
          <td className="px-6 py-4 whitespace-nowrap">18/03/2023</td>
          <td className="px-6 py-4 whitespace-nowrap">₪2,340</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">בטיפול</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            <button className="text-blue-600 hover:text-blue-900">צפה</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const CustomerServiceHistory = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-lg font-medium mb-4">היסטוריית שירות</h2>
    <div className="space-y-4">
      <div className="p-4 border rounded-md">
        <div className="flex justify-between mb-2">
          <span className="font-medium">החלפת מסנן</span>
          <span className="text-gray-500 text-sm">20/02/2023</span>
        </div>
        <p className="text-gray-600">הוחלף מסנן מים ראשי. טכנאי: ישראל ישראלי</p>
      </div>
      <div className="p-4 border rounded-md">
        <div className="flex justify-between mb-2">
          <span className="font-medium">בדיקת מערכת</span>
          <span className="text-gray-500 text-sm">15/12/2022</span>
        </div>
        <p className="text-gray-600">בוצעה בדיקה תקופתית למערכת המים. טכנאי: יוסי לוי</p>
      </div>
    </div>
  </div>
);

const CustomerDocuments = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-lg font-medium mb-4">מסמכים</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded-md p-4 flex items-center">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <div className="font-medium">חשבונית #1001</div>
          <div className="text-sm text-gray-500">15/03/2023</div>
        </div>
        <button className="mr-auto text-blue-600 hover:text-blue-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
      <div className="border rounded-md p-4 flex items-center">
        <div className="bg-green-100 p-3 rounded-full text-green-600 mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <div className="font-medium">חוזה התקנה</div>
          <div className="text-sm text-gray-500">10/01/2023</div>
        </div>
        <button className="mr-auto text-blue-600 hover:text-blue-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const CustomerActivity = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-lg font-medium mb-4">פעילות אחרונה</h2>
    <div className="flow-root">
      <ul className="-mb-8">
        <li>
          <div className="relative pb-8">
            <span className="absolute top-5 right-5 -mr-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
            <div className="relative flex items-start space-x-3 space-x-reverse">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div>
                  <div className="text-sm font-medium text-gray-900">תשלום התקבל</div>
                  <p className="mt-0.5 text-sm text-gray-500">15/03/2023 - 10:42</p>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <p>התקבל תשלום בסך ₪1,250 עבור הזמנה #1001</p>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="relative pb-8">
            <div className="relative flex items-start space-x-3 space-x-reverse">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div>
                  <div className="text-sm font-medium text-gray-900">הזמנה הושלמה</div>
                  <p className="mt-0.5 text-sm text-gray-500">15/03/2023 - 09:15</p>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <p>הזמנה #1001 הושלמה ונשלחה ללקוח</p>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
);

/**
 * Customer detail page with tabs for different sections
 */
const CustomerDetail = () => {
  const [activePath, setActivePath] = useState('/customers');
  const [activeTab, setActiveTab] = useState('details');
  
  return (
    <MainLayout
      sidebarItems={sidebarItems}
      activePath={activePath}
      userName="ישראל ישראלי"
      userRole="מנהל מערכת"
      userMenuItems={userMenuItems}
      logo={<Logo />}
      title="פרטי לקוח"
      notifications={notifications}
      onNavigate={(path) => setActivePath(path)}
    >
      <Container>
        <PageHeader 
          title="משה כהן" 
          description="פרטי לקוח וניהול"
          backLink={{ href: '/customers', label: 'חזרה לרשימת הלקוחות' }}
        />
        
        <Tabs
          tabs={[
            { id: 'details', label: 'פרטים' },
            { id: 'orders', label: 'הזמנות' },
            { id: 'service', label: 'היסטוריית שירות' },
            { id: 'documents', label: 'מסמכים' },
            { id: 'activity', label: 'פעילות' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        
        {activeTab === 'details' && <CustomerForm />}
        {activeTab === 'orders' && <CustomerOrders />}
        {activeTab === 'service' && <CustomerServiceHistory />}
        {activeTab === 'documents' && <CustomerDocuments />}
        {activeTab === 'activity' && <CustomerActivity />}
      </Container>
    </MainLayout>
  );
};

export default CustomerDetail; 