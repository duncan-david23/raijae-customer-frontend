// src/context/ProductsContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import axios from "axios";

// Only categories stay static
// export const categories = [
//   { id: "all", name: "All Products" },
//   { id: "tshirt", name: "T-Shirts" },
//   { id: "hoodies", name: "Hoodies" },
//   { id: "sneakers", name: "Sneakers" },
//   { id: "camo-jeans", name: "Camo Jeans" },
//   { id: "jersey", name: "Jersey" },
// ];

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://mwsie-backend.onrender.com/api/ecommerce/products"
        );
        setItems(response.data.products || []);
        
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // -------------------------------
  // Helper Functions
  // -------------------------------
  const getProductById = (id) =>
    items.find((product) => product.id === (id));

  const getFeaturedProducts = () => items.slice(0, 4);

  const getProductsByCategory = (catId) => {
    if (catId === "all") return items;

    return items.filter(
      (product) => product.product_categories && product.product_categories.includes(catId)
    );
  };

  const getRelatedProducts = (productId, limit = 4) => {
    const product = getProductById(productId);
    if (!product) return [];

    return items
      .filter(
        (p) =>
          p.id !== productId &&
          p.category?.some((c) => product.product_categories.includes(c))
      )
      .slice(0, limit);
  };

  // -------------------------------
  // Filtering + Sorting Logic
  // -------------------------------
  const filteredProducts = useMemo(() => {
    let filtered = getProductsByCategory(selectedCategory);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        (product.product_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.product_price - b.product_price);
      case "price-high":
        return sorted.sort((a, b) => b.product_price - a.product_price);
      case "name":
        return sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
      default:
        return sorted;
    }
  }, [items, selectedCategory, sortBy, searchQuery]);

  const value = {
    items,
    categories,
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    getProductById,
    getFeaturedProducts,
    getRelatedProducts,
    getProductsByCategory,
    loading,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);
