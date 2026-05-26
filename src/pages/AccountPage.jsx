import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Package, LogOut, ChevronRight, ShoppingBag, Heart, Settings, HelpCircle, Award, ShoppingCartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrdersSection from '../components/OrdersSection';
import ProfileSection from '../components/ProfileSection';
import AddressesSection from '../components/AddressesSection';
// import WishlistSection from '../components/WishlistSection';
// import SettingsSection from './components/SettingsSection';
import HelpSection from '../components/HelpSection';
import raijamLogo from '../assets/raijam_logo.png';
import { supabase } from '../lib/supabaseClient';
import { avatarUrl } from '../data/avatarUrl';

// Dummy Data
const dummyProfile = {
  name: 'James Harrison',
  email: 'james.harrison@example.com',
  phone: '+1 (555) 123-4567',
  avatar: avatarUrl[0].url,
  memberSince: 'January 2024',
  totalSpent: 2847.50
};

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/login');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('business_name');
      localStorage.removeItem('userCart');
    }
  };

  const sidebarItems = [
    { id: 'orders', icon: <Package className="w-5 h-5" />, label: 'Orders' },
    { id: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
    { id: 'addresses', icon: <MapPin className="w-5 h-5" />, label: 'Addresses' },
    { id: 'help', icon: <HelpCircle className="w-5 h-5" />, label: 'Help' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/products')}>
              <img src={raijamLogo} alt="Raijam Logo" className="w-7 h-7 object-contain" />
              <h1 onClick={() => navigate('/products')} className="text-xl font-bold tracking-wide cursor-pointer" style={{ fontFamily: "'Playfair Display', serif" }}>
                RAIJAM
              </h1>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/products')} className="p-[9px] bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium">
                <ShoppingCartIcon className="w-4 h-4" />
              </button>
              <button onClick={handleSignOut} className="flex items-center gap-2 px-2 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
               Sign Out
               
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <div className="text-center mb-6 pb-6 border-b border-gray-100">
                <img src={dummyProfile.avatar} alt={dummyProfile.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-gray-200" />
                <h3 className="font-semibold text-gray-900">{dummyProfile.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Member since {dummyProfile.memberSince}</p>
                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                  <Award className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-600">${dummyProfile.totalSpent.toLocaleString()} spent</span>
                </div>
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between p-3 rounded-md transition-all text-left ${activeTab === item.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && <OrdersSection />}
              {activeTab === 'profile' && <ProfileSection />}
              {activeTab === 'addresses' && <AddressesSection />}
              {activeTab === 'wishlist' && <WishlistSection />}
              {activeTab === 'settings' && <SettingsSection />}
              {activeTab === 'help' && <HelpSection />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;