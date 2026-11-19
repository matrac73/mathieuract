---
title: "Sans danger pour le cœur ne veut pas dire bon pour le cœur"
summary: "L'essai SYNCHRONIZE-CVOT montre que le survodutide n'augmente pas le risque cardiovasculaire, sans prouver qu'il le réduit. La différence tient au choix de l'hypothèse nulle d'un test statistique."
hook: "Un essai sur 5 500 patients montre qu'un nouveau médicament contre l'obésité n'abîme pas le cœur, sans prouver qu'il le protège : tout dépend de l'hypothèse que l'on cherche à réfuter."
category: "perspective"
date: "2026-11-09"
written: "2026-11"
readingMinutes: 5
course: "Statistiques et Apprentissage (1A)"
news:
  title: "Survodutide Meets CV Safety End Point in SYNCHRONIZE-CVOT"
  source: "AJMC (The American Journal of Managed Care)"
  url: "https://www.ajmc.com/view/survodutide-meets-cv-safety-end-point-in-synchronize-cvot"
  date: "2026-11-09"
---

Le 9 novembre 2026, au congrès de l'American Heart Association, le laboratoire Boehringer Ingelheim a présenté les résultats de l'essai SYNCHRONIZE-CVOT, publiés le même jour dans The Lancet. Environ 5 500 adultes en surpoids ou obèses, à risque cardiovasculaire élevé, ont reçu chaque semaine du survodutide, un nouveau médicament amaigrissant, ou un placebo, avec un suivi médian de 22 mois. Le résultat annoncé est que le médicament est « non inférieur » au placebo pour le cœur. Cette formule étrange vient directement de la façon dont on construit un test statistique.

## Ce que l'essai a mesuré

L'essai comptait les accidents cardiovasculaires graves : décès d'origine cardiovasculaire, infarctus, AVC, intervention pour déboucher une artère coronaire, épisode d'insuffisance cardiaque. Il y en a eu 136 parmi les 3 671 patients traités (3,7 %) et 76 parmi les 1 836 patients sous placebo (4,1 %).

On résume cette comparaison par un rapport de risque : le risque d'accident chez les traités divisé par celui du groupe placebo. Il vaut 1 si le médicament ne change rien, moins de 1 s'il protège, plus de 1 s'il nuit. L'essai l'estime à 0,89. Comme cette estimation repose sur un nombre limité d'accidents, on l'accompagne d'un intervalle de confiance à 95 %, c'est-à-dire la plage de valeurs compatibles avec les données : ici de 0,67 à 1,18.

La règle était fixée avant l'essai : il serait réussi si la borne haute de cet intervalle restait sous 1,65. Elle vaut 1,18, donc l'essai est réussi.

## La notion : deux hypothèses qui ne jouent pas le même rôle

Un test statistique confronte deux hypothèses, notées H0 et H1, et dit à partir des données si l'on garde H0 ou si on la rejette. Le cours de statistiques de première année insiste sur l'asymétrie entre les deux. H0, l'hypothèse nulle, est l'hypothèse « conservative » : celle sur laquelle on souhaite le moins se tromper en la rejetant à tort. Le cours prend l'image de la présomption d'innocence : on part de l'idée que l'accusé est innocent, et il faut des preuves convaincantes pour conclure le contraire, parce qu'il est plus grave de condamner un innocent que de relâcher un coupable.

Il y a donc deux erreurs possibles. L'erreur de première espèce consiste à rejeter H0 alors qu'elle est vraie. L'erreur de deuxième espèce consiste à garder H0 alors qu'elle est fausse. On ne peut pas rendre les deux très petites en même temps. On choisit donc de plafonner la première à un niveau α, typiquement 5 % ou 1 % selon le cours, et l'on fait au mieux pour la seconde.

La conséquence pratique est que les deux issues n'ont pas le même poids. Rejeter H0 est une conclusion solide. La garder signifie seulement que les preuves n'ont pas suffi.

```figure
file: fig-1.svg
caption: Les quatre issues d'un test quand l'hypothèse de départ est « le médicament est trop risqué »
scroll: Le tableau se remplit case par case, jusqu'à faire apparaître les deux erreurs possibles.
steps:
- On part de l'hypothèse prudente H0, le médicament est trop risqué. La réalité, que personne ne connaît, se trouve dans l'une des deux colonnes.
- À la fin de l'essai, on garde H0 ou on la rejette. Dans deux cases sur quatre, la décision est la bonne.
- Rejeter H0 alors qu'elle est vraie, c'est autoriser un produit risqué. C'est l'erreur de première espèce, la plus grave, dont on plafonne la probabilité à α.
- Garder H0 alors qu'elle est fausse, c'est bloquer un bon produit. Cette erreur de deuxième espèce n'est pas plafonnée, elle diminue quand l'essai grossit.
```

## Lire le résultat avec cette grille

Dans un essai de sécurité, l'erreur que l'on veut éviter avant tout est de déclarer sûr un médicament qui ne l'est pas. L'hypothèse nulle est donc « le médicament est trop risqué », traduite par un rapport de risque supérieur ou égal à 1,65. C'est au médicament de prouver le contraire. Ici, tout l'intervalle de confiance se trouve sous 1,65 : on rejette H0, et c'est une conclusion solide. Vérifier que la borne haute d'un intervalle à 95 % passe sous le seuil revient à plafonner l'erreur de première espèce à 2,5 %.

On peut poser une seconde question avec les mêmes données : le médicament protège-t-il le cœur ? L'hypothèse prudente devient « il ne protège pas », soit un rapport supérieur ou égal à 1. Cette fois l'intervalle, qui va jusqu'à 1,18, contient 1. On ne peut pas rejeter H0. Le 0,89 observé est encourageant, mais il reste compatible avec une absence d'effet.

```figure
file: fig-2.svg
caption: Le même intervalle de confiance répond à deux questions différentes
scroll: L'intervalle mesuré est comparé d'abord au seuil de danger à 1,65, puis à la valeur 1 qui marque l'absence d'effet.
steps:
- L'essai estime le rapport de risque à 0,89, avec un intervalle de confiance qui va de 0,67 à 1,18. La valeur 1 signifie que le médicament ne change rien.
- L'hypothèse de départ est que le médicament est trop risqué, c'est-à-dire que le vrai rapport se trouve au-delà de 1,65.
- Tout l'intervalle se trouve à gauche du seuil. L'hypothèse de départ est rejetée, le risque est jugé acceptable.
- Pour conclure à un bénéfice, il faudrait que tout l'intervalle soit sous 1. Il dépasse 1, donc la protection du cœur n'est pas démontrée.
```

« Non inférieur » est donc le nom exact de ce qui a été prouvé. Ce n'est ni une formule prudente ni un demi-échec.

## Ce que la notion ne dit pas

Pourquoi l'intervalle est-il si large ? Sa largeur dépend surtout du nombre d'accidents observés. Sur une échelle logarithmique, l'incertitude vaut à peu près √(1/136 + 1/76) ≈ 0,14, et l'on retrouve bien l'intervalle publié, de 0,67 à 1,18. Elle diminue comme 1/√n : pour la diviser par deux, il faut quatre fois plus d'accidents. Si le vrai rapport était 0,89, mon calcul donne environ 1 230 accidents pour que l'intervalle passe sous 1, soit près de six fois plus que les 212 observés.

```figure
file: fig-3.svg
caption: À estimation égale (0,89), l'intervalle de confiance se resserre quand le nombre d'accidents observés augmente
scroll: Les intervalles s'empilent en se resserrant autour de 0,89, jusqu'à ce que le dernier passe à gauche de 1.
steps:
- Avec les 212 accidents de l'essai, l'intervalle va de 0,67 à 1,18. Il est large parce que les accidents sont rares.
- Avec deux fois plus d'accidents et la même estimation, l'intervalle se resserre d'un facteur √2. Il contient encore 1.
- Avec quatre fois plus d'accidents, la largeur est divisée par deux. La borne haute dépasse encore un peu 1.
- Avec huit fois plus d'accidents, tout l'intervalle est sous 1. Le même 0,89 deviendrait alors la preuve d'un bénéfice.
```

Deux limites pour finir. Le seuil de 1,65 n'est pas un résultat mathématique : c'est une convention, qui fixe ce que l'on accepte d'appeler « pas trop risqué ». Et le test ne porte que sur le cœur. Il ne dit rien des troubles digestifs, qui ont conduit environ un patient traité sur cinq à arrêter le médicament, contre 1,9 % sous placebo. Ce que je retiens : avant de lire le résultat d'un essai, je regarde quelle hypothèse il cherchait à réfuter.

## Sources

- [Survodutide Meets CV Safety End Point in SYNCHRONIZE-CVOT, AJMC, 9 novembre 2026](https://www.ajmc.com/view/survodutide-meets-cv-safety-end-point-in-synchronize-cvot)
- [Survodutide meets cardiovascular safety endpoint in phase 3 obesity trial, Patient Care Online, 10 novembre 2026](https://www.patientcareonline.com/view/survodutide-meets-cardiovascular-safety-endpoint-in-phase-3-obesity-trial)
- [Survodutide shows cardiovascular safety in SYNCHRONIZE-CVOT, Pharmacy Times, 9 novembre 2026](https://www.pharmacytimes.com/view/survodutide-shows-cardiovascular-safety-in-synchronize-cvot)
- [Survodutide does not raise cardiovascular risk in patients with obesity, Healio, 9 novembre 2026](https://www.healio.com/news/cardiology/20261109/survodutide-does-not-raise-cardiovascular-risk-in-patients-with-obesity)
- Polycopié « Statistiques et apprentissage », CentraleSupélec, chapitre 3, Tests d'hypothèses statistiques
