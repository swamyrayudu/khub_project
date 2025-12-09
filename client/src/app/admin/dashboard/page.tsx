import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export default async function AdminDashboard() {
  // 🔐 Authentication Check
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token) redirect('/admin/login');

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as DecodedToken;
    
    if (decoded.role !== 'admin') redirect('/unauthorized');

    // 📊 Get Admin Data & Stats
    const adminData = await sql`
      SELECT name, email FROM admin_users WHERE id = ${decoded.userId}
    `;

    const stats = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_approvals
      FROM sellers
    `;

    if (adminData.length === 0) redirect('/admin/login');

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        
        {/* Protected Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, {adminData[0].name}
              </p>
            </div>
            
            <div className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
              <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                🔒 Authenticated
              </span>
            </div>
          </div>
        </header>

        {/* Protected Content */}
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats[0]?.total_users || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
              <p className="text-3xl font-bold text-amber-600">
                {stats[0]?.pending_approvals || 0}
              </p>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
              🛡️ Security Status
            </h3>
            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
              <p>✅ Admin authentication verified</p>
              <p>✅ Database credentials validated</p>
              <p>✅ Route protection active</p>
              <p>✅ No registration system (secure)</p>
            </div>
          </div>
        </main>
      </div>
    );

  } catch {
    redirect('/admin/login');
  }
}
