'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft, ShoppingCart, HelpCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
    return (
        <section className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
                {/* Cancel Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Checkout Cancelled
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Your payment was not completed. Don't worry, your cart items are still saved.
                    </p>
                </div>

                {/* Info Card */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-muted rounded-lg shrink-0">
                                    <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Your cart is still available</h3>
                                    <p className="text-sm text-muted-foreground">
                                        All your items are saved and ready when you want to complete your purchase.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-muted rounded-lg shrink-0">
                                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Need help?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        If you experienced any issues during checkout, please contact our support team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/cart">
                        <Button className="w-full sm:w-auto gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Return to Cart
                        </Button>
                    </Link>
                    <Link href="/products">
                        <Button variant="outline" className="w-full sm:w-auto gap-2">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>

                {/* Additional Help */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    Having trouble? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
                </p>
            </div>
        </section>
    );
}
