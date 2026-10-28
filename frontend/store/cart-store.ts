import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}


interface CartState {
    items: CartItem[];
    itemCount: number;
    total: number;
    isLoading: boolean;
    userId: string | null;


    // Actions
    setUserId: (userId: string | null) => void;
    fetchCart: (userId: string) => Promise<void>;
    addToCart: (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;

    // Local-only actions (for instant UI updates)



}


const CART_API_URL = 'http://localhost:3003/cart';

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            itemCount: 0,
            total: 0,
            isLoading: false,
            userId: null,

            setUserId: (userId) => set({ userId }),
            fetchCart: async (userId: string) => {
                set({ isLoading: true });
                try {
                    const response = await fetch(`${CART_API_URL}/${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        set({
                            items: data.items || [],
                            itemCount: data.itemCount || 0,
                            total: data.total || 0,
                            userId
                        });
                    }
                } catch (error) {
                    console.error('Error fetching cart:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            addToCart: async (product) => {
                const { userId, items } = get();
                const currentUserId = userId || 'guest';

                // Optimistic update - update UI immediately
                const existingItemIndex = items.findIndex(item => item.productId === product.productId);
                let newItems: CartItem[];

                if (existingItemIndex > -1) {
                    newItems = items.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                            : item
                    );
                } else {
                    newItems = [...items, { ...product, quantity: product.quantity || 1 }];
                }

                const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
                const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                set({
                    items: newItems,
                    itemCount: newItemCount,
                    total: Math.round(newTotal * 100) / 100
                });

                // Sync with backend
                try {
                    await fetch(`${CART_API_URL}/${currentUserId}/add`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            productId: product.productId,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            quantity: product.quantity || 1
                        })
                    });
                } catch (error) {
                    console.error('Error adding to cart:', error);
                }
            },


            removeFromCart: async (productId: string) => {
                const { userId, items } = get();
                const currentUserId = userId || 'guest';

                // Optimistic update
                const newItems = items.filter(item => item.productId !== productId);
                const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
                const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                set({
                    items: newItems,
                    itemCount: newItemCount,
                    total: Math.round(newTotal * 100) / 100
                });

                // Sync with backend
                try {
                    await fetch(`${CART_API_URL}/${currentUserId}/remove/${productId}`, {
                        method: 'DELETE'
                    });
                } catch (error) {
                    console.error('Error removing from cart:', error);
                }
            },

            updateQuantity: async (productId: string, quantity: number) => {
                const { userId, items } = get();
                const currentUserId = userId || 'guest';

                if (quantity <= 0) {
                    return get().removeFromCart(productId);
                }

                // Optimistic update
                const newItems = items.map(item =>
                    item.productId === productId
                        ? { ...item, quantity }
                        : item
                );
                const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
                const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                set({
                    items: newItems,
                    itemCount: newItemCount,
                    total: Math.round(newTotal * 100) / 100
                });

                // Sync with backend
                try {
                    await fetch(`${CART_API_URL}/${currentUserId}/update`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId, quantity })
                    });
                } catch (error) {
                    console.error('Error updating cart:', error);
                }
            },

            clearCart: async () => {
                const { userId } = get();
                const currentUserId = userId || 'guest';

                // Optimistic update
                set({ items: [], itemCount: 0, total: 0 });

                // Sync with backend
                try {
                    await fetch(`${CART_API_URL}/${currentUserId}/clear`, {
                        method: 'DELETE'
                    });
                } catch (error) {
                    console.error('Error clearing cart:', error);
                }
            }






        }),

        {
            name: 'cart-storage',
            partialize: (state) => ({
                items: state.items,
                itemCount: state.itemCount,
                total: state.total,
                userId: state.userId
            })
        }


    )
)
