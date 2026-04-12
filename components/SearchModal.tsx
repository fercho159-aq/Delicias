'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';
import './SearchModal.css';

interface SearchProduct {
    id: number;
    name: string;
    slug: string;
    category?: {
        name: string;
        slug: string;
    } | null;
    images: {
        url: string;
        alt?: string | null;
    }[];
    variants: {
        price: number;
        salePrice?: number | null;
        weight?: string | null;
    }[];
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Focus the input when the modal opens
    useEffect(() => {
        if (isOpen) {
            // Short delay to ensure the modal is rendered before focusing
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        } else {
            // Reset state when modal closes
            setQuery('');
            setResults([]);
            setHasSearched(false);
            setIsLoading(false);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Debounced search
    const performSearch = useCallback(async (searchQuery: string) => {
        const trimmed = searchQuery.trim();

        if (trimmed.length < 2) {
            setResults([]);
            setHasSearched(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
            const data = await res.json();

            if (res.ok) {
                setResults(data.products);
            } else {
                setResults([]);
            }
        } catch {
            setResults([]);
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // If cleared, reset immediately
        if (value.trim().length < 2) {
            setResults([]);
            setHasSearched(false);
            setIsLoading(false);
            return;
        }

        // Show loading immediately for better feedback
        setIsLoading(true);

        // Debounce the actual API call
        debounceRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    // Clean up debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleResultClick = () => {
        onClose();
    };

    if (!isOpen) return null;

    const getPrice = (product: SearchProduct) => {
        const variant = product.variants[0];
        if (!variant) return null;
        const price = Number(variant.price) || 0;
        const salePrice = variant.salePrice ? Number(variant.salePrice) : null;
        return { price, salePrice };
    };

    const getImageUrl = (product: SearchProduct) => {
        return product.images[0]?.url || '/placeholder-product.png';
    };

    return (
        <div className="search-overlay" onClick={handleOverlayClick}>
            <div className="search-modal" role="dialog" aria-modal="true" aria-label="Buscar productos">
                {/* Search Input */}
                <div className="search-input-wrapper">
                    <Search size={20} className="search-input-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Buscar productos..."
                        value={query}
                        onChange={handleInputChange}
                        maxLength={100}
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <button
                        className="search-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar búsqueda"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Results Area */}
                <div className="search-results">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="search-status">
                            <Loader2 size={28} className="search-spinner" />
                            <p>Buscando...</p>
                        </div>
                    )}

                    {/* No Results */}
                    {!isLoading && hasSearched && results.length === 0 && (
                        <div className="search-status">
                            <Search size={28} className="search-status-icon" />
                            <p>No se encontraron productos para &ldquo;{query.trim()}&rdquo;</p>
                        </div>
                    )}

                    {/* Results List */}
                    {!isLoading && results.length > 0 && (
                        <>
                            {results.map((product) => {
                                const pricing = getPrice(product);
                                const imageUrl = getImageUrl(product);
                                const isLocalImage = imageUrl.startsWith('/');

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/productos/${product.slug}`}
                                        className="search-result-item"
                                        onClick={handleResultClick}
                                    >
                                        <div className="search-result-image">
                                            {isLocalImage ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={product.images[0]?.alt || product.name}
                                                    width={56}
                                                    height={56}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.images[0]?.alt || product.name}
                                                />
                                            )}
                                        </div>

                                        <div className="search-result-info">
                                            {product.category && (
                                                <span className="search-result-category">
                                                    {product.category.name}
                                                </span>
                                            )}
                                            <p className="search-result-name">{product.name}</p>
                                        </div>

                                        {pricing && (
                                            <div className="search-result-price">
                                                {pricing.salePrice && pricing.salePrice < pricing.price ? (
                                                    <>
                                                        <span className="search-result-price-original">
                                                            ${pricing.price.toFixed(2)}
                                                        </span>
                                                        <span className="search-result-price-current">
                                                            ${pricing.salePrice.toFixed(2)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="search-result-price-current">
                                                        ${pricing.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Footer with keyboard hint */}
                <div className="search-footer">
                    <span className="search-footer-hint">
                        <kbd>Esc</kbd> para cerrar
                    </span>
                </div>
            </div>
        </div>
    );
}
