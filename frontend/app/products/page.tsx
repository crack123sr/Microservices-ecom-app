'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import AddToCartButton from "@/_components/AddToCartButton";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:3002/products/all-products', {
                    cache: 'no-store',
                });
                if (!res.ok) {
                    console.error("Failed to fetch products");
                    setError(true);
                    return;
                }
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">All Products</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Discover our complete collection. High quality and premium design.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Card key={i} className="overflow-hidden animate-pulse">
                            <div className="h-64 bg-muted"></div>
                            <CardHeader>
                                <div className="h-6 bg-muted rounded w-3/4"></div>
                                <div className="h-4 bg-muted rounded w-full mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded w-1/4"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">All Products</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Discover our complete collection. High quality and premium design.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.length > 0 ? (
                    products.map((product) => (
                        <Link href={`/products/${product._id}`} key={product._id}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                                <div className="relative h-64 w-full overflow-hidden">
                                    <Image
                                        src={product.image || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080"}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-xl truncate" title={product.name}>{product.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                    <div className="flex items-center justify-between">
                                        <p className="text-2xl font-bold text-primary">${product.price}</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <AddToCartButton product={product} />
                                </CardFooter>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center text-muted-foreground p-12 bg-muted/20 rounded-lg border border-dashed">
                        <p className="text-lg">No products found.</p>
                        <p className="text-sm">Please ensure the backend service (port 3002) is running.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
