'use client';

import { useSession } from '@/lib/providers/SessionProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredDepartments?: string[];
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requiredDepartments = [] 
}: ProtectedRouteProps) {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));
      if (!hasRequiredRole) {
        router.push('/unauthorized');
        return;
      }
    }

    if (user && requiredDepartments.length > 0) {
      const hasRequiredDepartment = requiredDepartments.some(dept => 
        user.departmentId === dept
      );
      if (!hasRequiredDepartment) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isLoading, router, requiredRoles, requiredDepartments]);

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}