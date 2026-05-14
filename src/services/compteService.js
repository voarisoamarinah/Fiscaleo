import apiClient from './api';

const getCompte = async () => {
    try {
        const allRecords = [];
        const pageSize = 100;
        let skip = 0;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
            // console.log(`Récupération de la page avec $skip=${skip}, $top=${pageSize}`);
            const response = await apiClient.get('/models/C_ElementValue', {
                params: {
                    $top: pageSize,
                    $skip: skip,
                },
            });

            const records = response.records || response || [];
            // console.log(`Page récupérée: ${records.length} enregistrements`);

            allRecords.push(...records);

            hasMoreRecords = records.length === pageSize;
            skip += pageSize;

            if (skip > 10000) {
                console.warn('Limite de pagination atteinte (skip > 10000). Arrêt.');
                hasMoreRecords = false;
            }
        }

        // console.log(`Total enregistrements récupérés: ${allRecords.length}`);
        return allRecords;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Erreur lors de la requête API:', errorMessage);
        throw new Error(`Échec de la récupération des données GL_Journal: ${errorMessage}`);
    }
};

const createCompte = async (data) => {
    try {
        if (data.existeDeja != true) {
            const compte = {
                AD_Client_ID: 11,
                AD_Org_ID: 11,
                Value: data.compte,
                Name: data.libelle,
                C_Element_ID: 105
            };
            const response = await apiClient.post('/models/C_ElementValue', compte);
            return response
        }
        return data;
    } catch (error) {
        console.error('Erreur lors de la création du compte:', {
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Échec de la création du compte: ${error.message}`);
    }
};

const compteExist = async (value) => {
    try {
        const response = await apiClient.get(`/models/C_ElementValue?$filter=Value eq '${value}' AND IsActive eq true`);

        return Boolean(response?.records?.length);
    } catch (error) {
        console.error('Erreur lors de la vérification du compte:', error);
        return false;
    }
};

const getCompteById = async (value) => {
    try {
        return await apiClient.get(`/models/C_ElementValue?$filter=Value eq '${value}' AND IsActive eq true`);
    } catch (error) {
        console.error('Erreur lors de la vérification du compte:', error);
        return false;
    }
};

const updateCompte = async (value, data) => {
    try {
        const compte = {
            Value: data.compte || value,
            Name: data.libelle,
            AD_Client_ID: 11,
            AD_Org_ID: 11,
            C_Element_ID: 105
        };
        const response = await apiClient.put(`/models/C_ElementValue/${value}`, compte);
        return response;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du compte:', {
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Échec de la mise à jour du compte: ${error.message}`);
    }
};

const deleteCompte = async (value) => {
    try {
        const response = await apiClient.delete(`/models/C_ElementValue/${value}`);
        return response;
    } catch (error) {
        console.error('Erreur lors de la suppression du compte:', {
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Échec de la suppression du compte: ${error.message}`);
    }
};

export default {
    createCompte,
    compteExist,
    getCompteById,
    updateCompte,
    deleteCompte,
    getCompte
};