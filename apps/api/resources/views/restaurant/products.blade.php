
@extends('layouts.restaurant')

@section('title', 'Our Menu — Savory.')

@section('content')
<section class="section">
    <div class="container">
        <div class="page-heading">
            <p class="eyebrow">FRESHLY PREPARED FOR YOU</p>
            <h1>Find your new favourite.</h1>
            <p class="muted">Explore delicious picks for every kind of appetite.</p>
        </div>

        <div class="product-grid">
            @forelse ($products as $product)
                <article class="product-card">
                    @if ($product->image_url)
                        <a href="{{ route('restaurant.product-detail', ['slug' => $product->slug]) }}">
                            <img class="product-image" src="{{ $product->image_url }}" alt="{{ $product->name }}" loading="lazy">
                        </a>
                    @else
                        <div class="product-image" style="display:grid;place-items:center">
                            Savory
                        </div>
                    @endif

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
                <p class="muted">No products are available right now.</p>
            @endforelse
        </div>
    </div>
</section>
@endsection
