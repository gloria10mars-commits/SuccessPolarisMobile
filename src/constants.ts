// Constantes SuccessPolaris - Version React Native
// IA: Léon Astarte Engine (fournisseur-agnostic, backend configurable)

import { Category, Document } from './types';

export const THEME = {
  deepSpace: '#020617',
  nexusCyan: '#00d4ff',
  electricBlue: '#3b82f6',
  polarisNeon: '#0ff0fc',
  matrixGlow: 'rgba(0, 212, 255, 0.15)',
  warmGlass: 'rgba(255, 255, 255, 0.03)',
  vibrantGlow: 'rgba(0, 212, 255, 0.3)',
  spaceBlack: '#0a0a2a',
};

// Endpoints de synchronisation (inchangés par rapport à la version web)
export const URL_COMPTEUR =
  'https://script.google.com/macros/s/AKfycbCiCf6TonxpoZ7RjacHCEIg6hl0D0ImulJvqsbkF1jMhEA_U5nWTfrdWbl5sWQdT3B/exec';
export const URL_LISTE_DOCUMENTS =
  'https://docs.google.com/spreadsheets/d/1fg-tStXc8E04WLqkHxDfrEJR7yf6ix0uzL4y52HF0k0/export?format=csv';
export const APPS_SCRIPT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbzCsLoQDbL1N7WK_oOYJ7gYyqEZMqcmdDPPKIVQTHlUFCU4eFTaVk_0rVSDLCsQi73V/exec';

// Léon Astarte Engine - backend IA configurable.
// L'utilisateur peut héberger son propre backend (Node, Python, etc.) et pointer cette URL.
// Format attendu: POST { messages: ChatMessage[], context: string } → { text: string }
export const LEON_ASTARTE_ENDPOINT = 'https://leon-astarte-backend.example.com/api/chat';

// Persona de l'IA - signature "Léon Astarte"
export const LEON_ASTARTE_PERSONA = `Tu es Léon Astarte, un système d'IA intelligent et polyvalent.
Tes réponses doivent être précises, utiles et accessibles.
Réponds toujours en français. Sois rapide et efficace.`;

// Signature affichée dans l'UI
export const LEON_ASTARTE_SIGNATURE = 'Léon Astarte Engine';

export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_DOCUMENTS: Document[] = [];

// Pays supportés (focus Afrique de l'Ouest)
export const COUNTRIES = [
  'Togo',
  'Bénin',
  'Côte d\'Ivoire',
  'Burkina Faso',
  'Sénégal',
  'Mali',
  'Niger',
  'Guinée',
  'Cameroun',
  'Gabon',
  'Congo',
  'France',
  'Autre',
];
