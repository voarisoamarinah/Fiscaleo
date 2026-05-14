<template>
    <div class="input">
        <label v-if="label" :for="id" class="input-label">{{ label }}</label>
        <input :id="id" :type="type" :value="value" :placeholder="placeholder" :disabled="disabled"
            @input="$emit('input', $event.target.value)" class="input" />
        <span v-if="error" class="input-error">{{ error }}</span>
    </div>
</template>
  
<script>
export default {
    props: {
        id: String,
        value: [String, Number],
        type: {
            type: String,
            default: 'text'
        },
        label: String,
        placeholder: String,
        error: String,
        disabled: Boolean
    }
}
</script>

<style scoped>
input {
    width: 100%;
    padding: 14px 25px 14px 25px;
    border: none !important;
    outline: none !important;
    border-radius: 30px;
    font-size: 0.9rem;
    transition: all 0.3s;
    box-sizing: border-box;
    background-color: #156367;
    color: white;
}

input:focus {
    border: none;
    outline: none;
    background-color: #079BA3;
}

input::placeholder {
    color: rgba(255, 255, 255, 0.7);
}

input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.input-label {
    display: block;
    margin-left: 1.5rem;
    margin-bottom: 0.5rem;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
}

.input-error {
    display: block;
    margin-left: 1.5rem;
    color: var(--danger-color);
    font-size: 0.9rem;
    opacity: 10;
}

</style>