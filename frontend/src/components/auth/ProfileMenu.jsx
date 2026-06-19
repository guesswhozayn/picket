import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield, ChevronDown } from 'lucide-react';

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[var(--bg-hover)] transition-colors px-2.5"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed || user.email}`}
          alt={user.name}
          className="w-8 h-8 rounded-full border border-[var(--bg-hover)]"
        />
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[13px] font-medium leading-none text-[var(--text-primary)]">
            {user.name?.split(' ')[0]}
          </span>
          <ChevronDown size={12} className="text-[var(--text-placeholder)]" />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl py-2 z-[100] border border-[var(--border-color)]"
          style={{
            background: 'var(--bg)',
            boxShadow: 'var(--sh-modal)',
          }}
        >
          <div className="px-4 py-2 border-b border-[var(--border-color)] mb-2">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] truncate">
              {user.email}
            </p>
          </div>

          <div className="px-2 space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text-body)] rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer">
              <User size={14} className="text-[var(--text-placeholder)]" />
              <span>Profile Settings</span>
            </div>

            {user.role === 'admin' && (
              <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text-body)] rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer">
                <Shield size={14} className="text-[var(--badge-blue-text)]" />
                <span>Admin Console</span>
              </div>
            )}
          </div>

          <div className="px-2 mt-2 pt-2 border-t border-[var(--border-color)]">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--badge-red-text)] rounded-lg hover:bg-[var(--badge-red-bg)] transition-colors"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <LogOut size={14} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
