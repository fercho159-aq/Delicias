'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface UserOrder {
    id: string;
    date: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus?: string;
    paymentMethod?: string;
    items: {
        productName: string;
        variantName: string;
        quantity: number;
        price: number;
        image: string | null;
    }[];
    shipping: number;
    discount?: number;
    total: number;
    shippingAddress: {
        address: string;
        city: string;
        state: string;
        zipCode: string;
    } | null;
}

export interface UserData {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    hasPassword: boolean;
    createdAt: string;
    orders: UserOrder[];
    isGuest?: boolean;
}

interface UserContextType {
    user: UserData | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setGuestUser: (email: string, firstName: string, lastName: string, phone: string) => void;
    updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'delicias-guest';

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const res = await fetch('/api/customer/me');
            const data = await res.json();
            if (data.user) {
                setUser({ ...data.user, isGuest: false });
                // Clear guest data if we have a real session
                localStorage.removeItem(GUEST_STORAGE_KEY);
            } else {
                // No server session — check for guest data in localStorage
                const guest = localStorage.getItem(GUEST_STORAGE_KEY);
                if (guest) {
                    try {
                        setUser({ ...JSON.parse(guest), isGuest: true });
                    } catch {
                        localStorage.removeItem(GUEST_STORAGE_KEY);
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            }
        } catch {
            // On network error, fall back to guest
            const guest = localStorage.getItem(GUEST_STORAGE_KEY);
            if (guest) {
                try {
                    setUser({ ...JSON.parse(guest), isGuest: true });
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        }
    }, []);

    // Load user on mount
    useEffect(() => {
        refreshUser().finally(() => setIsLoading(false));
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/customer/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                return { success: false, error: data.error || 'Error al iniciar sesión.' };
            }
            await refreshUser();
            return { success: true };
        } catch {
            return { success: false, error: 'Error de conexión.' };
        }
    };

    const register = async (regData: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
        try {
            const res = await fetch('/api/customer/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regData),
            });
            const data = await res.json();
            if (!res.ok) {
                return { success: false, error: data.error || 'Error al registrar.' };
            }
            await refreshUser();
            return { success: true };
        } catch {
            return { success: false, error: 'Error de conexión.' };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/customer/logout', { method: 'POST' });
        } catch {
            // ignore
        }
        localStorage.removeItem(GUEST_STORAGE_KEY);
        setUser(null);
    };

    const setGuestUser = (email: string, firstName: string, lastName: string, phone: string) => {
        const guestData: UserData = {
            id: 0,
            email,
            firstName,
            lastName,
            phone,
            hasPassword: false,
            createdAt: new Date().toISOString(),
            orders: [],
            isGuest: true,
        };
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
        setUser(guestData);
    };

    const updateProfile = async (data: { firstName?: string; lastName?: string; phone?: string; password?: string }) => {
        try {
            const res = await fetch('/api/customer/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!res.ok) {
                return { success: false, error: result.error || 'Error al actualizar.' };
            }
            await refreshUser();
            return { success: true };
        } catch {
            return { success: false, error: 'Error de conexión.' };
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
                setGuestUser,
                updateProfile,
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
