import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

interface AdminProtectionProps {
  children: React.ReactNode;
}

export default async function AdminProtection({ children }: AdminProtectionProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');

  if (!token) {
    redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'supersecretkey') as any;
    
    if (!decoded || decoded.role !== 'admin') {
      redirect('/unauthorized');
    }

    // Verify user still exists and is active
    const { sql } = await import('@/lib/db');
    const users = await sql`
      SELECT id, is_active FROM admin_users 
      WHERE id = ${decoded.userId} AND is_active = true
    `;

    if (users.length === 0) {
      redirect('/admin/login');
    }

    // We'll handle login page redirects in middleware instead
    // as it's more appropriate for handling route protection

    return <>{children}</>;

  } catch (error) {
    redirect('/admin/login');
  }
}
