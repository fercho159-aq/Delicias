'use client';

import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import './AddToCart.css';

interface AddToCartProps {
    productId: number;
    productName: string;
    productSlug: string;
    variantId: number;
    variantName: string;
    price: number;
    image: string | null;
    maxStock: number;
}

export default function AddToCart({
    productId,
    productName,
    productSlug,
    variantId,
    variantName,
    price,
    image,
    maxStock
}: AddToCartProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addItem({
            variantId,
            productId,
            productName,
            productSlug,
            variantName,
            price,
            quantity,
            image,
            maxStock
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const incrementQuantity = () => {
        if (quantity < maxStock) {
            setQuantity(q => q + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    return (
        <div className="add-to-cart">
            <div className="quantity-selector">
                <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    aria-label="Reducir cantidad"
                >
                    <Minus size={18} />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                    onClick={incrementQuantity}
                    disabled={quantity >= maxStock}
                    aria-label="Aumentar cantidad"
                >
                    <Plus size={18} />
                </button>
            </div>

            <button
                className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={maxStock === 0}
            >
                {isAdded ? (
                    <>
                        <Check size={20} />
                        ¡Agregado!
                    </>
                ) : maxStock === 0 ? (
                    'Agotado'
                ) : (
                    <>
                        <ShoppingCart size={20} />
                        Agregar al Carrito
                    </>
                )}
            </button>
        </div>
    );
}
