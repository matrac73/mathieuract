---
title: "GenCast : pourquoi une IA météo produit cinquante prévisions plutôt qu'une"
summary: "Le modèle météo GenCast de Google DeepMind avance par pas de 12 heures en ajoutant du hasard à chaque pas, comme un processus autorégressif : la théorie de la prévision explique pourquoi il faut alors un ensemble de scénarios."
hook: "À quinze jours, la meilleure prévision météo unique ressemble à la moyenne de saison : l'IA de Google DeepMind tire donc cinquante futurs possibles et compte ceux où la tempête a lieu."
category: "perspective"
date: "2024-12-04"
written: "2024-12"
readingMinutes: 5
course: "Séries Chronologiques (3A)"
courseSlug: "series-chronologiques-3a"
news:
  title: "GenCast predicts weather and the risks of extreme conditions with state-of-the-art accuracy"
  source: "Google DeepMind"
  url: "https://deepmind.google/discover/blog/gencast-predicts-weather-and-the-risks-of-extreme-conditions-with-sota-accuracy/"
  date: "2024-12-04"
---

## Ce qui s'est passé

Le 4 décembre 2024, Google DeepMind présente GenCast, un modèle d'intelligence artificielle de prévision météo, décrit le même jour dans la revue Nature. Il ne donne pas une prévision mais un « ensemble » de 50 scénarios ou plus, chacun décrivant une évolution possible du temps sur 15 jours, sur une grille mondiale de 0,25° de côté. Entraîné sur quarante ans d'archives météo arrêtées à 2018 et testé sur l'année 2019, il fait mieux que ENS, le système d'ensemble du Centre européen de prévision (ECMWF), sur 97,2 % des 1 320 combinaisons de variables et d'échéances comparées. Un scénario de 15 jours se calcule en 8 minutes sur une seule puce spécialisée de Google, là où un ensemble classique occupe un supercalculateur pendant des heures.

Ce qui m'intéresse ici est le choix de produire cinquante réponses. Le cours de séries chronologiques permet de voir que ce n'est pas une coquetterie.

## La notion : prévoir une série autorégressive

Une série chronologique est une suite de mesures dans le temps. Le modèle le plus simple du cours pour la décrire est le processus autorégressif d'ordre 1, noté AR(1) : la valeur de demain est une fraction de celle d'aujourd'hui, plus un aléa imprévisible. On écrit X(t) = φ × X(t−1) + ε(t), où φ est un nombre entre −1 et 1 et ε(t) un tirage au hasard d'écart-type σ. Le cours justifie ce terme aléatoire ainsi : pour tenir compte du caractère non prédictible des observations futures, on choisit un modèle qui a une composante aléatoire.

Le cours en déduit la meilleure prévision à h pas : φ^h × X(n). L'aléa futur étant inconnu, on le remplace par sa moyenne, zéro, et il ne reste que la mémoire de la valeur actuelle, qui s'efface pas après pas. L'erreur de cette prévision a pour variance σ² × (1 − φ^(2h)) / (1 − φ²).

Prenons un exemple inventé, qui n'est pas calé sur de vraies données. X est l'écart de température à la normale, un pas dure 12 heures, φ = 0,9 et σ = 1 °C. Aujourd'hui, il fait 4 °C de plus que la normale. Dans 12 heures, la prévision est +3,6 °C, à 1 °C près. Dans trois jours (6 pas), elle vaut 4 × 0,9⁶ ≈ +2,1 °C, à 1,9 °C près. Dans quinze jours (30 pas), elle vaut +0,2 °C, à 2,3 °C près. Or 2,3 °C, soit σ / √(1 − φ²), est l'écart-type ordinaire de la série : à cet horizon, la prévision dit « la normale, avec la dispersion habituelle ». C'est la phrase du cours : la prévision est d'autant meilleure que l'horizon est petit.

```figure
file: fig-1.svg
caption: Prévision d'un processus AR(1) (φ = 0,9 par pas de 12 heures, σ = 1 °C) à partir d'un écart de +4 °C
scroll: La courbe de prévision descend vers zéro pendant que la zone d'incertitude s'élargit jusqu'à la variabilité habituelle de la série.
steps:
- Aujourd'hui, la température est 4 °C au-dessus de la normale. C'est la seule information dont on dispose.
- La meilleure prévision multiplie cet écart par 0,9 à chaque pas de 12 heures. La mémoire du point de départ s'efface et la courbe revient vers la normale.
- L'aléa de chaque pas s'accumule. La zone où la réalité tombe environ deux fois sur trois s'élargit vite, puis plafonne.
- À quinze jours, la prévision vaut presque zéro et la zone atteint ± 2,3 °C, la dispersion ordinaire de la série. La prévision ne dit plus rien de particulier.
```

## Ce que cela éclaire dans GenCast

GenCast est construit sur le même squelette. D'après l'article scientifique, il calcule l'état de l'atmosphère dans 12 heures à partir des deux états les plus récents, ce qui en fait l'analogue d'un processus autorégressif d'ordre 2, puis il réinjecte sa sortie en entrée, 30 fois de suite, pour atteindre 15 jours. Deux différences de taille : la fonction qui relie les états n'est pas une multiplication par φ mais un réseau de neurones, et l'état n'est pas un nombre mais plus de 80 variables sur toute la grille.

Le point commun décisif est le terme ε. À chaque pas, GenCast part d'un bruit tiré au hasard, que le réseau transforme en un état météo plausible (c'est le principe d'un modèle de diffusion). Il ne remplace donc pas l'aléa par sa moyenne : il le tire vraiment.

```figure
file: fig-2.svg
caption: Le fonctionnement de GenCast, pas à pas
scroll: Les deux états d'entrée traversent le modèle avec un bruit aléatoire, la sortie repart en entrée, puis la boucle entière se répète cinquante fois.
steps:
- Le point de départ est l'état de l'atmosphère maintenant et 12 heures plus tôt.
- Le modèle reçoit ces deux états et un bruit tiré au hasard. Il en sort un état possible dans 12 heures.
- Cet état est réinjecté en entrée. Trente pas donnent un scénario de quinze jours.
- En relançant la boucle avec d'autres tirages, on obtient cinquante scénarios différents, tous partis de la même situation.
```

La figure 1 montre pourquoi c'est nécessaire. La meilleure prévision unique est une moyenne sur tous les aléas possibles : elle est lisse et rentre vers la normale. Les auteurs constatent la même chose en météo : la moyenne de leur ensemble est floue, alors que chaque scénario pris seul garde la finesse d'une vraie carte. Imaginons une tempête présente dans vingt scénarios sur cinquante, à des endroits un peu différents : elle disparaît de la moyenne. Elle reste dans l'ensemble, et il suffit de compter pour obtenir une probabilité.

```figure
file: fig-3.svg
caption: Cinq trajectoires simulées du même AR(1), leur moyenne, et la lecture d'une probabilité
scroll: Une trajectoire en dents de scie apparaît, puis quatre autres, puis leur moyenne plus régulière, et enfin un comptage au quatrième jour.
steps:
- En tirant l'aléa à chaque pas, on obtient un scénario en dents de scie, aussi agité que la vraie série.
- Quatre autres tirages donnent quatre autres histoires. Toutes partent de +4 °C et divergent en quelques jours.
- Leur moyenne est plus régulière et rentre vers la normale. Elle ne ressemble à aucun des scénarios.
- Au quatrième jour, deux scénarios sur cinq dépassent +2 °C. Compter les scénarios donne une probabilité, ce que la moyenne seule ne donne pas.
```

## Ce que la notion ne dit pas

La formule de l'AR(1) fixe une limite pour un modèle donné : elle ne dit pas à quel horizon la vraie atmosphère cesse d'être prévisible, ni que GenCast l'atteint. Elle suppose aussi une série stationnaire, c'est-à-dire dont la moyenne et la dispersion ne changent pas avec le temps. Un modèle appris sur des archives hérite de cette hypothèse : il reproduit le climat qu'il a vu. Enfin, les deux états d'entrée ne tombent pas du ciel. DeepMind précise que les modèles physiques traditionnels restent indispensables, parce qu'ils fournissent les données d'entraînement et l'état initial de chaque prévision.

Ce que je retiens : face à un système où le hasard entre à chaque pas, la bonne réponse à « quel temps fera-t-il dans dix jours » n'est pas une carte, c'est une distribution. GenCast la rend assez peu coûteuse pour qu'on la calcule en quelques minutes.

## Sources

- [GenCast predicts weather and the risks of extreme conditions with state-of-the-art accuracy, Google DeepMind, 4 décembre 2024](https://deepmind.google/discover/blog/gencast-predicts-weather-and-the-risks-of-extreme-conditions-with-sota-accuracy/)
- [GenCast: Diffusion-based ensemble forecasting for medium-range weather, résumé arXiv](https://arxiv.org/abs/2312.15796)
- [GenCast: Diffusion-based ensemble forecasting for medium-range weather, texte intégral arXiv (v2)](https://arxiv.org/html/2312.15796v2)
- Cours « Séries Chronologiques » (3A), CentraleSupélec, poly 2022 : chapitre 1 (problème de la prévision) et chapitre 4 (prédiction linéaire, exemple 4.1 sur l'AR(1)).
