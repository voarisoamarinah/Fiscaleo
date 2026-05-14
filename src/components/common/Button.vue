<template>
    <button class="base-button" :class="[variant, { 'full-width': fullWidth }]" :type="type" @click="$emit('click')">
        <slot name="icon"></slot>
        <slot></slot>
    </button>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            default: 'button'
        },
        variant: {
            type: String,
            default: 'primary',
            validator: value => ['primary', 'secondary', 'danger'].includes(value)
        },
        fullWidth: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style scoped>
.base-button {
    padding: 12px 24px;
    border-radius: 30px;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: 'Radibta', sans-serif;
    letter-spacing: 0.5px;
}

.base-button.primary {
    background: linear-gradient(135deg, #079BA3 0%, #156367 100%);
    color: white;
}

.base-button.primary:hover {
    background: linear-gradient(135deg, #067e85 0%, #0e4a4e 100%);
    transform: translateY(-2px);
}

.base-button.secondary {
    background: rgba(255, 255, 255, 0.9);
    color: #333;
}

.base-button.secondary:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
}

.base-button.danger {
    background: linear-gradient(135deg, #ff4757 0%, #cc2e3d 100%);
    color: white;
}

.base-button.danger:hover {
    background: linear-gradient(135deg, #e84141 0%, #b82525 100%);
    transform: translateY(-2px);
}

.base-button.full-width {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    display: block;
}

@media (max-width: 768px) {
    .base-button {
        padding: 10px 20px;
        font-size: 0.9rem;
    }
}
</style>