import React, { useState, useEffect } from 'react'
import { MainLayout } from '../../AppLayout'
import { getDashboardSummary, DashboardSummary } from '../../services/api/dashboardService';
import { Card } from '../../shared/ui/data-display/Card';
import { Skeleton } from '../../shared/ui/feedback/Skeleton';
import { Alert } from '../../shared/ui/feedback/Alert';

// Dashboard with MainLayout
const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const response = await getDashboardSummary();
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error?.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="mb-6">
          <Skeleton height="2rem" width="60%" className="mb-2" />
          <Skeleton height="1.5rem" width="80%" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
        </div>
        
        <Skeleton height="20rem" className="mt-8" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-right">לוח בקרה</h1>
        <p className="text-gray-600 text-right">ברוכים הבאים למערכת ה-CRM למסנני מים</p>
      </div>
      
      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Dashboard cards */}
        <Card hoverable>
          <h3 className="text-lg font-semibold text-right">לקוחות</h3>
          <p className="text-3xl font-bold mt-2">{data?.customers.total || 0}</p>
          <p className="text-green-500 mt-1">+{data?.customers.percentChange || 0}% החודש</p>
        </Card>
        
        <Card hoverable>
          <h3 className="text-lg font-semibold text-right">הזמנות</h3>
          <p className="text-3xl font-bold mt-2">{data?.orders.total || 0}</p>
          <p className="text-green-500 mt-1">+{data?.orders.percentChange || 0}% החודש</p>
        </Card>
        
        <Card hoverable>
          <h3 className="text-lg font-semibold text-right">משימות פתוחות</h3>
          <p className="text-3xl font-bold mt-2">{data?.tasks.total || 0}</p>
          <p className="text-red-500 mt-1">{data?.tasks.highPriority || 0} עם עדיפות גבוהה</p>
        </Card>
      </div>
      
      <Card className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-right">הזמנות אחרונות</h3>
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
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="border px-4 py-2">#{order.id}</td>
                    <td className="border px-4 py-2">{order.customer}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full 
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {order.status === 'completed' ? 'הושלם' : 
                         order.status === 'pending' ? 'בהמתנה' : 
                         order.status === 'shipped' ? 'במשלוח' : order.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2">₪{order.amount.toLocaleString('he-IL')}</td>
                    <td className="border px-4 py-2">{order.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border px-4 py-2 text-center text-gray-500">
                    לא נמצאו הזמנות אחרונות
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  )
}

export default Dashboard 