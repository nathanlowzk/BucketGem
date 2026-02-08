import { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { Button } from './Button';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  user: User;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onUserUpdate: (user: User) => void;
}

export function Profile({ user, onSignOut, onDeleteAccount, onUserUpdate }: ProfileProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fullName = user.user_metadata?.full_name || 'Traveler';
  const email = user.email || '';
  const isSubscribed = user.user_metadata?.subscribed_to_newsletter || false;

  // Email editing
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  // Newsletter toggle
  const [togglingNewsletter, setTogglingNewsletter] = useState(false);

  useEffect(() => {
    if (countdownStarted && countdown > 0) {
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
  }, [countdownStarted, countdown, onDeleteAccount]);

  const handleCancelDelete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowDeleteConfirm(false);
    setCountdownStarted(false);
    setCountdown(10);
  };

  const handleEmailSave = async () => {
    if (newEmail === email) {
      setEditingEmail(false);
      return;
    }

    setEmailStatus('saving');
    setEmailError('');

    try {
      const { data, error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      if (data.user) onUserUpdate(data.user);
      setEmailStatus('success');
      setEditingEmail(false);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to update email');
      setEmailStatus('error');
    }
  };

  const handleNewsletterToggle = async () => {
    setTogglingNewsletter(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { subscribed_to_newsletter: !isSubscribed },
      });
      if (error) throw error;
      if (data.user) onUserUpdate(data.user);
    } catch (err) {
      console.error('Failed to update newsletter preference:', err);
    } finally {
      setTogglingNewsletter(false);
    }
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
      </div>

      <div className="space-y-6">
        {/* Email */}
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</span>
            {!editingEmail && (
              <button
                onClick={() => { setEditingEmail(true); setNewEmail(email); setEmailStatus('idle'); setEmailError(''); }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>
          {editingEmail ? (
            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500"
                autoFocus
              />
              {emailError && <p className="text-xs text-red-500">{emailError}</p>}
              {emailStatus === 'success' && <p className="text-xs text-emerald-500">Confirmation email sent to your new address.</p>}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="text-sm py-1.5 px-4"
                  onClick={handleEmailSave}
                  disabled={emailStatus === 'saving'}
                >
                  {emailStatus === 'saving' ? 'Saving...' : 'Save'}
                </Button>
                <button
                  onClick={() => { setEditingEmail(false); setEmailStatus('idle'); setEmailError(''); }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-700">{email}</p>
          )}
        </div>

        {/* Newsletter */}
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Newsletter</span>
              <p className="text-sm text-slate-600">
                {isSubscribed ? 'You are subscribed to weekly travel inspiration.' : 'Get weekly travel destinations in your inbox.'}
              </p>
            </div>
            <button
              onClick={handleNewsletterToggle}
              disabled={togglingNewsletter}
              className={`relative w-12 h-7 rounded-full transition-colors ${isSubscribed ? 'bg-emerald-500' : 'bg-slate-300'} ${togglingNewsletter ? 'opacity-50' : ''}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isSubscribed ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-3"
          onClick={onSignOut}
        >
          <Lucide.LogOut className="w-4 h-4" />
          Sign Out
        </Button>

        {/* Delete Account */}
        <div className="pt-2 border-t border-slate-100 text-center">
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

            {countdownStarted ? (
              <>
                <div className="mb-6">
                  <div className="text-4xl font-mono font-bold text-red-500">{countdown}</div>
                  <p className="text-xs text-slate-400 mt-1">seconds until deletion</p>

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
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full py-3 justify-center"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </Button>
                <button
                  onClick={() => setCountdownStarted(true)}
                  className="w-full py-3 px-6 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
