'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: number;
    variantId: number;
    productId: number;
    productName: string;
    productSlug: string;
    variantName: string;
    price: number;
    quantity: number;
    image: string | null;
    maxStock: number;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    isOpen: boolean;
    isLoading: boolean;
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (variantId: number) => void;
    updateQuantity: (variantId: number, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'delicias-cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error loading cart:', e);
            }
        }
        setIsLoading(false);
    }, []);

    // Save cart to localStorage when items change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isLoading]);

    const addItem = (newItem: Omit<CartItem, 'id'>) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.variantId === newItem.variantId);

            if (existingItem) {
                // Update quantity if item already exists
                return currentItems.map(item =>
                    item.variantId === newItem.variantId
                        ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.maxStock) }
                        : item
                );
            }

            // Add new item
            return [...currentItems, { ...newItem, id: Date.now() }];
        });

        setIsOpen(true); // Open cart drawer when adding item
    };

    const removeItem = (variantId: number) => {
        setItems(currentItems => currentItems.filter(item => item.variantId !== variantId));
    };

    const updateQuantity = (variantId: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(variantId);
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.variantId === variantId
                    ? { ...item, quantity: Math.min(quantity, item.maxStock) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const toggleCart = () => setIsOpen(!isOpen);

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                isOpen,
                isLoading,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                openCart,
                closeCart,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
