'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserOrder {
    id: string;
    date: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    items: {
        productName: string;
        variantName: string;
        quantity: number;
        price: number;
        image: string | null;
    }[];
    shipping: number;
    total: number;
    shippingAddress: {
        address: string;
        city: string;
        state: string;
        zipCode: string;
    };
}

export interface UserData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    createdAt: string;
    orders: UserOrder[];
}

interface UserContextType {
    user: UserData | null;
    isLoading: boolean;
    login: (email: string, firstName: string, lastName: string, phone: string) => void;
    logout: () => void;
    updateProfile: (data: Partial<UserData>) => void;
    addOrder: (order: UserOrder) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'delicias-user';

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Error loading user:', e);
            }
        }
        setIsLoading(false);
    }, []);

    // Save user to localStorage when data changes
    useEffect(() => {
        if (!isLoading && user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        }
    }, [user, isLoading]);

    const login = (email: string, firstName: string, lastName: string, phone: string) => {
        // Check if user already exists with this email
        const savedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
            const existingUser = JSON.parse(savedUser);
            if (existingUser.email === email) {
                // Update existing user info
                setUser({
                    ...existingUser,
                    firstName,
                    lastName,
                    phone
                });
                return;
            }
        }

        // Create new user
        const newUser: UserData = {
            id: `user-${Date.now()}`,
            email,
            firstName,
            lastName,
            phone,
            createdAt: new Date().toISOString(),
            orders: []
        };
        setUser(newUser);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
    };

    const updateProfile = (data: Partial<UserData>) => {
        if (user) {
            setUser({ ...user, ...data });
        }
    };

    const addOrder = (order: UserOrder) => {
        if (user) {
            setUser({
                ...user,
                orders: [order, ...user.orders]
            });
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
                updateProfile,
                addOrder,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
