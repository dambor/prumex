import { User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeaderProps {
  user: {
    email: string;
    name: string;
    role: 'Proprietário' | 'Contratante';
  };
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgb(0,0,0)] rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-gray-900">Gestão de Obra</h1>
            <p className="text-sm text-gray-600">{user.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={user.role === 'Proprietário' ? 'default' : 'secondary'}>
            {user.role}
          </Badge>
        </div>
      </div>
    </header>
  );
}