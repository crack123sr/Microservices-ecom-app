'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ShoppingCart, Loader2, CreditCard } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function CartPage() {
    const { items, itemCount, total, isLoading, updateQuantity, removeFromCart } = useCartStore();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const { user, isSignedIn } = useUser();



    const handleCheckout = async () => {
        if (isCheckingOut) return;

        setIsCheckingOut(true);

        try {
            const response = await fetch("http://localhost:3006/checkout/create-session", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: items.map(item => ({
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity
                    })),
                    customerEmail: user?.primaryEmailAddress?.emailAddress || 'guest@example.com',
                    userId: user?.id || 'guest'
                }),
            })
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No checkout URL returned');
                alert('Failed to start checkout. Please try again.');
            }

        } catch (error) {

            console.error('Checkout error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    }

    // Empty cart state
    if (!isLoading && items.length === 0) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mb-8 relative">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-16 h-16 text-primary/60" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Your cart is empty</h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
                    </p>
                    <Link href="/products">
                        <Button size="lg" className="gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Browse Products
                        </Button>
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-4 py-8 md:py-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Shopping Cart</h1>
                    <p className="text-muted-foreground mt-1">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>
                <Link href="/products">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Continue Shopping
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        // Loading skeleton
                        [...Array(3)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-lg"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-5 bg-muted rounded w-3/4"></div>
                                            <div className="h-4 bg-muted rounded w-1/4"></div>
                                            <div className="h-8 bg-muted rounded w-32"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        items.map((item) => (
                            <Card key={item.productId} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex gap-4 md:gap-6">
                                        {/* Product Image */}
                                        <Link href={`/products/${item.productId}`} className="shrink-0">
                                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted border">
                                                <Image
                                                    src={item.image || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400"}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        </Link>

                                        {/* Product Details */}
                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            <div>
                                                <Link href={`/products/${item.productId}`}>
                                                    <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-xl font-bold text-primary mt-1">
                                                    ${item.price.toFixed(2)}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between mt-4 gap-4">
                                                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-md hover:bg-background"
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-10 text-center font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-md hover:bg-background"
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <p className="font-semibold text-lg hidden sm:block">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeFromCart(item.productId)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4 bg-gradient-to-br from-card to-muted/20 border-2">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Tax</span>
                                    <span>${(total * 0.1).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">${(total * 1.1).toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 pt-2">
                            <Button
                                className="w-full gap-2"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                            >
                                {isCheckingOut ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-4 w-4" />
                                        Proceed to Checkout
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                Secure checkout powered by Stripe
                            </p>
                        </CardFooter>
                    </Card>

                    {/* Security badges */}
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Money Back Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
