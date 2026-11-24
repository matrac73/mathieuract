---
title: "MuZero : apprendre les règles pour pouvoir réfléchir"
summary: "DeepMind publie dans Nature un programme qui joue au go, aux échecs et à 57 jeux Atari sans connaître leurs règles. Le chapitre du cours sur l'apprentissage par renforcement montre ce qu'il fait de nouveau."
hook: "MuZero joue au go et aux échecs au meilleur niveau sans qu'on lui ait donné les règles : il apprend à prévoir l'effet de ses coups, ce qui lui permet de réfléchir avant de jouer."
category: "perspective"
date: "2020-12-23"
written: "2020-12"
readingMinutes: 5
course: "Data Analysis and Machine Learning (3A)"
courseSlug: "data-analysis-and-machine-learning-3a"
news:
  title: "MuZero: Mastering Go, chess, shogi and Atari without rules"
  source: "DeepMind"
  url: "https://deepmind.google/discover/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/"
  date: "2020-12-23"
---

Le 23 décembre 2020, le laboratoire DeepMind publie dans la revue Nature la description complète de MuZero, un programme dont une première version circulait depuis 2019. MuZero égale AlphaZero, le programme précédent du laboratoire, au go, aux échecs et au shogi, et il établit le meilleur résultat connu sur une série de 57 jeux vidéo Atari. La différence tient en une phrase : AlphaZero recevait les règles de chaque jeu, MuZero ne les reçoit pas.

## Décider quand on connaît les règles

Mon cours de troisième année consacre un chapitre à l'apprentissage par renforcement, c'est-à-dire à l'art d'apprendre une bonne suite de décisions par essais et erreurs. Le cadre est simple. Un agent se trouve dans un état (une position sur un plateau, une case d'un labyrinthe). Il choisit une action. L'environnement lui renvoie un nouvel état et une récompense, positive ou négative. Deux fonctions décrivent donc entièrement le jeu : celle qui donne l'état suivant et celle qui donne la récompense. Ce sont les règles.

Le cours prend l'exemple d'un labyrinthe où chaque déplacement coûte 10 et où la sortie rapporte 200. J'en garde une version réduite à un couloir. On appelle valeur d'une case le total des récompenses que l'on peut espérer en partant de là, un gain futur étant compté à 90 % de son montant à chaque pas d'attente. À un pas de la sortie, la valeur est 200. À deux pas, elle est de −10 + 0,9 × 200 = 170. À trois pas, de −10 + 0,9 × 170 = 143.

```figure
file: fig-1.svg
caption: Quand les règles sont connues, la valeur de chaque case se calcule en remontant depuis la sortie
scroll: Les valeurs se remplissent case après case, de la sortie vers le fond du couloir
steps:
- Un couloir de quatre cases mène à la sortie. Chaque pas coûte 10, la sortie rapporte 200, et un gain à venir compte pour 90 % de son montant.
- À un pas de la sortie, il n'y a rien à calculer. La case vaut 200.
- À deux pas, on paie 10 puis on se retrouve sur une case qui vaut 200. La case vaut 170.
- On recommence une case plus loin, en s'appuyant sur la valeur que l'on vient de trouver.
- Toutes les valeurs sont connues sans avoir fait un seul pas. Ce calcul exige de connaître les règles à l'avance.
```

Le cours appelle ce calcul la programmation dynamique. Il fonctionne sans jamais jouer, mais il suppose que l'on sache d'avance où mène chaque action et ce qu'elle rapporte.

## Apprendre à tâtons

Quand l'environnement est inconnu, le cours présente un autre algorithme, le Q-learning. L'agent tient un tableau qui note la qualité de chaque action dans chaque état. Il joue, observe la récompense et l'état d'arrivée, puis corrige la note concernée en faisant un pas vers ce qu'il vient d'observer. Dans le couloir, à deux pas de la sortie, avec une note de départ à 0 et un pas de correction de moitié, la note devient 0,5 × 0 + 0,5 × (−10 + 0,9 × 200) = 85. Au passage suivant elle monte à 127,5, et elle s'approche peu à peu de 170.

Cette méthode a deux limites. Le tableau contient une ligne par état : le labyrinthe du cours en compte 25, un plateau de go ou un écran de jeu vidéo en compte beaucoup trop. Et surtout, l'agent ne prévoit rien. Il sait qu'une action a bien marché dans le passé, sans pouvoir imaginer ce qui se passera trois coups plus loin. Le cours le dit à sa manière : l'apprentissage par renforcement n'est pas de la planification, parce que l'on ne connaît l'environnement qu'imparfaitement.

## MuZero fabrique ses propres règles

Le cours précise que tout algorithme de ce type doit choisir une façon de représenter l'environnement et de la mettre à jour après chaque observation. Le Q-learning choisit un tableau de notes. MuZero choisit de reconstruire les deux fonctions manquantes.

Un réseau de neurones transforme ce que le programme observe en un état interne. Un deuxième prédit, pour une action donnée, l'état interne suivant et la récompense. Un troisième estime la valeur de la position et les coups qui méritent d'être examinés. Le programme ne cherche pas à reproduire l'écran image par image. Il n'apprend que les trois grandeurs utiles pour décider : récompense, valeur et choix du coup. Avec elles, il déroule un arbre de coups imaginaires, comme le faisait AlphaZero avec les vraies règles.

```figure
file: fig-2.svg
caption: MuZero imagine la suite de la partie dans un modèle qu'il a appris, puis choisit son coup
scroll: L'arbre des coups imaginés se déploie vers la droite, puis la branche retenue passe en orange
steps:
- Le programme traduit ce qu'il observe en un état interne, une suite de nombres qu'il a lui-même appris à construire.
- Pour chaque coup possible, il prédit l'état suivant et la récompense immédiate. Aucune règle ne lui a été fournie, ce sont ses propres prévisions.
- Il prédit aussi la valeur de chaque état imaginé, c'est-à-dire ce que l'on peut espérer gagner ensuite. Les chiffres du schéma sont inventés pour l'exemple.
- Il recommence depuis les états imaginés et explore ainsi plusieurs coups d'avance.
- Le coup B ne rapporte rien tout de suite mais mène à une meilleure position. C'est lui qui est joué.
```

Les résultats publiés montrent que cette réflexion compte. Au go, le niveau de MuZero augmente de plus de 1 000 points Elo quand le temps accordé par coup passe de 0,1 à 50 secondes, ce que DeepMind compare à l'écart entre un bon amateur et le meilleur professionnel. Selon le laboratoire, cette progression suit presque exactement celle d'AlphaZero, qui dispose pourtant d'un simulateur parfait. Le modèle appris remplace donc les règles sans perte visible.

```figure
file: fig-3.svg
caption: Quatre méthodes, selon qu'elles reçoivent les règles et qu'elles prévoient avant d'agir
scroll: Les lignes du tableau apparaissent une à une, jusqu'à celle de MuZero
steps:
- La programmation dynamique du cours calcule la meilleure décision à l'avance, à condition de recevoir les règles.
- Le Q-learning se passe des règles, mais il ne prévoit rien. Il note seulement ce qui a marché.
- AlphaZero prévoit plusieurs coups d'avance, parce qu'on lui a donné les règles du go, des échecs et du shogi.
- MuZero occupe la case qui restait vide. Il apprend les règles en jouant, puis s'en sert pour prévoir.
```

## Ce que cela ne dit pas

Je retiens que la frontière tracée par le cours entre environnement connu et environnement inconnu n'est pas fixe : on peut apprendre un modèle, puis raisonner dessus comme s'il était donné. DeepMind y voit un pas vers des problèmes réels, où personne ne fournit de règles.

Il reste des réserves. Les jeux testés donnent un score clair et peuvent être rejoués autant de fois que nécessaire, ce qui est rare hors d'un ordinateur. Le modèle de MuZero ne vaut que pour les situations qu'il a rencontrées, et rien ne garantit ses prévisions ailleurs. Le cours rappelle que les garanties de convergence du Q-learning reposent déjà sur des hypothèses. Pour un modèle appris par un réseau de neurones, la preuve reste, à ce stade, le résultat des parties.

## Sources

- [DeepMind, « MuZero: Mastering Go, chess, shogi and Atari without rules », 23 décembre 2020](https://deepmind.google/discover/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/)
- [Schrittwieser et al., « Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model », arXiv:1911.08265](https://arxiv.org/abs/1911.08265)
