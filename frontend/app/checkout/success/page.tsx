'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/store/cart-store';
import { CheckCircle2, Package, Mail, CreditCard, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface SessionData {
    id: string;
    customerEmail: string;
    paymentStatus: string;
    amountTotal: number;
    currency: string;
    metadata: {
        userId: string;
        items: string;
        subtotal: string;
        tax: string;
        total: string;
    };
    lineItems: Array<{
        description: string;
        quantity: number;
        amount_total: number;
    }>;
    createdAt: string;
}

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) {
                setError('No session ID provided');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3006/checkout/session/${sessionId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch session details');
                }

                const data = await response.json();
                setSessionData(data);

                // Clear the cart after successful payment
                if (data.paymentStatus === 'paid') {
                    clearCart();
                }
            } catch (err) {
                console.error('Error fetching session:', err);
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId, clearCart]);

    // Parse items from metadata
    const orderItems: OrderItem[] = sessionData?.metadata?.items
        ? JSON.parse(sessionData.metadata.items)
        : [];

    if (loading) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center">
                    <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading your order details...</p>
                </div>
            </section>
        );
    }

    if (error || !sessionData) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-destructive" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                    <p className="text-muted-foreground mb-8">{error || 'Unable to load order details'}</p>
                    <Link href="/products">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-4 py-8 md:py-16">
            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Payment Successful!
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                </div>

                {/* Order Details Card */}
                <Card className="mb-6 overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Order Confirmation</CardTitle>
                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                {sessionData.paymentStatus.toUpperCase()}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Order Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                                    <p className="font-mono text-sm font-medium truncate max-w-[200px]" title={sessionData.id}>
                                        {sessionData.id.slice(0, 20)}...
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{sessionData.customerEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Date</p>
                                    <p className="font-medium">
                                        {new Date(sessionData.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Status</p>
                                    <p className="font-medium text-green-600 dark:text-green-400">Completed</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="border-t pt-6">
                            <h3 className="font-semibold mb-4">Order Items</h3>
                            <div className="space-y-4">
                                {orderItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                                <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t mt-6 pt-6 space-y-2">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>${sessionData.metadata?.subtotal || '0.00'}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tax (10%)</span>
                                <span>${sessionData.metadata?.tax || '0.00'}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total Paid</span>
                                <span className="text-primary">
                                    ${sessionData.amountTotal.toFixed(2)} {sessionData.currency.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t p-4">
                        <p className="text-sm text-muted-foreground text-center w-full">
                            A confirmation email has been sent to <strong>{sessionData.customerEmail}</strong>
                        </p>
                    </CardFooter>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/orders">
                        <Button variant="outline" className="w-full sm:w-auto gap-2">
                            <Package className="w-4 h-4" />
                            View My Orders
                        </Button>
                    </Link>
                    <Link href="/products">
                        <Button className="w-full sm:w-auto gap-2">
                            Continue Shopping
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
