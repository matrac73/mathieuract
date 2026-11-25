---
title: "La mémoire flash baisse, la mémoire vive tient : la hiérarchie des mémoires"
summary: "Le prix des puces de stockage a perdu 20 % en deux semaines alors que celui de la mémoire vive bouge à peine. La hiérarchie des mémoires, vue en première année, explique pourquoi l'une ne peut pas remplacer l'autre."
hook: "Le prix des puces de stockage chute pendant que la mémoire vive reste chère, parce qu'un ordinateur ne peut pas remplacer l'une par l'autre : le stockage est des milliers de fois plus lent."
category: "perspective"
date: "2026-11-17"
written: "2026-11"
readingMinutes: 5
course: "SIP (Systèmes d_Information et Programmation) (1A)"
courseSlug: "sip-systemes-d-information-et-programmation-1a"
news:
  title: "NAND Spot Prices Reverse Course, Sliding 20% in 2 Weeks amid Weak Consumer Demand, YMTC Competition"
  source: "TrendForce"
  url: "https://www.trendforce.com/news/2026/11/17/news-nand-spot-prices-reverse-course-sliding-20-in-2-weeks-amid-weak-consumer-demand-ymtc-competition/"
  date: "2026-11-17"
---

Depuis plus d'un an, les puces mémoire manquent et leurs prix montent, tirés par les centres de calcul de l'intelligence artificielle. Le 17 novembre, le cabinet TrendForce a signalé une première fissure : la mémoire flash NAND, celle qui sert au stockage dans les téléphones et les SSD, a perdu environ 20 % en deux semaines sur le marché au comptant, c'est-à-dire le marché où l'on achète pour une livraison immédiate. La mémoire vive, la DRAM, ne suit pas ce mouvement.

## Ce qui s'est passé

Selon les chiffres de Bank of America repris par TrendForce, une galette de puces NAND de 512 gigabits vaut 14,30 dollars, soit 32 % de moins qu'au trimestre précédent. Les raisons avancées sont du côté de la demande : les téléphones et les PC se vendent moins bien, les fabricants réduisent la capacité de stockage de leurs modèles, et des négociants chinois vident leurs stocks.

La DRAM raconte une autre histoire. D'après TechRadar, qui cite le relevé de TrendForce pour la semaine du 17 novembre, la DDR4 courante n'a cédé que 1,43 % au comptant, et la DDR5 est restée à peu près stable. Les prix des contrats, ceux que paient les gros acheteurs, continuent de monter : Bank of America prévoit encore 8 % de hausse ce trimestre. Fortune rappelle qu'une puce DDR5 de 16 gigabits est passée de 8,70 dollars en octobre 2025 à 48 dollars en septembre 2026.

```figure
file: fig-1.svg
caption: En novembre 2026, le prix de la mémoire flash décroche, celui de la mémoire vive presque pas
scroll: Les deux barres apparaissent l'une après l'autre, la grande pour la flash, la toute petite pour la DRAM
steps:
- On mesure la variation du prix au comptant, celui d'un achat livré tout de suite.
- La mémoire flash NAND, celle du stockage, perd environ 20 % en deux semaines.
- La DRAM, la mémoire vive, ne cède que 1,43 % en une semaine pour la DDR4.
- Et dans les contrats des gros acheteurs, la DRAM monte encore, 8 % de hausse étant prévus ce trimestre.
```

Une question vient naturellement. Si le stockage devient moins cher et que la mémoire vive reste hors de prix, pourquoi ne pas mettre plus de l'un et moins de l'autre ?

## La hiérarchie des mémoires

Le cours de SIP de première année répond avec un tableau que l'on apprend tôt : la hiérarchie des mémoires. Un ordinateur ne possède pas une mémoire, mais plusieurs, rangées par distance au processeur.

Tout près du processeur, on trouve les registres et la mémoire cache. Le polycopié les décrit comme « petites mais très rapides » : un accès au cache prend de 1 à 12 nanosecondes (milliardièmes de seconde), pour un coût de l'ordre de 5 000 euros par gigaoctet. Vient ensuite la mémoire centrale, ou RAM, qui contient les programmes en cours d'exécution : 5 à 40 nanosecondes par accès, 2,5 à 18 euros par gigaoctet. Tout en bas, les disques et les SSD : 85 microsecondes à 16 millisecondes par accès, mais seulement 0,02 à 0,44 euro par gigaoctet. Ces prix datent du polycopié et non du marché de 2026, mais c'est l'ordre des étages qui compte.

```figure
file: fig-2.svg
caption: La hiérarchie des mémoires du cours, avec le temps d'accès et le coût de chaque étage
scroll: Les étages s'empilent du processeur vers le disque, puis l'écart de vitesse entre RAM et disque s'affiche en orange
steps:
- Près du processeur, les registres et le cache sont minuscules, très rapides et très chers.
- La mémoire vive contient les programmes en cours. Elle répond en 5 à 40 nanosecondes.
- Le disque ou le SSD garde les données éteint. Il est bien moins cher, mais répond en microsecondes.
- Entre le plus lent des accès RAM et le plus rapide des accès disque, il y a déjà un facteur 2 000.
```

Chaque étage échange donc de la vitesse contre du prix. Le cours donne aussi la raison pour laquelle un programme est copié du disque vers la RAM avant d'être exécuté : les mémoires principales sont « beaucoup plus rapides que les disques ». Avec les chiffres du tableau, 85 microsecondes divisées par 40 nanosecondes donnent un peu plus de 2 000, et c'est le cas le plus favorable au disque.

## Pourquoi la flash bon marché ne soulage pas la RAM

Prenons un exemple chiffré, avec des valeurs prises dans les fourchettes du cours. Un accès en RAM coûte 20 nanosecondes, un accès au SSD 100 microsecondes, soit 100 000 nanosecondes. Imaginons une machine à qui l'on retire un peu de RAM, si bien que 1 % de ses accès doivent aller chercher la donnée sur le SSD. Le temps moyen d'un accès devient 0,99 × 20 + 0,01 × 100 000 ≈ 1 020 nanosecondes. La machine est environ 50 fois plus lente, alors que 99 % de ses accès n'ont pas changé.

```figure
file: fig-3.svg
caption: Temps d'accès moyen quand une petite part des accès passe de la RAM (20 ns) au SSD (100 µs)
scroll: Une droite monte depuis le coin en bas à gauche, puis un point orange marque le cas où 1 % des accès vont au SSD
steps:
- Quand toutes les données tiennent en mémoire vive, un accès prend 20 nanosecondes.
- Chaque accès renvoyé vers le SSD coûte 100 000 nanosecondes. La moyenne grimpe en ligne droite.
- Avec seulement 1 % des accès sur le SSD, la moyenne atteint environ 1 020 nanosecondes, soit 50 fois plus.
```

C'est ce que la hiérarchie fait comprendre de l'actualité. Flash et DRAM ne sont pas deux qualités d'un même produit, mais deux étages qui ne font pas le même travail. Un fabricant de téléphones peut réduire le stockage quand il coûte trop cher, et c'est ce que décrit TrendForce. Il ne peut pas compenser un manque de mémoire vive par du stockage devenu abordable. La baisse d'un étage ne se transmet donc pas à l'autre, et les deux prix peuvent diverger durablement.

## Ce que la notion ne dit pas

La hiérarchie explique pourquoi la demande ne glisse pas d'une puce vers l'autre. Elle ne dit rien du niveau des prix, qui dépend de l'offre. Sur ce point, les sources donnent deux éléments que le cours ne contient pas. D'une part, le marché de la DRAM est tenu par trois fabricants, contre six pour la NAND. D'autre part, la mémoire HBM destinée aux puces d'IA consomme, selon une analyste de TrendForce citée par TechRadar, trois à quatre fois plus de capacité de production que la DRAM ordinaire, ce qui laisse moins de place à cette dernière.

Il faut aussi garder les proportions : la baisse concerne pour l'instant le marché au comptant, qui ne représente qu'une petite part des volumes. Les prix en magasin suivent avec retard.

Je retiens que le tableau de première année, que l'on prend pour une simple liste de composants, décrit en réalité une contrainte : on ne descend pas d'un étage sans payer en temps.

## Sources

- [TrendForce, « NAND Spot Prices Reverse Course, Sliding 20% in 2 Weeks amid Weak Consumer Demand, YMTC Competition », 17 novembre 2026](https://www.trendforce.com/news/2026/11/17/news-nand-spot-prices-reverse-course-sliding-20-in-2-weeks-amid-weak-consumer-demand-ymtc-competition/)
- [TechRadar, « NAND prices could finally be set to fall, but DRAM is refusing to budge so far », 24 novembre 2026](https://www.techradar.com/pro/nand-prices-could-finally-be-set-to-fall-in-the-first-bit-of-good-news-for-component-fans-for-some-time-but-dram-is-refusing-to-budge-so-far)
- [Fortune, « Memory chip CEO warns 2027 shortage will be so bad that 'even money can't buy goods' », 10 novembre 2026](https://fortune.com/2026/11/10/team-group-ceo-memory-chip-shortage-2027-even-money-cant-buy-goods/)
