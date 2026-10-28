'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCartStore } from '@/store/cart-store';

interface CartProviderProps {
    children: React.ReactNode;
}

export default function CartProvider({ children }: CartProviderProps) {
    const { user, isSignedIn, isLoaded } = useUser();
    const { setUserId, fetchCart, userId: currentUserId } = useCartStore();

    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn && user?.id) {
            // User is signed in - use their Clerk ID
            if (currentUserId !== user.id) {
                setUserId(user.id);
                fetchCart(user.id);
            }
        } else {
            // User is not signed in - use 'guest' 
            // Note: Guest carts are temporary and won't persist across sessions
            if (currentUserId !== 'guest') {
                setUserId('guest');
            }
        }
    }, [isLoaded, isSignedIn, user?.id, currentUserId, setUserId, fetchCart]);

    return <>{children}</>;
}
