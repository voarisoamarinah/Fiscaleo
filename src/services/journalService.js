import apiClient from './api';

const getGrandLivre = async () => {
    try {
        const allRecords = [];
        const pageSize = 100;
        let skip = 0;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
            // console.log(`Récupération de la page avec $skip=${skip}, $top=${pageSize}`);
            const response = await apiClient.get('/models/GL_Journal', {
                params: {
                    $filter: 'GL_Category_ID eq 1000000',
                    $expand: 'GL_JournalLine',
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

const getJournalLine = async (startDate, endDate) => {
    if (!startDate || !endDate) {
        throw new Error('Les paramètres startDate et endDate sont requis.');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        throw new Error('Les dates doivent être au format YYYY-MM-DD.');
    }

    if (new Date(startDate) > new Date(endDate)) {
        throw new Error('La date de début doit être antérieure ou égale à la date de fin.');
    }

    try {
        const allRecords = [];
        const pageSize = 100;
        let skip = 0;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
            // console.log(`Récupération de la page avec $skip=${skip}, $top=${pageSize}, startDate=${startDate}, endDate=${endDate}`);
            const response = await apiClient.get('/models/GL_JournalLine', {
                params: {
                    $filter: `DateAcct ge '${startDate}' and DateAcct le '${endDate}'`,
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
        throw new Error(`Échec de la récupération des données GL_JournalLine: ${errorMessage}`);
    }
};

const createJournal = async (data) => {
    try {
        const dateIso = data.date.replace(' ', 'T');
        const c_p_id = await findPeriodId(dateIso);

        // if (c_p_id !== null && c_p_id !== undefined) {
        const journal = {
            AD_Client_ID: 11,
            AD_Org_ID: 11,
            C_AcctSchema_ID: 101,
            C_DocType_ID: 115,
            C_Period_ID: c_p_id,
            Description: data.reference,
            PostingType: 'A',
            GL_Category_ID: 1000000,
            DateAcct: dateIso,
            DateDoc: dateIso
        };
        console.log('Journal à créer :', journal);

        const response = await apiClient.post('/models/GL_Journal', journal);
        return response;
        // }
    } catch (error) {
        console.error('Erreur lors de la création du journal :', {
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Échec de la création du journal : ${error.message}`);
    }
};

const createJournalLine = async (data, journal, compte, line) => {
    try {
        // console.log(data.date)
        const dateIso = data.date.replace(' ', 'T');
        const c_p_id = await findPeriodId(dateIso);
        // console.log(dateIso)


        const journalline = {
            AD_Client_ID: 11,
            AD_Org_ID: 11,
            GL_Journal_ID: journal.id,
            Account_ID: compte.id,
            Line: line,
            C_Currency_ID: 100,
            DateAcct: dateIso,
            AmtAcctDr: Number(data.debit),
            AmtAcctCr: Number(data.credit),
            AmtSourceDr: Number(data.debit),
            AmtSourceCr: Number(data.credit)
        };
        console.log('Journal Line à créer :', journalline);

        const response = await apiClient.post('/models/GL_JournalLine', journalline);
        console.log('Journal Line created:', response);
        return response;

    } catch (error) {
        console.error('Erreur lors de la création du journal Line :', {
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Échec de la création du journal Line : ${error.message}`);
    }
};

const createJournalLine1 = async (data, journal, compte, line) => {
    try {
        const journalline = {
            AD_Client_ID: 11,
            AD_Org_ID: 11,
            GL_Journal_ID: journal.id,
            Account_ID: compte.id,
            Line: line,
            C_Currency_ID: 100,
            DateAcct: data.date,
            AmtAcctDr: Number(data.debit),
            AmtAcctCr: Number(data.credit),
            AmtSourceDr: Number(data.debit),
            AmtSourceCr: Number(data.credit)
        };
        console.log('Journal Line à créer :', journalline);

        const response = await apiClient.post('/models/GL_JournalLine', journalline);
        console.log('Journal Line created:', response);
        return response;

    } catch (error) {
        console.error('Erreur lors de la création du journal Line :', {
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Échec de la création du journal Line : ${error.message}`);
    }
};

const findPeriodId = async (date) => {
    const isoDate = new Date(date).toISOString().split('.')[0];
    const response = await apiClient.get(`/models/C_Period`, {
        params: {
            '$filter': `IsActive eq true and StartDate le ${isoDate} and EndDate ge ${isoDate}`
        }
    });

    // console.log(response)

    if (response.records && response.records.length > 0) {
        return response.records[0].id;
    }

    throw new Error(`Aucune période active ouverte trouvée pour la date ${date}`);
};

const journalExist = async (value) => {
    try {
        const response = await apiClient.get(`/models/GL_Journal?$filter=Description eq '${value}' AND IsActive eq true`);
        return response.records || [];
    } catch (error) {
        console.error('Erreur lors de la vérification du journal :', error);
        return [];
    }
};

export default {
    getGrandLivre,
    createJournal,
    journalExist,
    findPeriodId,
    createJournalLine,
    createJournalLine1,
    getJournalLine
};
