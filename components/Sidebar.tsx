'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCog,
  UserCheck,
  FileCheck,
  Calendar,
  ClipboardList,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/management/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', href: '/management/dashboard/accounts', icon: Users },
  { name: 'Therapists', href: '/management/dashboard/therapists', icon: UserCog },
  { name: 'Patients', href: '/management/dashboard/patients', icon: UserCheck },
  { name: 'Certificates', href: '/management/dashboard/certificates', icon: FileCheck },
  { name: 'Events', href: '/management/dashboard/events', icon: Calendar },
  { name: 'Questionnaires', href: '/management/dashboard/questionnaires', icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/management/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Menta Admin</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
