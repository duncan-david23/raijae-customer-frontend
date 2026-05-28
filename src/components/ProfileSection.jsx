import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Camera, X, User, Mail, Phone, Calendar, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { avatarUrl } from "../data/avatarUrl";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";

const ProfileSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Format date for member since
  const formatMemberSince = (dateString) => {
    if (!dateString) return "January 2024";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // =========================
  // FETCH PROFILE DATA
  // =========================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await axios.get(
          "http://172.20.10.3:5000/api/users/get-profile",
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (data && data.success) {
          const profileData = {
            name: data.full_name || "User",
            email: data.email || "",
            phone: data.phone_number || "",
            avatar: data.profile_image || avatarUrl[0].url,
            role: data.role || "customer",
            created_at: data.created_at,
            memberSince: formatMemberSince(data.created_at),
            totalSpent: data.total_spent || 0
          };
          setProfile(profileData);
          setFormData(profileData);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // =========================
  // AVATAR UPDATE
  // =========================
  const handleAvatarSelect = async (selectedAvatar) => {
    setShowAvatarModal(false);

    // Update UI immediately
    setProfile((prev) => ({ ...prev, avatar: selectedAvatar.url }));
    setFormData((prev) => ({ ...prev, avatar: selectedAvatar.url }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await axios.put(
        "http://172.20.10.3:5000/api/users/profile/update-profile",
        {
          profile_image: selectedAvatar.url,
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
      }
    } catch (err) {
      console.error("Avatar update failed:", err);
      setMessage({ type: 'error', text: 'Failed to update avatar' });
      // Revert UI on error
      setProfile((prev) => ({ ...prev, avatar: profile.avatar }));
      setFormData((prev) => ({ ...prev, avatar: profile.avatar }));
    }
  };

  // =========================
  // UPDATE NAME AND PHONE
  // =========================
  const handleUpdateProfile = async () => {
    // Validate phone number if provided
    if (formData.phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const payload = {};
      if (formData.name !== profile.name) payload.full_name = formData.name.trim();
      if (formData.phone !== profile.phone) payload.phone_number = formData.phone.trim();

      // Only make API call if there are changes
      if (Object.keys(payload).length === 0) {
        setMessage({ type: 'info', text: 'No changes to save' });
        setIsEditing(false);
        setLoading(false);
        return;
      }

      const response = await axios.put(
        "http://172.20.10.3:5000/api/users/profile/update-profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setProfile(formData);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
      // Revert form data on error
      setFormData(profile);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profile);
    setMessage({ type: '', text: '' });
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load profile data</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h2 className="text-2xl font-light tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
          Profile Information
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your personal details
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-600' : 
            message.type === 'error' ? 'bg-red-50 text-red-600' :
            'bg-blue-50 text-blue-600'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* =========================
            PROFILE HEADER
        ========================= */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-6 border-b border-gray-100">
          <div className="relative group">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 cursor-pointer transition-opacity group-hover:opacity-90"
              onClick={() => setShowAvatarModal(true)}
            />
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-0 right-0 bg-black rounded-full p-2 border-2 border-white transition-transform hover:scale-110"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h3 className="font-semibold text-gray-900 text-xl">{profile.name}</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                <User className="w-3 h-3" />
                {profile.role}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                <Calendar className="w-3 h-3" />
                Joined {profile.memberSince}
              </span>
            
            </div>
          </div>
        </div>

        {/* =========================
            FORM FIELDS
        ========================= */}
        <div className="space-y-6">
          {/* Name Field */}
          <div className="group">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={formData.name}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all focus:outline-none focus:ring-1 ${
                  !isEditing 
                    ? 'border-gray-100 bg-gray-50 text-gray-500' 
                    : 'border-gray-200 focus:ring-black bg-white'
                }`}
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="group">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={formData.email}
                disabled={true}
                className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                placeholder="Your email address"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-1">Email cannot be changed</p>
          </div>

          {/* Phone Field */}
          <div className="group">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={formData.phone}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all focus:outline-none focus:ring-1 ${
                  !isEditing 
                    ? 'border-gray-100 bg-gray-50 text-gray-500' 
                    : 'border-gray-200 focus:ring-black bg-white'
                }`}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>

        {/* =========================
            ACTION BUTTONS
        ========================= */}
        <div className="mt-8 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* =========================
          AVATAR MODAL
      ========================= */}
      <AnimatePresence>
        {showAvatarModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowAvatarModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Choose Avatar</h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-4 text-center">Select an avatar for your profile</p>
                <div className="grid grid-cols-4 gap-4">
                  {avatarUrl.map((avatar, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAvatarSelect(avatar)}
                      className={`cursor-pointer rounded-full p-1 transition-all ${
                        profile.avatar === avatar.url 
                          ? 'ring-2 ring-black ring-offset-2' 
                          : 'hover:ring-1 hover:ring-gray-300'
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={`Avatar ${index + 1}`}
                        className="w-full aspect-square rounded-full object-cover"
                      />
                    </motion.div>
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