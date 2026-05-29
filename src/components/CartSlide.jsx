import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2, MapPin, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://172.20.10.3:5000/api/users';

const CartSlide = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    getCartItemsCount,
    getCartTotal,
    clearCart
  } = useCart();

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  const cartCount = getCartItemsCount();

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await axios.get(
        `${API_BASE_URL}/get-profile`,
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
          user_id: data.user_id
        };
        setProfile(profileData);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = session.access_token;
      
      const response = await axios.get(
        `${API_BASE_URL}/get-user-addresses`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      
      if (response.data.addresses && Array.isArray(response.data.addresses)) {
        const formattedAddresses = response.data.addresses.map(addr => ({
          id: addr.id,
          full_address: addr.address,
          is_default: addr.is_default
        }));
        
        setAddresses(formattedAddresses);
        
        const defaultAddr = formattedAddresses.find(addr => addr.is_default);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (formattedAddresses.length > 0) {
          setSelectedAddress(formattedAddresses[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  useEffect(() => {
    if (cartOpen) {
      const loadData = async () => {
        setUserDataLoading(true);
        await Promise.all([fetchProfile(), fetchAddresses()]);
        setUserDataLoading(false);
      };
      loadData();
    }
  }, [cartOpen]);

  // ✅ FIXED: Prepare order data with color from cart item
  const prepareOrderData = (paymentMethod) => {
    console.log('Cart items in prepareOrderData:', cart.items);
    
    const orderItems = cart.items.map(item => ({
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
      color: item.selectedColor || item.color || null,  // Get color from cart item
      image: item.images?.[0] || null
    }));

    console.log('Order items with colors:', orderItems);

    const totalAmount = getCartTotal();

    return {
      customer: {
        name: profile?.name || "",
        email: profile?.email || "",
        phone: profile?.phone || ""
      },
      delivery_address: selectedAddress ? {
        id: selectedAddress.id,
        full_address: selectedAddress.full_address
      } : null,
      items: orderItems,
      summary: {
        subtotal: totalAmount,
        shipping_fee: 0,
        total: totalAmount
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'awaiting_payment'
      },
      created_at: new Date().toISOString()
    };
  };

  // =========================
  // HANDLE CASH ON DELIVERY
  // =========================
  const handleCashOnDelivery = async () => {
    console.log('=== CASH ON DELIVERY SELECTED ===');
    
    if (userDataLoading) {
      toast.info('Please wait, loading your information...');
      return;
    }

    if (!selectedAddress) {
      toast.warning('Please select a delivery address');
      setShowAddressModal(true);
      return;
    }

    if (!profile) {
      toast.warning('Please complete your profile before placing an order');
      setCartOpen(false);
      navigate('/account');
      return;
    }

    if (cart.items.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    const orderData = prepareOrderData('cash_on_delivery');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to place order');
        navigate('/login');
        setIsPlacingOrder(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/create-order`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Order placed successfully, You will pay upon delivery. Thank you for your order');
        
        setTimeout(() => {
          setCartOpen(false);
          navigate('/products');
        }, 2000);

        clearCart();
      } else {
        toast.error(response.data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order submission failed:', error);
      toast.error(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // =========================
  // HANDLE PAYSTACK PAYMENT
  // =========================
  const handlePaystackPayment = async () => {
    console.log('=== PAYSTACK PAYMENT SELECTED ===');
    
    if (userDataLoading) {
      toast.info('Please wait, loading your information...');
      return;
    }

    if (!selectedAddress) {
      toast.warning('Please select a delivery address');
      setShowAddressModal(true);
      return;
    }

    if (!profile) {
      toast.warning('Please complete your profile before placing an order');
      setCartOpen(false);
      navigate('/account');
      return;
    }

    if (cart.items.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    const orderData = prepareOrderData('paystack');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to place order');
        navigate('/login');
        setIsPlacingOrder(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/create-order`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Order created! Redirecting to Paystack...');
        
        if (response.data.payment_url) {
          window.location.href = response.data.payment_url;
        } else {
          toast.info('Paystack integration coming soon!');
          setTimeout(() => {
            setCartOpen(false);
            navigate('/products');
          }, 2000);
        }
        clearCart();
      } else {
        toast.error(response.data.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Paystack payment failed:', error);
      toast.error(error.response?.data?.error || 'Failed to process payment. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Address Modal Component
  const AddressModal = () => (
    <AnimatePresence>
      {showAddressModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[500]"
            onClick={() => setShowAddressModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-[501] w-full max-w-md max-h-[80vh] overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Select Delivery Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No saved addresses</p>
                  <button 
                    onClick={() => {
                      setShowAddressModal(false);
                      navigate('/account');
                    }}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setShowAddressModal(false);
                        toast.success('Delivery address selected');
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAddress?.id === addr.id 
                          ? 'border-black bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className={`w-5 h-5 mt-0.5 ${selectedAddress?.id === addr.id ? 'text-black' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{addr.full_address}</p>
                          {addr.is_default && (
                            <span className="inline-block text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded mt-2">
                              Default
                            </span>
                          )}
                        </div>
                        {selectedAddress?.id === addr.id && (
                          <Check className="w-5 h-5 text-black" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!cartOpen) return null;

  return (
    <>
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              className="cp-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              className="cp"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="cp-head">
                <span className="cp-title">Your Cart {cartCount > 0 && `(${cartCount})`}</span>
                <button className="cp-close" onClick={() => setCartOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              {cart.items.length === 0 ? (
                <div className="cp-empty">
                  <ShoppingCart size={40} strokeWidth={1} color="#e4e4e4" />
                  <p className="cp-empty-txt">Your cart is empty.</p>
                </div>
              ) : (
                <>
                  <div className="cp-items">
                    {/* Delivery Address Row */}
                    <div className="address-row" onClick={() => setShowAddressModal(true)}>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">
                          {selectedAddress ? selectedAddress.full_address.substring(0, 50) + '...' : 'Select delivery address'}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-gray-400" />
                    </div>

                    {cart.items.map(item => (
                      <div key={item.id} className="cp-item">
                        <div className="cp-item-img">
                          <img src={item.images?.[0] || item.image || 'https://via.placeholder.com/60'} alt={item.name} />
                        </div>
                        <div className="cp-item-info">
                          <p className="cp-item-name">
                            {item.name}
                            {item.selectedColor && <span className="text-gray-400 text-xs ml-1">({item.selectedColor})</span>}
                            {item.color && !item.selectedColor && <span className="text-gray-400 text-xs ml-1">({item.color})</span>}
                          </p>
                          <p className="cp-item-price">GHC {((item.price ?? item.product_price) * item.quantity).toFixed(2)}</p>
                          <div className="cp-item-qty">
                            <button className="cp-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus size={10} strokeWidth={2.5} />
                            </button>
                            <span className="cp-qty-val">{item.quantity}</span>
                            <button className="cp-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus size={10} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                        <button className="cp-remove" onClick={() => removeFromCart(item.id)}>
                          <Trash2 size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="cp-foot">
                    <div className="cp-total-row">
                      <span className="cp-total-lbl">Total</span>
                      <span className="cp-total-val">GHC {getCartTotal().toFixed(2)}</span>
                    </div>
                    <p className="cp-pay-label">Pay with</p>
                    <div className="cp-pay-options">
                      <button 
                        className="cp-pay-btn cp-paystack"
                        onClick={handlePaystackPayment}
                        disabled={isPlacingOrder || userDataLoading}
                      >
                        <span className="cp-paystack-logo">Pay</span>
                        {userDataLoading ? 'Loading...' : (isPlacingOrder ? 'Processing...' : 'Pay with Paystack')}
                      </button>
                      <div className="cp-pay-divider">
                        <div className="cp-pay-divider-line" />
                        <span className="cp-pay-divider-txt">OR</span>
                        <div className="cp-pay-divider-line" />
                      </div>
                      <button 
                        className="cp-pay-btn cp-cod"
                        onClick={handleCashOnDelivery}
                        disabled={isPlacingOrder || userDataLoading}
                      >
                        🏠 {userDataLoading ? 'Loading...' : (isPlacingOrder ? 'Processing...' : 'Cash on Delivery')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AddressModal />

      <style>{`
        .cp-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 490;
        }
        .cp {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 380px; max-width: 100vw;
          background: var(--white); z-index: 491;
          display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
        }
        @media(max-width:480px){ .cp { width: 100vw; } }
        .cp-head {
          padding: 20px 24px; border-bottom: 1px solid var(--line);
          display: flex; align-items: center; justify-content: space-between;
        }
        .cp-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: var(--ink);
        }
        .cp-close {
          background: none; border: none; cursor: pointer;
          color: var(--ink2); padding: 6px; border-radius: 6px; transition: background .14s;
        }
        .cp-close:hover { background: var(--hover); }
        .cp-items { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .cp-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; padding: 40px 24px; text-align: center;
        }
        .cp-empty-txt { font-size: 13px; color: var(--soft); }
        .cp-item {
          display: flex; gap: 12px; padding: 14px 0;
          border-bottom: 1px solid var(--line);
        }
        .cp-item:last-child { border-bottom: none; }
        .cp-item-img {
          width: 60px; height: 60px; border-radius: 6px;
          background: #f8f8f8; overflow: hidden; flex-shrink: 0;
        }
        .cp-item-img img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }
        .cp-item-info { flex: 1; min-width: 0; }
        .cp-item-name {
          font-size: 12.5px; font-weight: 600; color: var(--ink);
          margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cp-item-price {
          font-family: 'Playfair Display', serif;
          font-size: 13px; font-weight: 700; color: var(--ink);
        }
        .cp-item-qty { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
        .cp-qty-btn {
          width: 22px; height: 22px; border-radius: 4px;
          background: var(--hover); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink2); transition: background .14s;
        }
        .cp-qty-btn:hover { background: var(--line); }
        .cp-qty-val { font-size: 12px; font-weight: 600; color: var(--ink); min-width: 16px; text-align: center; }
        .cp-remove {
          background: none; border: none; cursor: pointer;
          color: var(--soft); padding: 4px; transition: color .14s;
          flex-shrink: 0; align-self: flex-start; margin-top: 2px;
        }
        .cp-remove:hover { color: #c0392b; }
        .cp-foot { padding: 14px 24px 24px; border-top: 1px solid var(--line); }
        .cp-total-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px;
        }
        .cp-total-lbl { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--soft); }
        .cp-total-val {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: var(--ink);
        }
        .cp-pay-label {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--soft); margin-bottom: 8px;
        }
        .cp-pay-options { display: flex; flex-direction: column; gap: 8px; }
        .cp-pay-btn {
          width: 100%; border: none; padding: 13px 16px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; transition: opacity .18s, transform .14s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .cp-pay-btn:hover { opacity: .88; }
        .cp-pay-btn:active { transform: scale(.98); }
        .cp-paystack { background: #011B33; color: #fff; }
        .cp-paystack-logo {
          background: #00C3F7; border-radius: 4px;
          padding: 2px 6px; font-size: 10px; font-weight: 900;
          letter-spacing: 0.02em; color: #011B33;
        }
        .cp-cod { background: var(--hover); color: var(--ink); border: 1px solid var(--line); }
        .cp-pay-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 4px 0;
        }
        .cp-pay-divider-line { flex: 1; height: 1px; background: var(--line); }
        .cp-pay-divider-txt { font-size: 10px; color: #bbb; font-weight: 600; letter-spacing: 0.08em; }

        .address-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px; padding: 10px; background: var(--hover);
          border-radius: 8px; cursor: pointer;
        }
        .address-row:hover { background: var(--line); }

        :root {
          --bg:    #f5f5f5;
          --white: #ffffff;
          --ink:   #111111;
          --ink2:  #444444;
          --soft:  #777777;
          --line:  #e4e4e4;
          --hover: #f0f0f0;
        }
      `}</style>
    </>
  );
};

export default CartSlide;