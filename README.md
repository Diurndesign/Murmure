# Murmure

> Une question par jour. Des réponses d'inconnus. Rien d'autre.

Murmure est une application mobile anonyme et anti-addictive. Chaque jour à minuit, une nouvelle question apparaît — la même pour tout le monde. Tu réponds en quelques mots, tu lis les réponses des autres. Pas de compte, pas de profil, pas de like. Tu ouvres, tu lis, tu fermes.

---

## Concept

L'idée est née d'un constat simple : les réseaux sociaux ont mis l'individu au centre à la place du sujet. Sur Murmure, il n'y a pas d'identité — seulement des voix. Une question commune crée un point focal partagé, comme regarder le même feu ensemble sans se parler directement.

**Ce que Murmure n'est pas**
- Un réseau social
- Une app de bien-être avec des streaks
- Un outil de performance ou de visibilité

**Ce que Murmure est**
- Un espace de présence anonyme
- Un rituel quotidien court
- Une façon de se sentir moins seul sans s'exposer

---

## Fonctionnalités

- **Question du jour** — rotation aléatoire seedée parmi 400 questions, la même pour tous les utilisateurs simultanément
- **Réponse anonyme** — identifiant généré localement, aucune donnée personnelle collectée
- **1 réponse par jour** — limite appliquée côté client (localStorage) et côté serveur (Supabase)
- **Modification** — possibilité de corriger sa réponse jusqu'à minuit
- **Les voix** — lecture des réponses anonymes du jour
- **Signalement** — suppression immédiate avec raison obligatoire, audit conservé en base
- **Mode sombre** — suit automatiquement la préférence système
- **Hors ligne** — la question du jour est mise en cache localement
- **Paramètres** — politique de confidentialité, suppression des données, suggestions, soutien Ko-fi
- **Numéros d'aide** — lignes d'écoute françaises accessibles depuis l'app (3114, SOS Amitié, etc.)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite |
| Styling | CSS-in-JS (inline styles) |
| Base de données | Supabase (PostgreSQL, EU West) |
| Déploiement | Vercel |
| Auth | Aucune — identifiant anonyme localStorage |

---

## Structure du projet

```
murmure/
├── src/
│   ├── App.jsx        # Application complète (composants + logique)
│   └── main.jsx       # Point d'entrée React
├── index.html         # HTML principal
├── privacy.html       # Page de confidentialité publique
├── vite.config.js     # Config Vite (multi-page)
├── package.json
└── README.md
```

---

## Base de données

Trois tables Supabase avec Row Level Security activé :

**`responses`** — les réponses du jour
```sql
id            UUID    PRIMARY KEY
question_id   INTEGER             -- index de la question (0–399)
question_date DATE                -- YYYY-MM-DD
content       TEXT                -- réponse (3–200 chars)
device_id     TEXT                -- ID anonyme de l'appareil
created_at    TIMESTAMPTZ
```
Contrainte unique : `(device_id, question_date)` — une réponse par appareil par jour.

**`flags`** — audit des signalements
```sql
id                UUID    PRIMARY KEY
response_id       UUID
response_content  TEXT    -- contenu sauvegardé avant suppression
device_id         TEXT    -- qui a signalé
reason            TEXT    -- raison choisie
created_at        TIMESTAMPTZ
```

**`feedbacks`** — suggestions d'amélioration
```sql
id          UUID    PRIMARY KEY
content     TEXT    -- suggestion (5–500 chars)
device_id   TEXT
created_at  TIMESTAMPTZ
```

---

## Confidentialité

Murmure ne collecte aucune donnée personnelle. L'identifiant utilisateur est généré aléatoirement sur l'appareil et ne peut pas être associé à une identité réelle.

Politique complète : [murmure-orpin.vercel.app/privacy](https://murmure-orpin.vercel.app/privacy)

---

## Questions (400 au total)

Les questions couvrent 8 catégories :

- Souvenirs (50)
- Relations & Liens (45)
- Petits bonheurs (40)
- Soi & Identité (45)
- Rêves & Imagination (40)
- Corps & Sensations (30)
- Découvertes (40)
- Futur & Espoirs (30)
- Légères & Joyeuses (40)
- Universelles (40)

La rotation est déterministe et seedée par la date — tout le monde voit la même question le même jour, sans répétition pendant 400 jours.

---

## Roadmap

- [ ] PWA manifest — icône et splash screen natifs
- [ ] Conversion native via Capacitor ou Expo
- [ ] Soumission App Store (Apple Developer Account)
- [ ] Soumission Google Play
- [ ] Tip jar iOS via Apple In-App Purchase (RevenueCat)
- [ ] Tableau de bord modération pour les signalements
- [ ] Notifications push optionnelles (rappel quotidien)

---

## Soutenir le projet

Murmure est gratuit et sans publicité.
[ko-fi.com/murmureapp](https://ko-fi.com/murmureapp)

---

*Construit à Nice, Côte d'Azur.*
