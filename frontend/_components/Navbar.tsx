'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import {

    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
    useUser,
} from '@clerk/nextjs'
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isSignedIn } = useUser();

    const itemCount = useCartStore((state) => state.itemCount);


    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
        { name: 'Contact Us', href: '/contact' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                Ecommerce
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="relative group text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="hidden md:flex items-center gap-4">
                        <button className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent">
                            <Search className="h-5 w-5" />
                        </button>



                        {/* Cart Icon with Badge */}
                        <Link href="/cart" className="relative text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent">
                            <ShoppingCart className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </span>
                            )}
                        </Link>

                        {!isSignedIn && (
                            <>
                                <SignInButton mode="modal">
                                    <Button>
                                        Sign In
                                    </Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button>
                                        Sign Up
                                    </Button>
                                </SignUpButton>
                            </>
                        )}

                        {/* Show the user button when the user is signed in */}

                        {isSignedIn && (
                            <>
                                <UserButton />
                                <Link href="/orders">
                                    <Button>Orders</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-border/40 bg-background">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-4 border-t border-border/40">
                        <div className="flex items-center justify-around px-5">
                            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
                                <Search className="h-5 w-5" />
                                <span className="text-xs">Search</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary relative">
                                <div className="relative">
                                    <ShoppingCart className="h-5 w-5" />
                                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600"></span>
                                </div>
                                <span className="text-xs">Cart</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
                                <User className="h-5 w-5" />
                                <span className="text-xs">Profile</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;