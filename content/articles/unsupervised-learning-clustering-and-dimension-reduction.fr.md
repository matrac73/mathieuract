---
title: "Apprentissage non supervisé : clustering et réduction de dimension"
summary: "K-means, clustering hiérarchique, DBSCAN, ACP et NMF : comment chacun fonctionne et quand je m'en sers."
category: "data-science"
date: "2026-11-10"
readingMinutes: 5
order: 3
---

L'apprentissage non supervisé commence là où les étiquettes s'arrêtent : personne ne dit à l'algorithme quelle est la bonne réponse, il doit trouver seul une structure. En pratique, cela recouvre deux tâches : regrouper des observations semblables (clustering) et condenser de nombreuses variables en quelques-unes (réduction de dimension).

## K-means : le choix par défaut

K-means cherche *k* groupes en répétant deux étapes :

1. Affecter chaque point au centre le plus proche (distance euclidienne).
2. Déplacer chaque centre à la moyenne de ses points.

Les centres sont initialisés au hasard et la boucle s'arrête quand ils ne bougent plus. L'algorithme minimise la **variance intra-cluster**.

```python
from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=3, n_init=10, random_state=0)
labels = kmeans.fit_predict(X)
centers = kmeans.cluster_centers_
```

Il est rapide et facile à expliquer. Ses limites sont tout aussi nettes : il faut choisir *k* à l'avance, le résultat dépend de l'initialisation, il suppose des groupes à peu près sphériques et de taille comparable, et il est sensible à l'échelle ; on standardise donc d'abord.

## Clustering hiérarchique : pas de k à fixer au départ

Au lieu d'une partition unique, le clustering hiérarchique construit un arbre de groupes emboîtés, le **dendrogramme**.

- **Agglomératif (ascendant)** : chaque point est d'abord son propre cluster ; on fusionne les deux clusters les plus proches, on met à jour la matrice de similarité, et ainsi de suite jusqu'à n'en avoir plus qu'un.
- **Divisif (descendant)** : tout part d'un seul cluster, que l'on scinde récursivement.

La version agglomérative est celle que proposent la plupart des bibliothèques. Le vrai résultat, c'est le dendrogramme : on le coupe à la hauteur qui a du sens et on y lit le nombre de clusters. Le prix est le temps de calcul, qui croît vite avec le nombre de points ; je l'utilise sur des milliers de lignes, pas sur des millions.

## DBSCAN : les clusters comme zones denses

DBSCAN définit un cluster comme une zone où les points sont denses. Deux paramètres :

- **epsilon** : le rayon du voisinage autour d'un point.
- **minPts** : le nombre minimal de voisins pour qu'un point soit un *point central*.

Les points centraux voisins sont reliés en un même cluster. Les points non centraux situés près d'un point central rejoignent ce cluster comme points de bordure. Tout le reste est étiqueté **bruit**.

Deux propriétés font son intérêt : il trouve des clusters de forme quelconque, et il identifie nativement les points isolés au lieu de les forcer dans un groupe. Le nombre de clusters n'est pas un paramètre. La difficulté se reporte sur le choix d'epsilon, et il peine lorsque les clusters ont des densités très différentes.

## Quel algorithme de clustering ?

| Situation | Mon premier choix |
|---|---|
| Gros volume, groupes compacts, k connu | K-means |
| Petit volume, envie de voir la structure | Hiérarchique + dendrogramme |
| Formes irrégulières, bruit, k inconnu | DBSCAN |

## ACP : moins d'axes, l'essentiel de la variance

L'analyse en composantes principales construit de nouveaux axes, combinaisons linéaires des variables d'origine, classés selon la variance qu'ils capturent.

1. **Centrer** les données (et les réduire si les unités diffèrent).
2. Calculer la **matrice de covariance**.
3. La décomposer en **vecteurs propres** (les directions) et **valeurs propres** (la variance portée par chaque direction).
4. **Projeter** les données sur les premières directions.

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)
print(pca.explained_variance_ratio_)
```

Je m'en sers pour trois choses : visualiser un jeu de données en deux dimensions, supprimer la redondance entre variables corrélées avant un modèle, et accélérer l'entraînement. `explained_variance_ratio_` indique ce que l'on perd. Le revers est l'interprétabilité : une composante est un mélange de tout.

## NMF : des parties qui s'additionnent

La factorisation en matrices non négatives approche une matrice X non négative par le produit de deux matrices non négatives plus petites, W et H. Toutes deux partent de valeurs aléatoires et sont mises à jour tour à tour pour réduire l'erreur de reconstruction, jusqu'à convergence.

- **W** donne le poids de chaque observation sur chaque composante.
- **H** donne la contribution de chaque variable à chaque composante.

Comme rien ne peut être négatif, les composantes ne peuvent que s'additionner, jamais se compenser. Elles ressemblent alors à des *parties* : des thèmes dans un corpus de documents, des profils types dans des données d'usage. La NMF se lit donc plus facilement que l'ACP quand les données sont des comptages ou des intensités.

## Comment savoir si cela a fonctionné

Sans étiquettes, pas d'accuracy. Je m'appuie sur :

- **L'inertie** (somme des carrés intra-cluster) tracée en fonction de *k*, à la recherche du coude.
- **Le coefficient de silhouette**, entre -1 et 1, qui compare la proximité d'un point à son propre cluster et au cluster voisin le plus proche.
- **Le bon sens** : puis-je nommer chaque cluster ? Une segmentation que l'on ne peut pas décrire en termes métier ne sera pas utilisée.

## À retenir

- Le clustering regroupe des lignes ; la réduction de dimension condense des colonnes. Les deux se combinent bien.
- K-means est le choix rapide par défaut, mais exige k, une mise à l'échelle et des groupes compacts.
- Un dendrogramme montre la structure avant de s'engager sur un nombre de clusters.
- DBSCAN gère les formes atypiques et signale le bruit ; le réglage d'epsilon en est le prix.
- L'ACP maximise la variance ; la NMF donne des composantes additives, plus lisibles.
- Valider avec la silhouette et l'inertie, puis en vérifiant que les clusters peuvent être nommés.
