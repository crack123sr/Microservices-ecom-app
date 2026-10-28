"use client";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
}

interface AddToCartButtonProps {
    product: Product;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showIcon?: boolean;
    fullWidth?: boolean;
}

export default function AddToCartButton({ product, variant = 'default',
    size = 'default',
    className = '',
    showIcon = true,
    fullWidth = true }: AddToCartButtonProps) {

    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const addToCart = useCartStore((state) => state.addToCart);


    const handleAddToCart = async (e: React.MouseEvent) => {

        e.preventDefault();
        e.stopPropagation()

        if (isAdding || isAdded) return;

        setIsAdding(true);


        try {
            await addToCart({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image
            })

            setIsAdded(true);


            // Reset after 2 seconds
            setTimeout(() => {
                setIsAdded(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setIsAdding(false);
        }



    }


    return (
        <Button
            variant={isAdded ? 'secondary' : variant}
            size={size}
            className={`${fullWidth ? 'w-full' : ''} ${className} transition-all duration-200`}
            onClick={handleAddToCart}
            disabled={isAdding}
        >
            {isAdding ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                </>
            ) : isAdded ? (
                <>
                    <Check className="h-4 w-4 mr-2" />
                    Added!
                </>
            ) : (
                <>
                    {showIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
                    Add to Cart
                </>
            )}
        </Button>
    )




}