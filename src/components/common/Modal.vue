<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-card">
            <h3 class="modal-title">Nom du client</h3>
            <input type="text" v-model="nom" placeholder="Entrez le nom du client" class="modal-input" />
            <div class="modal-buttons">
                <button @click="valider" class="modal-btn confirm-btn">Valider</button>
                <button @click="$emit('close')" class="modal-btn cancel-btn">Annuler</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Modal',
    data() {
        return {
            nom: ''
        };
    },
    methods: {
        valider() {
            if (!this.nom.trim()) {
                alert('Veuillez entrer un nom');
                return;
            }

            sessionStorage.setItem('clientNom', this.nom);

            this.$emit('valider', this.nom);

            this.$router.push('/checkout'); 
        }
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-card {
    background: var(--primary-color);
    padding: 2rem;
    border-radius: 35px;
    box-shadow: 0 15px 15px -3px #123c3e73;
    width: 90%;
    max-width: 400px;
    transition: all 0.3s ease;
}

.modal-title {
    margin: 0 0 1.5rem 0;
    font-size: 1.4rem;
    color: #ebebeb;
    font-weight: 600;
    font-family: 'Radibta', sans-serif;
    letter-spacing: 1px;
    text-align: center;
}

.modal-input {
    width: 100%;
    padding: 12px 15px;
    margin-bottom: 1.5rem;
    border: 2px solid rgba(7, 155, 163, 0.3);
    border-radius: 30px;
    background-color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    color: #333;
    transition: all 0.3s ease;
}

.modal-input:focus {
    outline: none;
    border-color: #079BA3;
    box-shadow: 0 0 0 3px rgba(7, 155, 163, 0.2);
}

.modal-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.modal-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 30px;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.confirm-btn {
    background: linear-gradient(135deg, #079BA3 0%, #156367 100%);
    color: white;
}

.confirm-btn:hover {
    background: linear-gradient(135deg, #067e85 0%, #0e4a4e 100%);
    transform: translateY(-2px);
}

.cancel-btn {
    background: rgba(255, 255, 255, 0.9);
    color: #333;
}

.cancel-btn:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .modal-card {
        padding: 1.5rem;
        border-radius: 30px;
    }

    .modal-title {
        font-size: 1.2rem;
        margin-bottom: 1.2rem;
    }

    .modal-input {
        padding: 10px 12px;
        font-size: 0.9rem;
    }

    .modal-btn {
        padding: 10px;
        font-size: 0.9rem;
    }
}
</style>