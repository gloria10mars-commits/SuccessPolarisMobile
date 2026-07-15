# SuccessPolaris Mobile (React Native / Expo)

Version native (APK Android) de l'application web **SuccessPolaris - Astral Palace**.
Portée depuis la version React/Vite vers **React Native + Expo**, sans aucune référence à Gemini ou autre fournisseur IA propriétaire — l'IA est désormais **Léon Astarte Engine**, indépendante du fournisseur.

---

## 🎯 Différences clés avec la version web

| Aspect | Version Web | Version Mobile (ce projet) |
|---|---|---|
| Framework | React 19 + Vite | React Native + Expo SDK 52 |
| Stockage | `localStorage` | `AsyncStorage` (`@react-native-async-storage/async-storage`) |
| Fond animé | `<canvas>` 2000 étoiles | `Animated.View` 120 étoiles (mobile-friendly) |
| Charts | Recharts (SVG) | `react-native-chart-kit` |
| PDF | `<iframe>` Google Drive | `react-native-webview` |
| Iframes IA | `<iframe>` StackAI | `react-native-webview` (Modal) |
| IA | `@google/genai` Gemini | **Léon Astarte Engine** (backend configurable) |
| Signature IA | "Gemini 3 Flash (Astarté Engine)" | **"Léon Astarte Engine"** |
| Persona admin | "Astarté" | **"Léon Astarte"** |
| PWA | Service Worker | Non nécessaire (APK natif) |
| Build | `vite build` | `eas build -p android --profile preview` |

---

## 📁 Structure

```
SuccessPolarisMobile/
├── App.tsx                          # Composant racine + navigation modale
├── app.json                         # Configuration Expo
├── eas.json                         # Profils de build EAS (APK / AAB)
├── package.json                     # Dépendances natives
├── babel.config.js                  # Babel + reanimated plugin
├── tsconfig.json
└── src/
    ├── types.ts                     # Interfaces TypeScript
    ├── constants.ts                 # URLs + persona "Léon Astarte"
    ├── theme/
    │   └── colors.ts                # Palette de couleurs
    ├── services/
    │   ├── aiService.ts             # Léon Astarte Engine (fournisseur-agnostic)
    │   └── storageService.ts        # AsyncStorage + sync Google Sheets
    └── components/
        ├── AuroraBackground.tsx     # Fond stellaire animé
        ├── ExamCountdown.tsx        # Compte à rebours BAC + porte admin
        ├── DocumentCard.tsx         # Carte document
        ├── PDFViewer.tsx            # Visionneuse PDF (WebView)
        ├── ChatWidget.tsx           # Chat IA flottant (WebView)
        ├── SuccessPolarisAssistant.tsx  # Assistant modal (WebView)
        ├── AdminDashboard.tsx       # Dashboard admin 3 onglets
        ├── AdminStats.tsx           # Stats admin (chart-kit)
        ├── EmailModal.tsx           # Enregistrement utilisateur
        └── AdminLoginModal.tsx      # Authentification admin
```

---

## 🚀 Installation et build APK

### Prérequis

- **Node.js** ≥ 18
- **Java JDK 17** (requis par Android Gradle)
- **Android Studio** (pour le SDK Android) ou utilisation d'**EAS Build** (cloud)
- Un compte **Expo** gratuit : https://expo.dev

### 1. Installation des dépendances

```bash
cd SuccessPolarisMobile
npm install
```

### 2. Lancement en développement (optionnel)

```bash
npx expo start
```

> ⚠️ Ce projet utilise des modules natifs (`react-native-webview`, `react-native-linear-gradient`, `AsyncStorage`, etc.) — il ne fonctionne pas dans Expo Go. Il faut soit :
> - Créer un **dev build** : `npx expo run:android` (nécessite Android Studio + un device/émulateur)
> - Soit builder un APK directement via EAS (voir ci-dessous).

### 3. Build APK avec EAS Build (recommandé, sans Android Studio)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Initialiser le projet EAS (une seule fois)
eas build:configure

# Builder l'APK (≈ 15-30 min sur le cloud Expo)
eas build -p android --profile preview
```

À la fin, EAS renvoie une URL de téléchargement direct du fichier `.apk`.

### 4. Build APK local (alternative, sans cloud)

```bash
# Nécessite Android Studio + SDK installé
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
# APK généré dans: android/app/build/outputs/apk/release/app-release.apk
```

### 5. Build AAB (Play Store)

```bash
eas build -p android --profile production
```

---

## ⚙️ Configuration de Léon Astarte Engine

L'IA ne dépend plus de Gemini. Elle appelle un **backend configurable** défini dans `src/constants.ts` :

```ts
export const LEON_ASTARTE_ENDPOINT = 'https://leon-astarte-backend.example.com/api/chat';
```

### Format attendu par le backend

**Requête (POST JSON) :**
```json
{
  "messages": [{ "role": "user", "text": "Bonjour" }],
  "systemInstruction": "Tu es Léon Astarte...",
  "context": "- Document A [cat-1]\n- Document B [cat-2]",
  "temperature": 0.7
}
```

**Réponse attendue :**
```json
{ "text": "Bonjour, je suis Léon Astarte..." }
```

Vous pouvez héberger ce backend avec n'importe quelle stack (Node/Express, FastAPI, Cloudflare Worker, Vercel function, etc.) et y brancher n'importe quel moteur IA (LLM local, OpenAI, Mistral, etc.) — **l'application n'en sait rien**.

---

## 🔐 Sécurité

- Le code admin (`mazedxn7`) est défini en clair dans `App.tsx`. Pour une vraie release, déplacez-le vers un backend d'authentification.
- Les URLs Google Apps Script restent publiques (inchangées par rapport à la version web).
- La liste de bannissement est stockée localement sur le device — pour un vrai contrôle, migrez vers un backend.

---

## 🎨 Personnalisation rapide

| Élément | Fichier à modifier |
|---|---|
| Couleurs du thème | `src/theme/colors.ts` |
| Persona IA | `src/constants.ts` → `LEON_ASTARTE_PERSONA` |
| Endpoint IA | `src/constants.ts` → `LEON_ASTARTE_ENDPOINT` |
| Date du BAC | `src/components/ExamCountdown.tsx` |
| Code admin | `App.tsx` → `ADMIN_SECRET_CODE` |
| Pays supportés | `src/constants.ts` → `COUNTRIES` |
| URLs Google Sheets | `src/constants.ts` |

---

## ✅ À faire après installation

1. Remplacer `LEON_ASTARTE_ENDPOINT` par l'URL de votre backend IA
2. Ajouter une icône d'application dans `assets/icon.png` (1024×1024)
3. Ajouter un splash screen dans `assets/splash.png` (1242×2436)
4. Configurer `eas.json` avec votre `projectId` Expo (`eas build:configure` le fait automatiquement)
5. Builder l'APK : `eas build -p android --profile preview`
