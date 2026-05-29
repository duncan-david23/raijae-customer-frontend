import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ChevronRight, MapPin, CreditCard, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = 'https://raijae-backend.onrender.com/api/users';

const OrdersSection = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600';
      case 'shipped': return 'bg-blue-50 text-blue-600';
      case 'processing': return 'bg-amber-50 text-amber-600';
      case 'pending': return 'bg-gray-100 text-gray-600';
      case 'cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'shipped': return <Truck className="w-3.5 h-3.5" />;
      case 'processing': return <Clock className="w-3.5 h-3.5" />;
      case 'pending': return <Package className="w-3.5 h-3.5" />;
      case 'cancelled': return <Package className="w-3.5 h-3.5" />;
      default: return <Package className="w-3.5 h-3.5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return `GHC ${amount?.toFixed(2) || '0.00'}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await axios.get(
          `${API_BASE_URL}/get-user-orders`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            }
          }
        );
        
        console.log("Fetched orders:", response.data);

        if (response.data.orders && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
        <p className="text-sm text-gray-500">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-light tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
          My Orders
        </h2>
        <p className="text-gray-400 text-sm mt-1">Track and manage your purchases</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              {/* Order Header */}
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Left side - Order Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-gray-400">Order ID</p>
                      <p className="text-sm font-semibold text-gray-900">{order.order_id}</p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-gray-100" />
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Date
                      </p>
                      <p className="text-sm font-medium text-gray-700">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Right side - Status & Total */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(order.order_total)}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status || 'pending'}</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Order Summary (always visible) */}
              <div className="px-5 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Package className="w-3 h-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="capitalize">{order.payment_method?.replace('_', ' ') || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100 bg-gray-50/50"
                >
                  <div className="p-5 space-y-5">
                    {/* Customer Information */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer Details</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-400 mb-1">Full Name</p>
                          <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-400 mb-1">Email</p>
                          <p className="text-sm font-medium text-gray-900">{order.customer_email}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-400 mb-1">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{order.customer_phone}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Delivery Address
                          </p>
                          <p className="text-sm font-medium text-gray-900 whitespace-pre-line">{order.customer_address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="flex gap-4">
                              <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                    {item.color && (
                                      <p className="text-xs text-gray-400 mt-1">Color: {item.color}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-50">
                                  <p className="text-xs text-gray-500 flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Subtotal</span>
                        <span className="text-sm text-gray-900">{formatCurrency(order.order_total)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Shipping</span>
                        <span className="text-sm text-gray-500">Free</span>
                      </div>
                      <div className="pt-3 mt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-gray-900">{formatCurrency(order.order_total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default OrdersSection;