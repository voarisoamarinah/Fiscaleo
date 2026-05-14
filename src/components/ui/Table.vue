<template>
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr class="table-header">
                    <th v-for="(header, index) in headers" :key="index">{{ header.text }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in data" :key="rowIndex" @click="$emit('row-click', row)" class="table-row">
                    <td v-for="(header, colIndex) in headers" :key="colIndex">
                        {{ formatCell(getNestedValue(row, header.key) || '-') }}
                    </td>
                </tr>
            </tbody>
            <tfoot v-if="showFooter" class="table-footer">
                <tr>
                    <td :colspan="headers.length - 1">Total</td>
                    <td>{{ formatPrice(total) }}</td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>
  
<script>
export default {
    name: 'DataTable',
    props: {
        headers: {
            type: Array,
            required: true,
            validator: value => value.every(h => typeof h === 'string' || typeof h === 'object')
        },
        data: {
            type: Array,
            required: true
        },
        showFooter: {
            type: Boolean,
            default: false
        },
        total: {
            type: Number,
            default: 0
        }
    },
    methods: {
        formatPrice(price) {
            // return new Intl.NumberFormat('fr-FR', {
            //     style: 'currency',
            //     currency: 'EUR'
            // }).format(price)
            return price
        },
        getNestedValue(obj, path) {
            return path.split('.').reduce((acc, key) => acc && acc[key], obj)
        },
        formatCell(value) {
            if (typeof value === 'number') {
                return this.formatPrice(value)
            }
            return value
        }
    }
}
</script>
  
<style scoped>
.table-container {
    overflow-x: auto;
    margin: 1rem 0;
    border-radius: 10px;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Radibta', sans-serif;
}

.table-header {
    background: rgba(7, 155, 163, 0.7);
}

.table-header th {
    padding: 15px;
    text-align: left;
    color: white;
    font-weight: 600;
}

.table-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: background-color 0.3s ease;
}

.table-row:hover {
    background-color: rgba(7, 155, 163, 0.1);
}

.table-row td {
    padding: 12px 15px;
    color: #ebebeb;
}

.table-footer {
    background: rgba(7, 155, 163, 0.3);
    font-weight: 600;
}

.table-footer td {
    padding: 15px;
}

@media (max-width: 768px) {

    .table-header th,
    .table-row td,
    .table-footer td {
        padding: 10px 8px;
        font-size: 0.9rem;
    }
}
</style>