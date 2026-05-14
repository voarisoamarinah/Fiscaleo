import { ref } from 'vue';
import apiClient from './api.js';

export function useDeleteAccountingRecords() {
    const isDeleting = ref(false);
    const deleteResult = ref(null);
    const deleteError = ref(null);

    async function deleteAllAccountingRecords() {
        isDeleting.value = true;
        deleteResult.value = null;
        deleteError.value = null;

        const result = {
            deleted: {
                GL_JournalLine: [],
                GL_Journal: [],
                C_ElementValue: [],
            },
            errors: [],
        };

        try {
            let lines = await apiClient.get('/models/GL_JournalLine', {
                params: {
                    $select: 'GL_JournalLine_ID',
                    $top: 100,
                },
            });

            while (lines.records.length > 0) {
                for (const line of lines.records) {
                    try {
                        await apiClient.delete(`/models/GL_JournalLine/${line.id}`);
                        console.log("suppr line " + line.id)
                        result.deleted.GL_JournalLine.push(line.id);
                    } catch (error) {
                        result.errors.push(
                            `Erreur lors de la suppression de GL_JournalLine_ID ${line.id}: ${error.response ? error.response.message : error.message
                            } `
                        );
                    }
                }

                lines = await apiClient.get('/models/GL_JournalLine', {
                    params: {
                        $select: 'GL_JournalLine_ID',
                        $top: 100,
                        $skip: result.deleted.GL_JournalLine.length,
                    },
                });
            }

            let journals = await apiClient.get('/models/GL_Journal', {
                params: {
                    $select: 'GL_Journal_ID,DocumentNo',
                    $top: 100,
                },
            });

            while (journals.records.length > 0) {
                for (const journal of journals.records) {
                    try {
                        await apiClient.delete(`/models/GL_Journal/${journal.id}`);
                        console.log("suppr journal " + journal.id)
                        result.deleted.GL_Journal.push({ journalId: journal.id, documentNo: journal.DocumentNo });
                    } catch (error) {
                        result.errors.push(
                            `Erreur lors de la suppression de GL_Journal_ID ${journal.id} (DocumentNo: ${journal.DocumentNo}): ${error.response ? error.response.message : error.message
                            }`
                        );
                    }
                }

                journals = await apiClient.get('/models/GL_Journal', {
                    params: {
                        $select: 'GL_Journal_ID,DocumentNo',
                        $top: 100,
                        $skip: result.deleted.GL_Journal.length,
                    },
                });
            }

            const usageCheck = await apiClient.get('/models/GL_JournalLine', {
                params: {
                    $select: 'GL_JournalLine_ID',
                    $top: 1,
                },
            });

            if (usageCheck.records.length > 0) {
                result.errors.push('Impossible de supprimer C_ElementValue : des comptes sont encore utilisés dans GL_JournalLine');
            } else {
                let accounts = await apiClient.get('/models/C_ElementValue', {
                    params: {
                        $select: 'C_ElementValue_ID,Value',
                        $top: 100,
                    },
                });

                while (accounts.records.length > 0) {
                    for (const account of accounts.records) {
                        try {
                            await apiClient.delete(`/models/C_ElementValue/${account.id}`);
                            console.log("suppr account " + journal.id)
                            result.deleted.C_ElementValue.push(account.id);
                        } catch (error) {
                            result.errors.push(
                                `Erreur lors de la suppression de C_ElementValue_ID ${account.id} (Value: ${account.Value}): ${error.response ? error.response.message : error.message
                                }`
                            );
                        }
                    }

                    accounts = await apiClient.get('/models/C_ElementValue', {
                        params: {
                            $select: 'C_ElementValue_ID,Value',
                            $top: 100,
                            $skip: result.deleted.C_ElementValue.length,
                        },
                    });
                }
            }

            deleteResult.value = result;
            return result;
        } catch (error) {
            result.errors.push(`Erreur générale: ${error.response ? error.response.message : error.message} `);
            deleteError.value = result.errors.join(', ');
            throw new Error(deleteError.value);
        } finally {
            isDeleting.value = false;
        }
    }

    return {
        deleteAllAccountingRecords,
        isDeleting,
        deleteResult,
        deleteError,
    };
}
