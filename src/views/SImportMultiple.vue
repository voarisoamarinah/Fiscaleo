<template>
  <nav class="navbar">
    <div class="navbar-links">
      <router-link to="/balance">
        <span>Balance</span>
      </router-link>
      <router-link to="/grandLivre">
        <span>GrandLivre</span>
      </router-link>
      <router-link to="/dashboard">
        <span>Dashboard</span>
      </router-link>
      <router-link to="/import">
        <span>Import</span>
      </router-link>
      <router-link to="/importMultiple">
        <span>Import Multiple</span>
      </router-link>
    </div>
  </nav>
  <div class="container">
    <h2 class="title">Importation CSV</h2>
    <input type="file" multiple accept=".csv" @change="handleFiles" class="select-categorie" />
  </div>
</template>

<script setup>
import Papa from 'papaparse';
import { computed, ref } from 'vue';
import ImportMultiple from '@/services/ImportMultiple';

const importService = new ImportMultiple();
const parsedData = ref([]);
const headersRequire = ["compte", "libelle"];
const valueLoad = ref(0);

const loading = computed({
  get: () => valueLoad.value,
  set: (val) => {
    valueLoad.value = val;
  }
});

function parseCSV(file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          file,
          filename: file.name,
          headers: results.meta.fields,
          rows: results.data,
        });
      },
    });
  });
}

function hasRequiredHeaders(headers) {
  if (!headers) return false;
  return headersRequire.every(h => headers.includes(h));
}

async function handleFiles(event) {
  const files = Array.from(event.target.files);
  parsedData.value = [];

  loading.value = 1;
  const parsedResults = await Promise.all(files.map(file => parseCSV(file)));

  const withRequiredHeaders = parsedResults.filter(res => hasRequiredHeaders(res.headers));
  const withoutRequiredHeaders = parsedResults.filter(res => !hasRequiredHeaders(res.headers));

  for (const result of withRequiredHeaders) {
    await importService.createCompte(result);
    parsedData.value.push(result);
    console.log('Fichier traité (compte): ', result.filename);
  }

  for (const result of withoutRequiredHeaders) {
    await importService.setJournal(result);
    parsedData.value.push(result);
    console.log('Fichier traité (journal) :', result.filename);
  }

  setTimeout(() => {
    loading.value = 0;
  }, 1000);
  loading.value = 2;
}

</script>
<style scoped>
.container {
  padding: 3%;
}

.title {
  text-align: center;
  margin-bottom: 1rem;
  font-family: 'ALATA';
}

.input-recherche,
.select-categorie {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 50%;
  transition: width 0.3s ease-in-out, border-color 0.3s ease-in-out;
}

.input-recherche:focus {
  border: 1px solid #007bff;
  width: 80%;
}

@media (max-width: 600px) {
  .galerie {
    grid-template-columns: repeat(2, 0.49fr);
  }
}
</style>