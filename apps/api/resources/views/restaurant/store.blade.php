@extends('layouts.restaurant')

@section('title', 'Savory. — Good food. Good mood.')

@section('content')
<section class="section">
    <div class="container">
        <div style="display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:40px;background:#f2ede3;border-radius:24px;padding:clamp(24px,5vw,56px)">
            <div>
                <p class="eyebrow">FRESH · DELICIOUS · MADE FOR YOU</p>
                <h1 style="margin:16px 0">Good food.<br>Good mood.</h1>
                <p class="muted" style="max-width:450px">
                    Discover your favorites, freshly prepared and ready to enjoy.
                    Every bite brings a little happiness.
                </p>
                <a class="button" href="#favorites" style="margin-top:22px">
                    Explore our menu →
                </a>
                <p class="muted" style="font-size:13px;margin-top:16px">
                    ✦ Freshly prepared · Made with love
                </p>
            </div>

            <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1100&q=85"
                alt="Freshly prepared burger"
                style="width:100%;height:340px;object-fit:cover;border-radius:20px"
            >
        </div>
    </div>
</section>

<section class="section" id="favorites" style="padding-top:20px">
    <div class="container">
        <div style="display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:28px">
            <div>
                <p class="eyebrow">MADE FOR YOUR APPETITE</p>
                <h2 style="margin:8px 0">Customer favorites</h2>
                <p class="muted">Delicious picks for every kind of appetite.</p>
            </div>
            <a class="text-link" href="#menu">Explore menu ↓</a>
        </div>

        <div class="product-grid" id="menu">
            @forelse ($products as $product)
                <article class="product-card">

                    <a href="{{ route('restaurant.product-detail', ['slug' => $product->slug]) }}">
                        @if ($product->image_url)
                            <img
                                class="product-image"
                                src="{{ $product->image_url }}"
                                alt="{{ $product->name }}"
                                loading="lazy"
                            >
                        @else
                            <div class="product-image" style="display:grid;place-items:center;color:#777">
                                Savory
                            </div>
                        @endif
                    </a>


                    <div class="product-content">
                        <span class="product-category">
                            {{ $product->category ?: 'Fresh favorite' }}
                        </span>
                        <h3>
                            <a href="{{ route('restaurant.product-detail', ['slug' => $product->slug]) }}">
                                {{ $product->name }}
                            </a>
                        </h3>
                        <p class="product-description">
                            {{ $product->description ?: 'Freshly prepared and made with care.' }}
                        </p>

                        <div class="product-bottom">
                            <span class="product-price">
                                ₹{{ number_format((float) $product->price, 2) }}
                            </span>
                            <button
                                type="button"
                                class="button button-small"
                                onclick="addToCart({
                                    id: {{ $product->id }},
                                    name: {{ Illuminate\Support\Js::from($product->name) }},
                                    price: {{ (float) $product->price }},
                                    image: {{ Illuminate\Support\Js::from($product->image_url ?? '') }}
                                })"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                </article>
            @empty
                <p class="muted">Our menu is being prepared. Please check back soon.</p>
            @endforelse
        </div>

        <div style="margin-top:56px;padding:32px;border-radius:20px;background:#f2ede3;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap">
            <div>
                <p class="eyebrow">SOMETHING DELICIOUS AWAITS</p>
                <h2 style="font-size:clamp(26px,3vw,36px);margin:8px 0">
                    Good things are on the menu.
                </h2>
                <p class="muted">Find your next favorite and make your day a little better.</p>
            </div>
            <a class="button" href="#menu">Browse favorites →</a>
        </div>
    </div>
</section>

<style>
    @media (max-width: 700px) {
        .section .container > div:first-child {
            grid-template-columns: 1fr !important;
        }
        .section .container > div:first-child > img {
            height: 230px !important;
        }
    }
</style>
@endsection
