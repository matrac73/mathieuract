---
title: "ChatGPT répond sans rien chercher : ce qui le sépare d'un moteur de recherche"
summary: "OpenAI met en ligne ChatGPT et prévient qu'il écrit parfois des réponses plausibles mais fausses. L'index inversé et la précision, vus en cours de recherche d'information, montrent pourquoi ce n'est pas un moteur de recherche."
hook: "ChatGPT ne va chercher aucun document : il écrit sa réponse mot après mot, ce qui la rend fluide mais invérifiable sur place, alors qu'un moteur de recherche ne renvoie que des pages qui existent."
category: "perspective"
date: "2022-11-30"
written: "2022-11"
readingMinutes: 5
course: "Web data intelligence (1A)"
courseSlug: "web-data-intelligence-1a"
news:
  title: "OpenAI présente ChatGPT"
  source: "OpenAI"
  url: "https://openai.com/blog/chatgpt"
  date: "2022-11-30"
---

## Ce qui s'est passé

Le 30 novembre, OpenAI met en ligne ChatGPT, un programme avec lequel on converse par écrit. L'accès est gratuit pendant cette phase, que l'entreprise appelle un aperçu de recherche et qu'elle ouvre pour recueillir les retours des utilisateurs. D'après OpenAI, le modèle répond aux questions, suit le fil d'une conversation, reconnaît ses erreurs et refuse certaines demandes. Il dérive d'un modèle de la série GPT-3.5, affiné avec l'aide de personnes qui ont écrit des dialogues puis classé des réponses.

La liste des limites publiée par OpenAI commence par celle-ci : ChatGPT écrit parfois des réponses qui sonnent juste mais qui sont fausses ou absurdes. Comme on lui pose des questions à la manière dont on interroge un moteur de recherche, la comparaison vient toute seule. Le cours de recherche d'information permet de la faire proprement.

## Ce que dit le cours : un moteur renvoie des documents

Un moteur de recherche ne lit pas le web au moment où on l'interroge. Il a préparé à l'avance un index inversé : pour chaque terme, la liste des documents qui le contiennent. Le cours le construit sur une collection de cinq phrases qui parlent de ventes de maisons, notées d1 à d5. Le terme « july » pointe vers d2, d3 et d4. Le terme « new » pointe vers d1 et d4. Le terme « home » pointe vers les cinq.

Tous les termes n'ont pas la même valeur. Le cours leur donne un poids, l'IDF (inverse document frequency, fréquence inverse de document) : log(N / df), où N est le nombre de documents et df le nombre de ceux qui contiennent le terme. Avec N = 5 et des logarithmes en base 10, « july » vaut log(5/3) ≈ 0,22, « new » vaut log(5/2) ≈ 0,40 et « home » vaut log(5/5) = 0. Un mot présent partout ne distingue aucun document. L'IDF est la moitié de la pondération TF-IDF. L'autre moitié, TF, compte les apparitions du terme dans le document, et vaut 1 partout ici.

Pour la requête « july new », j'additionne les poids des termes présents dans chaque document. d4 contient les deux et obtient 0,62. d1 obtient 0,40, d2 et d3 obtiennent 0,22, d5 n'obtient rien et n'est pas renvoyé.

```figure
file: fig-1.svg
caption: Un moteur de recherche passe par un index et renvoie des documents classés
scroll: Cinq documents sont posés à gauche, l'index inversé apparaît au centre, puis le classement à droite, et un trait orange ramène le premier résultat à son document.
steps:
- La collection du cours contient cinq documents, d1 à d5. Ce sont eux, et eux seuls, que le moteur peut renvoyer.
- L'index inversé donne pour chaque terme la liste des documents qui le contiennent. Un terme rare pèse plus qu'un terme présent partout.
- Pour la requête « july new », chaque document reçoit la somme des poids de ses termes. d4 contient les deux mots et arrive en tête.
- Le premier résultat est le document d4 lui-même. On peut l'ouvrir et le lire pour vérifier.
```

Le point qui compte pour la suite est que la réponse d'un moteur est une liste de documents qui existent. Le moteur peut se tromper, et le cours mesure cette erreur avec deux nombres. La précision est la part des documents renvoyés qui sont pertinents. Le rappel est la part des documents pertinents qui sont renvoyés. Dans un exercice du cours, un système renvoie 200 documents dont 170 sont pertinents, alors que la collection en compte 190. La précision vaut 170 / 200 = 0,85 et le rappel 170 / 190 ≈ 0,89.

## Ce que fait ChatGPT : une phrase, pas un document

GPT-3, la famille dont vient ChatGPT, est décrit par ses auteurs comme un modèle de langage autorégressif à 175 milliards de paramètres. Autorégressif veut dire qu'il produit le texte un morceau après l'autre, chaque morceau étant choisi d'après ceux qui précèdent. D'après TechCrunch, GPT-3.5 a été entraîné sur des textes et du code publiés avant le dernier trimestre 2021, et il s'appuie sur les régularités statistiques de ces données.

Il n'y a donc ni index, ni liste de documents. Prenons une phrase qui commence par « La capitale de l'Australie est ». J'invente des probabilités pour l'exemple : Canberra 55 %, Sydney 35 %, Melbourne 10 %. Si le modèle tire le mot suivant selon ces probabilités, il écrit Sydney environ une fois sur trois. La phrase est bien formée, elle est plausible, et elle est fausse. OpenAI note d'ailleurs que la même question posée deux fois peut recevoir deux réponses différentes.

```figure
file: fig-2.svg
caption: Un modèle de langage choisit le mot suivant d'après sa probabilité
scroll: Une phrase incomplète attend son dernier mot, trois barres de probabilité apparaissent, puis la barre orange envoie un mot faux dans la case vide.
steps:
- Le modèle a déjà écrit le début de la phrase. Il lui reste à produire le mot suivant.
- Il attribue une probabilité à chaque mot possible, d'après les textes sur lesquels il a été entraîné. Les chiffres sont inventés pour l'exemple.
- Le tirage tombe ici sur Sydney, qui avait 35 % de chances. La phrase est fluide et plausible, mais elle est fausse.
- Rien ne relie cette phrase à un document. Il n'y a aucune page à ouvrir pour la vérifier.
```

## Ce que la comparaison fait comprendre

La première différence touche à la vérification. Un résultat de moteur est une adresse : on ouvre la page, on voit qui l'a écrite, on juge. La réponse de ChatGPT est un texte neuf, qui n'existe nulle part ailleurs.

La deuxième touche au silence. Dans le modèle booléen du cours, une requête comme « sale AND increase » ne renvoie que les documents qui contiennent les deux termes, et un terme absent de l'index donne une liste vide. Un modèle de langage a toujours un mot suivant à proposer. OpenAI écrit que le rendre plus prudent le conduit à refuser des questions auxquelles il saurait répondre.

La troisième touche à la mesure. La précision compte des documents, et l'utilisateur voit les mauvais résultats dans la liste. Dans une réponse rédigée, l'erreur est une affirmation parmi d'autres, écrite sur le même ton. OpenAI reconnaît que le problème est difficile à corriger, notamment parce qu'il n'existe pas de source de vérité pendant l'entraînement.

```figure
file: fig-3.svg
caption: L'erreur d'un moteur se compte, celle d'une réponse rédigée se cache
scroll: Une grille de 200 carrés se remplit à gauche et 30 d'entre eux passent en gris, puis un bloc de texte apparaît à droite et un seul segment devient orange.
steps:
- Dans l'exercice du cours, le moteur renvoie 200 documents pour une requête. Chaque carré est un document que l'on peut ouvrir.
- 170 sont pertinents et 30 ne le sont pas. La précision vaut 170 / 200, soit 0,85.
- ChatGPT renvoie une seule réponse rédigée. Toutes ses phrases ont la même assurance.
- Si une affirmation est fausse, rien ne la signale. On ne peut pas compter les erreurs sans vérifier chaque phrase ailleurs.
```

## Ce qu'il faut en retenir

ChatGPT n'est pas un moteur de recherche amélioré, c'est un autre objet. Un moteur retrouve, ChatGPT rédige. Je retiens donc une règle simple : tout fait qu'il énonce se vérifie ailleurs.

La notion ne dit pas tout. Pertinent ne veut pas dire vrai : un moteur peut très bien classer en tête une page qui se trompe, il laisse seulement au lecteur le moyen de juger la source. La précision et le rappel ne mesurent pas non plus ce que ChatGPT apporte, c'est-à-dire rédiger, reformuler et suivre une conversation, ce qu'aucun index ne fait. Enfin mon exemple australien est une caricature : un vrai modèle manipule des fragments de mots, et ses probabilités ne sont pas celles que j'ai inventées.

## Sources

- [OpenAI, 30 novembre 2022 : ChatGPT](https://openai.com/blog/chatgpt)
- [TechCrunch, 1er décembre 2022 : While anticipation builds for GPT-4, OpenAI quietly releases GPT-3.5](https://techcrunch.com/2022/12/01/while-anticipation-builds-for-gpt-4-openai-quietly-releases-gpt-3-5/)
- [Brown et al., 28 mai 2020 : Language Models are Few-Shot Learners (arXiv:2005.14165)](https://arxiv.org/abs/2005.14165)
- Cours Web data intelligence (1A), CentraleSupélec : partiel corrigé de recherche d'information, exercices sur l'index inversé, la pondération IDF, le modèle booléen, la précision et le rappel.
