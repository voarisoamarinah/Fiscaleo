<template>
    <div class="product-card">
        <div class="product-image-container">
            <img src="@/assets/images/velo-vtt.png" alt="product.name" class="product-image" />
            <div class="product-price">{{ product.M_ProductPrice?.[0]?.PriceStd ?? '0.0' }} €</div>
            <div class="product-stock" :class="{ 'low-stock': 100 < 5 }">
                {{ product.M_StorageOnHand?.[0]?.QtyOnHand ?? '0' }} restant(s)
            </div>
        </div>

        <div class="product-details">
            <h3 class="product-name">{{ product.Name }}</h3>

            <div class="container-description">
                <p class="product-description">{{ product.Description }}</p>
            </div>

            <button class="add-to-cart-btn" @click="addToCart">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Ajouter au panier</span>
            </button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        product: {
            type: Object,
            required: true
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.product)
            const btn = this.$el.querySelector('.add-to-cart-btn')
            btn.classList.add('clicked')
            setTimeout(() => btn.classList.remove('clicked'), 300)
        }
    }
}
</script>

<style scoped>
.product-card {
    background: var(--primary-color);
    padding: 1rem;
    border-radius: 45px;
    box-shadow: 0 15px 15px -3px #123c3e73;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.product-image-container {
    position: relative;
    padding-top: 75%;
    overflow: hidden;
    border-radius: 35px;
    margin-bottom: 1rem;
}

.product-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.product-card:hover .product-image {
    transform: scale(1.03);
}

.product-price {
    position: absolute;
    bottom: 15px;
    right: 15px;
    background-color: rgba(7, 155, 163, 0.9);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 1.1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.product-stock {
    position: absolute;
    top: 15px;
    left: 15px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #333;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 500;
    font-size: 0.9rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.low-stock {
    background-color: rgba(255, 59, 48, 0.9);
    color: white;
}

.product-details {
    padding: 0.5rem 1.2rem 1.2rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.product-name {
    margin: 0 0 0.8rem 0;
    font-size: 1.2rem;
    color: #ebebeb;
    font-weight: 600;
    font-family: 'Radibta', sans-serif;
    letter-spacing: 1px;
    text-align: center;
}

.container-description {
    height: auto;
}

.product-description {
    color: #d1d1d1;
    font-size: 0.9rem;
    line-height: 1.4;
    margin-bottom: 1.5rem;
    flex-grow: 1;
}

.add-to-cart-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #079BA3 0%, #156367 100%);
    color: white;
    border: none;
    border-radius: 30px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
    background: linear-gradient(135deg, #067e85 0%, #0e4a4e 100%);
    transform: translateY(-2px);
}

.add-to-cart-btn:active {
    transform: translateY(0);
}

.add-to-cart-btn.clicked {
    background: #4a8f7e;
    transform: scale(0.98);
}

@media (max-width: 768px) {
    .product-card {
        border-radius: 35px;
        padding: 1rem;
    }

    .product-details {
        padding: 0.5rem 1rem 1rem;
    }

    .product-name {
        font-size: 1.1rem;
    }

    .product-description {
        font-size: 0.85rem;
    }

    .add-to-cart-btn {
        padding: 10px;
        font-size: 0.9rem;
    }
}
</style>