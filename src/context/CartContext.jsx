// src/context/CartContext.jsx
import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';

const CartContext = createContext();
const STORAGE_KEY = 'raijam_cart';

/* ── load persisted cart from localStorage ── */
const loadCart = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { items: [] };
  } catch {
    return { items: [] };
  }
};

/* ── save cart to localStorage ── */
const saveCart = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — fail silently
  }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [cartOpen, setCartOpen] = useState(false);

  /* ── sync to localStorage whenever cart changes ── */
  useEffect(() => {
    saveCart(state);
  }, [state]);

  const addToCart      = (product)        => dispatch({ type: 'ADD_TO_CART',     payload: product });
  const removeFromCart = (id)             => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  const updateQuantity = (id, quantity)   => dispatch({ type: 'UPDATE_QUANTITY',  payload: { id, quantity } });
  const clearCart      = ()              => dispatch({ type: 'CLEAR_CART' });

  // Works with both `price` (local data) and `product_price` (API data)
  const getCartTotal      = () => state.items.reduce((t, i) => t + ((i.price ?? i.product_price ?? 0) * i.quantity), 0);
  const getCartItemsCount = () => state.items.reduce((t, i) => t + i.quantity, 0);
  const isInCart          = (id) => state.items.some(i => i.id === id);

  return (
    <CartContext.Provider value={{
      cart: state,
      cartOpen,
      setCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};