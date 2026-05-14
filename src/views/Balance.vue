<template>
    <div class="accounting-container">
        <div v-if="error" class="status-message error">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
        </div>

        <div class="card balance-card" v-if="Object.keys(balanceData).length">
            <div class="card-header">
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
                <table class="accounting-table">
                    <thead>
                        <tr>
                            <th class="account-col">Compte</th>
                            <th class="account-col">Débit</th>
                            <th class="account-col">Crédit</th>
                            <th class="account-col">Solde</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(account, accountName) in balanceData" :key="accountName" class="account-row">
                            <td>
                                <button class="account-link" @click="openModal(accountName)">
                                    <span class="account-name">{{ accountName }}</span>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </td>
                            <td class="debit-amount">{{ formatCurrency(account.totalDebit) }}</td>
                            <td class="credit-amount">{{ formatCurrency(account.totalCredit) }}</td>
                            <td :class="getBalanceClass(account)">
                                {{ formatCurrency(account.totalCredit - account.totalDebit) }}
                            </td>
                        </tr>
                        <tr v-for="st in sousTotal" :key="st.classe" class="total-row">
                            <td>Sous Total {{ st.classe }}</td>
                            <td class="debit-amount">{{ formatCurrency(st.totalDebit) }}</td>
                            <td class="credit-amount">{{ formatCurrency(st.totalCredit) }}</td>
                            <td :class="getTotalBalanceClass()">
                                {{ formatCurrency(st.totalSolde) }}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td>Total Balance</td>
                            <td class="debit-amount">{{ formatCurrency(balanceTotals.totalDebit) }}</td>
                            <td class="credit-amount">{{ formatCurrency(balanceTotals.totalCredit) }}</td>
                            <td :class="getTotalBalanceClass()">
                                {{ formatCurrency(balanceTotals.totalCredit - balanceTotals.totalDebit) }}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
        <div v-else class="status-message info">
            <i class="fas fa-info-circle"></i>
            Aucune donnée disponible.
        </div>

        <transition name="modal">
            <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>
                            <i class="fas fa-book-open"></i>
                            Grand Livre : {{ selectedAccount }}
                        </h3>
                        <button class="btn-close" @click="closeModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="chart-container">
                        <Line :data="chartData" :options="chartOptions" />
                    </div>

                    <div class="modal-filters">
                        <div class="filter-item">
                            <label>Période :</label>
                            <div class="date-range">
                                <input type="date" v-model="modalDateMin" class="form-input">
                                <span>au</span>
                                <input type="date" v-model="modalDateMax" class="form-input">
                            </div>
                        </div>

                        <div class="filter-item">
                            <label>Recherche :</label>
                            <input type="text" v-model="modalReferenceFilter" placeholder="Référence ou libellé..."
                                class="form-input">
                        </div>

                        <button @click="resetModalFilters" class="btn-secondary">
                            <i class="fas fa-undo"></i> Réinitialiser
                        </button>
                    </div>

                    <div class="table-container">
                        <table class="ledger-table" v-if="accountLines.length">
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
                                <tr v-for="(line, index) in accountLines" :key="line.id">
                                    <td>{{ formatDate(line.DateAcct) }}</td>
                                    <td class="doc-no">{{ line.DocumentNo }}</td>
                                    <td class="description">{{ line.journalDescription || 'N/A' }}</td>
                                    <td class="debit-amount">{{ formatCurrency(line.AmtAcctDr) }}</td>
                                    <td class="credit-amount">{{ formatCurrency(line.AmtAcctCr) }}</td>
                                    <td :class="getRunningBalanceClass(runningBalances[index])">
                                        {{ formatCurrency(runningBalances[index]) }}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td colspan="3">Total</td>
                                    <td class="debit-amount">{{ formatCurrency(totalDebit) }}</td>
                                    <td class="credit-amount">{{ formatCurrency(totalCredit) }}</td>
                                    <td :class="getTotalBalanceClass(totalCredit - totalDebit)">
                                        {{ formatCurrency(totalCredit - totalDebit) }}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                        <div v-else class="status-message info">
                            <i class="fas fa-info-circle"></i>
                            Aucune transaction pour ce compte.
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button @click="closeModal" class="btn-primary">
                            <i class="fas fa-check"></i> Fermer
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import journalService from '@/services/journalService.js';
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
} from 'chart.js';

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale
);

const grandLivre = ref([]);
const error = ref(null);
const dateMin = ref(null);
const dateMax = ref(null);
const referenceFilter = ref('');
const showModal = ref(false);
const selectedAccount = ref(null);
const modalDateMin = ref(null);
const modalDateMax = ref(null);
const modalReferenceFilter = ref('');
const sousTotal = {};

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

const resetModalFilters = () => {
    modalDateMin.value = null;
    modalDateMax.value = null;
    modalReferenceFilter.value = '';
};

const openModal = (accountName) => {
    selectedAccount.value = accountName;
    resetModalFilters();
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedAccount.value = null;
};

const balanceData = computed(() => {
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
                    totalDebit: 0,
                    totalCredit: 0,
                };
            }
            grouped[accountName].totalDebit += line.AmtAcctDr || 0;
            grouped[accountName].totalCredit += line.AmtAcctCr || 0;
        });
    });

    return Object.fromEntries(
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    );
});

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
    },
};

const balanceTotals = computed(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    Object.values(balanceData.value).forEach(account => {
        totalDebit += account.totalDebit;
        totalCredit += account.totalCredit;
    });

    return {
        totalDebit,
        totalCredit,
    };
});

const accountLines = computed(() => {
    if (!selectedAccount.value) return [];

    const lines = [];

    const filteredJournals = grandLivre.value.filter(journal => {
        let matches = true;

        const journalDate = new Date(journal.DateAcct);
        if (modalDateMin.value) {
            const minDate = new Date(modalDateMin.value);
            matches = matches && journalDate >= minDate;
        }
        if (modalDateMax.value) {
            const maxDate = new Date(modalDateMax.value);
            maxDate.setHours(23, 59, 59, 999);
            matches = matches && journalDate <= maxDate;
        }

        if (modalReferenceFilter.value) {
            const refLower = modalReferenceFilter.value.toLowerCase();
            matches =
                matches &&
                ((journal.Description || '').toLowerCase().includes(refLower) ||
                    (journal.DocumentNo || '').toLowerCase().includes(refLower));
        }

        return matches;
    });

    filteredJournals.forEach(journal => {
        (journal.GL_JournalLine || []).forEach(line => {
            if (line.Account_ID?.identifier === selectedAccount.value) {
                lines.push({
                    ...line,
                    journalDescription: journal.Description || 'N/A',
                    DocumentNo: journal.DocumentNo || 'N/A',
                    DateAcct: line.DateAcct || journal.DateAcct,
                });
            }
        });
    });

    let totalCr = lines.reduce((sum, item) => sum + item.AmtAcctCr, 0)
    let totalDr = lines.reduce((sum, item) => sum + item.AmtAcctDr, 0)
    let totalSolde = totalCr - totalDr

    const chartData = computed(() => ({
        labels: lines.sort((a, b) => {
            const dateA = new Date(a.DateAcct);
            const dateB = new Date(b.DateAcct);
            return dateA - dateB || a.Line - b.Line;
        }),
        datasets: [
            {
                label: 'Solde',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                data: totalSolde,
                fill: false,
                tension: 0.4,
            },
        ],
    }));


    return lines.sort((a, b) => {
        const dateA = new Date(a.DateAcct);
        const dateB = new Date(b.DateAcct);
        return dateA - dateB || a.Line - b.Line;
    });
});

const runningBalances = computed(() => {
    let runningBalance = 0;
    return accountLines.value.map(line => {
        runningBalance += (line.AmtAcctCr || 0) - (line.AmtAcctDr || 0);
        return runningBalance;
    });
});

const totalDebit = computed(() => {
    return accountLines.value.reduce((sum, line) => sum + (line.AmtAcctDr || 0), 0);
});
const totalCredit = computed(() => {
    return accountLines.value.reduce((sum, line) => sum + (line.AmtAcctCr || 0), 0);
});

onMounted(async () => {
    try {
        const grandLivreResponse = await journalService.getGrandLivre();
        const rawResponse = grandLivreResponse || [];
        grandLivre.value = rawResponse;

        const startDate = '2023-01-01';
        const endDate = '2025-12-31';
        const journalLines = await journalService.getJournalLine(startDate, endDate);
        console.log(journalLines)

        for (let index = 0; index < 7; index++) {
            let totalCr = 0
            let totalDr = 0
            journalLines.forEach(element => {
                const accountValue = element.Account_ID?.identifier?.split('_')[0] || '';
                if (accountValue.startsWith(index + 1)) {
                    totalCr += element.AmtAcctCr || 0
                    totalDr += element.AmtAcctDr || 0
                }
            });
            sousTotal[index] = {
                classe: (index + 1),
                totalCredit: totalCr,
                totalDebit: totalDr,
                totalSolde: (totalCr - totalDr)
            }
        }
        console.log('sousTotal', sousTotal);

        console.log('Données Balance:', grandLivre.value);
    } catch (err) {
        error.value = 'Erreur lors du chargement de la Balance';
        console.error('Erreur API:', err.response ? err.response.data : err.message);
    }
});

const getBalanceClass = (account) => {
    const balance = account.totalCredit - account.totalDebit;
    return balance >= 0 ? 'positive-amount' : 'negative-amount';
};

const getTotalBalanceClass = () => {
    const balance = balanceTotals.value.totalCredit - balanceTotals.value.totalDebit;
    return balance >= 0 ? 'positive-amount' : 'negative-amount';
};

const getRunningBalanceClass = (balance) => {
    return balance >= 0 ? 'positive-amount' : 'negative-amount';
};
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
}

/* Cartes */
.card {
    background-color: #ffffffb8;
    border-radius: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    overflow: hidden;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

/* Tableaux */
.table-container {
    overflow-x: auto;
    padding: 0 1rem;
}

.accounting-table,
.ledger-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.accounting-table th,
.ledger-table th {
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: var(--gray-color);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border-bottom: 2px solid var(--border-color);
    font-family: 'Gendy';
    font-weight: smaller;
    color: #292929;

}

.accounting-table td,
.ledger-table td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

/* Colonnes spécifiques */
.account-col {
    width: 40%;
}

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
    /* background-color: var(--light-color); */
}

.total-row td {
    border-top: 2px solid var(--border-color);
    border-bottom: none;
}

/* Liens de compte */
.account-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--primary-color);
    transition: var(--transition);
}

.account-link:hover {
    color: var(--secondary-color);
}

.account-link i {
    opacity: 0;
    transition: var(--transition);
}

.account-row:hover .account-link i {
    opacity: 1;
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

/* Modale */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(3px);
}

.modal-container {
    background: white;
    border-radius: 10px;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--gray-color);
    transition: var(--transition);
}

.btn-close:hover {
    color: var(--danger-color);
}

.modal-filters {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    align-items: center;
    flex-wrap: wrap;
    background: var(--light-color);
    border-bottom: 1px solid var(--border-color);
}

.filter-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.date-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
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

.btn-primary {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary:hover {
    background: var(--secondary-color);
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

/* Animation modale */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
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

    .account-col {
        width: 35%;
    }

    .amount-col {
        width: 20%;
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
}

@media (max-width: 480px) {
    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .accounting-table td,
    .accounting-table th {
        padding: 0.5rem;
    }
}
</style>