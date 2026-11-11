---
title: "Prétraitement des données : les neuf étapes qui comptent"
summary: "Valeurs aberrantes, valeurs manquantes, mise à l'échelle, encodage, sélection et enrichissement : ma checklist avant tout modèle."
category: "data-science"
date: "2026-11-10"
written: "2023-06"
scene: "sieve"
readingMinutes: 5
order: 2
---

Un modèle moyen sur des données propres bat le plus souvent un excellent modèle sur des données sales. Le prétraitement est la partie la moins séduisante d'un projet, et celle où j'ai gagné le plus de performance. Voici la checklist que je garde sous la main.

## La checklist

1. Données incohérentes
2. Doublons
3. Valeurs aberrantes
4. Valeurs manquantes
5. Suppression de lignes
6. Mise à l'échelle
7. Encodage des variables catégorielles
8. Réduction du nombre de variables
9. Enrichissement des variables

Et une règle au-dessus de la liste : **documenter chaque modification**.

## Nettoyer : incohérences et doublons

Une donnée incohérente (un âge négatif, une date dans le futur, deux unités dans une même colonne) ne se corrige pas par une formule. La méthode est un processus : identifier le problème, comprendre à quoi la donnée devrait ressembler, choisir une stratégie de correction, l'appliquer, valider le résultat, et le documenter.

Les doublons sont plus simples : `df.drop_duplicates()`, avec `subset=` si seules certaines colonnes définissent l'identité d'une ligne.

## Valeurs aberrantes : trois méthodes simples

- **Z-score.** On compte le nombre d'écarts-types qui séparent un point de la moyenne ; on signale au-delà de 2 ou 3. Adapté à des données à peu près normales.
- **Percentiles.** On retire ce qui se situe sous le 5e ou au-dessus du 95e percentile. Simple, mais on retire toujours quelque chose, même sans valeur aberrante.
- **Écart interquartile (IQR).** On signale les valeurs inférieures à Q1 - 1,5 x IQR ou supérieures à Q3 + 1,5 x IQR. Robuste, car les quartiles ne sont pas influencés par les valeurs extrêmes elles-mêmes.

```python
import numpy as np

def remove_outliers_iqr(data):
    q1, q3 = np.percentile(data, [25, 75])
    iqr = q3 - q1
    mask = (data >= q1 - 1.5 * iqr) & (data <= q3 + 1.5 * iqr)
    return data[mask]
```

Une mise en garde apprise à mes dépens : sur un tout petit échantillon contenant une valeur énorme, le z-score peut rater la valeur aberrante, parce qu'elle gonfle l'écart-type auquel on la compare. L'IQR est mon choix par défaut.

Et avant de supprimer quoi que ce soit, se demander si la valeur est une erreur ou un événement réel. Un pic de trafic un jour de grève est une information, pas du bruit.

## Valeurs manquantes

Trois options, à choisir selon le contexte :

- **Imputer par une statistique** : moyenne ou médiane de la colonne (`df["col"].fillna(df["col"].median())`). La médiane résiste mieux aux valeurs extrêmes.
- **Propager un voisin** : remplissage vers l'avant (`ffill`) ou vers l'arrière (`bfill`), naturel pour une série temporelle où la valeur précédente est une estimation correcte.
- **Remplir par une constante** comme 0, uniquement quand zéro veut vraiment dire « rien ».

Supprimer des lignes est le dernier recours, acceptable quand peu de lignes sont concernées et qu'elles manquent de façon aléatoire.

## Mise à l'échelle et encodage

Beaucoup de modèles (tout ce qui repose sur des distances ou des gradients : k-means, KNN, SVM, réseaux de neurones) sont sensibles à l'échelle des variables. La standardisation ramène chaque variable à une moyenne de 0 et un écart-type de 1.

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # pas de fit sur le test
```

Ajuster le scaler sur le seul jeu d'entraînement n'est pas un détail : l'ajuster sur l'ensemble fait fuiter de l'information du test vers l'entraînement. `inverse_transform` ramène les prédictions dans les unités d'origine.

Les variables catégorielles doivent devenir des nombres. Le **one-hot encoding** transforme une colonne à *k* modalités en *k* colonnes binaires (`OneHotEncoder` de scikit-learn, ou `pd.get_dummies`). Il évite d'inventer un ordre artificiel entre les modalités, au prix de colonnes supplémentaires.

## Moins de variables

Plus de variables ne veut pas dire mieux. Trois outils que j'utilise :

- **ACP (PCA)** : projette les données sur de nouveaux axes qui capturent le maximum de variance. Efficace, mais les nouvelles variables perdent leur sens métier.
- **Recursive Feature Elimination (RFE)** : entraîne un modèle, retire la variable la moins importante, et recommence jusqu'au nombre voulu.
- **SelectKBest** : note chaque variable individuellement avec un test statistique (khi-deux, test F d'ANOVA, information mutuelle) et garde les *k* meilleures. Rapide, mais aveugle aux interactions.

## De meilleures variables

C'est ici que la connaissance du métier paie. Quatre familles :

- **Variables dérivées** : ratios (prix au mètre carré), différences (âge à partir d'une date de naissance), longueur d'un texte, pourcentages, regroupement en classes.
- **Variables temporelles** : heure, jour de la semaine, mois, trimestre, saison, jours fériés ou vacances scolaires, toute période exceptionnelle.
- **Variables textuelles** : sac de mots, TF-IDF, embeddings, sentiment.
- **Données externes** : météo, démographie, indicateurs économiques, tendances de marché.

Sur un exercice de prévision de trafic, ajouter un indicateur de vacances et la météo a davantage réduit l'erreur que n'importe quel changement de modèle.

## À retenir

- Nettoyer d'abord, transformer ensuite, sélectionner et enrichir en dernier ; consigner chaque changement.
- L'IQR est un bon choix par défaut pour les valeurs aberrantes ; vérifier qu'il s'agit d'une erreur avant de supprimer.
- Préférer l'imputation par la médiane ou le remplissage vers l'avant à la suppression de lignes.
- Ajuster scalers et encodeurs sur le jeu d'entraînement uniquement.
- L'enrichissement par la connaissance métier bat souvent un modèle plus complexe.
