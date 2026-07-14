// storageService - Version React Native (AsyncStorage)
// Identique en surface à la version web, mais persistant côté device.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Document, AdminAccount, VisitorActivity } from '../types';
import { URL_COMPTEUR, URL_LISTE_DOCUMENTS, APPS_SCRIPT_WEBHOOK_URL } from '../constants';

const KEYS = {
  CATEGORIES: 'sp_categories',
  DOCUMENTS: 'sp_documents',
  STATS: 'sp_stats',
  LOGS: 'sp_logs',
  VISITOR_ACTIVITY: 'sp_visitor_spy_logs',
  ACCOUNTS: 'sp_admin_accounts',
  USER_EMAIL: 'sp_user_identity',
  USER_COUNTRY: 'sp_user_country',
  BANNED_EMAILS: 'sp_banned_list',
  USER_XP: 'sp_user_xp',
  USER_HISTORY: 'sp_user_doc_history',
  SHEET_ROW_COUNT: 'sp_document_total_count',
  IA_DIRECTIVES: 'sp_ia_directives',
  IA_NOTES: 'sp_ia_notes',
} as const;

const parseCSV = (csv: string) => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length <= 1) return [];

  return lines.slice(1).map((line, index) => {
    const values = line
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((v) => v.trim().replace(/^"|"$/g, ''));
    return {
      title: values[0] || '',
      url: values[1] || '',
      category: (values[2] || '').toLowerCase(),
      subCategory: (values[3] || '').toLowerCase(),
      date: values[4] || new Date().toISOString(),
      id: `doc-${index}-${Date.now()}`,
    };
  });
};

const safeGet = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.warn('AsyncStorage set failed', key, e);
  }
};

export const storageService = {
  // ----- Compteur distant -----
  chargerCompteur: async (): Promise<number> => {
    try {
      const response = await fetch(`${URL_COMPTEUR}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Réseau instable');
      const textData = await response.text();
      let finalCount = 0;
      try {
        const jsonData = JSON.parse(textData);
        finalCount = parseInt(jsonData.total || jsonData.count || 0);
      } catch (e) {
        finalCount = parseInt(textData.trim()) || 0;
      }
      await safeSet(KEYS.SHEET_ROW_COUNT, finalCount.toString());
      return finalCount;
    } catch (e) {
      const cached = await safeGet(KEYS.SHEET_ROW_COUNT);
      return parseInt(cached || '0');
    }
  },

  // ----- Synchronisation Google Sheets -----
  fetchFromSheets: async (): Promise<{ categories: Category[]; documents: Document[] }> => {
    try {
      const response = await fetch(`${URL_LISTE_DOCUMENTS}&t=${Date.now()}`);
      if (!response.ok) throw new Error('Source inaccessible');
      const csvData = await response.text();
      const rows = parseCSV(csvData);
      const categories: Category[] = [];
      const documents: Document[] = [];
      const categoryMap = new Map<string, string>();

      rows.forEach((row) => {
        if (!row.title || !row.url || !row.category) return;
        const mainCatLabel = row.category.toUpperCase();
        const subCatLabel = row.subCategory ? row.subCategory.toUpperCase() : null;
        if (!categoryMap.has(mainCatLabel)) {
          const catId = `cat-${mainCatLabel.replace(/\s+/g, '-')}`;
          categoryMap.set(mainCatLabel, catId);
          categories.push({ id: catId, name: mainCatLabel, parentId: null, icon: '📁' });
        }
        let finalCatId = categoryMap.get(mainCatLabel)!;
        if (subCatLabel) {
          const subKey = `${mainCatLabel}_${subCatLabel}`;
          if (!categoryMap.has(subKey)) {
            const subId = `sub-${subKey.replace(/\s+/g, '-')}`;
            categoryMap.set(subKey, subId);
            categories.push({ id: subId, name: subCatLabel, parentId: finalCatId, icon: '📖' });
          }
          finalCatId = categoryMap.get(subKey)!;
        }
        documents.push({
          id: row.id,
          title: row.title,
          description: `Archive ${mainCatLabel} > ${subCatLabel || 'Général'}`,
          categoryId: finalCatId,
          fileUrl: row.url,
          fileType: 'pdf',
          tags: [mainCatLabel],
          downloads: 0,
          dateAdded: row.date,
          size: 'PDF',
        });
      });
      await safeSet(KEYS.DOCUMENTS, JSON.stringify(documents));
      await safeSet(KEYS.CATEGORIES, JSON.stringify(categories));
      return { categories, documents };
    } catch (error) {
      const catsRaw = await safeGet(KEYS.CATEGORIES);
      const docsRaw = await safeGet(KEYS.DOCUMENTS);
      return {
        categories: catsRaw ? JSON.parse(catsRaw) : [],
        documents: docsRaw ? JSON.parse(docsRaw) : [],
      };
    }
  },

  getDrivePreviewUrl: (url: string): string => {
    if (!url || !url.includes('drive.google.com')) return url;
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return idMatch ? `https://drive.google.com/file/d/${idMatch[1]}/preview` : url;
  },

  // ----- XP -----
  getUserXP: async (): Promise<number> => {
    const v = await safeGet(KEYS.USER_XP);
    return parseInt(v || '0');
  },
  addXP: async (amount: number): Promise<number> => {
    const newXP = (await storageService.getUserXP()) + amount;
    await safeSet(KEYS.USER_XP, newXP.toString());
    return newXP;
  },

  // ----- Identité utilisateur -----
  saveUserEmail: (email: string) => safeSet(KEYS.USER_EMAIL, email),
  getUserEmail: async (): Promise<string | null> => safeGet(KEYS.USER_EMAIL),
  saveUserCountry: (country: string) => safeSet(KEYS.USER_COUNTRY, country),
  getUserCountry: async (): Promise<string | null> => safeGet(KEYS.USER_COUNTRY),

  // ----- Bannissement -----
  getBannedEmails: async (): Promise<string[]> => {
    const v = await safeGet(KEYS.BANNED_EMAILS);
    return v ? JSON.parse(v) : [];
  },
  isEmailBanned: async (email: string): Promise<boolean> => {
    const banned = await storageService.getBannedEmails();
    const userEmail = await storageService.getUserEmail();
    return banned.includes(email) || (userEmail ? banned.includes(userEmail) : false);
  },
  banEmail: async (email: string): Promise<void> => {
    const banned = await storageService.getBannedEmails();
    if (!banned.includes(email)) {
      await safeSet(KEYS.BANNED_EMAILS, JSON.stringify([...banned, email]));
      await storageService.addLog('BAN', `Identité bannie : ${email}`);
    }
  },
  unbanEmail: async (email: string): Promise<void> => {
    const banned = await storageService.getBannedEmails();
    await safeSet(KEYS.BANNED_EMAILS, JSON.stringify(banned.filter((e) => e !== email)));
    await storageService.addLog('BAN', `Accès rétabli : ${email}`);
  },

  // ----- Comptes admin -----
  getAccounts: async (): Promise<AdminAccount[]> => {
    const data = await safeGet(KEYS.ACCOUNTS);
    if (!data) {
      const defaults: AdminAccount[] = [
        { id: '0', username: 'Léon Astarte', role: 'SUPER_MASTER', lastLogin: '' },
      ];
      await safeSet(KEYS.ACCOUNTS, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  },
  addAccount: async (username: string, role: AdminAccount['role']): Promise<void> => {
    const accounts = await storageService.getAccounts();
    await safeSet(
      KEYS.ACCOUNTS,
      JSON.stringify([...accounts, { id: Date.now().toString(), username, role, lastLogin: '' }])
    );
  },
  removeAccount: async (id: string): Promise<void> => {
    const accounts = await storageService.getAccounts();
    await safeSet(KEYS.ACCOUNTS, JSON.stringify(accounts.filter((a) => a.id !== id)));
  },

  // ----- Activité visiteur -----
  getVisitorActivities: async (): Promise<VisitorActivity[]> => {
    const v = await safeGet(KEYS.VISITOR_ACTIVITY);
    return v ? JSON.parse(v) : [];
  },

  getAdvancedStats: async () => {
    const activitiesRaw = await safeGet(KEYS.VISITOR_ACTIVITY);
    const docsRaw = await safeGet(KEYS.DOCUMENTS);
    const activities: VisitorActivity[] = activitiesRaw ? JSON.parse(activitiesRaw) : [];
    const docs: Document[] = docsRaw ? JSON.parse(docsRaw) : [];
    const topDocs = [...docs].sort((a, b) => b.downloads - a.downloads).slice(0, 5);
    const uniqueEmails = new Set(activities.filter((a) => a.email).map((a) => a.email));
    const dailyStats: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyStats[d.toLocaleDateString('fr-FR')] = 0;
    }
    activities.forEach((act) => {
      const dateStr = act.timestamp.split(' ')[0];
      if (dailyStats.hasOwnProperty(dateStr)) dailyStats[dateStr]++;
    });
    return {
      topDocs,
      totalUniqueUsers: uniqueEmails.size,
      chartData: Object.keys(dailyStats)
        .map((date) => ({ date, downloads: dailyStats[date] }))
        .reverse(),
    };
  },

  // ----- Logs -----
  getLogs: async () => {
    const v = await safeGet(KEYS.LOGS);
    return v ? JSON.parse(v) : [];
  },
  addLog: async (action: any, details: string) => {
    const v = await safeGet(KEYS.LOGS);
    const logs = v ? JSON.parse(v) : [];
    await safeSet(
      KEYS.LOGS,
      JSON.stringify(
        [
          { id: Date.now().toString(), action, details, timestamp: new Date().toLocaleString() },
          ...logs,
        ].slice(0, 100)
      )
    );
  },

  // ----- Directives IA -----
  getIADirectives: async (): Promise<string> => {
    const v = await safeGet(KEYS.IA_DIRECTIVES);
    return v || 'Vous êtes Léon Astarte, un assistant ultra-rapide.';
  },
  getIANotes: async (): Promise<string> => {
    const v = await safeGet(KEYS.IA_NOTES);
    return v || 'Focus BAC 2025.';
  },
  logAIResponse: async (provider: string, latency: number): Promise<void> => {
    await storageService.addLog('SYSTEM', `IA [${provider}] répondue en ${latency}ms`);
  },

  // ----- Visites / Preview / Download -----
  logVisit: async (): Promise<void> => {
    const v = await safeGet(KEYS.VISITOR_ACTIVITY);
    const activities: VisitorActivity[] = v ? JSON.parse(v) : [];
    const email = (await storageService.getUserEmail()) || 'Anonyme';
    await safeSet(
      KEYS.VISITOR_ACTIVITY,
      JSON.stringify(
        [
          {
            id: `v-${Date.now()}`,
            type: 'VISIT',
            email,
            timestamp: new Date().toLocaleString(),
          },
          ...activities,
        ].slice(0, 500)
      )
    );
  },

  logPreview: async (email: string | null, fileName: string) => {
    const v = await safeGet(KEYS.VISITOR_ACTIVITY);
    const activities: VisitorActivity[] = v ? JSON.parse(v) : [];
    await safeSet(
      KEYS.VISITOR_ACTIVITY,
      JSON.stringify(
        [
          {
            id: `p-${Date.now()}`,
            type: 'PREVIEW',
            email: email || 'Anonyme',
            fileName,
            timestamp: new Date().toLocaleString(),
          },
          ...activities,
        ].slice(0, 500)
      )
    );
  },

  logDownload: async (email: string, fileName: string, docId?: string) => {
    const v = await safeGet(KEYS.VISITOR_ACTIVITY);
    const activities: VisitorActivity[] = v ? JSON.parse(v) : [];
    await safeSet(
      KEYS.VISITOR_ACTIVITY,
      JSON.stringify(
        [
          {
            id: `d-${Date.now()}`,
            type: 'DOWNLOAD',
            email,
            fileName,
            timestamp: new Date().toLocaleString(),
          },
          ...activities,
        ].slice(0, 500)
      )
    );
    if (docId) {
      const hRaw = await safeGet(KEYS.USER_HISTORY);
      const history: string[] = hRaw ? JSON.parse(hRaw) : [];
      if (!history.includes(docId)) {
        await safeSet(KEYS.USER_HISTORY, JSON.stringify([...history, docId]));
      }
    }
  },

  getUserHistory: async (): Promise<string[]> => {
    const v = await safeGet(KEYS.USER_HISTORY);
    return v ? JSON.parse(v) : [];
  },

  incrementDownload: async (id: string) => {
    const docsRaw = await safeGet(KEYS.DOCUMENTS);
    const docs: Document[] = docsRaw ? JSON.parse(docsRaw) : [];
    const idx = docs.findIndex((d) => d.id === id);
    if (idx > -1) {
      docs[idx].downloads += 1;
      await safeSet(KEYS.DOCUMENTS, JSON.stringify(docs));
    }
  },

  // ----- Cloud log (Apps Script) -----
  sendToCloudLog: async (data: any): Promise<boolean> => {
    try {
      const payload = JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        platform: 'SuccessPolaris-Native',
      });
      await fetch(APPS_SCRIPT_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'text/plain' },
        body: payload,
      });
      console.log('✅ Données envoyées au Cloud (Mode Robuste)');
      return true;
    } catch (error) {
      console.error('❌ Erreur critique Cloud Log:', error);
      return false;
    }
  },
};
