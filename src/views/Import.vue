<template>
    <div>
        <form @submit.prevent="importerFichiers">
            <div class="form-group" style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <label class="file-input-label">
                        <h1 for="compteFileInput">Compte (fichier 2)</h1>
                        <div class="custom-file-input">
                            <span class="file-input-text">{{ compteFileName || 'Aucun fichier sélectionné' }}</span>
                            <span class="file-input-button">Parcourir</span>
                            <input type="file" id="compteFileInput" accept=".csv" @change="handleCompteChange"
                                class="hidden-file-input" />
                        </div>
                    </label>
                </div>
                <div style="flex: 1;">
                    <label class="file-input-label">
                        <h1 for="ecritureFileInput">Écriture (fichier 1)</h1>
                        <div class="custom-file-input">
                            <span class="file-input-text">{{ ecritureFileName || 'Aucun fichier sélectionné' }}</span>
                            <span class="file-input-button">Parcourir</span>
                            <input type="file" id="ecritureFileInput" accept=".csv" @change="handleEcritureChange"
                                class="hidden-file-input" />
                        </div>
                    </label>
                </div>
            </div>
            <button type="submit" class="import-button" :class="{ 'loading': isLoading }" :disabled="isLoading">
                <span class="button-content">
                    <span class="button-text">Importer</span>
                    <span class="button-icon">→</span>
                </span>
            </button>
        </form>

        <div v-if="compteData.length" style="display: flex; gap: 20px; margin-bottom: 20px; margin-top: 20px;">
            <div style="flex: 1;">
                <h2 style="font-family: 'Gendy';font-weight: smaller; color: #292929;">Données Compte</h2><br>
                <table>
                    <thead>
                        <tr>
                            <th v-for="key in filteredKeysCompte" :key="key">
                                {{ key }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in compteData" :key="index"
                            :style="{ backgroundColor: !!row.existeDeja ? 'red' : 'inherit' }">
                            <td v-for="key in filteredKeysCompte" :key="key">
                                {{ row[key] }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style="flex: 1;">
                <h2 style="font-family: 'Gendy';font-weight: smaller; color: #292929;">Données Écriture</h2><br>
                <table>
                    <thead>
                        <tr>
                            <th v-for="key in filteredKeysEcriture" :key="key">
                                {{ key }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in ecritureData" :key="index"
                            :style="{ backgroundColor: !!row.dateValide ? 'inherit' : 'red' }">
                            <td v-for="key in filteredKeysEcriture" :key="key">
                                {{ row[key] }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="tooltip-container">
            <br>
            <button v-if="ecritureData.length" type="button" @click="validData" :disabled="validationBloquee"
                @mouseover="showTooltip = validationBloquee" @mouseleave="showTooltip = false" class="validate-button"
                :class="{
                    'button-disabled': validationBloquee,
                    'button-pulse': !validationBloquee
                }">
                <span class="button-content">
                    <span class="button-icon">✓</span>
                    <span class="button-text">Valider</span>
                </span>
            </button>

            <transition name="tooltip-fade">
                <div v-if="validationBloquee && showTooltip" class="tooltip-message">
                    <div class="tooltip-arrow"></div>
                    Corriger les erreurs des données<br>pour valider les données
                </div>
            </transition>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import compteService from '@/services/compteService.js'
import journalService from '@/services/journalService.js'

const compteFile = ref(null)
const ecritureFile = ref(null)

const isLoading = ref(false);

const compteFileName = ref('');
const ecritureFileName = ref('');

const compteData = ref([])
const ecritureData = ref([])

const showTooltip = ref(false)

const filteredKeysCompte = computed(() => {
    if (compteData.value.length > 0) {
        return Object.keys(compteData.value[0]).filter(key => key !== 'existeDeja');
    }
    return [];
});

const filteredKeysEcriture = computed(() => {
    if (ecritureData.value.length > 0) {
        return Object.keys(ecritureData.value[0]).filter(key => key !== 'dateValide');
    }
    return [];
});

const validationBloquee = computed(() => {
    const compteInvalide = compteData.value.some(c => c.existeDeja === true)
    const ecritureInvalide = ecritureData.value.some(e => e.dateValide === false)
    return compteInvalide || ecritureInvalide
})

function handleCompteChange(event) {
    compteFileName.value = event.target.files[0]?.name || '';
    compteFile.value = event.target.files[0]
}

function handleEcritureChange(event) {
    ecritureFileName.value = event.target.files[0]?.name || '';
    ecritureFile.value = event.target.files[0]
}

async function importerFichiers() {
    if (compteFile.value) {
        compteData.value = await lireCSV(compteFile.value, true, false)
    }

    if (ecritureFile.value) {
        ecritureData.value = await lireCSV(ecritureFile.value, false, true)
    }
}

async function lireCSV(file, checkCompte, checkEcriture) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async (event) => {
            try {
                const text = event.target.result
                const rows = text.trim().split('\n')
                const headers = rows[0].split(',').map(h => h.trim())

                const rawData = rows.slice(1).map(row => {
                    const values = row.split(',').map(v => v.trim())
                    const obj = {}

                    headers.forEach((header, index) => {
                        let value = values[index]

                        if (header.toLowerCase() === 'date') {
                            obj.dateValide = estDateValide(value);

                            if (!obj.dateValide) {
                                alert(`Date inexistante: ${value} à la ligne ${rows.indexOf(row)}`);
                            }

                            value = formatDateForPostgres(value)
                        }

                        obj[header] = value
                    })

                    return obj
                })

                if (checkCompte) {
                    const dataWithCheck = await Promise.all(
                        rawData.map(async (obj) => {
                            const existe = await compteService.compteExist(obj.compte)
                            return { ...obj, existeDeja: Boolean(existe) }
                        })
                    )
                    resolve(dataWithCheck)
                } else {
                    resolve(rawData)
                }
            } catch (e) {
                reject(e)
            }
        }

        reader.onerror = reject
        reader.readAsText(file)
    })
}

function formatDateForPostgres(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} 00:00:00`;
}

function estDateValide(dateStr) {
    if (!dateStr) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);

    const dateMin = new Date(2001, 0, 1);
    const dateMax = new Date();

    return inputDate >= dateMin && inputDate <= dateMax;
}

async function validData() {
    // Création des comptes avec await pour attendre chaque opération
    for (const compte of compteData.value) {
        await compteService.createCompte(compte); // Ajout de await
    }

    let lastReference = null;
    let currentLine = 10;

    for (const ecriture of ecritureData.value) {
        try {
            // Si la référence change, réinitialiser le compteur de ligne
            if (ecriture.reference !== lastReference) {
                lastReference = ecriture.reference;
                currentLine = 10;
            }

            // Vérification de l'existence du journal
            const exist = await journalService.journalExist(ecriture.reference);

            // Vérification du compte
            const compte = await compteService.getCompteById(ecriture.compte);
            if (!compte || !compte.records || compte.records.length === 0) {
                console.error(`Compte introuvable pour l'écriture :`, ecriture);
                continue; // Passer à l'écriture suivante en cas d'erreur
            }

            // Simplification de la vérification de dateValide
            if (ecriture.dateValide !== false) {
                let journal;

                if (!exist || exist.length === 0) {
                    // Créer un nouveau journal si aucun n'existe
                    ecriture.line = currentLine;
                    journal = await journalService.createJournal(ecriture);
                    console.log(`Journal créé :`, journal);
                } else {
                    // Utiliser le journal existant
                    journal = exist[0];
                }

                // Créer la ligne de journal
                await journalService.createJournalLine(ecriture, journal, compte.records[0], currentLine);
            }

            currentLine += 10; // Incrémenter pour la prochaine ligne
        } catch (error) {
            console.error(`Erreur lors du traitement de l'écriture :`, ecriture, error);
            continue; // Continuer avec l'écriture suivante en cas d'erreur
        }
    }
}

</script>
  
<style scoped>
.form-group h1 {
    font-family: 'Gendy';
    color: #292929;
    word-spacing: 10px;
    font-size: 35px;
    margin: 0;
}

.file-input-label {
    display: block;
    cursor: pointer;
}

.custom-file-input {
    display: flex;
    align-items: center;
    border: 2px dashed #ccc;
    border-radius: 15px;
    padding: 12px;
    transition: all 0.3s;
    background-color: #ffffff;
    color: var(--dark-color);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-top: 10px;
}

.custom-file-input:hover {
    border-color: var(--primary-color);
    background-color: #f0f8f0;
}

.file-input-text {
    flex-grow: 1;
    margin-right: 10px;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-input-button {
    background-color: var(--primary-color);
    color: white;
    padding: 8px 16px;
    border-radius: 10px;
    font-weight: bold;
}

.hidden-file-input {
    display: none;
}

.import-button {
    position: relative;
    padding: 12px 32px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    transition: all 0.4s ease;
    overflow: hidden;
}

.import-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    background: linear-gradient(135deg, #0367FC 0%, #194d9c 100%);
}

.import-button:active {
    transform: translateY(0);
}

.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.button-icon {
    transition: transform 0.3s ease;
}

.import-button:hover .button-icon {
    transform: translateX(4px);
}

.validate-button {
    position: relative;
    padding: 12px 24px;
    background: linear-gradient(135deg, #2196F3 0%, #0d47a1 100%);
    color: white;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
    transition: all 0.4s ease;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.validate-button:hover:not(.button-disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
    background: linear-gradient(135deg, #42A5F5 0%, #1565C0 100%);
}

.validate-button:active:not(.button-disabled) {
    transform: translateY(0);
}

/* Animation de pulsation quand actif */
.button-pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
    }
}

/* Style désactivé */
.button-disabled {
    background: linear-gradient(135deg, #b0bec5 0%, #78909c 100%) !important;
    box-shadow: none !important;
    cursor: not-allowed;
    transform: none !important;
    animation: none !important;
}

/* Contenu du bouton */
.button-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.button-icon {
    font-size: 18px;
    transition: transform 0.3s ease;
}

.validate-button:hover:not(.button-disabled) .button-icon {
    transform: scale(1.2);
}

/* Tooltip modernisé */
.tooltip-message {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ff5252;
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 10px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-align: center;
    line-height: 1.4;
    max-width: 220px;
}

.tooltip-arrow {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #ff5252;
}

/* Animation tooltip */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
    transition: all 0.3s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
}

/* Variables CSS (matching previous pages) */
:root {
    --primary-color: #4361ee;
    --secondary-color: #3f37c9;
    --success-color: #4cc9f0;
    --danger-color: #f72585;
    --warning-color: #f8961e;
    --light-color: #f8f9fa;
    --dark-color: #212529;
    --gray-color: #6c757d;
    --border-color: #dee2e6;
    --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
}

/* Tableaux */
.table-container {
    overflow-x: auto;
    padding: 0 1rem;
    margin: 1rem 0;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    background-color: #ffffffb8;
    border-radius: 10px;
    box-shadow: var(--shadow);
    overflow: hidden;
}

table th {
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: var(--gray-color);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border-bottom: 2px solid var(--border-color);
    background-color: var(--light-color);
}

table td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

/* Lignes */
table tr:hover {
    background-color: rgba(67, 97, 238, 0.05);
}

/* Lignes avec erreurs */
table tr[style*="backgroundColor: red"] {
    background-color: #fee2e2 !important;
    color: #b91c1c;
}

/* Responsive */
@media (max-width: 768px) {
    table {
        font-size: 0.8rem;
    }

    table th,
    table td {
        padding: 0.5rem;
    }
}

@media (max-width: 480px) {

    table th,
    table td {
        padding: 0.4rem;
    }
}
</style>