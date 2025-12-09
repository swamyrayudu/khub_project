import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export default async function AdminHomePage() {
  // Check authentication on server-side
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token) {
    redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token.value, JWT_SECRET) as DecodedToken;
    
    if (!decoded || decoded.role !== 'admin') {
      redirect('/unauthorized');
    }

    // Get fresh admin data from database
    const { sql } = await import('@/lib/db');
    const users = await sql`
      SELECT id, email, name FROM admin_users 
      WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      redirect('/admin/login');
    }

    const adminUser = users[0];

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b px-6 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {adminUser.name}</p>
        </header>
        
        <main className="p-6">
          <h2 className="text-xl font-semibold mb-4">🎉 Admin Access Granted!</h2>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-300">
              ✅ <strong>Authenticated as:</strong> {adminUser.email}<br/>
              ✅ <strong>Role:</strong> Administrator<br/>
              ✅ <strong>Security:</strong> Database-verified credentials
            </p>
          </div>
        </main>
      </div>
    );

  } catch {
    redirect('/admin/login');
  }
}
