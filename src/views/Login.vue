<template>
    <div class="login-container">
        <form @submit.prevent="handleLogin">
            <span>UserName</span>
            <input type="text" v-model="username" /><br />

            <span>Password</span>
            <input type="password" v-model="password" /><br />

            <input type="submit" value="Se connecter" />
        </form>
    </div>
</template>
  
<script setup>
import { ref } from 'vue'
import { login } from '@/services/clientService.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
    try {
        const token = await login(username.value, password.value)

        console.log("token Login.vue : " + token)
        router.push('/dashboard')
        alert('Connexion réussie !')
    } catch (error) {
        console.error(error)
        alert('Échec de la connexion.')
    }
}
</script>

<style scoped>
/* Wrapper pour forcer le z-index au-dessus de background-blur */
.login-container {
    position: relative;
    z-index: 2;
    /* supérieur à background-blur (z-index:1) */
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    /* centrer verticalement */
}

/* Styles du formulaire */
form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 300px;
    margin: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

span {
    font-weight: bold;
    color: #333;
}

input[type="text"],
input[type="password"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

input[type="submit"] {
    padding: 10px;
    background: #4361ee;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

input[type="submit"]:hover {
    background: #3f37c9;
}
</style>
