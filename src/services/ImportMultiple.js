import apiClient from './api';

const token = 'eyJraWQiOiJpZGVtcGllcmUiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTdXBlclVzZXIiLCJBRF9DbGllbnRfSUQiOjExLCJBRF9Vc2VyX0lEIjoxMDAsIkFEX1JvbGVfSUQiOjEwMiwiQURfT3JnX0lEIjowLCJBRF9MYW5ndWFnZSI6ImVuX1VTIiwiQURfU2Vzc2lvbl9JRCI6MTAwMDAxNSwiaXNzIjoiaWRlbXBpZXJlLm9yZyIsImV4cCI6MTIxNzQ4NjI0MTE5fQ.pMb2i2AQ2rTQWMcLejkvtU43XHQUgm47lLBu-oG6BVzp4-7UDcGNn_s1id8mfF1zq-lqaIwYHY4vlYUyVF8OQA';
const m_AD_Client_ID = 11;
const m_AD_Org_ID = 0;
class ImportMultiple {
    getCurrentLocalISODate() {
        const date = new Date();
        const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
        return new Date(date - tzOffsetMs)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
    }

    async createCompte(file) {
        const tab = [];
        try {
            console.log('🟢 Creation compte :', file.filename);
            for (const row of file.rows) {
                tab.push(row);
            }

            for (let index = 0; index < tab.length; index++) {
                const element = tab[index];
                console.log("Compte: ", element.compte, " libelle: ", element.libelle);
                const body =
                {
                    Value: Number(element.compte),
                    Name: String(element.libelle),
                    C_Element_ID: 105
                };

                if (await this.verifieCompte(element.compte)==0) {
                    const response = await apiClient.post('/models/c_elementvalue', body, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                    });
                    console.log("Reponse: ", response);
                }
                console.warn("Deja exister");
            }
        } catch (error) {
            console.error("Error de creation compte: ", error);
            throw error;
        }
    }

    async verifieCompte(value) {
        try {
            const response = await apiClient.get('/models/c_elementvalue', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    $filter: `value eq '${value}'`
                }
            });
            // console.log("verifieCompte: ",response);
            // return response.records.length;
            if (response.records.length==0) {
                return 0;
            }
            return response.records[0].id;
        } catch (error) {
            console.error("Erreur de verifieCompte: ", error);
            throw error;
        }
    }

    verifie_date(dateString) {
        // Supposé format jj/mm/yyyy
        const parts = dateString.split('/');
        if (parts.length !== 3) {
            console.warn("Format de date invalide :", dateString);
            return null;
        }

        const [day, month, year] = parts.map(part => parseInt(part, 10));

        // Vérifie si les valeurs sont correctes
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            console.warn("Composants de date non valides :", dateString);
            return null;
        }

        // Construction d'une date valide
        const date = new Date(year, month - 1, day); // Mois = 0-indexé
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            console.warn("Date invalide (hors calendrier) :", dateString);
            return null;
        }

        return date;
    }

    async creationJournal(date, ref, journal) {
        try {
            // Convert date from dd/MM/yyyy to yyyy-MM-dd
            const formattedDate = date.split('/').reverse().join('-');
            
            const body = {
                AD_Client_ID: 11,
                AD_Org_ID: 11,
                DateDoc: formattedDate,
                // GL_JournalBatch_ID: 100,
                // DocStatus: 'DR',
                C_Period_ID:155,
                DocumentNo: ref,
                Description: journal,
                DateAcct: formattedDate,
                C_DocType_ID: 115,
                GL_Category_ID: 108,
                C_AcctSchema_ID: 101
            };
            const response = await apiClient.post('/models/gl_journal', body, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            console.log("creationJournal succes: ", response);
        } catch (error) {
            console.error("creationJournal: ", error);
            throw error;
        }
    }

    async verificationJournal(date, ref, journal)
    {
        try {
            const formattedDate = date.split('/').reverse().join('-');
            const response=await apiClient.get('/models/gl_journal',{
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    $filter: `DocumentNo eq '${ref}' and DateDoc eq '${formattedDate}' and Description eq '${journal}'`
                }
            });
            console.log("verificationJournal: ",response);
            if (response.records.length==0) {
                return 0;
            }
            return response.records[0].id;
            // return response.records.length;
        } catch (error) {
            throw error;
        }
    }

    async creationJournalLine(line,ref, date, compte, debit, credit, gl_journal_id) {
        try {
            const formattedDate = date.split('/').reverse().join('-');
            console.log("Compte: ",compte);
            
            const body =
            {
                GL_Journal_ID: gl_journal_id,
                Account_ID: compte,
                AmtAcctDr: Number(debit),
                AmtAcctCr: Number(credit),
                AmtSourceDr: Number(debit),
                AmtSourceCr: Number(credit),
                DateAcct: formattedDate,
                Description: ref,
                Line:line
            };
            const response = await apiClient.post('/models/gl_journalline', body, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            console.log("creationJournalLine success: ", response);
        } catch (error) {
            console.error("creationJournalLine: ", error);
        }
    }

    // async creationFact_acct(date,ref,compte,debit,credit)
    // {
    //     try {
    //         const body=
    //         {
    //             DateAcct: date,
    //             DocumentNo: ref,
    //             C_ElementValue_ID: compte,
    //             AmtAcctDr: debit,
    //             AmtAcctCr: credit,
    //         };
    //     } catch (error) {
    //         throw error;
    //     }
    // }


    async setJournal(file) {
        const tab = [];
        try {
            for (const row of file.rows) {
                tab.push(row);
            }

            let line=10;
            for (let index = 0; index < tab.length; index++) {
                const element = tab[index];

                if (element.debit=="") {
                    console.log("Debit 0");
                    element.debit=0;
                }
                if (element.credit=="") {
                    console.log("Credit 0");
                    element.credit=0;
                }
                // console.log(element.debit," ",element.credit);
                // console.log("index: ",index+1);
                
                if (this.verifie_date(element.date) == null) {
                    console.warn("ARRET");
                    break;
                }
                // console.log("this.verifieCompte(element.compte)= ",this.verifieCompte(element.compte));

                const verifCompte_ID=await this.verifieCompte(element.compte);
                console.log("verifCompte_ID: ",verifCompte_ID);
                
                if (verifCompte_ID==0) {
                    console.warn("ARRET : Compte invalide ou vide à la ligne", index + 1);
                    break;
                }

                let verifJournal_ID=await this.verificationJournal(element.date,element.reference,element.journal);
                // console.log(element.reference," ",element.journal," ",verifJournal_ID);
                
                if (verifJournal_ID==0) {
                    verifJournal_ID=await this.creationJournal(element.date,element.reference,element.journal);
                }
                console.warn("JOURNAL DEJA EXISTANT");
                
                await this.creationJournalLine(line,element.reference,element.date,verifCompte_ID,element.debit,element.credit,verifJournal_ID);
                
                    // console.log("Body 1==> date: ",element.date," dater: ",date ," reference: ",element.reference, " journal: ",element.journal);
                // console.log("Body 2==> compte: ",element.compte, " debit: ",element.debit, " credit: ",element.credit);
                line+=10;
            }
        } catch (error) {
            console.error('Erreur dans getIdOrg:', error);
            throw error;
        }
    }
}

export default ImportMultiple;