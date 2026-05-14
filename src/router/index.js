import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Balance from '@/views/Balance.vue'
import GrandLivre from '@/views/GrandLivre.vue'
import Import from '@/views/Import.vue'
import Dashboard from '@/views/Dashboard.vue'
import ResetData from '@/views/ResetData.vue'
import SaisieEcriture from '@/views/SaisieEcriture.vue'
import SImportMultiple from '@/views/SImportMultiple.vue'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login
    },
    {
        path: '/dashboard',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: Dashboard
            }
        ]
    },
    {
        path: '/balance',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'Balance',
                component: Balance
            }
        ]
    },
    {
        path: '/grandLivre',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'GrandLivre',
                component: GrandLivre
            }
        ]
    },
    {
        path: '/import',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'Import',
                component: Import
            }
        ]
    },
    {
        path: '/saisieEcriture',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'SaisieEcriture',
                component: SaisieEcriture
            }
        ]
    },
    {
        path: '/resetdata',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'ResetData',
                component: ResetData
            }
        ]
    },
    {
        path: '/importMultiple',
        name: 'SImportMultiple',
        component: SImportMultiple
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
