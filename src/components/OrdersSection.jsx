import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ChevronRight } from 'lucide-react';

const dummyOrders = [
  {
    id: 'ORD-001',
    date: '2024-12-15',
    status: 'delivered',
    total: 299.00,
    items: [
      { id: 1, name: 'Cashmere Wool Scarf', quantity: 1, price: 89.00, image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=100&h=100&fit=crop' },
      { id: 2, name: 'Leather Gloves', quantity: 1, price: 120.00, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=100&h=100&fit=crop' },
      { id: 3, name: 'Wool Blend Coat', quantity: 1, price: 90.00, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=100&h=100&fit=crop' }
    ]
  },
  {
    id: 'ORD-002',
    date: '2024-12-10',
    status: 'shipped',
    total: 450.00,
    items: [
      { id: 4, name: 'Slim Fit Blazer', quantity: 1, price: 350.00, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&h=100&fit=crop' },
      { id: 5, name: 'Silk Tie', quantity: 2, price: 50.00, image: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=100&h=100&fit=crop' }
    ]
  },
  {
    id: 'ORD-003',
    date: '2024-12-05',
    status: 'processing',
    total: 189.00,
    items: [
      { id: 6, name: 'Leather Belt', quantity: 1, price: 89.00, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop' },
      { id: 7, name: 'Wool Socks Pack', quantity: 1, price: 100.00, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=100&h=100&fit=crop' }
    ]
  }
];

const OrdersSection = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-light tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>My Orders</h2>
        <p className="text-gray-500 text-sm mt-1">View and track your order history</p>
      </div>

      {dummyOrders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Order #{order.id}</p>
                <p className="text-xs text-gray-400 mt-1">{order.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </span>
                <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="text-gray-400 hover:text-gray-600">
                  <ChevronRight className={`w-5 h-5 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
              <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              {order.items.slice(0, 3).map((item, idx) => (
                <img key={idx} src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-gray-200" />
              ))}
              {order.items.length > 3 && (
                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-gray-200">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
          </div>

          {expandedOrder === order.id && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-100 bg-gray-50 p-5">
              <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                    </div>
                    <p className="font-medium text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </motion.div>
  );
};

export default OrdersSection;