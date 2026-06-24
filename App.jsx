import { useState, useEffect } from "react";

// ─── Supabase ──────────────────────────────────────────────────
const SB_URL = "https://wbeyalwwkysfnyfgqeya.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZXlhbHd3a3lzZm55ZmdxZXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTMyNzEsImV4cCI6MjA5Nzg4OTI3MX0.2I9aqXvGBBck34VAY2avwgS5XrAKBymcw7YZkmeBdAE";
const SB  = { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json" };

function todayStr() { return new Date().toISOString().split("T")[0]; }

// ─── LocalStorage — persistance entre sessions ─────────────────
function getOrCreateDeviceId() {
  try {
    const k = "murmure_did";
    const stored = localStorage.getItem(k);
    if (stored) return stored;
    const id = makeDeviceId();
    localStorage.setItem(k, id);
    return id;
  } catch { return makeDeviceId(); }
}

function localHasAnswered() {
  try { return localStorage.getItem("murmure_ans_" + todayStr()) === "1"; }
  catch { return false; }
}

function localSetAnswered() {
  try { localStorage.setItem("murmure_ans_" + todayStr(), "1"); } catch {}
}

async function sbFetchVoices(questionId) {
  try {
    const r = await fetch(
      `${SB_URL}/rest/v1/responses?question_id=eq.${questionId}&question_date=eq.${todayStr()}&order=created_at.asc`,
      { headers: SB }
    );
    return await r.json();
  } catch { return []; }
}

async function sbSubmit(questionId, content, deviceId) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/responses`, {
      method: "POST",
      headers: { ...SB, "Prefer": "return=minimal" },
      body: JSON.stringify({ question_id: questionId, question_date: todayStr(), content, device_id: deviceId }),
    });
    return r.status === 201;
  } catch { return false; }
}

async function sbCheckAnswered(deviceId) {
  try {
    const r = await fetch(
      `${SB_URL}/rest/v1/responses?device_id=eq.${deviceId}&question_date=eq.${todayStr()}&select=id`,
      { headers: SB }
    );
    const d = await r.json();
    return Array.isArray(d) && d.length > 0;
  } catch { return false; }
}

async function sbGetMyResponse(deviceId) {
  try {
    const r = await fetch(
      `${SB_URL}/rest/v1/responses?device_id=eq.${deviceId}&question_date=eq.${todayStr()}&select=id,content`,
      { headers: SB }
    );
    const d = await r.json();
    return Array.isArray(d) && d.length > 0 ? d[0] : null;
  } catch { return null; }
}

async function sbUpdate(responseId, content) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/responses?id=eq.${responseId}`, {
      method: "PATCH",
      headers: { ...SB, "Prefer": "return=minimal" },
      body: JSON.stringify({ content }),
    });
    return r.ok;
  } catch { return false; }
}

function makeDeviceId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ─── 400 Questions ─────────────────────────────────────────────
const QUESTIONS = [
  {id:1,cat:"Souvenirs",q:"C'est quoi ton souvenir d'enfance préféré ?"},
  {id:2,cat:"Souvenirs",q:"Quelle odeur te ramène immédiatement dans le passé ?"},
  {id:3,cat:"Souvenirs",q:"C'est quoi la dernière fois où tu as ri aux larmes ?"},
  {id:4,cat:"Souvenirs",q:"Un endroit que tu n'as pas revu depuis longtemps, mais qui te manque."},
  {id:5,cat:"Souvenirs",q:"Quel livre, film ou chanson t'a marqué pour toujours ?"},
  {id:6,cat:"Souvenirs",q:"C'est quoi le cadeau le plus mémorable que tu aies reçu ?"},
  {id:7,cat:"Souvenirs",q:"Un moment que tu aimerais revivre exactement comme il était."},
  {id:8,cat:"Souvenirs",q:"Quelle est la phrase d'un proche que tu n'as jamais oubliée ?"},
  {id:9,cat:"Souvenirs",q:"C'est quoi le meilleur repas de ta vie ?"},
  {id:10,cat:"Souvenirs",q:"Quel âge avais-tu quand tu as réalisé que tu avais grandi ?"},
  {id:11,cat:"Souvenirs",q:"Un truc que tu faisais enfant et que tu aimerais retrouver."},
  {id:12,cat:"Souvenirs",q:"Quelle chanson te ramène à un souvenir précis ?"},
  {id:13,cat:"Souvenirs",q:"C'est quoi la plus belle journée d'été que tu aies vécue ?"},
  {id:14,cat:"Souvenirs",q:"Un professeur qui t'a vraiment marqué et pourquoi."},
  {id:15,cat:"Souvenirs",q:"C'est quoi le premier truc dont tu te souviens de ta vie ?"},
  {id:16,cat:"Souvenirs",q:"Une nuit que tu n'oublieras jamais."},
  {id:17,cat:"Souvenirs",q:"Quelle erreur t'a finalement mené à quelque chose de bien ?"},
  {id:18,cat:"Souvenirs",q:"Le dernier endroit où tu t'es senti vraiment libre ?"},
  {id:19,cat:"Souvenirs",q:"C'est quoi la décision la plus courageuse que tu aies prise ?"},
  {id:20,cat:"Souvenirs",q:"Un moment où tu t'es surpris toi-même."},
  {id:21,cat:"Souvenirs",q:"C'est quoi la chose la plus belle que tu aies vue de tes yeux ?"},
  {id:22,cat:"Souvenirs",q:"Un voyage, même court, qui t'a changé quelque chose."},
  {id:23,cat:"Souvenirs",q:"La première fois que tu as réalisé que tu aimais quelque chose passionnément."},
  {id:24,cat:"Souvenirs",q:"Un geste simple d'un inconnu qui t'a touché."},
  {id:25,cat:"Souvenirs",q:"Quelle période de ta vie tu regardes avec le plus de tendresse ?"},
  {id:26,cat:"Souvenirs",q:"C'est quoi le truc le plus fou que tu aies fait et dont tu es fier ?"},
  {id:27,cat:"Souvenirs",q:"Un animal qui a compté dans ta vie."},
  {id:28,cat:"Souvenirs",q:"La dernière fois que quelque chose t'a coupé le souffle."},
  {id:29,cat:"Souvenirs",q:"Un jeu d'enfance que tu pourrais encore jouer des heures."},
  {id:30,cat:"Souvenirs",q:"Un concert, spectacle ou événement que tu gardes dans le cœur."},
  {id:31,cat:"Souvenirs",q:"C'est quoi la première chose que tu as achetée avec ton propre argent ?"},
  {id:32,cat:"Souvenirs",q:"Un souvenir lié à la pluie."},
  {id:33,cat:"Souvenirs",q:"C'est quoi le moment où tu t'es senti le plus à ta place ?"},
  {id:34,cat:"Souvenirs",q:"Une conversation que tu aimerais avoir eue différemment."},
  {id:35,cat:"Souvenirs",q:"La dernière fois que tu as pleuré de joie."},
  {id:36,cat:"Souvenirs",q:"Un objet que tu as gardé pour des raisons sentimentales."},
  {id:37,cat:"Souvenirs",q:"C'est quoi la surprise la plus belle qu'on t'ait faite ?"},
  {id:38,cat:"Souvenirs",q:"Un souvenir lié à la neige ou au froid."},
  {id:39,cat:"Souvenirs",q:"La dernière fois que tu t'es perdu — et ce que tu as trouvé à la place."},
  {id:40,cat:"Souvenirs",q:"C'est quoi le truc que tu regrettes de ne pas avoir dit à quelqu'un ?"},
  {id:41,cat:"Souvenirs",q:"Un moment de silence que tu gardes précieusement."},
  {id:42,cat:"Souvenirs",q:"La première fois que tu as aidé quelqu'un vraiment."},
  {id:43,cat:"Souvenirs",q:"Un souvenir de fête en famille ou entre amis."},
  {id:44,cat:"Souvenirs",q:"C'est quoi la chose la plus utile qu'on t'ait apprise ?"},
  {id:45,cat:"Souvenirs",q:"Un livre d'enfance qui compte encore aujourd'hui."},
  {id:46,cat:"Souvenirs",q:"C'est quoi la photo que tu aimerais retrouver ?"},
  {id:47,cat:"Souvenirs",q:"Un moment de paix absolue dont tu te souviens."},
  {id:48,cat:"Souvenirs",q:"La dernière fois que tu as eu vraiment peur — et comment ça s'est terminé."},
  {id:49,cat:"Souvenirs",q:"Un souvenir lié à la mer, un lac ou une rivière."},
  {id:50,cat:"Souvenirs",q:"C'est quoi la chose la plus folle que tu aies faite par amour ?"},
  {id:51,cat:"Relations & Liens",q:"C'est quoi le truc que tu fais pour les gens que tu aimes sans qu'ils s'en rendent compte ?"},
  {id:52,cat:"Relations & Liens",q:"Qui est la personne qui te connaît le mieux au monde ?"},
  {id:53,cat:"Relations & Liens",q:"C'est quoi ton langage d'amour — comment tu montres que tu tiens à quelqu'un ?"},
  {id:54,cat:"Relations & Liens",q:"Une amitié que tu as perdue et qui te manque encore."},
  {id:55,cat:"Relations & Liens",q:"C'est quoi le truc qu'une personne peut faire pour gagner immédiatement ta confiance ?"},
  {id:56,cat:"Relations & Liens",q:"Quelle personne de ta vie mériterait plus de remerciements ?"},
  {id:57,cat:"Relations & Liens",q:"C'est quoi la leçon la plus importante qu'un ami t'ait apprise ?"},
  {id:58,cat:"Relations & Liens",q:"Comment tu sais que tu es avec les bonnes personnes ?"},
  {id:59,cat:"Relations & Liens",q:"C'est quoi une chose que tu n'as jamais dite à quelqu'un que tu aimes ?"},
  {id:60,cat:"Relations & Liens",q:"La dernière fois que tu as rencontré quelqu'un qui t'a vraiment impressionné."},
  {id:61,cat:"Relations & Liens",q:"C'est quoi le plus beau geste qu'on ait fait pour toi ?"},
  {id:62,cat:"Relations & Liens",q:"Une dispute qui t'a finalement rapproché de quelqu'un."},
  {id:63,cat:"Relations & Liens",q:"C'est quoi ce que tu cherches dans une amitié profonde ?"},
  {id:64,cat:"Relations & Liens",q:"La personne dont le rire t'a toujours donné envie de rire aussi."},
  {id:65,cat:"Relations & Liens",q:"C'est quoi une habitude que tu as héritée de tes parents sans t'en rendre compte ?"},
  {id:66,cat:"Relations & Liens",q:"Quelqu'un que tu voudrais revoir après des années."},
  {id:67,cat:"Relations & Liens",q:"C'est quoi la qualité que tu admires le plus chez les autres ?"},
  {id:68,cat:"Relations & Liens",q:"Un étranger qui a compté dans ta vie, même brièvement."},
  {id:69,cat:"Relations & Liens",q:"C'est quoi la chose la plus difficile à pardonner ?"},
  {id:70,cat:"Relations & Liens",q:"Avec qui aimerais-tu passer une journée entière à ne rien faire de particulier ?"},
  {id:71,cat:"Relations & Liens",q:"C'est quoi le silence confortable — avec qui tu peux l'avoir ?"},
  {id:72,cat:"Relations & Liens",q:"Une personne qui t'a donné confiance en toi à un moment clé."},
  {id:73,cat:"Relations & Liens",q:"C'est quoi le plus beau compliment qu'on t'ait fait ?"},
  {id:74,cat:"Relations & Liens",q:"Une relation que tu chéris et que tu ne montres jamais assez."},
  {id:75,cat:"Relations & Liens",q:"C'est quoi le truc que tu ne supportes pas dans les relations, mais que tu as appris à gérer ?"},
  {id:76,cat:"Relations & Liens",q:"La dernière fois que tu as demandé de l'aide — et ce que ça t'a coûté de le faire."},
  {id:77,cat:"Relations & Liens",q:"C'est quoi le plus grand risque que tu aies pris pour une relation ?"},
  {id:78,cat:"Relations & Liens",q:"Une personne que tu ne remercies jamais assez."},
  {id:79,cat:"Relations & Liens",q:"C'est quoi ta façon à toi de dire au revoir ?"},
  {id:80,cat:"Relations & Liens",q:"Un lien inattendu qui s'est révélé précieux."},
  {id:81,cat:"Relations & Liens",q:"C'est quoi quelque chose que tu gardes uniquement pour toi, que personne ne partage ?"},
  {id:82,cat:"Relations & Liens",q:"Quel mot décrit le mieux la relation avec ta famille ?"},
  {id:83,cat:"Relations & Liens",q:"C'est quoi une chose que tu pourrais faire pour quelqu'un aujourd'hui ?"},
  {id:84,cat:"Relations & Liens",q:"Une personne avec qui tu pourrais parler pendant des heures sans jamais t'ennuyer."},
  {id:85,cat:"Relations & Liens",q:"C'est quoi le truc qui te manque dans les liens d'aujourd'hui par rapport à avant ?"},
  {id:86,cat:"Relations & Liens",q:"Comment tu gardes le contact avec les gens qui comptent ?"},
  {id:87,cat:"Relations & Liens",q:"C'est quoi la chose la plus belle que l'amitié t'a apportée ?"},
  {id:88,cat:"Relations & Liens",q:"Une rencontre que le hasard a mise sur ton chemin."},
  {id:89,cat:"Relations & Liens",q:"C'est quoi ce que tu aimerais que les gens ressentent près de toi ?"},
  {id:90,cat:"Relations & Liens",q:"La dernière fois que tu as dit 'je t'aime' — et à qui."},
  {id:91,cat:"Relations & Liens",q:"C'est quoi un secret que tu portes pour quelqu'un d'autre ?"},
  {id:92,cat:"Relations & Liens",q:"Une tradition que tu partages uniquement avec une personne."},
  {id:93,cat:"Relations & Liens",q:"C'est quoi le truc que tu changerais dans ta façon de traiter les gens ?"},
  {id:94,cat:"Relations & Liens",q:"La dernière fois que quelqu'un t'a surpris en bien."},
  {id:95,cat:"Relations & Liens",q:"C'est quoi ton plus grand acte d'amour, celui dont personne ne sait rien ?"},
  {id:96,cat:"Petits bonheurs",q:"C'est quoi la petite chose qui rend ton matin meilleur ?"},
  {id:97,cat:"Petits bonheurs",q:"Quel bruit te détend instantanément ?"},
  {id:98,cat:"Petits bonheurs",q:"C'est quoi ton endroit préféré dans ta maison ou ton appartement ?"},
  {id:99,cat:"Petits bonheurs",q:"La sensation physique qui te fait sentir vivant."},
  {id:100,cat:"Petits bonheurs",q:"C'est quoi le petit rituel que tu ne changerais pour rien au monde ?"},
  {id:101,cat:"Petits bonheurs",q:"Un plaisir coupable que tu assumes totalement."},
  {id:102,cat:"Petits bonheurs",q:"C'est quoi le truc con qui te fait encore sourire après des années ?"},
  {id:103,cat:"Petits bonheurs",q:"La première bouchée qui te rend heureux à chaque fois."},
  {id:104,cat:"Petits bonheurs",q:"C'est quoi le moment de la journée que tu attends le plus ?"},
  {id:105,cat:"Petits bonheurs",q:"Un objet du quotidien auquel tu es ridiculement attaché."},
  {id:106,cat:"Petits bonheurs",q:"C'est quoi ta météo préférée et pourquoi ?"},
  {id:107,cat:"Petits bonheurs",q:"Le dernier truc qui t'a fait sourire sans raison."},
  {id:108,cat:"Petits bonheurs",q:"C'est quoi une chose simple que tu pourrais faire tous les jours sans jamais t'en lasser ?"},
  {id:109,cat:"Petits bonheurs",q:"Une lumière, un éclairage, un moment de la journée que tu trouves beau."},
  {id:110,cat:"Petits bonheurs",q:"C'est quoi la chanson que tu mets quand tu es seul chez toi ?"},
  {id:111,cat:"Petits bonheurs",q:"Le dernier livre, film ou série qui t'a vraiment embarqué."},
  {id:112,cat:"Petits bonheurs",q:"C'est quoi ta façon préférée de ne rien faire ?"},
  {id:113,cat:"Petits bonheurs",q:"Un truc que tu fais pour toi et que personne ne voit."},
  {id:114,cat:"Petits bonheurs",q:"C'est quoi le goût du bonheur pour toi ?"},
  {id:115,cat:"Petits bonheurs",q:"La dernière fois que tu as été fier d'une toute petite chose."},
  {id:116,cat:"Petits bonheurs",q:"C'est quoi l'heure parfaite pour toi ?"},
  {id:117,cat:"Petits bonheurs",q:"Un truc gratuit qui te fait du bien."},
  {id:118,cat:"Petits bonheurs",q:"C'est quoi le silence que tu aimes le plus ?"},
  {id:119,cat:"Petits bonheurs",q:"La dernière chose belle que tu as remarquée dehors."},
  {id:120,cat:"Petits bonheurs",q:"C'est quoi ton café, ton thé, ta boisson du bonheur ?"},
  {id:121,cat:"Petits bonheurs",q:"Un truc que tu aimes faire lentement."},
  {id:122,cat:"Petits bonheurs",q:"C'est quoi ton coin de nature préféré ?"},
  {id:123,cat:"Petits bonheurs",q:"La dernière fois que tu t'es accordé du temps juste pour toi."},
  {id:124,cat:"Petits bonheurs",q:"C'est quoi une odeur qui te rend heureux instantanément ?"},
  {id:125,cat:"Petits bonheurs",q:"Un truc inutile mais adorable que tu collectionnes ou gardes."},
  {id:126,cat:"Petits bonheurs",q:"C'est quoi ton dimanche idéal ?"},
  {id:127,cat:"Petits bonheurs",q:"La dernière fois que tu as dansé, même seul."},
  {id:128,cat:"Petits bonheurs",q:"C'est quoi le truc que tu fais dès que tu rentres chez toi ?"},
  {id:129,cat:"Petits bonheurs",q:"Une texture, un tissu, un toucher qui te détend."},
  {id:130,cat:"Petits bonheurs",q:"C'est quoi ton heure magique — tôt le matin ou tard le soir ?"},
  {id:131,cat:"Petits bonheurs",q:"Le dernier truc que tu as fait pour la première fois et qui t'a plu."},
  {id:132,cat:"Petits bonheurs",q:"C'est quoi ta couleur préférée et ce qu'elle évoque ?"},
  {id:133,cat:"Petits bonheurs",q:"Un truc que la technologie ne pourra jamais remplacer dans ta vie."},
  {id:134,cat:"Petits bonheurs",q:"C'est quoi ta recette du bonheur en une phrase ?"},
  {id:135,cat:"Petits bonheurs",q:"La dernière fois que tu t'es senti exactement à ta place."},
  {id:136,cat:"Soi & Identité",q:"Qu'est-ce que tu fais mieux que tu ne le crois ?"},
  {id:137,cat:"Soi & Identité",q:"Si ta vie était un film, c'est quoi le titre ?"},
  {id:138,cat:"Soi & Identité",q:"C'est quoi la chose que tu aimes le plus chez toi ?"},
  {id:139,cat:"Soi & Identité",q:"Qu'est-ce que tu aurais aimé savoir à 20 ans ?"},
  {id:140,cat:"Soi & Identité",q:"C'est quoi ta plus grande fierté que personne ne connaît ?"},
  {id:141,cat:"Soi & Identité",q:"Quelle peur tu as apprivoisée avec le temps ?"},
  {id:142,cat:"Soi & Identité",q:"C'est quoi la valeur la plus importante dans ta vie ?"},
  {id:143,cat:"Soi & Identité",q:"Quel mot les gens utiliseraient pour te décrire — et est-ce que tu es d'accord ?"},
  {id:144,cat:"Soi & Identité",q:"C'est quoi une croyance sur toi-même que tu as dû abandonner ?"},
  {id:145,cat:"Soi & Identité",q:"De quoi tu es capable que tu n'oses pas montrer ?"},
  {id:146,cat:"Soi & Identité",q:"C'est quoi la chose la plus courageuse que tu aies faite sans que personne s'en aperçoive ?"},
  {id:147,cat:"Soi & Identité",q:"Quel défaut tu as transformé en force ?"},
  {id:148,cat:"Soi & Identité",q:"C'est quoi ce qui te motive profondément — pas ce que tu dis aux autres, ce qui est vrai ?"},
  {id:149,cat:"Soi & Identité",q:"Quand est-ce que tu es le plus toi-même ?"},
  {id:150,cat:"Soi & Identité",q:"C'est quoi quelque chose que tu as mis du temps à accepter de toi ?"},
  {id:151,cat:"Soi & Identité",q:"Quelle décision t'a défini sans que tu l'aies planifiée ?"},
  {id:152,cat:"Soi & Identité",q:"C'est quoi le truc que tu ne changerais pas, même si on te le demandait ?"},
  {id:153,cat:"Soi & Identité",q:"Une chose que tu as faite et dont tu es fier en secret."},
  {id:154,cat:"Soi & Identité",q:"C'est quoi ton rapport à la solitude ?"},
  {id:155,cat:"Soi & Identité",q:"Quelle partie de toi mérite plus de tendresse ?"},
  {id:156,cat:"Soi & Identité",q:"C'est quoi ta façon à toi de traverser les moments difficiles ?"},
  {id:157,cat:"Soi & Identité",q:"Un truc qui te définit que tu ne mets jamais sur ton CV ou tes réseaux."},
  {id:158,cat:"Soi & Identité",q:"C'est quoi la chose dont tu es le plus reconnaissant envers toi-même ?"},
  {id:159,cat:"Soi & Identité",q:"Qu'est-ce que tu te répètes dans les mauvais moments ?"},
  {id:160,cat:"Soi & Identité",q:"C'est quoi un talent que tu sous-estimes ?"},
  {id:161,cat:"Soi & Identité",q:"La chose que tu fais et qui donne du sens à ta journée."},
  {id:162,cat:"Soi & Identité",q:"C'est quoi quelque chose que les autres trouvent difficile mais toi naturel ?"},
  {id:163,cat:"Soi & Identité",q:"Quelle version de toi tu es le plus fier d'avoir été ?"},
  {id:164,cat:"Soi & Identité",q:"C'est quoi le truc que tu te promets depuis longtemps ?"},
  {id:165,cat:"Soi & Identité",q:"Comment tu te décrirais à quelqu'un qui ne te connaît pas ?"},
  {id:166,cat:"Soi & Identité",q:"C'est quoi ta définition personnelle du succès ?"},
  {id:167,cat:"Soi & Identité",q:"Une chose que tu as apprise sur toi pendant une période difficile."},
  {id:168,cat:"Soi & Identité",q:"C'est quoi l'écart entre qui tu es et qui tu voudrais être ?"},
  {id:169,cat:"Soi & Identité",q:"Qu'est-ce qui te ressource vraiment ?"},
  {id:170,cat:"Soi & Identité",q:"C'est quoi une limite que tu as mis du temps à poser ?"},
  {id:171,cat:"Soi & Identité",q:"Quel regard sur toi-même tu aimerais changer ?"},
  {id:172,cat:"Soi & Identité",q:"C'est quoi la chose la plus honnête que tu puisses dire sur toi ?"},
  {id:173,cat:"Soi & Identité",q:"Un truc que tu ne fais que pour toi, pas pour les autres."},
  {id:174,cat:"Soi & Identité",q:"C'est quoi ta façon d'être présent dans le monde ?"},
  {id:175,cat:"Soi & Identité",q:"La meilleure version de toi-même — à quoi elle ressemble ?"},
  {id:176,cat:"Soi & Identité",q:"C'est quoi ce que tu n'as pas besoin d'expliquer pour te sentir compris ?"},
  {id:177,cat:"Soi & Identité",q:"Un rituel que tu as créé juste pour toi."},
  {id:178,cat:"Soi & Identité",q:"C'est quoi une peur que tu gardes et que tu appelles 'prudence' ?"},
  {id:179,cat:"Soi & Identité",q:"Qu'est-ce que tu sais maintenant que tu ignorais il y a 5 ans ?"},
  {id:180,cat:"Soi & Identité",q:"C'est quoi la chose dont tu as besoin mais que tu demandes rarement ?"},
  {id:181,cat:"Rêves & Imagination",q:"Si tu pouvais vivre une journée dans un autre pays, tu choisirais lequel ?"},
  {id:182,cat:"Rêves & Imagination",q:"C'est quoi le métier que tu aurais adoré faire dans une autre vie ?"},
  {id:183,cat:"Rêves & Imagination",q:"Si tu pouvais maîtriser une compétence instantanément, laquelle ?"},
  {id:184,cat:"Rêves & Imagination",q:"C'est quoi ton rêve que tu n'as jamais dit à voix haute ?"},
  {id:185,cat:"Rêves & Imagination",q:"Si tu écrivais un livre, c'est quoi l'histoire ?"},
  {id:186,cat:"Rêves & Imagination",q:"C'est quoi l'endroit dans le monde que tu veux voir avant de mourir ?"},
  {id:187,cat:"Rêves & Imagination",q:"Si tu pouvais dîner avec n'importe qui, mort ou vivant, qui tu choisirais ?"},
  {id:188,cat:"Rêves & Imagination",q:"C'est quoi le projet que tu rêves de lancer un jour ?"},
  {id:189,cat:"Rêves & Imagination",q:"Si tu avais une année sabbatique, tu ferais quoi ?"},
  {id:190,cat:"Rêves & Imagination",q:"C'est quoi l'aventure que tu n'as jamais osé te lancer ?"},
  {id:191,cat:"Rêves & Imagination",q:"Si tu pouvais changer une chose dans le monde, ce serait quoi ?"},
  {id:192,cat:"Rêves & Imagination",q:"C'est quoi l'instrument que tu aimerais jouer ?"},
  {id:193,cat:"Rêves & Imagination",q:"Si tu pouvais vivre à une autre époque, laquelle ?"},
  {id:194,cat:"Rêves & Imagination",q:"C'est quoi ton endroit de rêve pour créer ?"},
  {id:195,cat:"Rêves & Imagination",q:"Si tu pouvais transmettre quelque chose à la prochaine génération, ce serait quoi ?"},
  {id:196,cat:"Rêves & Imagination",q:"C'est quoi l'idée que tu as et que personne n'a encore réalisée ?"},
  {id:197,cat:"Rêves & Imagination",q:"Si tu créais une association, elle ferait quoi ?"},
  {id:198,cat:"Rêves & Imagination",q:"C'est quoi la langue que tu aimerais parler couramment ?"},
  {id:199,cat:"Rêves & Imagination",q:"Si tu pouvais recommencer, tu changerais quoi — et qu'est-ce que tu garderais ?"},
  {id:200,cat:"Rêves & Imagination",q:"C'est quoi un rêve que tu as abandonné mais qui revient parfois ?"},
  {id:201,cat:"Rêves & Imagination",q:"Si tu avais une baguette magique pour une journée, tu l'utiliserais comment ?"},
  {id:202,cat:"Rêves & Imagination",q:"C'est quoi une cause qui mérite qu'on se batte pour elle ?"},
  {id:203,cat:"Rêves & Imagination",q:"Si tu pouvais vivre dans une série ou un film, lequel ?"},
  {id:204,cat:"Rêves & Imagination",q:"C'est quoi le truc que tu repousseras dans 10 ans si tu ne le fais pas maintenant ?"},
  {id:205,cat:"Rêves & Imagination",q:"Si tu pouvais apprendre une chose en un jour, ce serait quoi ?"},
  {id:206,cat:"Rêves & Imagination",q:"C'est quoi ton utopie personnelle ?"},
  {id:207,cat:"Rêves & Imagination",q:"Si tu pouvais voyager dans le temps, tu irais où et pourquoi ?"},
  {id:208,cat:"Rêves & Imagination",q:"C'est quoi quelque chose que tu veux créer avant la fin de ta vie ?"},
  {id:209,cat:"Rêves & Imagination",q:"Si tu n'avais pas peur, tu ferais quoi demain ?"},
  {id:210,cat:"Rêves & Imagination",q:"C'est quoi ta journée parfaite, dans les moindres détails ?"},
  {id:211,cat:"Rêves & Imagination",q:"Si tu pouvais avoir une conversation avec toi dans 20 ans, tu lui demanderais quoi ?"},
  {id:212,cat:"Rêves & Imagination",q:"C'est quoi l'héritage que tu veux laisser ?"},
  {id:213,cat:"Rêves & Imagination",q:"Si tu pouvais tout réapprendre, tu commencerais par quoi ?"},
  {id:214,cat:"Rêves & Imagination",q:"C'est quoi le projet que tu mets dans le tiroir depuis trop longtemps ?"},
  {id:215,cat:"Rêves & Imagination",q:"Si tu ouvrais un commerce, ce serait quoi ?"},
  {id:216,cat:"Rêves & Imagination",q:"C'est quoi une règle de vie que tu aimerais vraiment appliquer ?"},
  {id:217,cat:"Rêves & Imagination",q:"Si tu pouvais parler à une version plus jeune de toi, tu lui dirais quoi ?"},
  {id:218,cat:"Rêves & Imagination",q:"C'est quoi la chose que tu t'autorises à espérer ?"},
  {id:219,cat:"Rêves & Imagination",q:"Si tu devais disparaître un an et revenir, qu'est-ce qui t'aurait manqué ?"},
  {id:220,cat:"Rêves & Imagination",q:"C'est quoi le truc que tu feras quand tu te sentiras prêt — et tu ne te sentiras jamais prêt ?"},
  {id:221,cat:"Corps & Sensations",q:"C'est quoi la sensation physique qui t'ancre dans le présent ?"},
  {id:222,cat:"Corps & Sensations",q:"Quel son est capable de changer ton humeur instantanément ?"},
  {id:223,cat:"Corps & Sensations",q:"C'est quoi la lumière qui te rend heureux ?"},
  {id:224,cat:"Corps & Sensations",q:"La chose que tu aimes manger lentement, en savourant chaque bouchée."},
  {id:225,cat:"Corps & Sensations",q:"C'est quoi le mouvement qui te libère le plus — marcher, nager, danser, courir ?"},
  {id:226,cat:"Corps & Sensations",q:"Quelle texture t'a marqué — tissu, pierre, bois, eau ?"},
  {id:227,cat:"Corps & Sensations",q:"C'est quoi la position dans laquelle tu es le plus à l'aise pour penser ?"},
  {id:228,cat:"Corps & Sensations",q:"La dernière fois que ton corps t'a surpris par sa capacité."},
  {id:229,cat:"Corps & Sensations",q:"C'est quoi le froid ou la chaleur que tu préfères ?"},
  {id:230,cat:"Corps & Sensations",q:"Un goût que tu n'aimais pas et que tu as appris à aimer."},
  {id:231,cat:"Corps & Sensations",q:"C'est quoi le sommeil parfait pour toi — où, comment, avec quoi ?"},
  {id:232,cat:"Corps & Sensations",q:"La dernière fois que la musique t'a traversé physiquement."},
  {id:233,cat:"Corps & Sensations",q:"C'est quoi une douleur qui t'a appris quelque chose ?"},
  {id:234,cat:"Corps & Sensations",q:"Quel moment de la nature te donne l'impression d'être vivant ?"},
  {id:235,cat:"Corps & Sensations",q:"C'est quoi la chose que tu voudrais goûter une seule fois dans ta vie ?"},
  {id:236,cat:"Corps & Sensations",q:"La dernière fois que tu as eu froid et que ça t'a plu."},
  {id:237,cat:"Corps & Sensations",q:"C'est quoi une odeur que tu pourrais décrire avec précision sans la sentir ?"},
  {id:238,cat:"Corps & Sensations",q:"Le contact humain qui te manque le plus."},
  {id:239,cat:"Corps & Sensations",q:"C'est quoi la fatigue qui te satisfait — celle après l'effort ?"},
  {id:240,cat:"Corps & Sensations",q:"Un paysage que tu pourrais regarder pendant des heures."},
  {id:241,cat:"Corps & Sensations",q:"C'est quoi la sensation que tu associes à la liberté ?"},
  {id:242,cat:"Corps & Sensations",q:"La dernière fois que tu as pris le temps de vraiment écouter."},
  {id:243,cat:"Corps & Sensations",q:"C'est quoi le son de la nature que tu préfères ?"},
  {id:244,cat:"Corps & Sensations",q:"Une sensation que les mots ne décrivent pas bien."},
  {id:245,cat:"Corps & Sensations",q:"C'est quoi la lumière du soir qui te plaît le plus ?"},
  {id:246,cat:"Corps & Sensations",q:"La dernière fois que tu t'es arrêté pour regarder le ciel."},
  {id:247,cat:"Corps & Sensations",q:"C'est quoi le silence qui résonne encore dans ta tête ?"},
  {id:248,cat:"Corps & Sensations",q:"Une douceur que tu cherches dans les petits détails."},
  {id:249,cat:"Corps & Sensations",q:"C'est quoi la meilleure chose pour ton corps que tu fais régulièrement ?"},
  {id:250,cat:"Corps & Sensations",q:"La dernière fois que le vent t'a fait du bien."},
  {id:251,cat:"Découvertes",q:"C'est quoi le dernier truc qui t'a vraiment surpris ?"},
  {id:252,cat:"Découvertes",q:"Une idée qui a changé ta façon de voir le monde."},
  {id:253,cat:"Découvertes",q:"C'est quoi quelque chose que tu as découvert tard et que tu regrettes de ne pas avoir su plus tôt ?"},
  {id:254,cat:"Découvertes",q:"Une curiosité que tu as et que tu n'as jamais creusée."},
  {id:255,cat:"Découvertes",q:"C'est quoi une conviction que tu as abandonnée en vieillissant ?"},
  {id:256,cat:"Découvertes",q:"Quelque chose que tu as appris d'un enfant."},
  {id:257,cat:"Découvertes",q:"C'est quoi un sujet qui te fascine mais que tu n'arrives pas à expliquer ?"},
  {id:258,cat:"Découvertes",q:"La dernière fois que tu as changé d'avis sur quelque chose d'important."},
  {id:259,cat:"Découvertes",q:"C'est quoi quelque chose que tu sais faire et dont tu ne réalises pas la rareté ?"},
  {id:260,cat:"Découvertes",q:"Un documentaire, article ou livre qui a changé quelque chose en toi."},
  {id:261,cat:"Découvertes",q:"C'est quoi quelque chose d'ordinaire que tu regardes différemment depuis peu ?"},
  {id:262,cat:"Découvertes",q:"Une langue ou une culture qui t'attire sans raison précise."},
  {id:263,cat:"Découvertes",q:"C'est quoi le dernier truc que tu as appris par accident ?"},
  {id:264,cat:"Découvertes",q:"Une peur que tu as surmontée et ce que tu as trouvé de l'autre côté."},
  {id:265,cat:"Découvertes",q:"C'est quoi quelque chose qui semblait compliqué et qui s'est révélé simple ?"},
  {id:266,cat:"Découvertes",q:"Un artiste, musicien ou créateur que tu as découvert récemment."},
  {id:267,cat:"Découvertes",q:"C'est quoi une question à laquelle tu n'as pas encore de réponse ?"},
  {id:268,cat:"Découvertes",q:"Quelque chose dans la nature qui te laisse sans mots."},
  {id:269,cat:"Découvertes",q:"C'est quoi un mot dans une autre langue qui n'a pas d'équivalent en français ?"},
  {id:270,cat:"Découvertes",q:"La dernière fois que quelqu'un t'a appris quelque chose d'inattendu."},
  {id:271,cat:"Découvertes",q:"C'est quoi une idée reçue que tu as longtemps crue vraie ?"},
  {id:272,cat:"Découvertes",q:"Un endroit proche de chez toi que tu n'as jamais vraiment exploré."},
  {id:273,cat:"Découvertes",q:"C'est quoi quelque chose de beau que peu de gens remarquent ?"},
  {id:274,cat:"Découvertes",q:"Une discipline — art, sport, science — dont tu ne savais rien et qui t'a fasciné."},
  {id:275,cat:"Découvertes",q:"C'est quoi la chose la plus étonnante que tu aies apprise sur l'être humain ?"},
  {id:276,cat:"Découvertes",q:"Un truc que tu as eu honte de ne pas savoir — et que tu sais maintenant."},
  {id:277,cat:"Découvertes",q:"C'est quoi quelque chose que tu ferais si tu savais que tu ne pouvais pas échouer ?"},
  {id:278,cat:"Découvertes",q:"La dernière fois que la réalité était plus belle que l'idée que tu t'en faisais."},
  {id:279,cat:"Découvertes",q:"C'est quoi une chose dans la vie quotidienne qui te semble encore mystérieuse ?"},
  {id:280,cat:"Découvertes",q:"Un truc dont tu es convaincu et que la plupart de tes proches ne savent pas."},
  {id:281,cat:"Découvertes",q:"C'est quoi la dernière chose qui t'a rendu curieux ?"},
  {id:282,cat:"Découvertes",q:"Une habitude de quelqu'un d'autre que tu as adoptée."},
  {id:283,cat:"Découvertes",q:"C'est quoi un truc simple que tu as réalisé tardivement ?"},
  {id:284,cat:"Découvertes",q:"Quelque chose qui existe depuis toujours mais que tu viens de découvrir."},
  {id:285,cat:"Découvertes",q:"C'est quoi le dernier truc qui t'a redonné foi en l'humanité ?"},
  {id:286,cat:"Découvertes",q:"Une erreur qui t'a appris quelque chose que l'école n'aurait pas pu t'apprendre."},
  {id:287,cat:"Découvertes",q:"C'est quoi quelque chose que tu comprends maintenant sans pouvoir l'expliquer ?"},
  {id:288,cat:"Découvertes",q:"Le dernier film, livre ou discussion qui t'a fait voir les choses autrement."},
  {id:289,cat:"Découvertes",q:"C'est quoi une chose que l'âge t'a apprise ?"},
  {id:290,cat:"Découvertes",q:"Un truc absurde que tu as trouvé profondément beau."},
  {id:291,cat:"Futur & Espoirs",q:"C'est quoi la chose que tu espères le plus pour les 5 prochaines années ?"},
  {id:292,cat:"Futur & Espoirs",q:"Quelle version de toi tu veux être dans 10 ans ?"},
  {id:293,cat:"Futur & Espoirs",q:"C'est quoi quelque chose que tu veux changer dans ta vie — et tu sais déjà comment ?"},
  {id:294,cat:"Futur & Espoirs",q:"L'espoir le plus simple que tu portes en ce moment."},
  {id:295,cat:"Futur & Espoirs",q:"C'est quoi quelque chose qui t'enthousiasme dans ce que le monde devient ?"},
  {id:296,cat:"Futur & Espoirs",q:"Quel mot tu veux que les gens associent à toi dans 20 ans ?"},
  {id:297,cat:"Futur & Espoirs",q:"C'est quoi la prochaine étape de ta vie — même floue ?"},
  {id:298,cat:"Futur & Espoirs",q:"Un truc que tu veux commencer avant la fin de l'année."},
  {id:299,cat:"Futur & Espoirs",q:"C'est quoi quelque chose qui existera bientôt et qui t'enthousiasme ?"},
  {id:300,cat:"Futur & Espoirs",q:"La meilleure nouvelle que tu pourrais recevoir demain matin."},
  {id:301,cat:"Futur & Espoirs",q:"C'est quoi un pari que tu veux faire sur toi-même ?"},
  {id:302,cat:"Futur & Espoirs",q:"Qu'est-ce que tu veux transmettre ?"},
  {id:303,cat:"Futur & Espoirs",q:"C'est quoi quelque chose que tu t'autorises maintenant à vouloir ?"},
  {id:304,cat:"Futur & Espoirs",q:"La décision que tu repoussais et que tu es prêt à prendre."},
  {id:305,cat:"Futur & Espoirs",q:"C'est quoi quelque chose que tu veux avoir accompli dans les 10 prochaines années ?"},
  {id:306,cat:"Futur & Espoirs",q:"Un monde meilleur — à quoi il ressemble dans ta tête ?"},
  {id:307,cat:"Futur & Espoirs",q:"C'est quoi quelque chose de positif que tu remarques dans ta génération ?"},
  {id:308,cat:"Futur & Espoirs",q:"La chose que tu construis doucement, sans que personne le sache encore."},
  {id:309,cat:"Futur & Espoirs",q:"C'est quoi ta prochaine aventure ?"},
  {id:310,cat:"Futur & Espoirs",q:"Quelque chose qui te rend optimiste malgré tout."},
  {id:311,cat:"Futur & Espoirs",q:"C'est quoi ce que tu attends avec impatience ?"},
  {id:312,cat:"Futur & Espoirs",q:"Un rêve que tu as décidé de ne plus remettre à demain."},
  {id:313,cat:"Futur & Espoirs",q:"C'est quoi quelque chose dont tu seras fier dans un an ?"},
  {id:314,cat:"Futur & Espoirs",q:"La résolution que tu gardes secrète parce qu'elle compte trop."},
  {id:315,cat:"Futur & Espoirs",q:"C'est quoi le changement que tu as déjà commencé sans l'annoncer ?"},
  {id:316,cat:"Futur & Espoirs",q:"Un endroit où tu veux vivre — ou retourner."},
  {id:317,cat:"Futur & Espoirs",q:"C'est quoi la promesse que tu te fais pour demain ?"},
  {id:318,cat:"Futur & Espoirs",q:"Ce que tu espères pour quelqu'un que tu aimes."},
  {id:319,cat:"Futur & Espoirs",q:"C'est quoi un espoir collectif que tu portes pour l'humanité ?"},
  {id:320,cat:"Futur & Espoirs",q:"La version de toi que tu es en train de devenir."},
  {id:321,cat:"Légères & Joyeuses",q:"C'est quoi ton film réconfort que tu peux regarder 10 fois ?"},
  {id:322,cat:"Légères & Joyeuses",q:"Quel animal tu serais et pourquoi ?"},
  {id:323,cat:"Légères & Joyeuses",q:"C'est quoi ton endroit préféré pour manger ?"},
  {id:324,cat:"Légères & Joyeuses",q:"La blague ou le truc bête qui te fera rire jusqu'à la fin de ta vie."},
  {id:325,cat:"Légères & Joyeuses",q:"C'est quoi ton super-pouvoir inutile mais adorable ?"},
  {id:326,cat:"Légères & Joyeuses",q:"Si tu devais manger une seule chose pour le reste de ta vie, ce serait quoi ?"},
  {id:327,cat:"Légères & Joyeuses",q:"C'est quoi le truc le plus inutile que tu sais faire mais dont tu es fier ?"},
  {id:328,cat:"Légères & Joyeuses",q:"Ton emoji du moment — et ce qu'il raconte de toi."},
  {id:329,cat:"Légères & Joyeuses",q:"C'est quoi le son qui te met de bonne humeur en deux secondes ?"},
  {id:330,cat:"Légères & Joyeuses",q:"Si tu avais un thème musical pour entrer dans une pièce, ce serait quoi ?"},
  {id:331,cat:"Légères & Joyeuses",q:"C'est quoi l'application que tu utilises sans jamais l'admettre ?"},
  {id:332,cat:"Légères & Joyeuses",q:"Un truc que tu fais différemment des autres et que tu assumes."},
  {id:333,cat:"Légères & Joyeuses",q:"C'est quoi ta commande par cœur dans ton resto préféré ?"},
  {id:334,cat:"Légères & Joyeuses",q:"Si tu organisais une fête, c'est quoi le thème ?"},
  {id:335,cat:"Légères & Joyeuses",q:"C'est quoi quelque chose que tu fais encore avec la même joie qu'enfant ?"},
  {id:336,cat:"Légères & Joyeuses",q:"Ton mot préféré — en français ou dans une autre langue."},
  {id:337,cat:"Légères & Joyeuses",q:"C'est quoi le truc absurde sur lequel tu as une vraie opinion ?"},
  {id:338,cat:"Légères & Joyeuses",q:"Si tu devais choisir une décennie pour la musique, laquelle ?"},
  {id:339,cat:"Légères & Joyeuses",q:"C'est quoi un truc que tu fais mieux quand personne ne regarde ?"},
  {id:340,cat:"Légères & Joyeuses",q:"Ton talent caché complètement inutile."},
  {id:341,cat:"Légères & Joyeuses",q:"C'est quoi la dernière chose qui t'a fait rire tout seul ?"},
  {id:342,cat:"Légères & Joyeuses",q:"Si tu ne pouvais avoir qu'une saison toute l'année, laquelle ?"},
  {id:343,cat:"Légères & Joyeuses",q:"C'est quoi ton déguisement rêvé pour une fête ?"},
  {id:344,cat:"Légères & Joyeuses",q:"Un dessin animé d'enfance que tu regarderais encore maintenant."},
  {id:345,cat:"Légères & Joyeuses",q:"C'est quoi quelque chose que tu fais toujours dans le même ordre ?"},
  {id:346,cat:"Légères & Joyeuses",q:"Si tu avais un camion food truck, tu vendrais quoi ?"},
  {id:347,cat:"Légères & Joyeuses",q:"C'est quoi la chose la plus improbable qui se soit avérée vraie ?"},
  {id:348,cat:"Légères & Joyeuses",q:"Ton podcast ou YouTube que tu écoutes en boucle."},
  {id:349,cat:"Légères & Joyeuses",q:"C'est quoi le truc dont tu n'arrives pas à expliquer l'utilité mais qui te plaît ?"},
  {id:350,cat:"Légères & Joyeuses",q:"Si tu devais enseigner quelque chose en 5 minutes, ce serait quoi ?"},
  {id:351,cat:"Légères & Joyeuses",q:"C'est quoi ton film préféré pour un dimanche pluvieux ?"},
  {id:352,cat:"Légères & Joyeuses",q:"La chose qui t'énerve mais dont tu ris après coup."},
  {id:353,cat:"Légères & Joyeuses",q:"C'est quoi un truc que tu fais encore comme quand tu étais petit ?"},
  {id:354,cat:"Légères & Joyeuses",q:"Si tu devais décrire ton humeur du moment en une image, ce serait laquelle ?"},
  {id:355,cat:"Légères & Joyeuses",q:"C'est quoi quelque chose que tu trouves beau que personne ne remarque ?"},
  {id:356,cat:"Légères & Joyeuses",q:"Un truc que tu as cherché longtemps et qui était sous ton nez."},
  {id:357,cat:"Légères & Joyeuses",q:"C'est quoi une manie dont tu n'es pas près de te débarrasser ?"},
  {id:358,cat:"Légères & Joyeuses",q:"Si tu écrivais un roman, ton personnage principal s'appellerait comment ?"},
  {id:359,cat:"Légères & Joyeuses",q:"C'est quoi la chose qui te manquerait le plus si internet disparaissait ?"},
  {id:360,cat:"Légères & Joyeuses",q:"Un truc dont tu es fan et que tu assumes complètement."},
  {id:361,cat:"Universelles",q:"C'est quoi pour toi une vie bien vécue ?"},
  {id:362,cat:"Universelles",q:"Qu'est-ce que tout le monde cherche, au fond ?"},
  {id:363,cat:"Universelles",q:"C'est quoi quelque chose qui unit les gens partout dans le monde ?"},
  {id:364,cat:"Universelles",q:"Si tu avais un message à envoyer à l'humanité entière, ce serait quoi ?"},
  {id:365,cat:"Universelles",q:"C'est quoi quelque chose de vrai pour tout le monde, sans exception ?"},
  {id:366,cat:"Universelles",q:"Quelle émotion tu penses que les gens ressentent le plus mais n'osent pas dire ?"},
  {id:367,cat:"Universelles",q:"C'est quoi le besoin humain le plus fondamental selon toi ?"},
  {id:368,cat:"Universelles",q:"Qu'est-ce qu'on perd en grandissant qu'il faudrait garder ?"},
  {id:369,cat:"Universelles",q:"C'est quoi quelque chose de beau dans le fait d'être humain ?"},
  {id:370,cat:"Universelles",q:"Quelle question tu te poses sur la vie en ce moment ?"},
  {id:371,cat:"Universelles",q:"C'est quoi la chose la plus difficile à expliquer à quelqu'un qui ne l'a jamais vécu ?"},
  {id:372,cat:"Universelles",q:"Qu'est-ce qui rend un moment inoubliable ?"},
  {id:373,cat:"Universelles",q:"C'est quoi la chose la plus courageuse que les gens font au quotidien sans s'en rendre compte ?"},
  {id:374,cat:"Universelles",q:"Qu'est-ce qu'on ne peut pas acheter mais tout le monde veut ?"},
  {id:375,cat:"Universelles",q:"C'est quoi quelque chose qui te réconcilie avec le monde ?"},
  {id:376,cat:"Universelles",q:"La chose la plus simple qui peut changer la journée de quelqu'un."},
  {id:377,cat:"Universelles",q:"C'est quoi ce qui rend une personne mémorable ?"},
  {id:378,cat:"Universelles",q:"Qu'est-ce qui fait que deux étrangers se comprennent sans se parler ?"},
  {id:379,cat:"Universelles",q:"C'est quoi quelque chose qu'on sous-estime dans le bonheur ordinaire ?"},
  {id:380,cat:"Universelles",q:"Quelle question mérite qu'on y revienne toute sa vie ?"},
  {id:381,cat:"Universelles",q:"C'est quoi une vérité que tout le monde sait mais que personne ne dit ?"},
  {id:382,cat:"Universelles",q:"Qu'est-ce que le temps t'a appris que les mots n'auraient pas pu ?"},
  {id:383,cat:"Universelles",q:"C'est quoi la chose la plus importante qu'on ne voit pas ?"},
  {id:384,cat:"Universelles",q:"Qu'est-ce qui reste quand tout le reste disparaît ?"},
  {id:385,cat:"Universelles",q:"C'est quoi quelque chose de fondamentalement humain que la technologie ne remplacera jamais ?"},
  {id:386,cat:"Universelles",q:"Quelle phrase t'a changé pour toujours ?"},
  {id:387,cat:"Universelles",q:"C'est quoi la chose la plus honnête que tu puisses dire sur la vie ?"},
  {id:388,cat:"Universelles",q:"Qu'est-ce que les gens regrettent le plus, en général ?"},
  {id:389,cat:"Universelles",q:"C'est quoi quelque chose de petit qui a un impact énorme ?"},
  {id:390,cat:"Universelles",q:"Quelle est la meilleure façon de traverser une période difficile ?"},
  {id:391,cat:"Universelles",q:"C'est quoi quelque chose qu'on ne dit pas assez ?"},
  {id:392,cat:"Universelles",q:"Qu'est-ce qui mérite qu'on lui accorde plus d'attention ?"},
  {id:393,cat:"Universelles",q:"C'est quoi quelque chose de beau dans le fait de vieillir ?"},
  {id:394,cat:"Universelles",q:"Quelle leçon tu voudrais que le monde retienne ?"},
  {id:395,cat:"Universelles",q:"C'est quoi une chose dont on n'a pas besoin mais qu'on croit indispensable ?"},
  {id:396,cat:"Universelles",q:"Qu'est-ce qui nous rend tous pareils, malgré les différences ?"},
  {id:397,cat:"Universelles",q:"C'est quoi quelque chose que tu sais maintenant que tu ignorais il y a 5 ans ?"},
  {id:398,cat:"Universelles",q:"Qu'est-ce qui donne envie de se lever le matin ?"},
  {id:399,cat:"Universelles",q:"C'est quoi quelque chose que tu gardes en toi comme une lumière ?"},
  {id:400,cat:"Universelles",q:"Qu'est-ce que tu dirais à quelqu'un qui se sent invisible ?"},
];

// ─── Rotation aléatoire seedée ─────────────────────────────────
const LAUNCH = new Date("2025-01-01");
function seededRandom(seed) { const x = Math.sin(seed+1)*10000; return x-Math.floor(x); }
function getTodayQ() {
  const today = new Date(); today.setHours(0,0,0,0);
  const day = Math.floor((today-LAUNCH)/86400000);
  return QUESTIONS[Math.floor(seededRandom(day)*QUESTIONS.length)];
}

// ─── Thèmes ────────────────────────────────────────────────────
const LIGHT = {bg:"#F6F3EE",surface:"#EDEAE3",card:"#FDFCFA",border:"#D8D4CC",text:"#1A1815",soft:"#8A8680",accent:"#B8742A",help:"#3D7A56",helpBg:"#E4F0EB",urgent:"#B84040",urgentBg:"#F5E4E4"};
const DARK  = {bg:"#111009",surface:"#1C1A14",card:"#242118",border:"#2E2C24",text:"#EDE9E1",soft:"#6B6860",accent:"#D4924A",help:"#5DAF80",helpBg:"#162018",urgent:"#E07070",urgentBg:"#2A1414"};

// ─── Icônes SVG flat ───────────────────────────────────────────
const I = {
  Moon: ({c,s=17}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>,
  Sun:  ({c,s=17}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="4.5"/>{[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180;return<line key={a} x1={12+8*Math.cos(r)} y1={12+8*Math.sin(r)} x2={12+6.2*Math.cos(r)} y2={12+6.2*Math.sin(r)} stroke={c} strokeWidth="2" strokeLinecap="round"/>})}</svg>,
  Back: ({c,s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>,
  Heart:({c,s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Gem:  ({c,s=26}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 2l10 10-10 10L2 12z"/></svg>,
  Phone:({c,s=12}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  X:    ({c,s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ─── Numéros d'aide ────────────────────────────────────────────
const HELP = [
  {label:"Urgence immédiate",urgent:true,lines:[
    {name:"SAMU",number:"15",desc:"Urgence médicale, danger immédiat.",hours:"24h/24"},
    {name:"Urgences",number:"112",desc:"Numéro européen, toutes urgences.",hours:"24h/24"},
  ]},
  {label:"Crise & Suicide",lines:[
    {name:"Prévention du suicide",number:"3114",desc:"Numéro national officiel. Professionnels de santé mentale.",hours:"24h/24 · Gratuit"},
    {name:"Suicide Écoute",number:"01 45 39 40 00",desc:"Écoute anonyme et confidentielle.",hours:"24h/24"},
    {name:"SOS Suicide Phénix",number:"01 40 44 46 45",desc:"Soutien en cas de crise suicidaire.",hours:"13h–23h"},
  ]},
  {label:"Écoute & Solitude",lines:[
    {name:"SOS Amitié",number:"09 72 39 40 50",desc:"Écoute émotionnelle, anonyme.",hours:"24h/24"},
    {name:"Croix-Rouge Écoute",number:"0800 858 858",desc:"Écoute bienveillante, appel gratuit.",hours:"7j/7 · Gratuit"},
    {name:"SOS Dépression",number:"0 890 88 88 00",desc:"Aide psychologique ponctuelle.",hours:"24h/24"},
    {name:"Solitud'Écoute +50",number:"0800 47 47 88",desc:"Pour les personnes de plus de 50 ans.",hours:"15h–20h · Gratuit"},
  ]},
  {label:"Jeunes",lines:[
    {name:"Fil Santé Jeunes",number:"0800 235 236",desc:"Santé physique, psychologique, sociale.",hours:"8h–minuit · Gratuit"},
    {name:"Le Refuge · LGBT+",number:"06 31 59 69 50",desc:"Jeunes LGBT+ en souffrance ou isolement.",hours:"24h/24"},
    {name:"Harcèlement numérique",number:"3018",desc:"Cyber-harcèlement, violences en ligne.",hours:"24h/24"},
  ]},
  {label:"Violence & Victimes",lines:[
    {name:"Violences Femmes Info",number:"3919",desc:"Femmes victimes de violences.",hours:"9h–19h · 7j/7"},
    {name:"Aide aux Victimes",number:"116 006",desc:"Toute victime de violence, gratuit.",hours:"9h–19h · 7j/7"},
    {name:"Enfance en Danger",number:"119",desc:"Signalement, mineurs en danger.",hours:"24h/24 · Gratuit"},
    {name:"Viols Femmes",number:"0800 05 95 95",desc:"Victimes d'agressions sexuelles.",hours:"Lun–Ven · Gratuit"},
  ]},
  {label:"Addictions",lines:[
    {name:"Alcool Info Service",number:"0 980 980 930",desc:"Alcool et dépendances.",hours:"7j/7"},
    {name:"Drogues Info Service",number:"0 800 23 13 13",desc:"Toutes substances, anonyme.",hours:"7j/7 · Gratuit"},
  ]},
];

const TODAY_STR = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const KOFI_URL  = "https://ko-fi.com/murmureapp";

// ─── Composants base ───────────────────────────────────────────
const Bar = ({T,showBack,onBack}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px 6px",flexShrink:0}}>
    {showBack
      ? <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:T.soft,fontFamily:"system-ui",fontSize:13,padding:0}}><I.Back c={T.soft}/> Retour</button>
      : <div style={{width:24}}/>
    }
    <div style={{width:24}}/>
  </div>
);

const HelpBtn = ({T,onClick}) => (
  <button onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:T.help,fontFamily:"system-ui",fontSize:13,fontWeight:500,padding:"10px 0 2px",width:"100%"}}>
    <I.Heart c={T.help}/> Besoin d'aide ?
  </button>
);

const KofiBtn = ({T}) => (
  <a href={KOFI_URL} target="_blank" rel="noopener noreferrer"
    style={{display:"block",textAlign:"center",fontSize:11,color:T.soft,fontFamily:"system-ui",padding:"4px 0 2px",textDecoration:"none",opacity:0.6}}>
    Soutenir Murmure
  </a>
);

const Btn = ({T,children,onClick,disabled,v="dark"}) => {
  const vs = {dark:{backgroundColor:T.text,color:T.bg,border:"none"},ghost:{backgroundColor:"transparent",color:T.soft,border:`1.5px solid ${T.border}`},accent:{backgroundColor:T.accent,color:"#fff",border:"none"}};
  return <button onClick={onClick} disabled={disabled} style={{...vs[v],padding:"15px 20px",borderRadius:13,fontSize:15,fontWeight:600,fontFamily:"system-ui",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.35:1,width:"100%",transition:"opacity .2s"}}>{children}</button>;
};

// ─── Spinner ───────────────────────────────────────────────────
const Spinner = ({T}) => (
  <div style={{display:"flex",justifyContent:"center",padding:"32px 0"}}>
    <div style={{width:24,height:24,border:`2px solid ${T.border}`,borderTop:`2px solid ${T.soft}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── Modal Aide ────────────────────────────────────────────────
const HelpModal = ({T,onClose}) => {
  const [vis,setVis] = useState(false);
  useEffect(()=>{requestAnimationFrame(()=>setVis(true));},[]);
  return (
    <div style={{position:"absolute",inset:0,zIndex:200,display:"flex",flexDirection:"column",backgroundColor:T.bg,opacity:vis?1:0,transition:"opacity .3s"}}>
      <div style={{flexShrink:0,padding:"44px 24px 14px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><I.Heart c={T.help} s={17}/><span style={{fontSize:18,fontFamily:"Georgia,serif",color:T.text}}>Tu n'es pas seul·e.</span></div>
            <div style={{fontSize:12.5,color:T.soft,fontFamily:"system-ui",lineHeight:1.65,maxWidth:270}}>Des personnes formées sont là maintenant pour t'écouter, sans jugement.</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><I.X c={T.soft}/></button>
        </div>
      </div>
      <div style={{flex:1,minHeight:0,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"16px 24px 32px"}}>
        {HELP.map((cat,ci) => (
          <div key={ci} style={{marginBottom:18}}>
            <div style={{fontSize:10,letterSpacing:2.5,textTransform:"uppercase",fontFamily:"system-ui",fontWeight:700,color:cat.urgent?T.urgent:T.help,marginBottom:7}}>{cat.label}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {cat.lines.map((l,li) => (
                <div key={li} style={{backgroundColor:cat.urgent?T.urgentBg:T.card,border:`1.5px solid ${cat.urgent?T.urgent+"44":T.border}`,borderLeft:`3px solid ${cat.urgent?T.urgent:T.help}`,borderRadius:12,padding:"11px 13px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:"system-ui"}}>{l.name}</span>
                    <span style={{fontSize:10,color:cat.urgent?T.urgent:T.help,fontFamily:"system-ui",fontWeight:600}}>{l.hours}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><I.Phone c={cat.urgent?T.urgent:T.help}/><span style={{fontSize:18,fontWeight:800,color:cat.urgent?T.urgent:T.help,fontFamily:"system-ui"}}>{l.number}</span></div>
                  <div style={{fontSize:11.5,color:T.soft,fontFamily:"system-ui",lineHeight:1.5}}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{backgroundColor:T.surface,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
          <div style={{fontSize:11,color:T.soft,fontFamily:"system-ui",lineHeight:1.7}}>Numéros indépendants de Murmure · Gratuits et confidentiels</div>
        </div>
      </div>
    </div>
  );
};

// ─── Écrans ────────────────────────────────────────────────────
const Splash = ({T,onHelp,onNext}) => {
  const [title,setTitle] = useState(false);
  const [rest,setRest]   = useState(false);
  useEffect(()=>{
    setTimeout(()=>setTitle(true), 120);   // "Murmure" arrive en premier
    setTimeout(()=>setRest(true),  900);   // tout le reste arrive ensemble
  },[]);

  const restStyle = {
    opacity: rest ? 1 : 0,
    filter:  rest ? "blur(0px)" : "blur(10px)",
    transition: "opacity 0.6s ease, filter 0.6s ease",
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <Bar T={T}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"32px"}}>
        {/* Tagline — arrive avec le reste */}
        <div style={{fontSize:10,letterSpacing:4,color:T.soft,textTransform:"uppercase",fontFamily:"system-ui",fontWeight:500,marginBottom:12,...restStyle}}>
          une voix parmi d'autres
        </div>
        {/* MURMURE — apparaît en premier */}
        <div style={{
          fontSize:50,fontFamily:"Georgia,'Times New Roman',serif",color:T.text,fontWeight:400,letterSpacing:-1,marginBottom:6,
          opacity:title?1:0, filter:title?"blur(0px)":"blur(8px)",
          transition:"opacity 0.5s ease, filter 0.5s ease",
        }}>
          Murmure
        </div>
        {/* Ligne — arrive avec le reste */}
        <div style={{width:30,height:1.5,backgroundColor:T.accent,marginBottom:22,...restStyle}}/>
        {/* Phrase — arrive avec le reste */}
        <div style={{fontSize:14,color:T.soft,textAlign:"center",lineHeight:1.8,fontFamily:"system-ui",maxWidth:210,...restStyle}}>
          Une question. Des réponses d'inconnus. Rien d'autre.
        </div>
      </div>
      {/* Boutons — arrivent avec le reste */}
      <div style={{padding:"0 28px 24px",display:"flex",flexDirection:"column",gap:10,flexShrink:0,...restStyle}}>
        <Btn T={T} onClick={onNext}>Commencer</Btn>
        <div style={{textAlign:"center",fontSize:11,color:T.soft,fontFamily:"system-ui"}}>Anonyme · Sans compte · Gratuit</div>
        <KofiBtn T={T}/>
        <HelpBtn T={T} onClick={onHelp}/>
      </div>
    </div>
  );
};

const Question = ({T,onHelp,onAnswer,onVoices,answered,todayQ,voiceCount}) => (
  <div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <Bar T={T}/>
    <div style={{padding:"8px 24px 0",flexShrink:0}}>
      <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:T.soft,fontFamily:"system-ui",fontWeight:500}}>{TODAY_STR}</div>
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px"}}>
      <div style={{fontSize:9.5,letterSpacing:3,textTransform:"uppercase",color:T.accent,fontFamily:"system-ui",fontWeight:700,marginBottom:14}}>Question du jour · {todayQ.cat}</div>
      <div style={{fontSize:26,fontFamily:"Georgia,'Times New Roman',serif",color:T.text,lineHeight:1.45,marginBottom:22}}>{todayQ.q}</div>
      <div style={{width:36,height:1.5,backgroundColor:T.border,marginBottom:16}}/>
      <div style={{fontSize:13,color:T.soft,fontFamily:"system-ui",lineHeight:1.6}}>
        {answered ? "Tu as déjà répondu aujourd'hui." : "Ta réponse sera lue anonymement."}
      </div>
    </div>
    <div style={{padding:"0 28px 22px",display:"flex",flexDirection:"column",gap:9,flexShrink:0}}>
      {answered ? <Btn T={T} onClick={onAnswer} v="ghost">Modifier ma réponse</Btn> : <Btn T={T} onClick={onAnswer}>Répondre</Btn>}
      <Btn T={T} onClick={onVoices} v={answered?"dark":"ghost"}>
        {voiceCount > 0 ? `Lire les ${voiceCount} voix` : answered ? "Lire les voix" : "Voir les voix"}
      </Btn>
      <HelpBtn T={T} onClick={onHelp}/>
    </div>
  </div>
);

const Answer = ({T,onHelp,onBack,onSubmit,todayQ,submitting,initialText=""}) => {
  const [text,setText] = useState(initialText);
  const MAX = 200;
  const isEdit = initialText.length > 0;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <Bar T={T} showBack onBack={onBack}/>
      <div style={{padding:"10px 28px 14px",flexShrink:0}}>
        <div style={{fontSize:11.5,color:T.soft,fontFamily:"system-ui",marginBottom:6}}>
          {isEdit ? "Modifier ta réponse à" : "Ta réponse à"}
        </div>
        <div style={{fontSize:16,fontFamily:"Georgia,serif",color:T.text,lineHeight:1.45}}>{todayQ.q}</div>
      </div>
      <div style={{padding:"0 28px",flex:1,minHeight:80,maxHeight:280}}>
        <div style={{backgroundColor:T.card,borderRadius:14,border:`1.5px solid ${T.border}`,padding:"16px",height:"100%",boxSizing:"border-box"}}>
          <textarea value={text} onChange={e=>setText(e.target.value.slice(0,MAX))} placeholder="Écris ce qui te vient vraiment…" style={{width:"100%",height:"100%",border:"none",outline:"none",background:"transparent",resize:"none",fontSize:16,fontFamily:"Georgia,serif",color:T.text,lineHeight:1.65,boxSizing:"border-box",padding:0,caretColor:T.accent}}/>
        </div>
      </div>
      <div style={{padding:"8px 28px 22px",flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{textAlign:"right",fontSize:11,color:text.length>MAX*.8?T.accent:T.soft,fontFamily:"system-ui"}}>{text.length}/{MAX}</div>
        <Btn T={T} onClick={()=>onSubmit(text)} disabled={text.trim().length<3||submitting}>
          {submitting ? "Envoi en cours…" : isEdit ? "Mettre à jour" : "Envoyer dans le silence"}
        </Btn>
        <div style={{textAlign:"center",fontSize:11,color:T.soft,fontFamily:"system-ui"}}>Personne ne saura que c'est toi.</div>
        <HelpBtn T={T} onClick={onHelp}/>
      </div>
    </div>
  );
};

const Thanks = ({T,onHelp,onVoices}) => {
  const [v,setV] = useState(false);
  useEffect(()=>{setTimeout(()=>setV(true),80);},[]);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",opacity:v?1:0,transition:"opacity .5s"}}>
      <Bar T={T}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"40px 32px"}}>
        <I.Gem c={T.accent} s={36}/>
        <div style={{height:18}}/>
        <div style={{fontSize:23,fontFamily:"Georgia,serif",color:T.text,textAlign:"center",lineHeight:1.45,marginBottom:12}}>Ta voix rejoint les autres.</div>
        <div style={{width:30,height:1.5,backgroundColor:T.accent,marginBottom:14}}/>
        <div style={{fontSize:13.5,color:T.soft,textAlign:"center",lineHeight:1.75,fontFamily:"system-ui",maxWidth:220}}>Elle sera lue par des inconnus. Ni ton nom, ni ton visage. Juste tes mots.</div>
      </div>
      <div style={{padding:"0 28px 22px",display:"flex",flexDirection:"column",gap:10,flexShrink:0}}>
        <Btn T={T} onClick={onVoices} v="accent">Lire les autres voix</Btn>
        <HelpBtn T={T} onClick={onHelp}/>
      </div>
    </div>
  );
};

const Voices = ({T,onHelp,onBack,todayQ,voices,loading}) => (
  <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{flexShrink:0,borderBottom:`1px solid ${T.border}`}}>
      <Bar T={T} showBack onBack={onBack}/>
      <div style={{padding:"0 24px 12px"}}>
        <div style={{fontSize:9.5,letterSpacing:3,textTransform:"uppercase",color:T.accent,fontFamily:"system-ui",fontWeight:700,marginBottom:5}}>
          Les voix d'aujourd'hui {voices.length > 0 && `· ${voices.length}`}
        </div>
        <div style={{fontSize:14.5,fontFamily:"Georgia,serif",color:T.text,lineHeight:1.4}}>{todayQ.q}</div>
      </div>
    </div>
    <div style={{flex:1,minHeight:0,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 24px 8px",display:"flex",flexDirection:"column",gap:10}}>
      {loading && <Spinner T={T}/>}
      {!loading && voices.length === 0 && (
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:24,marginBottom:14,color:T.accent}}>✦</div>
          <div style={{fontSize:16,fontFamily:"Georgia,serif",color:T.text,marginBottom:10}}>Sois la première voix.</div>
          <div style={{fontSize:13,color:T.soft,fontFamily:"system-ui",lineHeight:1.7}}>Personne n'a encore répondu aujourd'hui. Ta voix sera la première lue.</div>
        </div>
      )}
      {!loading && voices.map((v,i) => (
        <div key={i} style={{backgroundColor:T.card,border:`1.5px solid ${T.border}`,borderRadius:13,padding:"15px 17px",flexShrink:0}}>
          <div style={{fontSize:14.5,fontFamily:"Georgia,serif",color:T.text,lineHeight:1.65,marginBottom:9}}>"{v.content}"</div>
          <div style={{fontSize:10.5,color:T.soft,fontFamily:"system-ui"}}>— Anonyme · {TODAY_STR}</div>
        </div>
      ))}
      {!loading && voices.length > 0 && (
        <div style={{textAlign:"center",padding:"14px 0",fontSize:12,color:T.soft,fontFamily:"system-ui",lineHeight:1.8,flexShrink:0}}>
          Tu as lu toutes les voix d'aujourd'hui.<br/>Reviens demain.
        </div>
      )}
    </div>
    <div style={{flexShrink:0,padding:"6px 28px 20px",borderTop:`1px solid ${T.border}`}}>
      <HelpBtn T={T} onClick={onHelp}/>
      <KofiBtn T={T}/>
    </div>
  </div>
);

// ─── Navigation dots ───────────────────────────────────────────
const SCREENS = ["splash","question","answer","thanks","voices"];
const Dots = ({current,T}) => (
  <div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5,zIndex:20}}>
    {SCREENS.map((_,i) => <div key={i} style={{width:i===current?16:5,height:5,borderRadius:3,backgroundColor:i===current?T.text:T.border,transition:"all .3s"}}/>)}
  </div>
);

// ─── App ───────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]   = useState("splash");
  const [answered,setAnswered] = useState(false);
  const [dark,setDark]       = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [help,setHelp]           = useState(false);
  const [voices,setVoices]       = useState([]);
  const [loadingV,setLoadingV]   = useState(false);
  const [submitting,setSubmitting] = useState(false);
  const [existingResp,setExisting] = useState(null);
  const [deviceId]               = useState(getOrCreateDeviceId);
  // Hauteur visible réelle — se réduit quand le clavier s'ouvre
  const [vvH, setVvH] = useState(
    () => typeof window !== "undefined" ? (window.visualViewport?.height || window.innerHeight) : 800
  );

  // Mode sombre/clair automatique (préférence système)
  useEffect(()=>{
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  },[]);

  // Suit la hauteur visible (clavier ouvert/fermé)
  useEffect(()=>{
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => setVvH(vv.height);
    vv.addEventListener("resize", handler);
    vv.addEventListener("scroll", handler);
    return () => { vv.removeEventListener("resize", handler); vv.removeEventListener("scroll", handler); };
  },[]);

  const T      = dark ? DARK : LIGHT;
  const onHelp = () => setHelp(true);
  const todayQ = getTodayQ();

  // Vérifie si déjà répondu (localStorage d'abord, Supabase ensuite)
  useEffect(() => {
    if (localHasAnswered()) { setAnswered(true); return; }
    sbCheckAnswered(deviceId).then(ok => { if (ok) { setAnswered(true); localSetAnswered(); }});
  }, [deviceId]);

  // Charger les voix quand on va sur l'écran voices
  useEffect(() => {
    if (screen === "voices") {
      setLoadingV(true);
      sbFetchVoices(todayQ.id).then(data => {
        setVoices(Array.isArray(data) ? data : []);
        setLoadingV(false);
      });
    }
  }, [screen]);

  // Aller sur l'écran de réponse (nouvelle ou modification)
  const goToAnswer = async () => {
    if (answered) {
      const resp = await sbGetMyResponse(deviceId);
      setExisting(resp);
    } else {
      setExisting(null);
    }
    go("answer");
  };

  // Soumettre ou mettre à jour
  const handleSubmit = async (text) => {
    if (text.trim().length < 3) return;
    setSubmitting(true);
    let ok = false;
    if (existingResp) {
      ok = await sbUpdate(existingResp.id, text.trim());
    } else {
      ok = await sbSubmit(todayQ.id, text.trim(), deviceId);
    }
    setSubmitting(false);
    if (ok) {
      setAnswered(true);
      localSetAnswered();
      setExisting(null);
      go("thanks");
    }
  };

  // ─── Navigation avec direction pour les animations ────────────
  const SCREEN_ORDER = ["splash","question","answer","thanks","voices"];
  const dirRef = { current: 1 }; // 1 = avant, -1 = arrière

  const go = (to) => {
    dirRef.current = SCREEN_ORDER.indexOf(to) >= SCREEN_ORDER.indexOf(screen) ? 1 : -1;
    setScreen(to);
  };

  // ─── Swipe (glisser à droite = retour) ────────────────────────
  const BACK_MAP = { answer:"question", thanks:"question", voices:"question", question:"splash" };
  const touchRef = { start: null };
  const onTouchStart = (e) => { touchRef.start = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchRef.start === null) return;
    const dist = e.changedTouches[0].clientX - touchRef.start;
    touchRef.start = null;
    if (dist > 60 && e.target.tagName !== "TEXTAREA") {
      const dest = BACK_MAP[screen];
      if (dest) go(dest);
    }
  };

  // CSS animations — flou doux
  const transitionCSS = `
    @keyframes blurIn { from { opacity:0; filter:blur(10px); } to { opacity:1; filter:blur(0px); } }
  `;

  const base = {T, onHelp, todayQ};

  // Contenu commun aux deux modes
  const inner = (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
         style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{transitionCSS}</style>
      {/* key={screen} force le re-mount à chaque changement → animation joue */}
      <div key={screen}
           style={{
             flex:1, display:"flex", flexDirection:"column", paddingTop:2, overflow:"hidden",
           animation:`blurIn 0.35s ease both`
           }}>
        {screen==="splash"   && <Splash   {...base} onNext={()=>go("question")}/>}
        {screen==="question" && <Question {...base} onAnswer={goToAnswer} onVoices={()=>go("voices")} answered={answered} voiceCount={voices.length}/>}
        {screen==="answer"   && <Answer   {...base} onBack={()=>go("question")} onSubmit={handleSubmit} submitting={submitting} initialText={existingResp?.content || ""}/>}
        {screen==="thanks"   && <Thanks   {...base} onVoices={()=>go("voices")}/>}
        {screen==="voices"   && <Voices   {...base} onBack={()=>go("question")} voices={voices} loading={loadingV}/>}
      </div>
      {help && <HelpModal T={T} onClose={()=>setHelp(false)}/>}
    </div>
  );

  // Mobile (≤600px) : plein écran, hauteur suit le clavier via visualViewport
  if (typeof window !== "undefined" && window.innerWidth <= 600) {
    return (
      <div style={{
        position:"fixed",
        top:0, left:0, right:0,
        height: vvH + "px",   // se réduit quand le clavier s'ouvre
        backgroundColor:T.bg,
        display:"flex", flexDirection:"column",
        overflow:"hidden",
        paddingTop:"env(safe-area-inset-top,0px)",
        transition:"background-color .35s",
      }}>
        {inner}
      </div>
    );
  }

  // Desktop / tablette : cadre iPhone centré sur fond sombre, dots sous le notch
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",backgroundColor:"#0A0A0A"}}>
      <div style={{position:"relative",width:375,height:812,backgroundColor:T.bg,borderRadius:44,overflow:"hidden",boxShadow:"0 40px 100px rgba(0,0,0,0.8)",display:"flex",flexDirection:"column",transition:"background-color .35s"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:120,height:28,backgroundColor:"#0A0A0A",borderRadius:"0 0 18px 18px",zIndex:100}}/>
        <Dots current={SCREENS.indexOf(screen)} T={T}/>
        {inner}
        <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",width:120,height:5,backgroundColor:T.text,borderRadius:3,opacity:.12,pointerEvents:"none"}}/>
      </div>
    </div>
  );
}
