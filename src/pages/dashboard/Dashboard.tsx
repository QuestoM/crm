import React from 'react'
import { useRtlDirection } from '../../shared/utils/rtl'

const Dashboard: React.FC = () => {
  const isRtl = useRtlDirection()
  
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">לוח בקרה</h1>
        <p className="text-gray-600">ברוכים הבאים למערכת ה-CRM למסנני מים</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Dashboard cards */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className={`text-lg font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>לקוחות</h3>
          <p className="text-3xl font-bold mt-2">152</p>
          <p className="text-green-500 mt-1">+12% החודש</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className={`text-lg font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>הזמנות</h3>
          <p className="text-3xl font-bold mt-2">38</p>
          <p className="text-green-500 mt-1">+5% החודש</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className={`text-lg font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>משימות פתוחות</h3>
          <p className="text-3xl font-bold mt-2">27</p>
          <p className="text-red-500 mt-1">4 עם עדיפות גבוהה</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h3 className={`text-lg font-semibold mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>הזמנות אחרונות</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-right">מספר הזמנה</th>
                <th className="px-4 py-2 text-right">לקוח</th>
                <th className="px-4 py-2 text-right">סטטוס</th>
                <th className="px-4 py-2 text-right">סכום</th>
                <th className="px-4 py-2 text-right">תאריך</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">#12345</td>
                <td className="border px-4 py-2">ישראל ישראלי</td>
                <td className="border px-4 py-2">
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">הושלם</span>
                </td>
                <td className="border px-4 py-2">₪1,200</td>
                <td className="border px-4 py-2">04/01/2025</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">#12344</td>
                <td className="border px-4 py-2">שרה כהן</td>
                <td className="border px-4 py-2">
                  <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">בהמתנה</span>
                </td>
                <td className="border px-4 py-2">₪850</td>
                <td className="border px-4 py-2">03/29/2025</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">#12343</td>
                <td className="border px-4 py-2">יעקב לוי</td>
                <td className="border px-4 py-2">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">במשלוח</span>
                </td>
                <td className="border px-4 py-2">₪2,400</td>
                <td className="border px-4 py-2">03/28/2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 