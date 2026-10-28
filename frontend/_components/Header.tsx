'use client';

import React from 'react';
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070',
        title: 'New Season Arrivals',
        subtitle: 'Check out the latest fashion trends',
        color: 'text-white',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1758186477159-99418b83a42f?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Latest Electronics',
        subtitle: 'Upgrade your tech game with our new gadgets',
        color: 'text-white',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1646987916641-1f3c8992daa2?q=80&w=1106&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Modern Home Decor',
        subtitle: 'Transform your living space today',
        color: 'text-white',
    },
];

function Header() {
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    return (
        <div className="w-full relative">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id} className="relative h-150 w-full">
                            <div className="absolute inset-0 block h-full w-full">
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover brightness-75"
                                    priority={slide.id === 1}
                                />
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${slide.color} drop-shadow-md`}>
                                    {slide.title}
                                </h1>
                                <p className={`text-lg md:text-2xl font-medium ${slide.color} drop-shadow-sm`}>
                                    {slide.subtitle}
                                </p>
                                <button className="mt-8 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-transform transform hover:scale-105 shadow-lg">
                                    Shop Now
                                </button>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10" />
            </Carousel>
        </div>
    );
}

export default Header;