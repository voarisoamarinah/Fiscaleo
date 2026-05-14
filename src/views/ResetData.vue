<template>
    <div class="delete-data-view" style="display: flex; gap: 20px; margin-bottom: 20px;">

        <div style="flex: 1;">
            <h1>Suppression des données</h1>

            <button type="button" class="delete-button" @click="confirmDeleteAll" :disabled="isDeleting"
                :aria-busy="isDeleting" aria-label="Supprimer toutes les données comptables">
                <span class="button-content">
                    <i class="fas fa-trash"></i>
                    {{ isDeleting ? 'Suppression en cours...' : 'Démarrer' }}
                </span>
            </button>
        </div>

        <div v-if="deleteError" class="error" role="alert">
            {{ deleteError }}
        </div>

        <div style="flex: 1;">
            <div v-if="deleteResult" class="result">
                <h2>Résultat de la suppression</h2>
                <pre>{{ JSON.stringify(deleteResult, null, 2) }}</pre>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useDeleteAccountingRecords } from '@/services/resetDataService.js';

export default defineComponent({
    name: 'DeleteData',
    setup() {
        const { deleteAllAccountingRecords, isDeleting, deleteResult, deleteError } = useDeleteAccountingRecords();

        const confirmDeleteAll = async () => {
            if (window.confirm('Voulez-vous vraiment supprimer TOUTES les données comptables ? Cette action est irréversible.')) {
                try {
                    const result = await deleteAllAccountingRecords();
                    window.alert(`Suppression terminée avec succès !\n${result.errors.length > 0 ? 'Erreurs rencontrées : ' + result.errors.join(', ') : 'Aucune erreur.'}`);
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error.message);
                }
            }
        };

        return {
            confirmDeleteAll,
            isDeleting,
            deleteResult,
            deleteError,
        };
    },
});
</script>

<style scoped>

h1 {
    font-family: 'Gendy', sans-serif;
    color: #292929;
    margin-bottom: 1.5rem;
    font-size: 2rem;
}

h2 {
    color: #292929;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.delete-button {
    position: relative;
    padding: 12px 32px;
    background-color: #dc3545;
    /* Rouge pour action dangereuse */
    color: white;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
    transition: all 0.4s ease;
    overflow: hidden;
}

.delete-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
    background: linear-gradient(135deg, #c82333, #a71d2a);
}

.delete-button:active {
    transform: translateY(0);
}

.delete-button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    box-shadow: none;
}

.button-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.error {
    color: #dc3545;
    background-color: #f8d7da;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
    font-weight: 500;
}

.result {
    margin-top: 2rem;
    background: #f4f4f4;
    padding: 1rem;
    border-radius: 4px;
}

pre {
    white-space: pre-wrap;
    font-size: 0.9rem;
    color: #333;
}
</style>