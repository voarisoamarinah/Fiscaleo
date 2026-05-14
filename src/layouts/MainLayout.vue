<template>
    <div class="app-container">
        <Navbar />
        
        <Header />

        <main class="main-content">
            <router-view />
        </main>
    </div>
</template>
  
<script>
import Navbar from '@/components/common/Navbar.vue';
import Header from '@/components/common/Header.vue';

export default {
    name: 'MainLayout',
    components: {
        Navbar,
        Header
    }
}
</script>
  
<style>
html,
body {
    height: 100%;
    margin: 0;
}

.app-container {
    height: 100%;
    display: flex;
    flex-direction: row;
}

.main-content {
    flex: 1;
    padding: 20px;
    padding-right: 50px;
    margin-left: 120px;
    margin-top: 120px;
    /* pas de height, pas de overflow */
    z-index: 2; /* au-dessus du blur et du background */
    position: relative;
}

</style>
