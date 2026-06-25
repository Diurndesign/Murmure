# Déploiement Android — Murmure

Guide complet pour générer l'APK et soumettre sur Google Play.

---

## Prérequis à installer sur ton PC Windows

### 1. Node.js
Télécharge et installe : https://nodejs.org (version LTS)
Vérifie : `node --version`

### 2. Android Studio
Télécharge : https://developer.android.com/studio
Lors de l'installation, coche bien :
- Android SDK
- Android SDK Platform
- Android Virtual Device

### 3. Java (JDK 17)
Android Studio l'installe automatiquement, mais si besoin :
https://adoptium.net/temurin/releases/?version=17

---

## Étape 1 — Cloner et installer le projet

```bash
git clone https://github.com/Diurndesign/Murmure.git
cd Murmure
npm install
```

---

## Étape 2 — Ajouter Android au projet

```bash
npx cap add android
```

Cette commande crée le dossier `android/` avec tout le projet natif.

---

## Étape 3 — Ajouter l'icône de l'app

Copie l'icône `murmure-icon-1024.png` (dans ce repo) dans le dossier `android/app/src/main/res/`.

Ensuite génère toutes les tailles automatiquement :
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --android
```

---

## Étape 4 — Builder et synchroniser

```bash
npm run build:android
```

Cette commande :
1. Build l'app web (Vite)
2. Synchronise les fichiers dans le projet Android

---

## Étape 5 — Ouvrir dans Android Studio

```bash
npm run open:android
```

Android Studio s'ouvre avec le projet.

Dans Android Studio :
- Attends que Gradle finisse de synchroniser (barre de progression en bas)
- `Build` → `Generate Signed Bundle / APK`
- Choisis **APK** (pour tester) ou **Android App Bundle** (pour Google Play)

---

## Étape 6 — Tester sur ton téléphone Android

1. Active le **mode développeur** sur ton téléphone :
   Paramètres → À propos → tape 7 fois sur "Numéro de build"

2. Active le **débogage USB** :
   Paramètres → Options développeur → Débogage USB

3. Branche ton téléphone, dans Android Studio clique ▶ Run

---

## Étape 7 — Créer le compte Google Play

1. Va sur https://play.google.com/console
2. Paye les 25€ uniques
3. Crée une nouvelle app : **Murmure**
4. Bundle ID : `app.murmure.voix`
5. Catégorie : Santé & Forme / Style de vie

---

## Étape 8 — Préparer la fiche Play Store

**Description courte (80 chars max) :**
```
Une question par jour. Des voix anonymes. Rien d'autre.
```

**Description longue :**
```
Murmure pose une question chaque jour à minuit — la même pour tout le monde.
Tu réponds en quelques mots, anonymement. Tu lis les réponses des autres.
Pas de compte, pas de profil, pas de like. Pas d'algorithme.

Juste une voix parmi d'autres.

• Une question nouvelle chaque jour
• Réponses 100% anonymes
• Lecture des voix du jour
• Aucune publicité
• Numéros d'aide intégrés (3114, SOS Amitié...)
• Politique de confidentialité : murmure-orpin.vercel.app/privacy
```

**Screenshots requis :**
- Minimum 2 screenshots téléphone (ratio 9:16)
- Taille recommandée : 1080 × 1920 px
- Montre : écran d'accueil, question du jour, les voix, les paramètres

---

## Étape 9 — Soumettre

Dans Google Play Console :
1. `Production` → `Créer une version`
2. Upload l'AAB (Android App Bundle) généré par Android Studio
3. Remplis la fiche avec les textes ci-dessus
4. Soumets pour révision

Délai de validation Google : **quelques heures à 3 jours**

---

## Mises à jour futures

À chaque mise à jour de l'app :

```bash
# 1. Mettre à jour la version dans package.json
# 2. Builder et synchroniser
npm run build:android

# 3. Dans Android Studio : incrémenter le versionCode dans build.gradle
# 4. Générer un nouvel AAB signé
# 5. Uploader sur Google Play Console
```

---

## En cas de problème

**Gradle ne synchronise pas :**
`File` → `Sync Project with Gradle Files`

**Erreur SDK manquant :**
`Tools` → `SDK Manager` → installe Android API 34

**Le téléphone n'apparaît pas :**
Vérifie les drivers USB Android sur Windows :
https://developer.android.com/studio/run/oem-usb

---

*Pour iOS, voir SETUP_IOS.md (à venir)*
