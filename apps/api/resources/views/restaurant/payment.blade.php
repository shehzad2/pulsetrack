
@extends('layouts.restaurant')

@section('title', 'Payment — Savory.')

@section('content')
<section class="section">
    <div class="container">
        <div class="page-heading">
            <p class="eyebrow">ONE LAST STEP</p>
            <h1>Choose how to pay.</h1>
            <p class="muted">Select a payment method for your Savory order.</p>
        </div>

        <div class="form-card" style="max-width:680px;margin:0 auto">
            <p class="muted">Order reference</p>
            <strong id="payment-order-reference"
                    style="display:block;margin-top:8px;overflow-wrap:anywhere">Loading...</strong>

            <div style="margin-top:24px">
                <label class="payment-choice">
                    <input type="radio" name="payment_method" value="cod" checked>
                    <span>
                        <strong>Cash on Delivery</strong>
                        <span class="muted choice-description">Pay when your order arrives.</span>
                    </span>
                </label>

                <label class="payment-choice payment-disabled">
                    <input type="radio" name="payment_method" value="upi" disabled>
                    <span>
                        <strong>UPI</strong>
                        <span class="muted choice-description">Coming soon — payment gateway not connected.</span>
                    </span>
                </label>

                <label class="payment-choice payment-disabled">
                    <input type="radio" name="payment_method" value="card" disabled>
                    <span>
                        <strong>Credit or debit card</strong>
                        <span class="muted choice-description">Coming soon — payment gateway not connected.</span>
                    </span>
                </label>
            </div>

            <p id="payment-error" class="muted" role="alert"
               style="margin-top:16px" hidden></p>

            <button id="confirm-payment" type="button" class="button"
                    style="width:100%;margin-top:24px">
                Confirm Cash on Delivery
            </button>

            <a href="/products" class="button button-secondary"
               style="display:block;text-align:center;margin-top:12px">
                Continue shopping
            </a>
        </div>
    </div>
</section>

<style>
.payment-choice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    margin-top: 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
}
.payment-choice input { margin-top: 5px; }
.choice-description { display: block; margin-top: 5px; }
.payment-disabled { opacity: .55; cursor: not-allowed; }
</style>

<script>
(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const orderId = parts[parts.length - 1];

    const reference = document.getElementById('payment-order-reference');
    const button = document.getElementById('confirm-payment');
    const error = document.getElementById('payment-error');

    reference.textContent =
        orderId && orderId !== 'payment' ? orderId : 'Not available';

    button.addEventListener('click', () => {
        error.hidden = true;

        if (!orderId || orderId === 'payment') {
            error.textContent = 'Order reference is missing. Please place your order first.';
            error.hidden = false;
            return;
        }

        const selected = document.querySelector(
            'input[name="payment_method"]:checked'
        );

        if (!selected || selected.value !== 'cod') {
            error.textContent = 'Only Cash on Delivery is currently available.';
            error.hidden = false;
            return;
        }

        window.location.href = '/thank-you/' + encodeURIComponent(orderId);
    });
})();
</script>
@endsection
