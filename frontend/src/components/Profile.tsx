import { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { Button } from './Button';
import type { User } from '@supabase/supabase-js';

interface ProfileProps {
  user: User;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

export function Profile({ user, onSignOut, onDeleteAccount }: ProfileProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fullName = user.user_metadata?.full_name || 'Traveler';
  const email = user.email || '';

  useEffect(() => {
    if (showDeleteConfirm && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    if (countdown === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      onDeleteAccount();
    }
  }, [showDeleteConfirm, countdown, onDeleteAccount]);

  const handleCancelDelete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowDeleteConfirm(false);
    setCountdown(10);
  };

  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="max-w-lg mx-auto px-6 py-12 md:py-20">
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-serif text-white">{initials}</span>
        </div>
        <h2 className="text-3xl font-serif text-slate-900">{fullName}</h2>
        <p className="text-slate-500 mt-1">{email}</p>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-3"
          onClick={onSignOut}
        >
          <Lucide.LogOut className="w-4 h-4" />
          Sign Out
        </Button>

        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 underline text-sm hover:text-red-700 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lucide.AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-serif text-slate-900 mb-2">Delete Account?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This will permanently delete your account and all your data. This action cannot be undone.
            </p>

            <div className="mb-6">
              <div className="text-4xl font-mono font-bold text-red-500">{countdown}</div>
              <p className="text-xs text-slate-400 mt-1">seconds until deletion</p>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3"
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
