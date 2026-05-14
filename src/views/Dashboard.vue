<template>
    <div class="financial-view">
        <div class="header-row">
            <h1>Évolution financière</h1>
            <div class="filters">
                <select id="year-filter" v-model="selectedYear" class="form-select">
                    <option v-for="year in availableYears" :key="year" :value="year">
                        {{ year }}
                    </option>
                </select>
            </div>
        </div>

        <div v-if="error" class="status-message error">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
        </div>

        <!-- Chart -->
        <div class="chart-container">
            <Line v-if="chartData.datasets.length" :data="chartData" :options="chartOptions" />
        </div>

        <!-- Table -->
        <div class="table-container">
            <div class="table-responsive">
                <table class="financial-table">
                    <thead>
                        <tr>
                            <th @click="sortData('mois')">Mois
                                <span v-if="sortKey === 'mois'">{{ sortOrder === 1 ? '↑' : '↓' }}</span>
                            </th>
                            <th @click="sortData('chiffreAffaires')">Chiffre d'affaires
                                <span v-if="sortKey === 'chiffreAffaires'">{{ sortOrder === 1 ? '↑' : '↓' }}</span>
                            </th>
                            <th @click="sortData('charges')">Charges
                                <span v-if="sortKey === 'charges'">{{ sortOrder === 1 ? '↑' : '↓' }}</span>
                            </th>
                            <th>Résultat net</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in sortedAndFilteredData" :key="`${item.mois}-${item.annee}`">
                            <td>{{ item.mois }}</td>
                            <td :class="getClass(item.chiffreAffaires)">{{ formatCurrency(item.chiffreAffaires) }}</td>
                            <td :class="getClass(item.charges)">{{ formatCurrency(item.charges) }}</td>
                            <td :class="getNetResultClass(item)">
                                {{ formatCurrency(calculateNetResult(item)) }}
                                <!-- <span class="percentage">({{ calculatePercentage(item) }}%)</span> -->
                            </td>
                        </tr>
                        <tr class="total-row">
                            <td>Total</td>
                            <td :class="getClass(totalCA)">{{ formatCurrency(totalCA) }}</td>
                            <td :class="getClass(totalCharges)">{{ formatCurrency(totalCharges) }}</td>
                            <td :class="totalResult >= 0 ? 'positive-amount' : 'negative-amount'">
                                {{ formatCurrency(totalResult) }}
                                <!-- <span class="percentage">({{ totalPercentage }}%)</span> -->
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Uncomment if you want to restore the export button -->
        <!-- <div class="actions">
            <button @click="exportToCSV" class="btn-export">
                <i class="fas fa-download"></i> Exporter en CSV
            </button>
        </div> -->
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

const journalLines = ref([]);
const selectedYear = ref('2025');
const sortKey = ref('mois');
const sortOrder = ref(-1);
const error = ref(null);

const moisOrder = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

const getClass = (val) => {
    return val >= 0 ? 'positive-amount' : 'negative-amount';
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount || 0);
};

const financialData = computed(() => {
    const dataByMonth = {};

    moisOrder.forEach(mois => {
        const key = `${mois}-${selectedYear.value}`;
        dataByMonth[key] = {
            mois,
            annee: selectedYear.value,
            chiffreAffaires: 0,
            charges: 0,
        };
    });

    journalLines.value.forEach(line => {
        const date = new Date(line.DateAcct);
        const mois = date.toLocaleString('fr-FR', { month: 'long' });
        const annee = date.getFullYear().toString();
        const key = `${mois}-${annee}`;
        const accountValue = line.Account_ID?.identifier?.split('_')[0] || '';

        if (annee === selectedYear.value) {
            if (!dataByMonth[key]) {
                dataByMonth[key] = {
                    mois,
                    annee,
                    chiffreAffaires: 0,
                    charges: 0,
                };
            }

            if (accountValue.startsWith('7')) {
                dataByMonth[key].chiffreAffaires += (line.AmtAcctCr || 0) - (line.AmtAcctDr || 0);
                // console.log(`${key} += ${line.AmtAcctCr} - ${line.AmtAcctDr}`)
            } else if (accountValue.startsWith('6')) {
                dataByMonth[key].charges += (line.AmtAcctDr || 0) - (line.AmtAcctCr || 0);
            }
        }
    });



    return Object.values(dataByMonth);
});

const availableYears = computed(() => {
    const years = new Set(journalLines.value.map(line => new Date(line.DateAcct).getFullYear().toString()));
    return Array.from(years).sort((a, b) => a - b);
});

const filteredData = computed(() => {
    return financialData.value.filter(item => item.annee === selectedYear.value);
});

const sortedAndFilteredData = computed(() => {
    return [...filteredData.value].sort((a, b) => {
        let valueA = a[sortKey.value];
        let valueB = b[sortKey.value];

        if (sortKey.value === 'mois') {
            valueA = moisOrder.indexOf(a.mois.toLowerCase());
            valueB = moisOrder.indexOf(b.mois.toLowerCase());
        }

        if (valueA < valueB) return sortOrder.value;
        if (valueA > valueB) return -sortOrder.value;
        return 0;
    });
});

const chartData = computed(() => ({
    labels: moisOrder,
    datasets: [
        {
            label: 'Chiffre d\'affaires',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            data: moisOrder.map(mois => {
                const item = sortedAndFilteredData.value.find(item => item.mois.toLowerCase() === mois.toLowerCase());
                return item ? item.chiffreAffaires : 0;
            }),
            fill: false,
            tension: 0.4,
        },
        {
            label: 'Charges',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: moisOrder.map(mois => {
                const item = sortedAndFilteredData.value.find(item => item.mois.toLowerCase() === mois.toLowerCase());
                return item ? item.charges : 0;
            }),
            fill: false,
            tension: 0.4,
        },
        {
            label: 'Résultat net',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            data: moisOrder.map(mois => {
                const item = sortedAndFilteredData.value.find(item => item.mois.toLowerCase() === mois.toLowerCase());
                return item ? calculateNetResult(item) : 0;
            }),
            fill: false,
            tension: 0.4,
        },
    ],
}));

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
    },
};

const totalCA = computed(() => {
    return filteredData.value.reduce((sum, item) => sum + item.chiffreAffaires, 0);
});

const totalCharges = computed(() => {
    return filteredData.value.reduce((sum, item) => sum + item.charges, 0);
});

const totalResult = computed(() => {
    return totalCA.value - totalCharges.value;
});

const totalPercentage = computed(() => {
    return totalCA.value > 0
        ? ((totalResult.value / totalCA.value) * 100).toFixed(2)
        : '0.00';
});

const calculateNetResult = (item) => {
    // console.log(item)
    return (item.chiffreAffaires) - (item.charges);
};

const calculatePercentage = (item) => {
    return item.chiffreAffaires > 0
        ? ((calculateNetResult(item) / item.chiffreAffaires) * 100).toFixed(2)
        : '0.00';
};

const getNetResultClass = (item) => {
    return calculateNetResult(item) >= 0 ? 'positive-amount' : 'negative-amount';
};

const sortData = (key) => {
    if (sortKey.value === key) {
        sortOrder.value *= -1;
    } else {
        sortKey.value = key;
        sortOrder.value = 1;
    }
};

const exportToCSV = () => {
    const headers = ['Mois', 'Année', 'Chiffre d\'affaires', 'Charges', 'Résultat net', 'Marge (%)'];
    const csvContent = [
        headers.join(';'),
        ...sortedAndFilteredData.value.map(item =>
            [
                item.mois,
                item.annee,
                item.chiffreAffaires,
                item.charges,
                calculateNetResult(item),
                calculatePercentage(item),
            ].join(';')
        ),
        [
            'Total',
            '',
            totalCA.value,
            totalCharges.value,
            totalResult.value,
            totalPercentage.value,
        ].join('\n')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `donnees-financieres-${selectedYear.value}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

onMounted(async () => {
    try {
        const startDate = '2023-01-01';
        const endDate = '2025-12-31';
        const journalServiceResponse = await journalService.getJournalLine(startDate, endDate);
        journalLines.value = journalServiceResponse || [];
        console.log('Données JournalLine:', journalLines.value);
    } catch (err) {
        error.value = 'Erreur lors du chargement de la JournalLine';
        console.error('Erreur API:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            url: err.config?.url,
        });
    }
});
</script>

<style scoped>
/* CSS Variables (consistent with previous views) */
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

/* Main container */
.financial-view {
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    color: var(--dark-color);
    line-height: 1.6;
}

/* Header row */
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.financial-view h1 {
    font-family: 'Gendy', sans-serif;
    color: var(--dark-color);
    word-spacing: 10px;
    font-size: 2.2rem;
    margin: 0;
}

/* Filters */
.filters select {
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 15px;
    background-color: #ffffffb8;
    color: var(--dark-color);
    box-shadow: var(--shadow);
    border: none;
    transition: var(--transition);
}

.filters select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

/* Status message */
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

/* Chart container */
.chart-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    height: 450px;
    box-sizing: border-box;
    padding: 15px;
    background: #ffffffb8;
    border-radius: 15px;
    box-shadow: var(--shadow);
    margin-bottom: 20px;
}

/* Table container */
.table-container {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    border-radius: 15px;
    overflow: hidden;
}

/* Table responsive */
.table-responsive {
    overflow-x: auto;
}

/* Financial table */
.financial-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: #ffffffb8;
    border-radius: 8px;
    box-shadow: var(--shadow);
}

.financial-table thead th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: var(--gray-color);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border-bottom: 2px solid var(--border-color);
    cursor: pointer;
    transition: var(--transition);font-family: 'Gendy';font-weight: smaller; color: #292929;
    
}

.financial-table thead th:hover {
    background-color: var(--light-color);
}

.financial-table tbody tr:not(.total-row):hover {
    background-color: rgba(67, 97, 238, 0.05);
}

.financial-table tbody td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color);
    color: var(--dark-color);
}

.financial-table .total-row {
    font-weight: 600;
    background-color: var(--light-color);
}

.financial-table .total-row td {
    border-top: 2px solid var(--border-color);
    border-bottom: none;
}

/* Result and percentage styles */
.positive {
    color: var(--success-color);
}

.negative {
    color: var(--danger-color);
}

.percentage {
    font-size: 0.85em;
    margin-left: 4px;
    opacity: 0.8;
    color: var(--gray-color);
}

/* Sort arrows */
.financial-table thead th span {
    margin-left: 4px;
    font-size: 0.9em;
}

.financial-table thead th[clickable]:after {
    content: "↕";
    opacity: 0.3;
    margin-left: 5px;
    font-size: 0.8em;
}

.financial-table thead th[clickable]:hover:after {
    opacity: 0.6;
}

/* Actions (for export button if uncommented) */
.actions {
    margin-top: 20px;
    text-align: right;
}

.btn-export {
    padding: 10px 20px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-export:hover {
    background-color: var(--secondary-color);
}

.positive-amount {
    color: var(--success-color);
}

.negative-amount {
    color: var(--danger-color);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .header-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .financial-table {
        font-size: 0.8rem;
    }

    .financial-table th,
    .financial-table td {
        padding: 10px 12px;
    }
}

@media (max-width: 480px) {
    .financial-view h1 {
        font-size: 1.8rem;
    }

    .filters select {
        width: 100%;
        padding: 10px;
    }

    .financial-table th,
    .financial-table td {
        padding: 8px 10px;
    }
}
</style>