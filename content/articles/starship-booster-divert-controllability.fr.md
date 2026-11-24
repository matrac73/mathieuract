---
title: "Starship : pourquoi le propulseur a visé la mer plutôt que la tour"
summary: "Le 13 novembre, le premier étage de Starship a été dévié vers le golfe du Mexique au lieu de revenir à sa tour. La commandabilité et le retour d'état expliquent la logique de ce renoncement."
hook: "Ramener une fusée de 72 mètres entre les bras d'une tour suppose de pouvoir encore corriger sa trajectoire ; quand ce n'est plus garanti, la décision raisonnable est de viser la mer."
category: "perspective"
date: "2026-11-13"
written: "2026-11"
readingMinutes: 5
course: "Commande des systèmes dynamiques (2A)"
courseSlug: "commande-des-systemes-dynamiques-2a"
news:
  title: "Starship : le propulseur dévié en mer lors du 15e vol d'essai"
  source: "CBS News"
  url: "https://www.cbsnews.com/news/spacex-launches-starship-flight-rocket/"
  date: "2026-11-13"
---

Le vendredi 13 novembre 2026, SpaceX a lancé sa fusée Starship pour la quinzième fois depuis le Texas, avec l'idée de rattraper les deux étages entre les bras mécaniques de la tour de lancement. Le premier étage, un propulseur de 72 mètres, s'est séparé environ 2 minutes 20 après le décollage, a fait demi-tour, puis a été dévié vers le golfe du Mexique un peu plus de six minutes après le départ. Il a explosé juste avant de toucher l'eau. CBS News parle d'un « problème technique » sans autre précision, et l'agence AP note que SpaceX n'a pas donné d'explication. L'étage supérieur a continué jusqu'à l'orbite et, d'après le Daily Wire, la tour l'a attrapé le lendemain après 14 tours de la Terre.

```figure
file: fig-1.svg
caption: Le vol du 13 novembre : le retour prévu vers la tour et la déviation réelle vers la mer
scroll: La trajectoire se construit étape par étape, jusqu'à la branche orange qui part vers la mer au lieu de la tour.
steps:
- La fusée décolle du Texas. Environ 2 minutes 20 plus tard, le propulseur se sépare du vaisseau, qui continue vers l'orbite.
- Le propulseur se retourne et rallume des moteurs pour repartir vers son point de départ.
- Le plan était de finir entre les bras de la tour, comme lors de trois vols précédents.
- Un peu plus de six minutes après le décollage, il est dévié vers le golfe du Mexique et explose juste avant l'eau.
```

## Ce que le cours appelle commander un système

Le cours de commande décrit un système par son état, c'est-à-dire la liste des grandeurs qui suffisent à prédire la suite. Je prends un modèle très réduit du propulseur : un seul axe horizontal, et deux grandeurs, l'écart d par rapport à l'axe de la tour et la vitesse latérale v. La commande u est l'accélération latérale que les moteurs peuvent produire en s'inclinant. Les équations tiennent en deux lignes : la dérivée de d vaut v, la dérivée de v vaut u.

Laissé à lui-même, ce système ne revient jamais vers la tour. Un écart de 10 m reste de 10 m, et une vitesse latérale de 1 m/s ajoute un mètre d'écart chaque seconde, sans fin. Le cours le lit sur les valeurs propres de la matrice du système, qui valent ici zéro deux fois : rien ne ramène l'état vers l'équilibre.

La première question du cours est alors la commandabilité : un système est commandable s'il existe une commande capable de l'amener d'un état à un autre en un temps fini. Le critère de Kalman donne la réponse par un calcul de rang sur une matrice construite à partir du modèle. Ici le rang vaut 2, autant que de grandeurs d'état : en agissant sur la seule accélération, on peut régler à la fois l'écart et la vitesse.

La deuxième étape est le retour d'état : on calcule la commande à partir de l'état mesuré, u = −l1 × d − l2 × v. Un théorème du cours (Wonham) dit que, si le système est commandable, on peut choisir l1 et l2 pour imposer le comportement voulu. Avec la recette donnée en amphi, un amortissement de 0,7 et une pulsation de 1 rad/s, on trouve l1 = 1 et l2 = 1,4. Un écart de 10 m déclenche donc une accélération de 1 m/s² vers la tour, puis la commande freine à mesure que la vitesse monte.

```figure
file: fig-2.svg
caption: Écart à la tour au cours du temps, sans commande puis avec un retour d'état
scroll: La ligne grise reste à 10 m, puis la courbe orange ramène l'écart vers zéro en trois secondes environ.
steps:
- Le propulseur est à 10 m de l'axe de la tour. Sans commande, cet écart ne se réduit pas tout seul.
- Le retour d'état calcule la poussée latérale à partir de l'écart et de la vitesse mesurés.
- Avec cette loi, l'écart retombe vers zéro, avec un léger dépassement de moins de 50 cm.
- Au bout de 3 secondes, il reste moins de 50 cm d'écart.
```

## Ce que cela dit de la déviation

Le critère de Kalman suppose que la commande peut prendre n'importe quelle valeur. Une fusée n'a pas ce luxe : sa poussée est bornée, son carburant aussi, et le sol arrive à une heure fixe. La question concrète devient donc : depuis l'état actuel, avec les commandes encore disponibles et le temps qui reste, la tour fait-elle partie des états atteignables ?

Un calcul simple fixe les idées. Si l'accélération latérale est limitée à 2 m/s² et qu'il reste T secondes, le mieux que l'on puisse faire est d'accélérer pendant la moitié du temps puis de freiner pendant l'autre. L'écart maximal rattrapable vaut alors 2 × T² / 4. Avec 10 secondes, cela fait 50 m. Un propulseur décalé de 30 m peut rejoindre la tour. Le même propulseur décalé de 65 m ne le peut plus, alors que le modèle reste « commandable » au sens du critère. Ces chiffres sont les miens et servent d'illustration, pas ceux de SpaceX.

```figure
file: fig-3.svg
caption: Écart latéral rattrapable selon le temps restant, pour une accélération limitée à 2 m/s²
scroll: La courbe sépare ce qui est rattrapable de ce qui ne l'est plus, puis deux points se placent de part et d'autre.
steps:
- Avec une poussée bornée, l'écart que l'on peut encore annuler dépend du temps restant. Il croît comme le carré de ce temps.
- À 10 secondes de la tour, un écart de 30 m est sous la courbe. La capture reste possible.
- À ce même instant, la limite est de 50 m.
- Un écart de 65 m est au-dessus. Aucune commande ne ramène le propulseur à la tour, il vaut mieux viser la mer.
```

Vue ainsi, la déviation est une décision de commande et non un accident de pilotage. Une tour de lancement ne se remplace pas en quelques jours, et le commentaire en direct de SpaceX a d'ailleurs présenté l'issue comme conforme aux contrôles de sécurité destinés à protéger le pas de tir. Si un moteur, une réserve de carburant ou une mesure sort de la plage prévue, la garantie d'atteindre la tour disparaît, et la mer devient la seule cible sûre.

## Ce que la notion ne dit pas

Elle ne dit pas ce qui s'est passé à bord. La cause n'était pas connue quand les articles que j'ai lus ont été publiés. Le Daily Wire évoque une alarme de niveau de carburant, mais ni CBS ni AP ne le confirment, et je ne m'appuie pas dessus.

Mon modèle à deux grandeurs est aussi très loin d'un vrai propulseur, qui bouge dans trois dimensions, tourne sur lui-même et s'allège en brûlant son carburant. Ce qu'il faut retenir tient en une phrase : le critère de commandabilité du cours répond par oui ou par non pour une commande sans limite, alors qu'un engin réel doit vérifier à chaque instant que sa cible reste atteignable avec ce qu'il lui reste. Le cours le dit à sa façon quand il prévient qu'un réglage trop rapide malmène les actionneurs.

## Sources

- [CBS News, William Harwood : le 15e vol de Starship et la déviation du propulseur (13 novembre 2026)](https://www.cbsnews.com/news/spacex-launches-starship-flight-rocket/)
- [AP, Marcia Dunn, reprise par Live 5 News : la double capture manquée (13 novembre 2026)](https://www.live5news.com/2026/11/13/spacexs-attempt-starship-double-catch-is-thwarted-when-booster-ends-up-gulf-mexico/)
- [AP, reprise par l'Atlanta Journal-Constitution (mise à jour du 14 novembre 2026)](https://www.ajc.com/news/2026/11/spacexs-starship-soars-into-orbit-after-booster-explosion-prevents-an-unprecedented-double-catch/)
- [Daily Wire : la capture de l'étage supérieur (14 novembre 2026)](https://www.dailywire.com/news/spacex-makes-history-with-starship-catch-after-booster-bails-on-landing)
- Cours de Commande des systèmes dynamiques (2A), CentraleSupélec : amphi de révision « L'auto pour les (très) nuls » et fiches de synthèse (commandabilité, critère de Kalman, retour d'état).
