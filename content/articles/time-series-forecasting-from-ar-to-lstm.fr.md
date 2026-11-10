---
title: "Prévision de séries temporelles : de l'AR au LSTM"
summary: "Stationnarité, AR, MA, ARIMA, SARIMAX et LSTM expliqués simplement, et comment je choisis entre eux."
category: "data-science"
date: "2026-11-10"
readingMinutes: 5
order: 4
---

Une série temporelle est le seul type de jeu de données où mélanger les lignes détruit l'information. L'ordre est le signal. Ce simple fait change la façon de découper, de modéliser et d'évaluer.

## D'abord, la stationnarité

Les modèles classiques supposent que la série est **stationnaire** : sa moyenne et sa variance ne changent pas dans le temps. Une série avec une tendance ou des oscillations qui s'amplifient ne l'est pas.

Le remède habituel est la **différenciation** : remplacer chaque valeur par sa variation par rapport à la précédente. Différencier une fois élimine une tendance linéaire ; deux fois, une tendance quadratique. Un simple tracé, ou un test statistique comme celui de Dickey-Fuller augmenté, indique si cela a suffi.

## La famille classique, lettre par lettre

**AR (autorégressif).** La valeur suivante est une combinaison linéaire des *p* valeurs précédentes. Les coefficients sont estimés par les moindres carrés ou le maximum de vraisemblance. Pour prévoir plusieurs pas en avant, les prédictions sont réinjectées en entrée ; les erreurs s'accumulent donc avec l'horizon.

**MA (moyenne mobile).** Malgré son nom, un modèle MA(*q*) n'est pas la moyenne glissante des dernières valeurs. Il modélise la valeur suivante à partir des *q* dernières **erreurs de prévision**. La moyenne glissante est un lissage et une référence naïve, utile, mais c'est un autre objet.

**ARMA.** AR et MA combinés. Sa limite : il ne modélise que des séries stationnaires et ne peut donc pas suivre une tendance croissante.

**ARIMA.** Un ARMA avec la différenciation intégrée. Le « I » (intégré) ajoute un paramètre *d* : le nombre de différenciations appliquées. On note le modèle ARIMA(p, d, q).

**SARIMAX.** Ajoute deux choses : des termes **saisonniers** (composantes AR et MA saisonnières qui relient une valeur au même moment des cycles précédents, avec une période *s*) et des variables **exogènes** (le X : météo, vacances, prix).

## Choisir p et q

Deux graphiques font l'essentiel du travail :

- L'**ACF** (fonction d'autocorrélation) montre la corrélation de la série avec ses propres décalages.
- La **PACF** (autocorrélation partielle) montre la corrélation avec un décalage une fois les décalages plus courts pris en compte.

La règle empirique : les décalages où la PACF dépasse le seuil de significativité suggèrent l'ordre AR *p* ; ceux où l'ACF le dépasse suggèrent l'ordre MA *q*. On compare ensuite quelques candidats avec un critère comme l'AIC plutôt que de se fier au seul coup d'œil.

```python
import statsmodels.api as sm

model = sm.tsa.SARIMAX(
    train,
    order=(1, 1, 1),              # p, d, q
    seasonal_order=(1, 1, 1, 12)  # P, D, Q, période
)
fit = model.fit(disp=False)
forecast = fit.forecast(steps=len(test))
```

## Réseaux de neurones : RNN et LSTM

Un **réseau de neurones récurrent** lit une séquence pas à pas et conserve un état caché, une mémoire de ce qu'il a vu. Il s'entraîne par rétropropagation à travers le temps. Sur de longues séquences, le gradient s'amenuise à chaque pas en arrière et le réseau oublie les événements lointains : c'est le problème de la **disparition du gradient**.

Le **LSTM** (Long Short-Term Memory) y répond avec une cellule mémoire et trois portes :

- la **porte d'oubli** décide ce qu'il faut effacer de la mémoire,
- la **porte d'entrée** décide quelle nouvelle information stocker,
- la **porte de sortie** décide ce qu'il faut exposer à ce pas de temps.

Le réseau apprend ainsi quoi retenir sur de longues périodes. Le prix : davantage de paramètres, de calcul et de données nécessaires.

Pour l'entraîner, on découpe la série en fenêtres glissantes : les *n* dernières valeurs en entrée, la valeur suivante comme cible.

```python
import numpy as np

def make_windows(series, n_steps):
    X, y = [], []
    for i in range(len(series) - n_steps):
        X.append(series[i:i + n_steps])
        y.append(series[i + n_steps])
    return np.array(X), np.array(y)
```

## Comment je choisis

| Situation | Point de départ |
|---|---|
| Série courte, une variable, saisonnalité nette | SARIMA |
| Facteurs externes connus (météo, calendrier) | SARIMAX, ou gradient boosting sur des variables de décalage et de calendrier |
| Long historique, nombreuses séries liées, effets non linéaires | LSTM ou autres modèles profonds |
| Dans tous les cas | Une référence naïve d'abord |

La référence compte. « Même valeur qu'hier » ou « même valeur que la semaine dernière » est étonnamment difficile à battre, et un modèle qui ne la bat pas ne mérite pas d'être déployé.

## Évaluer sans tricher

- Découper **chronologiquement** : entraîner sur le passé, tester sur la suite. Ne jamais mélanger.
- Tester sur plusieurs périodes si possible (une semaine normale, une période de vacances).
- Utiliser des métriques d'erreur dans l'unité du problème (MAE, RMSE) et une métrique relative (MAPE) pour communiquer.
- Tracer la prévision par-dessus les valeurs réelles. Un modèle qui se contente de répéter la valeur précédente peut afficher un score correct sans aucune utilité.

## À retenir

- L'ordre est l'information : découper selon le temps, jamais au hasard.
- Rendre la série stationnaire par différenciation avant d'utiliser les modèles classiques.
- AR utilise les valeurs passées, MA les erreurs passées, ARIMA ajoute la différenciation, SARIMAX la saisonnalité et les variables externes.
- L'ACF et la PACF suggèrent les ordres ; l'AIC arbitre.
- Les LSTM gèrent la mémoire longue et la non-linéarité, mais demandent des données et du calcul.
- Toujours comparer à une référence naïve.
