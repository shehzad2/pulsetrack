
@extends('layouts.restaurant')

@section('title', 'Checkout — Savory.')

@section('content')
<section class="section">
    <div class="container">
        <div class="page-heading">
            <p class="eyebrow">ALMOST READY</p>
            <h1>Let's get your order to you.</h1>
            <p class="muted">Enter your delivery details and review your order.</p>
        </div>

        @if ($errors->any())
            <div class="alert alert-error" role="alert" style="margin-bottom: 20px;">
                <ul style="margin: 0; padding-left: 20px;">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="checkout-grid">
            <div class="form-card">
                <h2>Delivery details</h2>
                <p class="muted">Tell us where to deliver your food.</p>

                <form
                    id="checkout-form"
                    method="POST"
                    action="{{ route('restaurant.checkout.store') }}"
                    style="margin-top:24px"
                >
                    @csrf

                    <label for="customer_name">Full name</label>
                    <input
                        id="customer_name"
                        name="customer_name"
                        type="text"
                        maxlength="255"
                        autocomplete="name"
                        value="{{ old('customer_name') }}"
                        required
                    >

                    <label for="phone" style="display:block;margin-top:16px">
                        Mobile number
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        maxlength="30"
                        autocomplete="tel"
                        value="{{ old('phone') }}"
                        required
                    >

                    <label for="address" style="display:block;margin-top:16px">
                        Full delivery address
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        rows="3"
                        maxlength="1000"
                        autocomplete="street-address"
                        required
                        style="width:100%"
                    >{{ old('address') }}</textarea>

                    <div class="checkout-fields">
                        <div>
                            <label for="city">City</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                maxlength="100"
                                autocomplete="address-level2"
                                value="{{ old('city') }}"
                                required
                            >
                        </div>

                        <div>
                            <label for="postal_code">PIN code</label>
                            <input
                                id="postal_code"
                                name="postal_code"
                                type="text"
                                maxlength="20"
                                autocomplete="postal-code"
                                value="{{ old('postal_code') }}"
                                required
                            >
                        </div>
                    </div>

                    <div style="margin-top:24px">
                        <h3>Payment method</h3>

                        <label class="payment-option">
                            <input
                                type="radio"
                                name="payment_method"
                                value="cod"
                                checked
                            >
                            <span>
                                <strong>Cash on Delivery</strong>
                                <span class="muted" style="display:block">
                                    Pay when your order arrives.
                                </span>
                            </span>
                        </label>
                    </div>

                    <p
                        id="checkout-error"
                        class="alert alert-error"
                        role="alert"
                        hidden
                        style="margin-top:16px"
                    ></p>

                    <button
                        id="place-order-button"
                        class="button"
                        type="submit"
                        style="width:100%;margin-top:24px"
                    >
                        Place order
                    </button>
                </form>
            </div>

            <aside class="form-card">
                <h2>Your order</h2>

                <div id="checkout-items" style="margin-top:20px">
                    <p class="muted">Loading your cart...</p>
                </div>

                <div
                    style="border-top:1px solid var(--border);margin-top:20px;padding-top:16px"
                >
                    <div class="checkout-total">
                        <span>Subtotal</span>
                        <strong id="checkout-subtotal">₹0.00</strong>
                    </div>

                    <p class="muted" style="font-size:13px;margin-top:10px">
                        Delivery charges, if applicable, are not included.
                    </p>
                </div>

                <a
                    href="/products"
                    class="button button-secondary"
                    style="display:block;text-align:center;margin-top:20px"
                >
                    Continue shopping
                </a>
            </aside>
        </div>
    </div>
</section>

<style>
.checkout-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(280px, .8fr);
    gap: 24px;
    align-items: start;
}

.checkout-grid .form-card {
    min-width: 0;
}

.checkout-grid label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 7px;
}

.checkout-grid input:not([type="radio"]),
.checkout-grid textarea {
    box-sizing: border-box;
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font: inherit;
}

.checkout-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 16px;
}

.payment-option {
    display: flex !important;
    align-items: flex-start;
    gap: 10px;
    padding: 16px;
    margin-top: 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
}

.payment-option input[type="radio"] {
    margin-top: 4px;
}

.checkout-total {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.checkout-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
}

.checkout-item img {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 8px;
}

@media (max-width: 700px) {
    .checkout-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<script>
(() => {
    const form = document.getElementById('checkout-form');
    const itemsContainer = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const errorElement = document.getElementById('checkout-error');
    const submitButton = document.getElementById('place-order-button');

    function readCart() {
        try {
            const value = JSON.parse(
                localStorage.getItem('savory_cart') || '[]'
            );

            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[char]);
    }

    function renderSummary() {
        const cart = readCart();

        const validItems = cart.filter(item =>
            Number.isInteger(Number(item.id)) &&
            Number(item.id) > 0 &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) >= 1 &&
            Number(item.quantity) <= 20
        );

        const total = validItems.reduce((sum, item) => {
            return sum + (Number(item.price) || 0) *
                Number(item.quantity);
        }, 0);

        itemsContainer.innerHTML = validItems.length
            ? validItems.map(item => `
                <div class="checkout-item">
                    <div style="display:flex;gap:12px;min-width:0">
                        ${item.image
                            ? `<img src="${escapeHtml(item.image)}" alt="">`
                            : ''
                        }
                        <div>
                            <strong>${escapeHtml(item.name)}</strong>
                            <p class="muted" style="margin-top:5px">
                                Qty: ${Number(item.quantity)}
                            </p>
                        </div>
                    </div>
                    <strong>₹${(
                        (Number(item.price) || 0) *
                        Number(item.quantity)
                    ).toFixed(2)}</strong>
                </div>
            `).join('')
            : '<p class="muted">Your cart is empty. Add something delicious from our menu.</p>';

        subtotalElement.textContent = '₹' + total.toFixed(2);

        submitButton.disabled = validItems.length === 0;
        submitButton.style.opacity = validItems.length ? '1' : '.6';

        return validItems;
    }

    renderSummary();

    form.addEventListener('submit', event => {
        errorElement.hidden = true;

        const currentItems = renderSummary();

        if (!currentItems.length) {
            event.preventDefault();
            errorElement.textContent =
                'Your cart is empty. Please add a product first.';
            errorElement.hidden = false;
            return;
        }

        // Prevent duplicate hidden fields on repeated submission attempts.
        form.querySelectorAll('[data-cart-field="true"]').forEach(input => {
            input.remove();
        });

        // Submit only product IDs and quantities.
        // Laravel will retrieve prices from the database.
        currentItems.forEach((item, index) => {
            const fields = {
                [`items[${index}][product_id]`]: Number(item.id),
                [`items[${index}][quantity]`]: Number(item.quantity)
            };

            Object.entries(fields).forEach(([name, value]) => {
                const input = document.createElement('input');

                input.type = 'hidden';
                input.name = name;
                input.value = String(value);
                input.dataset.cartField = 'true';

                form.appendChild(input);
            });
        });

        submitButton.disabled = true;
        submitButton.textContent = 'Placing your order...';

        // Allow the browser to submit the form normally to Laravel.
        // Do not call the orders API with fetch().
    });
})();
</script>
@endsection
