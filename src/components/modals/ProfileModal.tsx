'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, User, Camera, Bookmark, Calendar, Check, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeProfileModal, showToast } from '@/store/slices/uiSlice';
import { updateProfile } from '@/store/slices/authSlice';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export function ProfileModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.profileModalOpen);
  const user = useAppSelector((state) => state.auth.user);
  const favoritesCount = useAppSelector((state) => state.favorites.items.length);
  const selectedCategories = useAppSelector(
    (state) => state.preferences.selectedCategories
  );

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      updateProfile({
        name: name.trim() || user.name,
        username: username.trim() || user.username,
        bio: bio.trim(),
        avatarUrl,
      })
    );
    dispatch(showToast('Profile updated successfully!'));
    dispatch(closeProfileModal());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(closeProfileModal())}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            <h2 id="profile-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              User Profile
            </h2>
          </div>
          <button
            onClick={() => dispatch(closeProfileModal())}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close profile modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 py-4">
          {/* Avatar & Presets */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-indigo-500/30">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-white font-bold text-xl">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`relative h-8 w-8 overflow-hidden rounded-full ring-2 transition-all ${
                    avatarUrl === preset ? 'ring-indigo-500 scale-110' : 'ring-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={preset} alt="preset" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
            <div>
              <span className="block text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {favoritesCount}
              </span>
              <span className="text-[10px] text-slate-400">Favorites</span>
            </div>
            <div>
              <span className="block text-sm font-bold text-purple-600 dark:text-purple-400">
                {selectedCategories.length}
              </span>
              <span className="text-[10px] text-slate-400">Categories</span>
            </div>
            <div>
              <span className="block text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Pro
              </span>
              <span className="text-[10px] text-slate-400">Tier</span>
            </div>
          </div>

          {/* Name & Username Inputs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Joined date info */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Member since {user.joinedDate}</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => dispatch(closeProfileModal())}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
