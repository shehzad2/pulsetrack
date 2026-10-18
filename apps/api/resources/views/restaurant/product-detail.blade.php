
@extends('layouts.restaurant')

@section('title', $product->name . ' — Savory.')

@section('content')
<section class="section">
    <div class="container">
        <p class="muted" style="margin-bottom:24px">
            <a href="/">Home</a> / <a href="/products">Our Menu</a> / {{ $product->name }}
        </p>

        <div class="detail-grid">
            <div class="detail-image-wrap">
                @if ($product->image_url)
                    <img class="detail-image"
                         src="{{ $product->image_url }}"
                         alt="{{ $product->name }}">
                @else
                    <div class="detail-image detail-image-placeholder">Savory</div>
                @endif
            </div>

            <div class="detail-info">
                <p class="eyebrow">A SAVORY FAVOURITE</p>
                <p class="detail-category">{{ $product->category ?: 'Fresh favorite' }}</p>
                <h1>{{ $product->name }}</h1>

                <p class="detail-price">
                    ₹{{ number_format((float) $product->price, 2) }}
                </p>

                <p class="muted detail-description">
                    {{ $product->description ?: 'Freshly prepared and made with care.' }}
                </p>

                <div class="detail-benefits">
                    <span>✦ Freshly prepared</span>
                    <span>✦ Made with care</span>
                </div>

                <div class="quantity-row">
                    <label for="detail-quantity">Quantity</label>
                    <div class="quantity-control">
                        <button type="button" id="quantity-minus" aria-label="Decrease quantity">−</button>
                        <input id="detail-quantity" type="number" value="1" min="1" max="20">
                        <button type="button" id="quantity-plus" aria-label="Increase quantity">+</button>
                    </div>
                </div>

                <button type="button" id="detail-add-button" class="button">
                    Add to cart · ₹{{ number_format((float) $product->price, 2) }}
                </button>

                <p class="muted" style="font-size:13px;margin-top:12px">
                    Delivery charges, if applicable, are calculated separately.
                </p>
            </div>
        </div>

        @if ($relatedProducts->isNotEmpty())
            <div style="margin-top:64px">
                <div class="page-heading">
                    <p class="eyebrow">YOU MAY ALSO LOVE</p>
                    <h2>More delicious picks.</h2>
                </div>

                <div class="product-grid">
                    @foreach ($relatedProducts as $related)
                        <article class="product-card">
                            <a href="{{ route('restaurant.product-detail', ['slug' => $related->slug]) }}">
                                @if ($related->image_url)
                                    <img class="product-image"
                                         src="{{ $related->image_url }}"
                                         alt="{{ $related->name }}"
                                         loading="lazy">
                                @else
                                    <div class="product-image" style="display:grid;place-items:center">Savory</div>
                                @endif
                            </a>

                            <div class="product-content">
                                <span class="product-category">{{ $related->category ?: 'Fresh favorite' }}</span>
                                <h3>
                                    <a href="{{ route('restaurant.product-detail', ['slug' => $related->slug]) }}">
                                        {{ $related->name }}
                                    </a>
                                </h3>

                                <div class="product-bottom">
                                    <span class="product-price">₹{{ number_format((float) $related->price, 2) }}</span>
                                    <button type="button" class="button button-small"
                                        onclick="addToCart({
                                            id: {{ $related->id }},
                                            name: {{ Illuminate\Support\Js::from($related->name) }},
                                            price: {{ (float) $related->price }},
                                            image: {{ Illuminate\Support\Js::from($related->image_url ?? '') }}
                                        })">
                                        + Add
                                    </button>
                                </div>
                            </div>
                        </article>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</section>

<style>
.detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, .9fr);
    gap: 48px;
    align-items: center;
}
.detail-image-wrap {
    overflow: hidden;
    border-radius: 18px;
    background: var(--cream);
}
.detail-image {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
}
.detail-image-placeholder {
    display: grid;
    place-items: center;
    font-size: 32px;
}
.detail-category {
    margin-top: 18px;
    color: var(--muted);
    font-size: 14px;
}
.detail-info h1 {
    margin-top: 8px;
    font-size: clamp(32px, 4vw, 48px);
}
.detail-price {
    margin-top: 16px;
    font-size: 28px;
    font-weight: 700;
}
.detail-description {
    margin-top: 18px;
    line-height: 1.8;
}
.detail-benefits {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 22px;
    font-size: 14px;
}
.quantity-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 28px 0 18px;
}
.quantity-control {
    display: flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 9px;
    overflow: hidden;
}
.quantity-control button {
    width: 40px;
    height: 40px;
    border: 0;
    background: var(--cream);
    cursor: pointer;
    font-size: 20px;
}
.quantity-control input {
    width: 48px;
    border: 0;
    text-align: center;
    font: inherit;
    appearance: textfield;
}
#detail-add-button { width: 100%; }
@media (max-width: 700px) {
    .detail-grid { grid-template-columns: 1fr; gap: 24px; }
}
</style>

<script>
(() => {
    const quantityInput = document.getElementById('detail-quantity');
    const minusButton = document.getElementById('quantity-minus');
    const plusButton = document.getElementById('quantity-plus');
    const addButton = document.getElementById('detail-add-button');

    const product = {
        id: {{ $product->id }},
        name: {{ Illuminate\Support\Js::from($product->name) }},
        price: {{ (float) $product->price }},
        image: {{ Illuminate\Support\Js::from($product->image_url ?? '') }}
    };

    function getQuantity() {
        const parsed = Number.parseInt(quantityInput.value, 10);
        const quantity = Number.isFinite(parsed) ? parsed : 1;
        return Math.max(1, Math.min(20, quantity));
    }

    function updateButton() {
        const quantity = getQuantity();
        quantityInput.value = quantity;
        addButton.textContent =
            'Add to cart · ₹' + (product.price * quantity).toFixed(2);
    }

    minusButton.addEventListener('click', () => {
        quantityInput.value = getQuantity() - 1;
        updateButton();
    });

    plusButton.addEventListener('click', () => {
        quantityInput.value = getQuantity() + 1;
        updateButton();
    });

    quantityInput.addEventListener('change', updateButton);
    quantityInput.addEventListener('input', updateButton);

    addButton.addEventListener('click', () => {
    const quantity = getQuantity();

    if (typeof readCart !== 'function' ||
        typeof saveCart !== 'function' ||
        typeof openCart !== 'function') {
        console.error('Cart functions are not available.');
        alert('Unable to open the cart. Please refresh the page.');
        return;
    }

    const cart = readCart();
    const existing = cart.find(
        item => Number(item.id) === Number(product.id)
    );

    if (existing) {
        existing.quantity = Math.min(
            20,
            Number(existing.quantity || 0) + quantity
        );
    } else {
        cart.push({
            ...product,
            quantity: Math.min(20, quantity)
        });
    }

    saveCart(cart);
    openCart();
});

    updateButton();
})();
</script>
@endsection
