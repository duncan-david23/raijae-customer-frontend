import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Camera, X } from 'lucide-react';
import { avatarUrl } from '../data/avatarUrl';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

const dummyProfile = {
  name: 'James Harrison',
  email: 'james.harrison@example.com',
  phone: '+1 (555) 123-4567',
  avatar: avatarUrl[0].url,
  memberSince: 'January 2024',
  totalSpent: 2847.50
};

const ProfileSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(dummyProfile);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [profile, setProfile] = useState(dummyProfile);

  const handleAvatarSelect = async (selectedAvatar) => {
    // Close modal immediately
    setShowAvatarModal(false);
    
    // Update UI immediately
    setProfile(prev => ({ ...prev, avatar: selectedAvatar.url }));
    setFormData(prev => ({ ...prev, avatar: selectedAvatar.url }));
    
    // Update in background
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const token = session.access_token;
      
      await axios.put('http://172.20.10.3:5000/api/users/account-profile', 
        {
          profile_image: selectedAvatar.url
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // In real app, save to backend
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="mb-6">
        <h2 className="text-2xl font-light tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Profile Information</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your personal details</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
          <div className="relative">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => setShowAvatarModal(true)}
            />
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-0 right-0 bg-black rounded-full p-1.5 border-2 border-white"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{profile.name}</h3>
            <p className="text-sm text-gray-500">Member since {profile.memberSince}</p>
            <p className="text-sm text-gray-500 mt-1">Total spent: ${profile.totalSpent.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${!isEditing ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${!isEditing ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${!isEditing ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm">
                Save Changes
              </button>
              <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowAvatarModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Choose Avatar</h3>
                <button onClick={() => setShowAvatarModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-3 gap-4">
                  {avatarUrl.map((avatar, index) => (
                    <div
                      key={index}
                      onClick={() => handleAvatarSelect(avatar)}
                      className={`cursor-pointer rounded-lg p-2 transition-all hover:bg-gray-50 ${
                        profile.avatar === avatar.url ? 'ring-2 ring-black bg-gray-50' : ''
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={`Avatar ${index + 1}`}
                        className="w-full aspect-square rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileSection;