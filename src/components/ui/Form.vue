<template>
    <form class="form" @submit.prevent="handleSubmit">
        <h3>{{ title }}</h3>

        <Input v-for="field in fields" :key="field.id" v-model="formData[field.id]" :id="field.id"
            :type="field.type || 'text'" :label="field.label" :placeholder="field.placeholder" :error="errors[field.id]" />

        <Button type="submit">
            {{ boutonTxt }}
        </Button>
    </form>
</template>
  
<script>
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'

export default {
    name: 'Form',
    components: { Input, Button },
    props: {
        title: {
            type: String,
            default: 'Exemple formulaire'
        },
        boutonTxt: {
            type: String,
            default: 'Valider'
        },
        fields: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            formData: {
                name: '',
                email: '',
                age: null
            },
            errors: {}
        }
    },
    created() {
        this.formData = Object.fromEntries(this.fields.map(field => [field.id, '']));
    },
    methods: {
        handleSubmit() {
            this.errors = {}
            this.fields.forEach(field => {
                if (field.required && !this.formData[field.id]) {
                    this.errors[field.id] = `${field.label} est requis.`
                }
            })
            if (Object.keys(this.errors).length === 0) {
                alert('Formulaire soumis avec succès !')
                this.formData = Object.fromEntries(this.fields.map(f => [f.id, '']))
            }
        }
    }
}
</script>
  
  
<style scoped>
.form {
    background: var(--primary-color);
    padding: 1.5rem;
    border-radius: 45px;
    box-shadow: 0 15px 15px -3px #123c3e73;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.form h3 {
    color: #ffffff;
    text-align: center;
    margin: 0rem 1.5rem 0rem 1.5rem;
    font-size: 1.8rem;
    font-weight: 600;
}
</style>
