<template>
    <header :class="['header-container', { scrolled: isScrolled }]">
        <div class="page-name">
            <p>Fiscaleo /</p>
            <h1>{{ pageTitle }}</h1>
        </div>

        <div class="header-right">
            <!-- <InputRecherche /> -->
            <!-- <button class="theme-toggle-btn" @click="toggleTheme">
                <font-awesome-icon :icon="isDarkMode ? sun : moon" />
            </button> -->
        </div>
    </header>
</template>

<script>
import InputRecherche from '@/components/common/InputRecherche.vue';

export default {
    name: 'Header',
    components: {
        InputRecherche
    },
    data() {
        return {
            isDarkMode: false,
            isScrolled: false
        };
    },
    computed: {
        pageTitle() {
            const map = {
                '/dashboard': 'Dashboard',
                '/balance': 'Balance',
                '/grandLivre': 'Grand Livre',
                '/import': 'Import',
                '/resetdata': 'Reset Data',
            };

            return map[this.$route.path] || '';
        }
    },
    methods: {
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            if (this.isDarkMode) {
                document.documentElement.classList.add('dark-mode');
            } else {
                document.documentElement.classList.remove('dark-mode');
            }
        },
        handleScroll() {
            this.isScrolled = window.scrollY > 10;
        }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
    }
};
</script>

<style scoped>
.header-container {
    position: fixed;
    top: 0;
    left: 120px;
    right: 0;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* padding: 0 50px; */
    padding-left: 20px;
    padding-right: 50px;
    /* background-color: #f0f0f0; */
    z-index: 1000;
    transition: background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
}

/* Classe appliquée quand on scroll */
.header-container.scrolled {
    backdrop-filter: blur(5px);
    /* background-color: rgba(240, 240, 240, 0.8); */
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
}

/* Colonne avec le nom de la page */
.page-name {
    display: flex;
    align-items: center;
    gap: 10px;
}

.page-name p {
    font-family: 'Gendy';
    color: #2929296d;
    margin: 0;
}

.page-name h1 {
    font-family: 'Gendy';
    color: #292929;
    font-size: larger;
    margin: 0;
}

/* Droite du header */
.header-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

/* Bouton theme */
.theme-toggle-btn {
    padding: 8px 12px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background-color: #f0f0f0;
    color: #292929;
    transition: background-color 0.3s ease;
}

.theme-toggle-btn:hover {
    background-color: #e0e0e0;
}
</style>
