import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, X, Trash2, Edit3, Check } from 'lucide-react';

const dummyAddresses = [
  { id: 1, type: 'Home', address: '123 Park Avenue, Apt 4B', city: 'New York', state: 'NY', zip: '10022', country: 'United States', isDefault: true },
  { id: 2, type: 'Office', address: '456 Madison Avenue, Floor 12', city: 'New York', state: 'NY', zip: '10022', country: 'United States', isDefault: false }
];

const AddressesSection = () => {
  const [addresses, setAddresses] = useState(dummyAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newAddress, setNewAddress] = useState({ type: 'Home', address: '', city: '', state: '', zip: '', country: '', isDefault: false });

  const handleSetDefault = (id) => {
    setAddresses(addresses.map(addr => ({ ...addr, isDefault: addr.id === id })));
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleAdd = () => {
    const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
    setAddresses([...addresses, { ...newAddress, id: newId }]);
    setShowAddForm(false);
    setNewAddress({ type: 'Home', address: '', city: '', state: '', zip: '', country: '', isDefault: false });
  };

  const handleEdit = (id) => {
    setEditingId(id);
    const addr = addresses.find(a => a.id === id);
    setNewAddress(addr);
    setShowAddForm(true);
  };

  const handleUpdate = () => {
    setAddresses(addresses.map(addr => addr.id === editingId ? { ...newAddress, id: editingId } : addr));
    setShowAddForm(false);
    setEditingId(null);
    setNewAddress({ type: 'Home', address: '', city: '', state: '', zip: '', country: '', isDefault: false });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-light tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Saved Addresses</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your shipping addresses</p>
        </div>
        <button onClick={() => { setEditingId(null); setNewAddress({ type: 'Home', address: '', city: '', state: '', zip: '', country: '', isDefault: false }); setShowAddForm(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm">
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div key={address.id} className="bg-white rounded-lg border border-gray-200 p-5 relative">
            {address.isDefault && (
              <span className="absolute top-5 right-5 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Default</span>
            )}
            <h3 className="font-medium text-gray-900 mb-3">{address.type}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {address.address}<br />
              {address.city}, {address.state} {address.zip}<br />
              {address.country}
            </p>
            <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
              {!address.isDefault && (
                <button onClick={() => handleSetDefault(address.id)} className="text-xs text-gray-500 hover:text-black transition-colors">
                  Set as Default
                </button>
              )}
              <button onClick={() => handleEdit(address.id)} className="text-xs text-gray-500 hover:text-black transition-colors">
                <Edit3 className="w-3 h-3 inline mr-1" /> Edit
              </button>
              <button onClick={() => setShowDeleteConfirm(address.id)} className="text-xs text-red-500 hover:text-red-600 transition-colors">
                <Trash2 className="w-3 h-3 inline mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Address Type (Home, Office, etc.)" value={newAddress.type} onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              <input type="text" placeholder="Street Address" value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              <input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              <input type="text" placeholder="ZIP Code" value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
              <input type="text" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={editingId ? handleUpdate : handleAdd} className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium mb-2">Delete Address?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AddressesSection;