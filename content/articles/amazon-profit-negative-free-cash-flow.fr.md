---
title: "Amazon : un gros bénéfice et une trésorerie qui se vide"
summary: "Amazon a gagné 134,8 milliards de dollars en douze mois et a pourtant dépensé 42,4 milliards de plus qu'il n'a encaissé. L'amortissement explique l'écart entre les deux chiffres."
hook: "Amazon gagne beaucoup d'argent et dépense pourtant plus qu'il n'encaisse : un centre de données se paie tout de suite, mais ne pèse sur le bénéfice que par tranches étalées sur des années."
category: "perspective"
date: "2026-10-29"
written: "2026-10"
readingMinutes: 5
course: "Corporate Finance and Law (2A)"
courseSlug: "corporate-finance-and-law-2a"
news:
  title: "Amazon.com Announces Third Quarter Results"
  source: "Amazon"
  url: "https://aboutamazon.com/news/company-news/amazon-earnings-q3-2026-report"
  date: "2026-10-29"
---

Le 29 octobre 2026, Amazon a publié ses comptes du troisième trimestre. Les ventes atteignent 201,9 milliards de dollars, et le résultat d'exploitation 28,1 milliards, soit 13,9 % des ventes, ce que l'entreprise présente comme sa marge la plus élevée. Le même communiqué annonce pourtant que, sur les douze derniers mois, le flux de trésorerie disponible est négatif de 42,4 milliards, alors qu'il était positif de 14,8 milliards un an plus tôt.

Une entreprise peut donc gagner de l'argent et en avoir moins en caisse. Ce n'est ni une erreur ni une astuce : les deux chiffres ne mesurent pas la même chose, et le cours de finance d'entreprise que j'ai suivi à CentraleSupélec consacre un chapitre entier à cette différence.

## Une dépense que l'on ne compte pas d'un coup

Le compte de résultat est le tableau qui explique le bénéfice d'une période. Le cours y distingue deux sortes de charges. Les charges décaissées, comme les salaires ou les loyers, réduisent le bénéfice et la caisse en même temps. Les charges calculées réduisent le bénéfice sans qu'aucun argent ne sorte. La principale est la dotation aux amortissements.

L'amortissement répond à une question simple : quand une entreprise achète un bien qui servira plusieurs années, à quelle année faut-il attribuer son coût ? La comptabilité répond qu'il faut le répartir sur sa durée d'utilisation. Le cours prend l'exemple d'une voiture achetée 10 000 € à la fin de l'année 0 et amortie sur 5 ans. La caisse baisse de 10 000 € le jour de l'achat. Le bénéfice de l'année 0 ne bouge pas. Ensuite, chaque année pendant cinq ans, le compte de résultat porte une charge de 2 000 €, et la voiture perd 2 000 € de valeur au bilan : 8 000, 6 000, 4 000, 2 000, puis 0.

```figure
file: fig-1.svg
caption: La même dépense de 10 000 €, vue par la caisse et vue par le bénéfice
scroll: La dépense apparaît d'un bloc dans la trésorerie, puis en cinq petites tranches dans le résultat.
steps:
- L'entreprise achète une voiture 10 000 € à la fin de l'année 0. La caisse baisse de 10 000 € ce jour-là.
- Le bénéfice de l'année 0, lui, ne bouge pas. Aux yeux du compte de résultat, l'entreprise a échangé de l'argent contre un bien de même valeur.
- Pendant les cinq années suivantes, le compte de résultat porte une charge de 2 000 € par an, sans qu'aucun euro ne sorte. C'est la dotation aux amortissements.
- Au total, les deux tableaux comptent bien 10 000 €. Seul le calendrier diffère, et c'est ce décalage qui sépare le bénéfice de la trésorerie.
```

Le cours résume cela par une phrase que je trouve utile : le résultat est en partie virtuel, la trésorerie est réelle.

## Du bénéfice à la caisse

Pour suivre l'argent, il faut un troisième tableau, le tableau des flux de trésorerie, qui sépare trois familles de mouvements : l'exploitation, l'investissement et le financement.

Le flux d'exploitation se reconstruit à partir du bénéfice. On part du résultat net, on y rajoute les amortissements, puisqu'ils ont réduit le bénéfice sans sortir de la caisse, et on corrige des décalages de paiement avec les clients et les fournisseurs. Le flux d'investissement, lui, compte les achats d'équipements au moment où ils sont payés, en entier. La somme des deux est le flux de trésorerie disponible : ce qui reste à l'entreprise une fois ses investissements payés, par exemple pour rembourser sa dette.

Appliquons cela à Amazon, sur les douze mois clos fin septembre 2026. Le résultat net est de 134,8 milliards de dollars. Le flux d'exploitation est plus élevé, 168,3 milliards, notamment parce que 79,4 milliards d'amortissements ont été rajoutés. Les achats d'équipements, nets des cessions, atteignent 210,7 milliards. Le flux disponible vaut donc 168,3 − 210,7 = −42,4 milliards.

```figure
file: fig-2.svg
caption: Du bénéfice net d'Amazon à son flux de trésorerie disponible, sur douze mois
scroll: Les barres s'ajoutent de gauche à droite jusqu'à passer sous zéro.
steps:
- Sur douze mois, Amazon affiche un bénéfice net de 134,8 milliards de dollars.
- L'argent réellement encaissé par l'activité est plus élevé, 168,3 milliards, car les amortissements réduisent le bénéfice sans sortir de la caisse.
- Mais Amazon a payé 210,7 milliards d'équipements, comptés ici en entier, au moment du paiement.
- Il manque donc 42,4 milliards. C'est le flux de trésorerie disponible, négatif malgré le bénéfice.
```

## Ce que cela dit d'Amazon

L'écart vient d'un changement de rythme. En un an, les achats d'équipements sont passés de 120,1 à 215,2 milliards de dollars, une hausse qu'Amazon attribue surtout à l'intelligence artificielle. Les amortissements n'ont progressé que de 61,9 à 79,4 milliards. C'est mécanique : un serveur acheté cette année ne pèse sur le bénéfice que d'une fraction de son prix, alors que la caisse l'a payé en entier.

```figure
file: fig-3.svg
caption: Achats d'équipements et amortissements d'Amazon, deux périodes de douze mois
scroll: Les achats doublent presque d'une année à l'autre, les amortissements montent à peine.
steps:
- Sur les douze mois clos fin septembre 2025, Amazon achète pour 120,1 milliards de dollars d'équipements et passe 61,9 milliards d'amortissements en charges.
- Un an plus tard, les achats montent à 215,2 milliards.
- Les amortissements suivent de loin, à 79,4 milliards, parce que chaque achat est réparti sur plusieurs années.
- L'écart, environ 136 milliards, est une dépense déjà payée qui n'a pas encore réduit le bénéfice. Elle le fera dans les années qui viennent.
```

Deux conséquences en découlent. La première est immédiate : il faut trouver l'argent ailleurs. Sur la même période, Amazon a emprunté 130,0 milliards de dollars à long terme. La seconde est différée. Les équipements payés aujourd'hui deviendront des charges d'amortissement pendant des années, que les ventes suivent ou non. Le bénéfice d'aujourd'hui ne porte pas encore le coût complet de l'investissement en cours, et l'entreprise prévoit environ 220 milliards de dépenses d'équipement en 2026.

## Ce que la notion ne dit pas

L'amortissement décrit un calendrier, pas un jugement. Un flux disponible négatif ne signifie pas qu'Amazon va mal : une entreprise qui investit beaucoup a ce profil, et tout dépend de ce que rapporteront ces centres de données. Pour en juger, le cours propose un autre outil, la valeur actuelle nette, qui compare la dépense initiale aux recettes futures ramenées à leur valeur d'aujourd'hui.

Il faut aussi se rappeler que la durée d'amortissement est un choix comptable. Répartir un serveur sur plus d'années allège la charge annuelle et augmente le bénéfice, sans rien changer à la caisse. C'est une raison de lire les deux tableaux ensemble. Enfin, le chiffre d'amortissement que publie Amazon regroupe aussi d'autres éléments, comme les contenus vidéo et les locations : l'écart de 136 milliards est un ordre de grandeur, pas une mesure exacte.

## Sources

- [Amazon, résultats du troisième trimestre 2026](https://aboutamazon.com/news/company-news/amazon-earnings-q3-2026-report)
- [Communiqué complet avec les tableaux financiers, Business Wire via Finviz](https://finviz.com/news/412054/amazoncom-announces-third-quarter-results)
- Cours « Corporate Finance and Law », CentraleSupélec : chapitre sur les amortissements et provisions, et fiche de révision de la partie finance
