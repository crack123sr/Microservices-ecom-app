'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import AddToCartButton from "@/_components/AddToCartButton";
import { Button } from "@/components/ui/button";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
}

export default function ProductPage() {
    const params = useParams();
    const id = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:3002/products/all-products/${id}`, {
                    cache: 'no-store',
                });

                if (!res.ok) {
                    if (res.status === 404) {
                        setError(true);
                        return;
                    }
                    throw new Error('Failed to fetch product');
                }

                const data = await res.json();
                setProduct(data);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    if (loading) {
        return (
            <section className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Loading skeleton for image */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted animate-pulse"></div>

                    {/* Loading skeleton for details */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="h-10 bg-muted rounded w-3/4 animate-pulse"></div>
                            <div className="h-8 bg-muted rounded w-1/4 mt-4 animate-pulse"></div>
                        </div>
                        <div className="h-24 bg-muted rounded animate-pulse"></div>
                        <div className="flex gap-4 mt-6">
                            <div className="h-12 bg-muted rounded w-32 animate-pulse"></div>
                            <div className="h-12 bg-muted rounded w-32 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !product) {
        notFound();
    }

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Product Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                    <Image
                        src={product.image || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Product Details */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
                        <p className="text-3xl font-bold text-primary mt-4">${product.price}</p>
                    </div>

                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <AddToCartButton
                            product={product}
                            size="lg"
                            className="text-base px-8"
                            fullWidth={false}
                        />
                        <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                            Buy Now
                        </Button>
                    </div>

                    <div className="border-t pt-6 mt-6">
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                                <span className="font-medium text-foreground">Category:</span> Premium
                            </div>
                            <div>
                                <span className="font-medium text-foreground">Availability:</span> In Stock
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}