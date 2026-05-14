<template>
    <h1>Saisie Ecriture</h1>
    <form @submit.prevent="handleCreation">
        <span>Compte</span>
        <select name="compte" id="compte" v-model="compte">
            <option v-for="(c, index) in comptes" :key="c.id" :value="c">{{ c.Value }}</option>
        </select><br>

        <span>Journal</span>
        <select name="journal" id="journal" v-model="journal">
            <option v-for="(j, index) in journals" :key="j.id" :value="j">{{ j.Description }}</option>
        </select><br>

        <span>Date</span>
        <input type="date" v-model="date" /><br />

        <span>Débit</span>
        <input type="number" v-model="debit" /><br />

        <span>Crédit</span>
        <input type="number" v-model="credit" /><br />

        <input type="submit" value="Ajouter" />
    </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import journalService from '@/services/journalService.js';
import compteService from '@/services/compteService.js';

const journals = ref([]);
const comptes = ref([]);
const compte = ref('')
const journal = ref('')
const debit = ref(0)
const date = ref('')
const credit = ref(0)
let data = {}

function formatDateForPostgres(dateStr) {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} 00:00:00`;
}

const handleCreation = async () => {
    try {
        // data.credit = credit
        // data.debit = debit
        // const date = new Date();
        // console.log(date.getDate())
        const dateFormated = formatDateForPostgres(date.value)
        // console.log(dateFormated)
        data = {
            credit: credit.value,
            debit: debit.value,
            date: dateFormated
        }
        const response = await journalService.createJournalLine1(data, journal.value, compte.value, 10)
        // console.log(`${data.credit} ${formatDateForPostgres(date.value)} ${data.debit} ${compte.value.id} ${journal.value.id} `)
        alert('Ecriture créer !')
    } catch (error) {
        console.error(error)
        alert('Échec de la connexion.')
    }
}

onMounted(async () => {
    try {
        const journalsResponse = await journalService.getGrandLivre();
        const rawResponse1 = journalsResponse || [];
        journals.value = rawResponse1;
        console.log('journals:', journals.value);

        const comptesResponse = await compteService.getCompte();
        const rawResponse2 = comptesResponse || [];
        comptes.value = rawResponse2;
        console.log('comptes:', comptes.value);
    } catch (err) {
        error.value = 'Erreur lors du chargement de la Balance';
        console.error('Erreur API:', err.response ? err.response.data : err.message);
    }
});

</script>