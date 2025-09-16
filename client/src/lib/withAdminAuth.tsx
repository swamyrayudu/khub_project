import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export function withAdminAuth<T extends object>(Component: React.ComponentType<T>) {
  return async function ProtectedComponent(props: T) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
      redirect('/admin/login');
    }

    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'supersecretkey') as any;
      
      if (!decoded || decoded.role !== 'admin') {
        redirect('/unauthorized');
      }

      return <Component {...props} />;

    } catch (error) {
      redirect('/admin/login');
    }
  };
}
