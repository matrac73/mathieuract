---
title: "Le pipeline de machine learning, de bout en bout"
summary: "Les huit étapes que je suis sur chaque projet de ML, de l'import des données au tuning, et où part vraiment le temps."
category: "data-science"
date: "2026-11-10"
readingMinutes: 4
order: 1
---

La plupart des projets de machine learning n'échouent pas sur le modèle. Ils échouent dans la tuyauterie qui l'entoure. En remettant mes notes en ordre, je suis retombé à chaque fois sur les mêmes huit étapes ; j'en ai fait une checklist.

## Les huit étapes

1. **Importer** les données
2. Les **explorer** (EDA)
3. Les **prétraiter**
4. **Séparer** entraînement et test
5. **Entraîner** un modèle
6. **Afficher** les prédictions
7. **Mesurer** avec la bonne métrique
8. **Ajuster** (tuning)

Rien d'original, et c'est voulu. L'ordre compte davantage que la sophistication de chaque étape.

## Explorer avant de toucher à quoi que ce soit

Quatre appels pandas donnent une première image de n'importe quelle table : `df.shape`, `df.head()`, `df.info()` et `df.describe()`. La taille, un échantillon, les types et les valeurs manquantes, les statistiques de base.

Je regarde ensuite les variables face à la cible :

- **Des diagrammes en barres ou des boîtes à moustaches** de la cible par catégorie (heure, jour de la semaine, mois pour tout ce qui est temporel).
- **Des comparaisons côte à côte** de deux sous-ensembles, par exemple hiver contre été, pour voir si une variable change le comportement.
- **Une matrice de corrélation** pour repérer les variables redondantes et les facteurs évidents.

```python
import seaborn as sns

sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="YlGnBu")
```

Le but de l'EDA n'est pas de produire de jolis graphiques. C'est de formuler des hypothèses sur ce qui aidera le modèle, et de trouver les problèmes que le prétraitement devra corriger.

## Prétraiter, et noter ce que l'on a changé

Nettoyer (valeurs incohérentes, doublons, valeurs aberrantes, valeurs manquantes), puis transformer (mise à l'échelle, encodage), puis sélectionner ou créer des variables. J'y consacre une note à part, car c'est en général de là que vient l'essentiel de la performance.

Une habitude que j'ai prise : tenir un journal de chaque modification. Trois semaines plus tard, personne ne sait plus pourquoi 4 % des lignes ont disparu.

## Séparer : l'étape qui garde honnête

Pour un jeu de données tabulaire classique, un découpage aléatoire convient :

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

Pour une série temporelle, le découpage aléatoire est une erreur : le modèle apprendrait du futur pour prédire le passé. Le jeu de test doit être une période continue située *après* la période d'entraînement. Je choisis souvent plusieurs fenêtres de test (une semaine calme, une période de vacances) pour vérifier que le modèle tient dans des régimes différents.

La même logique vaut pour le prétraitement : on ajuste les scalers et les encodeurs sur le jeu d'entraînement uniquement, puis on les applique au jeu de test. Sinon, de l'information fuit.

## Entraîner : choisir d'abord la famille

Le choix du modèle part du type de problème, pas de l'algorithme à la mode :

| Problème | Ce dont on dispose | Outils typiques |
|---|---|---|
| Supervisé | Des exemples étiquetés | Régression, classification, méthodes d'ensemble |
| Non supervisé | Pas d'étiquettes | Clustering, réduction de dimension |
| Série temporelle | Des observations ordonnées | Famille ARIMA, réseaux récurrents |
| Renforcement | Un environnement et des récompenses | Q-learning, policy gradient |

À l'intérieur d'une famille, je commence par le modèle le plus simple qui pourrait fonctionner. Un modèle linéaire ou un petit arbre donne une référence en quelques minutes, et tout modèle plus complexe doit ensuite se justifier face à elle.

## Afficher, mesurer, ajuster

**Afficher** les prédictions face aux valeurs réelles avant de lire le moindre score. Un tracé de la prévision sur la période de test montre en deux secondes ce qu'un chiffre unique cache : un décalage, un biais systématique, un angle mort sur les pics.

**Mesurer** avec une métrique qui reflète le coût réel des erreurs. L'accuracy sur un jeu déséquilibré est le piège classique.

**Ajuster** en dernier. La recherche d'hyperparamètres (grid search, random search, avec validation croisée) apporte les derniers pourcents. Elle ne sauvera ni des variables pauvres ni un découpage qui fuit ; elle ne mérite donc pas d'être le premier réflexe.

## Où part vraiment le temps

D'après mon expérience, la répartition entre les étapes ne ressemble pas à ce que laissent penser les tutoriels. L'exploration et le prétraitement absorbent l'essentiel de l'effort. L'entraînement tient en quelques lignes. Et la boucle n'est jamais linéaire : une mauvaise métrique renvoie aux variables, un tracé étrange renvoie au nettoyage.

## À retenir

- Suivre les mêmes huit étapes à chaque fois, sans en sauter, même sur un petit projet.
- Explorer d'abord : `shape`, `head`, `info`, `describe`, puis les variables face à la cible.
- Séparer avant d'ajuster quoi que ce soit, et jamais au hasard sur une série temporelle.
- Partir d'une référence simple ; les modèles complexes doivent mériter leur place.
- Regarder les prédictions avant de se fier à un score, et ajuster en dernier.
