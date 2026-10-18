
@extends('layouts.restaurant')

@section('title', 'My Account — Savory.')

@section('content')
<section class="section">
    <div class="container">
        <div class="page-heading">
            <p class="eyebrow">YOUR SAVORY ACCOUNT</p>
            <h1>My account</h1>
            <p class="muted">Manage your details and keep track of your orders.</p>
        </div>

        <div class="form-card" id="account-card">
            <p class="muted">Loading your account...</p>
        </div>

        <div style="margin-top:30px">
            <h2 style="font-size:30px">Your orders</h2>
            <div id="orders-list" class="form-card">
                <p class="muted">Loading your orders...</p>
            </div>
        </div>
    </div>
</section>

<script>
(async () => {
    const token = localStorage.getItem('savory_auth_token');
    const accountCard = document.getElementById('account-card');
    const ordersList = document.getElementById('orders-list');

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[char]);
    }

    function loginPrompt() {
        accountCard.innerHTML =
            '<p>Please log in to view your account.</p>' +
            '<a class="button" href="/login">Log in →</a>';
        ordersList.innerHTML = '<p class="muted">Your orders will appear here after login.</p>';
    }

    if (!token) {
        loginPrompt();
        return;
    }

    const headers = {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
    };

    try {
        const response = await fetch('/api/v1/auth/me', { headers });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('savory_auth_token');
            localStorage.removeItem('savory_auth_user');
            loginPrompt();
            return;
        }

        if (!response.ok) {
            throw new Error('Unable to load account details.');
        }

        const data = await response.json();
        const user = data.user;

        localStorage.setItem('savory_auth_user', JSON.stringify(user));

        accountCard.innerHTML = `
            <p class="eyebrow">ACCOUNT DETAILS</p>
            <h2>${escapeHtml(user.name)}</h2>
            <p class="muted">${escapeHtml(user.mobile_number)}</p>
            <button class="button" id="logout-button" style="margin-top:20px">
                Log out
            </button>
        `;

        document.getElementById('logout-button').addEventListener('click', async () => {
            try {
                await fetch('/api/v1/auth/logout', {
                    method: 'POST',
                    headers
                });
            } finally {
                localStorage.removeItem('savory_auth_token');
                localStorage.removeItem('savory_auth_user');
                window.location.href = '/login';
            }
        });

        const ordersResponse = await fetch('/api/v1/orders', { headers });

        if (!ordersResponse.ok) {
            throw new Error('Unable to load your orders.');
        }

        const ordersData = await ordersResponse.json();
        const orders = Array.isArray(ordersData)
            ? ordersData
            : (ordersData.orders ?? ordersData.data ?? []);

        if (!orders.length) {
            ordersList.innerHTML = '<p class="muted">You have no orders yet. Explore our menu to get started.</p><a class="button" href="/products">Explore menu →</a>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <article style="padding:16px 0;border-bottom:1px solid var(--border)">
                <strong>Order ${escapeHtml(order.order_number ?? order.id)}</strong>
                <p class="muted" style="margin-top:6px">
                    Status: ${escapeHtml(order.status)}
                </p>
                <p style="margin-top:6px">
                    Total: ₹${Number(order.total_amount ?? 0).toFixed(2)}
                </p>
                <button type="button" class="button button-secondary button-small"
                    data-order-id="${escapeHtml(order.id)}">
                    View tracking
                </button>
                <div id="tracking-${escapeHtml(order.id)}" style="margin-top:12px"></div>
            </article>
        `).join('');

        ordersList.querySelectorAll('[data-order-id]').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.dataset.orderId;
                const container = document.getElementById('tracking-' + id);
                container.textContent = 'Loading tracking...';

                try {
                    const response = await fetch(
                        '/api/v1/orders/' + encodeURIComponent(id) + '/tracking',
                        { headers }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Unable to load tracking.');
                    }

                    const events = Array.isArray(data)
                        ? data
                        : (data.tracking_events ?? data.trackingEvents ?? data.events ?? []);

                    container.innerHTML = events.length
                        ? events.map(event => `
                            <div style="padding:10px 0;border-left:2px solid var(--green);padding-left:14px">
                                <strong>${escapeHtml(event.title ?? event.status)}</strong>
                                <p class="muted">${escapeHtml(event.description ?? '')}</p>
                                <small class="muted">${escapeHtml(event.occurred_at ?? '')}</small>
                            </div>
                        `).join('')
                        : '<p class="muted">No tracking events available yet.</p>';
                } catch (error) {
                    container.textContent = error.message;
                }
            });
        });
    } catch (error) {
        accountCard.innerHTML = '<p class="alert alert-error">' +
            escapeHtml(error.message) + '</p>';
        ordersList.innerHTML = '<p class="muted">Please refresh to try again.</p>';
    }
})();
</script>
@endsection
