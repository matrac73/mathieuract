---
title: "Trente-six vols pour une même fusée : ce que le record dit de son usure"
summary: "Le 36e vol d'un premier étage de Falcon 9, lu avec le taux de défaillance : un record prouve que l'engin a tenu, pas qu'il ne vieillit pas."
hook: "Un étage de fusée qui vole pour la 36e fois prouve qu'il a tenu jusque-là, pas qu'il ne s'use pas : c'est l'historique de toute la flotte qui permet de le savoir."
category: "perspective"
date: "2026-07-09"
written: "2026-07"
readingMinutes: 5
course: "Surveillance des Systèmes (1A)"
news:
  title: "SpaceX launches Falcon 9 rocket on record-breaking 36th flight"
  source: "Spaceflight Now"
  url: "https://spaceflightnow.com/2026/07/09/live-coverage-spacex-to-launch-falcon-9-rocket-on-record-breaking-36th-flight/"
  date: "2026-07-09"
---

## Un premier étage qui décolle pour la 36e fois

Le jeudi 9 juillet 2026, à 5 h 25 heure de Floride, une fusée Falcon 9 a décollé de Cap Canaveral avec 29 satellites Starlink. Son premier étage, le booster numéro 1067, volait pour la 36e fois, ce qui est un record pour SpaceX. Un peu plus de huit minutes après le décollage, il s'est posé sur une barge dans l'Atlantique. Cet étage vole depuis juin 2021 : il a d'abord emporté une capsule de ravitaillement pour la NASA, puis deux équipages, puis des satellites en série. Selon Space.com, le record tous engins confondus reste celui de la navette Discovery, avec 39 allers-retours en orbite.

La question que je me pose est simple : après 36 vols réussis, le 37e est-il plus risqué que le deuxième ? Le cours de surveillance des systèmes donne les mots pour y répondre.

## Le taux de défaillance, ou le risque du prochain vol

Le cours part de la durée de vie T d'un composant, vue comme une grandeur aléatoire. La fiabilité R(t) est la probabilité que le composant n'ait pas encore subi de défaillance à l'instant t. Ici, je compte le temps en nombre de vols, ce qui est une simplification.

La grandeur utile est le taux de défaillance z(t). Le cours le définit comme la « densité conditionnelle » de défaillance à l'instant t, sachant que le composant a survécu jusque-là. En clair : parmi les engins encore en état après t vols, quelle part sera perdue au vol suivant ?

Deux cas se distinguent. Si ce taux est constant, égal à λ, la durée de vie suit une loi exponentielle : R(t) = e^(−λt). Le cours dit alors que le composant « ne vieillit pas » : celui qui a survécu jusqu'ici a les mêmes chances de tenir encore qu'un composant neuf. La durée de vie moyenne, appelée MTTF, vaut 1/λ. Avec λ = 1 % par vol, elle est de 100 vols, et la probabilité d'atteindre 36 vols est e^(−0,36) ≈ 70 %.

Si au contraire le composant s'use, le cours propose la loi de Weibull, dont le taux vaut z(t) = α × β × t^(β−1). Quand β est supérieur à 1, le taux augmente avec l'âge. Je prends β = 2 et α = 0,00028, choisis pour que la probabilité d'atteindre 36 vols soit aussi de 70 %. Le risque par vol part alors de presque zéro et vaut 2 % au 36e vol.

```figure
file: fig-1.svg
caption: Deux hypothèses sur le risque du vol suivant, selon le nombre de vols déjà effectués
scroll: Une droite horizontale puis une droite montante apparaissent, se séparent au 36e vol, et la zone encore inconnue se colore
steps:
- Première hypothèse, le taux de défaillance est constant. Chaque vol a 1 % de chances d'être le dernier, quel que soit l'âge de l'étage.
- Seconde hypothèse, l'étage s'use. Le risque est presque nul quand il est neuf, puis il augmente à chaque vol.
- Au 36e vol, l'écart entre les deux hypothèses est net. Le risque est de 1 % dans un cas et de 2 % dans l'autre.
- Tout ce qui se trouve à droite n'a jamais été observé sur ce lanceur. C'est là que les deux hypothèses s'écartent le plus.
```

## Deux modèles d'accord sur le passé, pas sur la suite

Ces deux modèles donnent exactement la même probabilité d'arriver à 36 vols. Le record du booster 1067 ne permet donc pas de les départager. Ils se séparent en revanche dès que l'on regarde plus loin.

L'outil du cours est la fiabilité conditionnelle : la probabilité de tenir jusqu'à t sachant que l'on a tenu jusqu'à t1 vaut R(t) / R(t1). Pour 36 vols de plus, il faut calculer R(72) / R(36). Avec le taux constant, on trouve e^(−0,72) / e^(−0,36) = e^(−0,36), soit de nouveau 70 %. Avec l'usure, R(72) = e^(−1,44) ≈ 24 %, et le rapport tombe à 34 %. Le même passé conduit à deux avenirs, dont l'un est deux fois plus favorable que l'autre.

```figure
file: fig-2.svg
caption: Probabilité d'atteindre un nombre de vols donné, avec et sans usure
scroll: Deux courbes descendantes se rejoignent à 36 vols, puis s'écartent jusqu'à 72 vols
steps:
- Avec un taux constant de 1 % par vol, les chances d'atteindre un nombre de vols donné baissent régulièrement.
- Avec l'usure, la courbe descend d'abord moins vite, puis plus vite. Les deux courbes se croisent à 36 vols, à 70 %.
- À 72 vols, elles ne sont plus d'accord. Il reste 49 % de chances dans un cas et 24 % dans l'autre.
- Pour un étage qui a déjà fait 36 vols, cela donne 70 % ou 34 % de chances d'en faire 36 de plus.
```

## Ce qu'un seul record ne dit pas

Il y a une seconde raison d'être prudent. Un étage qui vole encore est ce que le cours appelle une observation censurée à droite : on sait seulement que sa durée de vie dépasse 36 vols. Le cours donne l'estimateur du taux dans ce cas : le nombre de défaillances observées divisé par la somme des durées d'observation. Avec un seul étage et aucune défaillance, le calcul donne zéro, ce qui n'apprend rien. Et un risque de 3 % ou de 5 % par vol laisse encore 34 % ou 17 % de chances d'enchaîner 36 vols sans perte.

```figure
file: fig-3.svg
caption: Probabilité d'enchaîner 36 vols sans perte pour trois niveaux de risque par vol
scroll: Trois barres de plus en plus basses apparaissent, puis la conclusion s'affiche
steps:
- Si le risque est de 1 % par vol, un étage a 70 % de chances d'atteindre 36 vols.
- Avec un risque trois fois plus élevé, il lui reste encore une chance sur trois.
- Même à 5 % par vol, environ un étage sur six arriverait à 36 vols.
- Voir un étage réussir 36 vols ne suffit donc pas à dire lequel de ces risques est le bon.
```

L'information est dans la flotte entière. Le décompte de Spaceflight Now en est à 635 atterrissages d'étages pour SpaceX, et ce lancement était la 80e mission Falcon 9 de l'année selon Space.com. Chaque étage, perdu ou encore en service, ajoute de la durée d'observation, et c'est en comparant le taux de perte des étages jeunes et des étages anciens que l'on peut voir si le taux monte. Je n'ai pas ces données par étage, donc je ne conclus pas sur la forme réelle de la courbe.

Le modèle a aussi une limite que le cours signale. Un modèle de durée de vie ne connaît que deux états, en fonctionnement ou défaillant. Un étage réutilisé est inspecté et remis en état entre deux vols, ce qui relève plutôt d'un modèle de dégradation, avec des états intermédiaires et de la maintenance préventive. Ce que je retiens : le chiffre 36 mesure la résistance passée d'un engin, et la confiance dans le 37e vol vient de ce que l'on voit en l'inspectant et de ce que toute la flotte a vécu.

## Sources

- [SpaceX launches Falcon 9 rocket on record-breaking 36th flight, Spaceflight Now, 9 juillet 2026](https://spaceflightnow.com/2026/07/09/live-coverage-spacex-to-launch-falcon-9-rocket-on-record-breaking-36th-flight/)
- [SpaceX Falcon 9 rocket launches for record-breaking 36th time, Space.com, 9 juillet 2026](https://www.space.com/space-exploration/launches-spacecraft/spacex-falcon-9-rocket-launch-36th-time-new-record)
- [SpaceX Breaks Rocket Reuse Record on 36th Falcon 9 Flight, AIAA, 9 juillet 2026](https://aiaa.org/2026/07/09/spacex-breaks-rocket-reuse-record-on-36th-falcon-9-flight/)
