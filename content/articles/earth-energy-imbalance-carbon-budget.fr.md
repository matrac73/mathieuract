---
title: "Un watt par mètre carré de trop : le bilan radiatif derrière le budget carbone"
summary: "Le rapport annuel sur les indicateurs du climat donne trois ans au budget carbone de 1,5 °C. Le bilan radiatif vu en cours explique pourquoi un écart de 1 W/m² suffit, et pourquoi on compte en stock."
hook: "La Terre garde environ 1 watt par mètre carré de plus qu'elle n'en renvoie, et au rythme actuel des émissions le budget carbone compatible avec 1,5 °C sera épuisé en trois ans."
category: "perspective"
date: "2025-06-19"
written: "2025-06"
readingMinutes: 5
course: "Limites Planétaires (1A)"
news:
  title: "Indicators of Global Climate Change 2024: annual update of key indicators of the state of the climate system and human influence"
  source: "Earth System Science Data"
  url: "https://essd.copernicus.org/articles/17/2641/2025/"
  date: "2025-06-19"
---

## Ce qui a été publié

Le 19 juin 2025, plus de soixante chercheurs publient dans la revue Earth System Science Data la mise à jour annuelle des indicateurs du climat. Trois chiffres en ressortent. Le réchauffement observé en 2024 atteint 1,52 °C par rapport à 1850-1900, dont 1,36 °C attribué aux activités humaines. La Terre accumule de l'énergie à un rythme d'environ 1 W/m² en moyenne sur les douze dernières années. Enfin, le budget carbone restant pour avoir une chance sur deux de limiter le réchauffement à 1,5 °C est estimé à 130 milliards de tonnes de CO2 (130 GtCO2) au début de 2025, soit un peu plus de trois ans d'émissions au niveau actuel de 42 GtCO2 par an.

Ces chiffres se comprennent bien avec deux outils du cours Limites Planétaires : le bilan radiatif de la Terre et les temps de résidence du carbone.

## Le bilan radiatif, vu en cours

Le bilan radiatif est la comptabilité de l'énergie qui entre et sort de la planète sous forme de rayonnement. Le cours l'écrit en une ligne :

(1 − α) × Sc/4 = (1 − ε) × σ × Ts⁴

À gauche, ce que la Terre absorbe. Sc est la constante solaire, 1368 W/m². On la divise par 4 parce que la Terre intercepte le Soleil comme un disque mais répartit cette énergie sur une sphère, ce qui donne 342 W/m² en moyenne. L'albédo α est la part réfléchie vers l'espace, 0,31 dans le TD. Il reste 235 W/m² absorbés.

À droite, ce que la Terre renvoie en infrarouge. Une surface à la température Ts émet σ × Ts⁴, où σ est la constante de Stefan. À 288 K (15 °C), cela fait 390 W/m². Mais l'atmosphère en retient une partie : c'est l'effet de serre, noté ε, qui vaut 0,4 dans le TD. Seuls 60 % sortent, soit 235 W/m². Les deux côtés sont égaux et la température ne bouge pas.

```figure
file: fig-1.svg
caption: Le bilan radiatif moyen de la Terre, à l'équilibre puis avec un effet de serre renforcé
scroll: Les flux apparaissent un à un, puis le flux infrarouge sortant baisse et un excédent de 1 W/m² reste dans l'océan
steps:
- La Terre reçoit en moyenne 342 W/m² du Soleil. Elle en réfléchit 107 et en absorbe 235.
- À l'équilibre, elle renvoie exactement 235 W/m² vers l'espace sous forme d'infrarouge. Sa température est stable.
- Quand l'effet de serre augmente, l'atmosphère retient un peu plus d'infrarouge. Il ne sort plus que 234 W/m² environ, et 1 W/m² reste.
- Cet excédent ne disparaît pas. Il réchauffe la planète, et 91 % de cette chaleur est stockée dans l'océan.
```

## Ce que le bilan dit du rapport

Ajouter des gaz à effet de serre revient à augmenter ε. Le côté droit de l'équation diminue alors que le côté gauche ne change pas. L'égalité est rompue, et la seule façon de la rétablir est que Ts augmente jusqu'à ce que la Terre émette de nouveau 235 W/m². Le déséquilibre mesuré par le rapport est donc la part du réchauffement qui n'a pas encore eu lieu : tant qu'il est positif, la planète continue de se réchauffer.

Un écart de 1 W/m² paraît faible face à 235. C'est 0,4 % du flux absorbé. Mais il s'applique à toute la surface du globe, 5,1 × 10¹⁴ m², en permanence : cela fait environ 5 × 10¹⁴ watts. Et il augmente. Le rapport donne 0,43 W/m² sur 1975-1994, 0,89 sur 2005-2024 et 0,99 sur 2012-2024.

```figure
file: fig-2.svg
caption: Le déséquilibre énergétique de la Terre selon la période de mesure (Forster et al., 2025)
scroll: Trois barres apparaissent l'une après l'autre, de plus en plus hautes
steps:
- Entre 1975 et 1994, la Terre gardait en moyenne 0,43 W/m² de plus qu'elle n'en renvoyait.
- Sur 2005-2024, l'écart moyen atteint 0,89 W/m², soit environ le double.
- Sur les douze dernières années, il est de 0,99 W/m². Le déséquilibre grandit au lieu de se résorber.
- Cela reste 0,4 % seulement des 235 W/m² absorbés. Le climat se joue sur un petit écart entre deux grands flux.
```

Le cours donne aussi de quoi estimer la suite. En dérivant l'équation, une variation relative du flux émis vaut 4 × ΔTs/Ts. Pour évacuer 1 W/m² de plus, soit 0,43 % de 235, il faut ΔTs ≈ 288 × 0,0043 / 4 ≈ 0,3 °C. Le TD précise que les rétroactions (vapeur d'eau, glace) amplifient ce résultat d'un facteur 2 à 3. Avec une atmosphère figée dans sa composition actuelle, il resterait donc de l'ordre de 0,6 à 0,9 °C à venir. C'est un ordre de grandeur, pas une prévision.

Reste la question du budget. On compte en tonnes cumulées parce que le CO2 s'accumule. Le TD montre que la végétation et l'océan de surface reprennent environ la moitié de nos émissions en quelques années, mais que le reste persiste : il faut de l'ordre de 370 ans pour le mélange avec l'océan profond, et des centaines de milliers d'années pour le retour complet vers le sous-sol. À l'échelle d'une vie humaine, chaque tonne émise est donc acquise. Ce qui fixe ε, et donc la température, c'est le total émis, pas le débit de l'année.

Avec la conversion du TD, 1 ppm de CO2 atmosphérique = 7,7 GtCO2, le budget de 130 GtCO2 représente 17 ppm émis, dont environ 8 resteraient dans l'air.

```figure
file: fig-3.svg
caption: Le budget carbone restant pour 1,5 °C, consommé au rythme des émissions
scroll: Une droite descend depuis 130 GtCO2 et touche zéro début 2028, puis une seconde droite en pointillés descend deux fois moins vite
steps:
- Début 2025, il reste 130 GtCO2 à émettre pour garder une chance sur deux de rester sous 1,5 °C.
- Les émissions actuelles retirent 42 GtCO2 par an de ce total. Le budget ne se recharge pas d'une année sur l'autre.
- À ce rythme, il est épuisé en 130 / 42 ≈ 3,1 ans, c'est-à-dire début 2028.
- Diviser les émissions par deux ne fait que doubler ce délai, jusqu'à début 2031. Seul l'arrêt des émissions arrête le compteur.
```

## Ce qu'il faut en retenir

Le climat ne dépend pas de la taille des flux mais de leur différence, et cette différence est aujourd'hui de 1 W/m² dans le mauvais sens. Comme le CO2 reste, réduire les émissions ralentit la hausse sans l'arrêter. Seul un total émis plafonné stabilise la température.

Le modèle du cours a ses limites. Il résume la Terre en un point, avec un seul albédo et un seul effet de serre. Il ne dit rien de la vitesse à laquelle l'océan absorbe la chaleur, ni des régions. Et le budget de 130 GtCO2 est une estimation centrale à une chance sur deux, pas un seuil physique : le dépasser ne déclenche rien de particulier le lendemain, cela rend seulement l'objectif de 1,5 °C de moins en moins probable.

## Sources

- [Forster et al., Indicators of Global Climate Change 2024, Earth System Science Data, 19 juin 2025](https://essd.copernicus.org/articles/17/2641/2025/)
- [Université de Leeds, Scientists find three years left of remaining carbon budget for 1.5°C, 19 juin 2025](https://climate.leeds.ac.uk/news/scientists-find-three-years-left-of-remaining-carbon-budget-for-1-5c/)
- Cours Limites Planétaires (CentraleSupélec, 1A), TD « Bilan radiatif et cycle du carbone », D. Paillard
