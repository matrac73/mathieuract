---
title: "L'image plus nette de M87 : ce que les télescopes n'ont pas mesuré"
summary: "L'algorithme PRIMO affine l'image du trou noir de M87 sans nouvelle observation. Le théorème d'inversion de Fourier montre pourquoi il faut pour cela ajouter une hypothèse aux mesures."
hook: "La nouvelle image du trou noir de M87 n'est pas une photo plus fine : c'est un calcul qui devine, à partir de simulations, ce que les télescopes n'ont pas pu mesurer."
category: "perspective"
date: "2023-04-13"
written: "2023-04"
readingMinutes: 5
course: "CIP (Convergence, Intégration et Probabilités) (1A)"
courseSlug: "cip-convergence-integration-et-probabilites-1a"
news:
  title: "A sharper look at the M87 black hole"
  source: "Institute for Advanced Study"
  url: "https://www.eurekalert.org/news-releases/985842"
  date: "2023-04-13"
---

## Ce qui s'est passé

Le 13 avril 2023, une équipe menée par Lia Medeiros, de l'Institute for Advanced Study, publie dans The Astrophysical Journal Letters une nouvelle version de l'image du trou noir de la galaxie M87, située à environ 54 millions d'années-lumière. Aucune observation nouvelle : les données sont celles de 2017, qui avaient donné l'image diffusée en 2019. Seul le calcul change. Un algorithme nommé PRIMO, nourri de plus de 30 000 images simulées, produit un anneau environ deux fois plus fin, autour d'une zone centrale plus sombre.

## La notion : une image est une somme d'ondulations

Le cours de CIP définit la transformée de Fourier d'une fonction f intégrable : Ff(y) = (1/√(2π)) × ∫ f(x) e^(−ixy) dx. En mots : pour chaque fréquence y, on mesure à quel point f ressemble à une ondulation régulière de cette fréquence. Vient ensuite le théorème d'inversion : si Ff est elle aussi intégrable, alors f(x) = (1/√(2π)) × ∫ Ff(y) e^(ixy) dy presque partout. On retrouve la fonction en additionnant ses ondulations. Le mot qui compte est caché dans le signe ∫ : l'addition porte sur toutes les fréquences.

Ce théorème décrit exactement le travail de l'Event Horizon Telescope, le réseau de radiotélescopes qui observe M87. Deux antennes éloignées, combinées, ne voient pas l'image : elles mesurent une seule valeur de sa transformée de Fourier, c'est-à-dire la force d'une seule ondulation. Plus les antennes sont loin l'une de l'autre, plus l'ondulation est serrée. L'écart se compte en longueurs d'onde, et le réseau observe à 1,3 mm. Un écart de 8 milliards de longueurs d'onde vaut 8 × 10⁹ × 1,3 mm ≈ 10 400 km, presque le diamètre de la Terre. L'ondulation correspondante se répète tous les 1/(8 × 10⁹) radian, soit environ 26 microsecondes d'arc (µas, l'unité d'angle utilisée ici). L'anneau de M87 mesure environ 42 µas : il tient dans moins de deux de ces ondulations.

```figure
file: fig-1.svg
caption: Une paire de télescopes mesure une seule ondulation de l'image, d'autant plus serrée que les télescopes sont éloignés
scroll: Les deux télescopes s'écartent sur la Terre et les bandes qui traversent l'anneau se resserrent
steps:
- Deux télescopes distants de 4 900 km mesurent la force d'une ondulation large de l'image. Ses crêtes sont espacées de 55 µas, plus que l'anneau lui-même.
- Deux télescopes distants de 10 400 km, presque le diamètre de la Terre, mesurent une ondulation plus serrée, de 26 µas. À cette longueur d'onde, c'est à peu près le plus fin détail accessible depuis le sol.
- Chaque paire ne donne qu'une ondulation. Pour appliquer le théorème d'inversion, il les faudrait toutes.
```

## Ce que cela dit de l'image de M87

En 2017, le réseau comptait sept stations sur cinq sites. La rotation de la Terre fait bouger les paires vues depuis la source, mais le résultat reste maigre : quelques arcs dans le plan des fréquences, et du vide autour. Le communiqué parle d'un puzzle auquel il manque des pièces.

Ce que l'on sait malgré tout se lit sur une courbe. L'article scientifique indique que l'amplitude mesurée tombe à un premier minimum pour un écart de 3,75 milliards de longueurs d'onde, ce qui correspond à un anneau fin de 42 µas. Le diamètre est donc bien tenu par les données. L'épaisseur de l'anneau, elle, se lit au-delà de 5 milliards de longueurs d'onde, là où, selon les auteurs, les mesures sont clairsemées.

```figure
file: fig-2.svg
caption: Transformée de Fourier d'un anneau de 42 µas, calculée pour deux épaisseurs : les courbes ne se séparent que pour les grands écarts
scroll: La courbe de l'anneau fin se trace, puis celle de l'anneau épais, puis la zone où elles diffèrent s'allume
steps:
- Pour un anneau de 42 µas, l'amplitude mesurée baisse quand les télescopes s'écartent et s'annule vers 3,75 milliards de longueurs d'onde. La position de ce zéro donne le diamètre.
- Un anneau deux fois plus épais donne presque la même courbe jusqu'au zéro. Il ne s'en distingue qu'après, par une bosse plus basse.
- L'épaisseur se lit donc entre 5 et 8 milliards de longueurs d'onde, où les mesures sont rares. Au-delà, le réseau ne mesure plus rien.
```

Le théorème d'inversion réclame toutes les fréquences, et on n'en a qu'une poignée. Plusieurs images différentes sont donc compatibles avec les mêmes mesures, et toute reconstruction doit ajouter une hypothèse pour en choisir une. En 2019, l'hypothèse était générique, par exemple que deux pixels voisins ont des luminosités proches. PRIMO en prend une plus précise : l'image ressemble à ce que la physique prévoit. L'algorithme extrait des simulations 20 motifs typiques, puis les mélange jusqu'à reproduire les mesures. Comme chaque motif relie entre elles des régions du plan des fréquences, ajuster le mélange sur les zones mesurées fixe aussi sa valeur dans les zones vides.

```figure
file: fig-3.svg
caption: PRIMO comble les fréquences non mesurées avec des motifs appris sur des simulations
scroll: Les arcs mesurés apparaissent, puis les motifs, puis le disque des fréquences se remplit et l'anneau s'affine
steps:
- Les mesures de 2017 ne couvrent que quelques arcs du plan des fréquences. Avec une hypothèse générique, l'image de 2019 montre un anneau large.
- Plus de 30 000 images simulées de trous noirs sont résumées en 20 motifs typiques.
- Le mélange de motifs est ajusté sur les arcs mesurés. Il donne du même coup une valeur aux fréquences jamais observées.
- L'image obtenue garde le même diamètre, 41,5 µas, avec un anneau environ deux fois plus fin.
```

Le résultat : un diamètre de 41,5 ± 0,6 µas, cohérent avec les analyses précédentes, et une épaisseur de 9,6 ± 0,5 µas, soit moins du quart du diamètre, là où la borne prudente était auparavant de la moitié.

## Ce qu'il faut en retenir

Je retiens que cette image n'est pas une mesure plus fine, mais la même mesure complétée par une hypothèse plus forte. Le théorème d'inversion dit ce qui manque, pas comment le remplacer. Si les simulations décrivent bien le gaz autour du trou noir, les fréquences comblées sont plausibles. Si elles se trompent, l'image hérite de leur erreur, et aucune formule de Fourier ne le signalera.

Les auteurs le reconnaissent en partie : une structure visible au sud de l'anneau n'est, écrivent-ils, pas exigée par les données, et elle change avec le nombre de motifs retenus. Des membres du réseau extérieurs à l'étude, cités par Scientific American, saluent la méthode et demandent davantage de tests. Le diamètre de l'anneau est porté par les mesures. Son épaisseur repose pour une part sur ce que l'on croit déjà savoir des trous noirs.

## Sources

- [A sharper look at the M87 black hole, communiqué de l'Institute for Advanced Study (EurekAlert, 13 avril 2023)](https://www.eurekalert.org/news-releases/985842)
- [The Image of the M87 Black Hole Reconstructed with PRIMO, Medeiros et al., The Astrophysical Journal Letters (arXiv 2304.06079)](https://ar5iv.labs.arxiv.org/html/2304.06079)
- [See the Sharp New Image of an Iconic Black Hole, Scientific American (13 avril 2023)](https://www.scientificamerican.com/article/see-the-sharp-new-image-of-an-iconic-black-hole/)
- [Astronomers Capture First Image of a Black Hole, communiqué de l'ESO (10 avril 2019)](https://www.eso.org/public/news/eso1907/)
