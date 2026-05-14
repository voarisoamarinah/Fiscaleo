<template>
    <nav class="navbar">
        <div class="navbar-logo">
            <img class="logo" src="../../assets/images/1722166220_logokucom_bird-ff-logo-removebg-preview.png" alt="">
        </div>

        <div class="navbar-links">
            <router-link to="/dashboard" class="nav-link">
                <font-awesome-icon icon="chart-bar" class="icon" />
                <span class="label">Dashboard</span>
            </router-link>
            <router-link to="/balance" class="nav-link">
                <font-awesome-icon icon="balance-scale" class="icon" />
                <span class="label">Balance</span>
            </router-link>
            <router-link to="/grandLivre" class="nav-link">
                <font-awesome-icon icon="book" class="icon" />
                <span class="label">Grand Livre</span>
            </router-link>
            <router-link to="/import" class="nav-link">
                <font-awesome-icon icon="file-import" class="icon" />
                <span class="label">Import</span>
            </router-link>
            <router-link to="/resetdata" class="nav-link">
                <font-awesome-icon icon="trash-restore" class="icon" />
                <span class="label">Reset Data</span>
            </router-link>
            <router-link to="/saisieEcriture" class="nav-link">
                <font-awesome-icon icon="trash-restore" class="icon" />
                <span class="label">Saisie Ecriture</span>
            </router-link>
        </div>

        <div class="navbar-profile" @click="toggleProfileMenu">
            <div class="profile-img">
                <img src="../../assets/images/utilisateur.png" alt="Profil" class="profile-img-img" />
            </div>
            <div v-if="showProfileMenu" class="profile-menu" @click.stop="deconnect">
                <font-awesome-icon icon="sign-out-alt" class="logout-icon" />
                <span class="logout-text">Déconnexion</span>
            </div>
        </div>
    </nav>
</template>

<script>
import { useRouter } from 'vue-router'
const router = useRouter()
export default {
    name: 'Navbar',
    data() {
        return {
            showProfileMenu: false
        }
    },
    methods: {
        toggleProfileMenu() {
            this.showProfileMenu = !this.showProfileMenu;
        }, deconnect() {
            localStorage.removeItem('token');
            this.$router.push('/');
        }

    }
}
</script>

<style scoped>
.navbar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 120px;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* pour pousser logo en haut, nav-links au centre, profil en bas */
    align-items: center;
    background-color: transparent;
    box-shadow: none;
    z-index: 10;
}

/* Logo entreprise en haut */
.navbar-logo {
    font-size: 28px;
    font-weight: bold;
    color: var(--dark-color);
    margin-bottom: 20px;
}

.logo {
    width: 120px;
}

/* Centrer les liens */
.navbar-links {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    flex-grow: 1;
    /* pour prendre l'espace central */
    justify-content: center;
    /* centrer verticalement */
}

.nav-link {
    color: var(--dark-color);
    text-decoration: none;
    padding: 10px;
    border-radius: 15px;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* centrer l'icône */
    position: relative;
    width: 60px;
    height: 50px;
}

.nav-link:hover {
    background-color: #ffffffb8;
    color: var(--dark-color);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.nav-link.router-link-exact-active {
    background-color: #ffffff;
    color: var(--dark-color);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    font-weight: bold;
}

.icon {
    font-size: 18px;
}

.label {
    opacity: 0;
    position: absolute;
    left: 80px;
    white-space: nowrap;
    background-color: #ffffffb8;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    color: var(--dark-color);
    font-family: 'Gendy';
    padding: 5px 10px;
    border-radius: 10px;
    transform: translateY(-50%);
    top: 50%;
    transition: opacity 0.3s ease;
    pointer-events: none;
    font-size: 14px;
    z-index: 10;
}

.nav-link:hover .label {
    opacity: 1;
}

/* Photo de profil en bas */
.navbar-profile {
    position: relative;
    margin-bottom: 20px;
    cursor: pointer;
    /* margin-top: 200px; */
}

.profile-img {
    width: 60px;
    height: 50px;
    border-radius: 15px;
    /* border-radius: 50%; */
    /* border: 3px solid var(--secondary-color); */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    background-color: #d1f60139;
    display: flex;
    align-items: center;
    justify-content: center;
}

.profile-img-img {
    width: 40px;
    /* height: 50px; */
}

/* Menu Déconnexion */
.profile-menu {
    position: absolute;
    left: 60px;
    top: 50%;
    transform: translateY(-50%);
    background-color: #ffffffb8;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    color: var(--dark-color);
    padding: 5px 10px;
    margin-left: 5px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    font-size: 14px;
    z-index: 20;
    height: 50px;
}

.logout-icon {
    font-size: 16px;
}
</style>
