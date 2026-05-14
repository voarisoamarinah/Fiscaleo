<template>
    <div class="search-bar">
        <input type="text" placeholder="Rechercher..." />
        <button>
            <font-awesome-icon icon="search" class="icon" />
        </button>
    </div>
</template>
<style scoped>
.search-bar {
    display: flex;
    align-items: center;
    background-color: #ffffff2a;
    color: var(--dark-color);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    padding: 8px 12px;
    width: 100%;
    max-width: 400px;
    /* largeur max */
    transition: box-shadow 0.3s ease;
}

.search-bar input {
    border: none;
    outline: none;
    font-size: 16px;
    flex: 1;
    background-color: transparent;
    color: var(--dark-color);
    font-weight: bold;
    padding: 6px;
}

.search-bar button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: var(--dark-color);
    font-size: 18px;
    padding: 6px;
    transition: color 0.3s ease;
}

.search-bar button:hover {
    color: var(--secondary-color);
    /* un petit effet de hover */
}</style>