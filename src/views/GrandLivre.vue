<template>
    <div class="accounting-container">
        <div v-if="error" class="status-message error">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
        </div>

        <div class="card filter-card">
            <div class="modal-filters">
                <div class="filter-item">
                    <label for="dateMin" style="font-family: 'Gendy';font-weight: smaller; color: #292929;">Période :</label>
                    <input type="date" v-model="dateMin" id="dateMin" class="form-input" />
                </div>
                <div class="filter-item">
                    <label for="dateMax" style="font-family: 'Gendy';font-weight: smaller; color: #292929;">au</label>
                    <input type="date" v-model="dateMax" id="dateMax" class="form-input" />
                </div>
                <div class="filter-item">
                    <label for="reference" style="font-family: 'Gendy';font-weight: smaller; color: #292929;">Recherche :</label>
                    <input type="text" v-model="referenceFilter" id="reference" placeholder="Référence ou libellé..."
                        class="form-input" />
                </div>
                <button @click="resetFilters" class="btn-secondary">
                    <i class="fas fa-undo"></i> Réinitialiser
                </button>
            </div>
        </div>

        <div v-if="Object.keys(groupedJournals).length">
            <div v-for="(accountGroup, accountName) in groupedJournals" :key="accountName" class="card account-section">
                <div class="card-header">
                    <h2>{{ accountName }}</h2>
                    <div class="card-actions">
                        <button class="btn-icon" title="Exporter en PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="btn-icon" title="Exporter en Excel">
                            <i class="fas fa-file-excel"></i>
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="ledger-table">
                        <thead>
                            <tr>
                                <th class="date-col">Date</th>
                                <th class="doc-col">Pièce</th>
                                <th class="desc-col">Libellé</th>
                                <th class="desc-col">Débit</th>
                                <th class="desc-col">Crédit</th>
                                <th class="desc-col">Solde</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(line, index) in accountGroup.lines" :key="line.id" class="account-row">
                                <td>{{ formatDate(line.DateAcct) }}</td>
                                <td class="doc-no">{{ line.DocumentNo }}</td>
                                <td class="description">{{ line.journalDescription || 'N/A' }}</td>
                                <td class="debit-amount">{{ formatCurrency(line.AmtAcctDr) }}</td>
                                <td class="credit-amount">{{ formatCurrency(line.AmtAcctCr) }}</td>
                                <td :class="getRunningBalanceClass(accountGroup.runningBalances[index])">
                                    {{ formatCurrency(accountGroup.runningBalances[index]) }}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="3">Total</td>
                                <td class="debit-amount">{{ formatCurrency(accountGroup.totalDebit) }}</td>
                                <td class="credit-amount">{{ formatCurrency(accountGroup.totalCredit) }}</td>
                                <td :class="getBalanceClass(accountGroup)">
                                    {{ formatCurrency(accountGroup.totalCredit - accountGroup.totalDebit) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="card grand-total">
                <div class="table-container">
                    <table class="ledger-table">
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="3" style="font-family: 'Gendy';font-weight: smaller; color: #292929;">Total Grand Livre</td>
                                <td class="debit-amount">{{ formatCurrency(grandLivreTotals.totalDebit) }}</td>
                                <td class="credit-amount">{{ formatCurrency(grandLivreTotals.totalCredit) }}</td>
                                <td :class="getTotalBalanceClass()">
                                    {{ formatCurrency(grandLivreTotals.totalCredit - grandLivreTotals.totalDebit) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
        <div v-else class="status-message info">
            <i class="fas fa-info-circle"></i>
            Aucune donnée disponible.
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import journalService from '@/services/journalService.js';

const grandLivre = ref([]);
const error = ref(null);
const dateMin = ref(null);
const dateMax = ref(null);
const referenceFilter = ref('');

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount || 0);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const resetFilters = () => {
    dateMin.value = null;
    dateMax.value = null;
    referenceFilter.value = '';
};

const groupedJournals = computed(() => {
    const grouped = {};

    const filteredJournals = grandLivre.value.filter(journal => {
        let matches = true;

        const journalDate = new Date(journal.DateAcct);
        if (dateMin.value) {
            const minDate = new Date(dateMin.value);
            matches = matches && journalDate >= minDate;
        }
        if (dateMax.value) {
            const maxDate = new Date(dateMax.value);
            maxDate.setHours(23, 59, 59, 999);
            matches = matches && journalDate <= maxDate;
        }

        if (referenceFilter.value) {
            const refLower = referenceFilter.value.toLowerCase();
            matches =
                matches &&
                ((journal.Description || '').toLowerCase().includes(refLower) ||
                    (journal.DocumentNo || '').toLowerCase().includes(refLower));
        }

        return matches;
    });

    filteredJournals.forEach(journal => {
        (journal.GL_JournalLine || []).forEach(line => {
            const accountName = line.Account_ID?.identifier || 'Compte inconnu';
            if (!grouped[accountName]) {
                grouped[accountName] = {
                    lines: [],
                    runningBalances: [],
                    totalDebit: 0,
                    totalCredit: 0,
                };
            }

            const lineData = {
                ...line,
                journalDescription: journal.Description || 'N/A',
                DocumentNo: journal.DocumentNo || 'N/A',
                DateAcct: line.DateAcct || journal.DateAcct,
            };

            grouped[accountName].lines.push(lineData);
            grouped[accountName].totalDebit += line.AmtAcctDr || 0;
            grouped[accountName].totalCredit += line.AmtAcctCr || 0;
        });
    });

    Object.values(grouped).forEach(group => {
        group.lines.sort((a, b) => {
            const dateA = new Date(a.DateAcct);
            const dateB = new Date(b.DateAcct);
            return dateA - dateB || a.Line - b.Line;
        });

        let runningBalance = 0;
        group.runningBalances = group.lines.map(line => {
            runningBalance += (line.AmtAcctCr || 0) - (line.AmtAcctDr || 0);
            return runningBalance;
        });
    });

    return Object.fromEntries(
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    );
});

const grandLivreTotals = computed(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    Object.values(groupedJournals.value).forEach(group => {
        totalDebit += group.totalDebit;
        totalCredit += group.totalCredit;
    });

    return {
        totalDebit,
        totalCredit,
    };
});

const getBalanceClass = (accountGroup) => {
    const balance = accountGroup.totalCredit - accountGroup.totalDebit;
    return balance >= 0 ? 'positive-amount' : 'negative-amount';
};

const getTotalBalanceClass = () => {
    const balance = grandLivreTotals.value.totalCredit - grandLivreTotals.value.totalDebit;
    return balance >= 0 ? 'positive-amount' : 'negative-amount';
};

const getRunningBalanceClass = (balance) => {
    return balance >= 0 ? 'positive-amount' : 'negative-amount';
};

onMounted(async () => {
    try {
        const grandLivreResponse = await journalService.getGrandLivre();
        const rawResponse = grandLivreResponse || [];
        grandLivre.value = rawResponse;
        console.log('Données Grand Livre:', grandLivre.value);
    } catch (err) {
        error.value = 'Erreur lors du chargement du Grand Livre';
        console.error('Erreur API:', err.response ? err.response.data : err.message);
    }
});
</script>

<style scoped>
/* Variables CSS */
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

/* Reset et base */
.accounting-container {
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    color: var(--dark-color);
    line-height: 1.6;
    padding: 1rem;
}

/* Cartes */
.card {
    background-color: #ffffffb8;
    border-radius: 15px;
    box-shadow: var(--shadow);
    margin-bottom: 2rem;
    overflow: hidden;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.card-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--dark-color);
}

.card-actions {
    display: flex;
    gap: 0.5rem;
}

/* Filtres */
.filter-card {
    background: var(--light-color);
}

.modal-filters {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    align-items: center;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--border-color);
}

.filter-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-item label {
    font-weight: 500;
    color: var(--gray-color);
}

.form-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    transition: var(--transition);
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

/* Tableaux */
.table-container {
    overflow-x: auto;
    padding: 0 1rem;
}

.ledger-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.ledger-table th {
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    /* color: var(--gray-color); */
    text-transform: uppercase; font-family: 'Gendy';font-weight: smaller; color: #292929;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border-bottom: 2px solid var(--border-color);
}

.ledger-table td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

/* Colonnes spécifiques */
.date-col {
    width: 15%;
}

.doc-col {
    width: 12%;
}

.desc-col {
    width: 33%;
}

.amount-col {
    width: 15%;
    text-align: right !important;
}

/* Lignes */
.account-row:hover {
    background-color: rgba(67, 97, 238, 0.05);
}

.total-row {
    font-weight: 600;
}

.total-row td {
    border-top: 2px solid var(--border-color);
    border-bottom: none;
}

/* Montants */
.debit-amount {
    color: var(--danger-color);
}

.credit-amount {
    color: var(--success-color);
}

.positive-amount {
    color: var(--success-color);
}

.negative-amount {
    color: var(--danger-color);
}

/* Boutons */
.btn-icon {
    background: none;
    border: none;
    color: var(--gray-color);
    cursor: pointer;
    font-size: 1rem;
    transition: var(--transition);
    padding: 0.25rem;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--dark-color);
}

.btn-secondary {
    background: white;
    color: var(--gray-color);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-secondary:hover {
    background: var(--light-color);
    color: var(--dark-color);
}

/* Messages d'état */
.status-message {
    padding: 1rem;
    border-radius: 5px;
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.error {
    background: #fee2e2;
    color: #b91c1c;
    border-left: 4px solid #dc2626;
}

.info {
    background: #e0f2fe;
    color: #0369a1;
    border-left: 4px solid #0ea5e9;
}

/* Total général */
.grand-total {
    background: var(--light-color);
}

/* Responsive */
@media (max-width: 768px) {
    .modal-filters {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-item {
        flex-direction: column;
        align-items: stretch;
    }

    .ledger-table {
        font-size: 0.8rem;
    }

    .date-col {
        width: 20%;
    }

    .doc-col {
        width: 15%;
    }

    .desc-col {
        width: 25%;
    }

    .amount-col {
        width: 20%;
    }
}

@media (max-width: 480px) {
    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .ledger-table td,
    .ledger-table th {
        padding: 0.5rem;
    }
}
</style>