"use client";

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Leaf, Sun, Cherry, Flame, Candy, Salad, Carrot, Gift, Package } from 'lucide-react';
import './CategoriesCarousel.css';

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
    'nueces': <Leaf size={18} strokeWidth={1.5} />,
    'semillas': <Sun size={18} strokeWidth={1.5} />,
    'frutos-secos': <Cherry size={18} strokeWidth={1.5} />,
    'cacahuates': <Flame size={18} strokeWidth={1.5} />,
    'dulces': <Candy size={18} strokeWidth={1.5} />,
    'mixes': <Salad size={18} strokeWidth={1.5} />,
    'verduras-deshidratadas': <Carrot size={18} strokeWidth={1.5} />,
    'cajas-de-regalo': <Gift size={18} strokeWidth={1.5} />,
    'veganos': <Leaf size={18} strokeWidth={1.5} />,
    'chocolates': <Candy size={18} strokeWidth={1.5} />,
    'canasta': <Gift size={18} strokeWidth={1.5} />,
    'paquetes': <Package size={18} strokeWidth={1.5} />,
};

interface Category {
    id: number;
    slug: string;
    name: string;
    _count: { products: number };
}

interface CategoriesCarouselProps {
    categories: Category[];
}

export default function CategoriesCarousel({ categories }: CategoriesCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.addEventListener('scroll', checkScroll);
            return () => scrollEl.removeEventListener('scroll', checkScroll);
        }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Auto-scroll effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

                // If at the end, scroll back to start
                if (scrollLeft >= scrollWidth - clientWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                }
            }
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="categories-carousel">
            <div className="container">
                <div className="carousel-wrapper">
                    {canScrollLeft && (
                        <button
                            className="carousel-btn carousel-btn-left"
                            onClick={() => scroll('left')}
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}

                    <div className="carousel-track" ref={scrollRef}>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/tienda/${category.slug}`}
                                className="category-chip"
                            >
                                <span className="category-icon">
                                    {categoryIcons[category.slug] || <Leaf size={18} />}
                                </span>
                                <span className="category-name">{category.name}</span>
                                <span className="category-count">({category._count.products})</span>
                            </Link>
                        ))}
                    </div>

                    {canScrollRight && (
                        <button
                            className="carousel-btn carousel-btn-right"
                            onClick={() => scroll('right')}
                            aria-label="Siguiente"
                        >
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
