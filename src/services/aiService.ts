// aiService - Léon Astarte Engine
// Version 100% indépendante d'un fournisseur IA propriétaire.
// Aucune référence à Gemini ou autre : le moteur appelle un backend configurable
// (LEON_ASTARTE_ENDPOINT) qui peut être hébergé par l'utilisateur.

import { Document, ChatMessage } from '../types';
import { LEON_ASTARTE_ENDPOINT, LEON_ASTARTE_PERSONA, LEON_ASTARTE_SIGNATURE } from '../constants';

export interface AIProviderResponse {
  text: string;
  source: string;
  status: string;
  responseTime: number;
}

export interface ChatRequestPayload {
  messages: { role: 'user' | 'model'; text: string }[];
  systemInstruction: string;
  context?: string;
  temperature?: number;
}

export const aiService = {
  processMessage: async (
    messages: ChatMessage[],
    availableDocs: Document[]
  ): Promise<AIProviderResponse> => {
    const startTime = Date.now();

    const docsContext = availableDocs.map((d) => `- ${d.title} [${d.categoryId}]`).join('\n');

    const systemInstruction = `${LEON_ASTARTE_PERSONA}

Tu as accès aux archives suivantes sur l'application :
${docsContext}

Si un utilisateur pose une question sur un sujet couvert par ces archives, mentionne qu'il peut trouver des ressources spécifiques dans les secteurs correspondants de l'application.`;

    const payload: ChatRequestPayload = {
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
      systemInstruction,
      context: docsContext,
      temperature: 0.7,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(LEON_ASTARTE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend Léon Astarte inaccessible (HTTP ${response.status})`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        text:
          data.text ||
          data.message ||
          data.response ||
          "Désolé, Léon Astarte est actuellement saturée.",
        source: LEON_ASTARTE_SIGNATURE,
        status: 'ACTIF',
        responseTime,
      };
    } catch (error) {
      console.error('Erreur Léon Astarte Engine:', error);
      throw error;
    }
  },
};
