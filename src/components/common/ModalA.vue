<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <header class="modal-header">
                <h2 class="modal-title">
                    <slot name="title" />
                </h2>
            </header>

            <section class="modal-body">
                <slot name="body" />
            </section>

            <footer class="modal-footer">
                <slot name="footer" />
            </footer>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'Modal'
}
</script>
  
<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 25, 26, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 2rem;
    overflow-y: auto;
}

.modal-content {
    background: #123c3e;
    border: 2px dotted var(--primary-color);
    color: #ebebeb;
    border-radius: 35px;
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.4);
    max-width: 850px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    overflow: hidden;
}

.modal-header {
    border-bottom: 1px solid rgba(7, 155, 163, 0.3);
    padding-bottom: 1rem;
    text-align: center;
}

.modal-title {
    font-size: 1.8rem;
    margin: 0;
    color: #00c9c8;
}

.modal-body {
    overflow-y: auto;
    padding: 1rem 0;
    flex-grow: 1;
}

.modal-footer {
    display: flex;
    justify-content: center;
    gap: 1rem;
    border-top: 1px solid rgba(7, 155, 163, 0.3);
    padding-top: 1rem;
    margin-top: 1rem;
}

::v-deep(.modal-footer button) {
  padding: 0.6rem 1.5rem;
  background-color: #079ba3;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

::v-deep(.modal-footer button:hover) {
  background-color: #057e84;
}
</style>
