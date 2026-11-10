---
title: "Apprentissage par renforcement : Q-learning et policy gradient"
summary: "Deux façons d'apprendre à un agent par essais et erreurs, expliquées sur une petite grille avec obstacles."
category: "data-science"
date: "2026-11-10"
readingMinutes: 5
order: 6
---

L'apprentissage par renforcement est la branche du machine learning sans jeu de données. Un agent agit, l'environnement répond par une récompense, et l'agent doit comprendre quel comportement paie dans la durée. Pour le comprendre, j'ai implémenté les deux approches classiques sur le même problème jouet.

## Le cadre : une grille

Une grille de 10 x 10. L'agent part d'un coin et doit atteindre une case objectif. Certaines cases sont des obstacles.

- **État** : la position de l'agent.
- **Actions** : haut, bas, gauche, droite.
- **Récompenses** : +1 en atteignant l'objectif, -1 en heurtant un obstacle (l'épisode s'arrête dans les deux cas), et -0,1 pour tout autre pas.

Cette petite pénalité par pas compte : sans elle, errer indéfiniment ne coûte rien. Avec elle, l'agent est poussé vers le chemin sûr le plus court. Concevoir la récompense, c'est concevoir le comportement.

Un **épisode** est une tentative, du départ jusqu'à l'objectif ou à un obstacle.

## Q-learning : apprendre la valeur de chaque action

Le Q-learning tient une table Q avec une entrée par couple (état, action) : la récompense totale espérée si je prends cette action ici puis que j'agis de façon optimale. Ici : 100 états x 4 actions.

Après chaque pas, l'entrée est mise à jour avec l'équation de Bellman :

> Q(s, a) ← Q(s, a) + α [ r + γ max Q(s', a') − Q(s, a) ]

- **α (taux d'apprentissage)** : à quel point une nouvelle expérience écrase l'ancienne estimation.
- **γ (facteur d'actualisation)** : le poids des récompenses futures face aux récompenses immédiates. Proche de 1, l'agent est patient.
- **r + γ max Q(s', a')** : la récompense reçue, plus la meilleure valeur accessible depuis l'état suivant.

```python
best_next = np.max(Q[next_state])
Q[state, action] += alpha * (reward + gamma * best_next - Q[state, action])
```

## Exploration contre exploitation

Si l'agent choisit toujours l'action à la plus forte valeur Q, il ne découvre jamais de meilleurs chemins. S'il agit toujours au hasard, il n'utilise jamais ce qu'il sait.

Le compromis habituel est la stratégie **epsilon-greedy** : avec une probabilité ε (disons 10 %), prendre une action aléatoire ; sinon, la meilleure action connue. Un raffinement courant consiste à partir d'un ε élevé et à le réduire au fil du temps.

Après suffisamment d'épisodes, prendre la valeur Q maximale de chaque case donne une carte de la qualité de chaque position, et suivre la meilleure action de case en case trace le chemin appris.

**Forces** : simple à comprendre et à implémenter, bien adapté aux petits environnements discrets.

**Limites** : la table grossit avec le nombre d'états et d'actions ; elle ne s'étend donc pas telle quelle aux espaces continus ou très grands, et il faut assez d'exploration pour converger. Le deep Q-learning remplace la table par un réseau de neurones pour aller plus loin.

## Policy gradient : apprendre directement le comportement

La seconde approche se passe de table de valeurs. Elle apprend une **politique** : une fonction, typiquement un petit réseau de neurones, qui prend l'état en entrée et renvoie une probabilité pour chaque action. La politique est stochastique ; l'exploration est donc intégrée.

L'algorithme de base (REINFORCE) se déroule ainsi :

1. **Initialiser** le réseau de politique avec des poids aléatoires.
2. **Jouer un épisode** en tirant les actions selon la politique ; enregistrer états, actions et récompenses.
3. **Calculer le retour** G_t de chaque pas : la somme actualisée des récompenses qui ont suivi (une estimation de Monte-Carlo).
4. **Mettre à jour les poids** pour rendre plus probables les actions suivies de retours élevés :

> θ ← θ + α ∇ log π(a | s) · G_t

En code, cela devient une perte à minimiser :

```python
loss = -(log_probs * returns).sum()
loss.backward()
optimizer.step()
```

Normaliser les retours (soustraire leur moyenne, diviser par leur écart-type) rend l'entraînement nettement plus stable.

**Forces** : gère les espaces d'actions continus ou vastes, et peut apprendre des politiques stochastiques.

**Limites** : l'estimation du gradient est bruitée ; l'apprentissage est donc plus lent, moins stable, et demande beaucoup d'épisodes. Les méthodes acteur-critique combinent les deux idées, une politique et une estimation de valeur, pour réduire ce bruit.

## Côte à côte

| | Q-learning | Policy gradient |
|---|---|---|
| Ce qui est appris | La valeur de chaque action | La probabilité de chaque action |
| Exploration | Ajoutée (epsilon-greedy) | Intégrée à la politique |
| Adapté à | Petits problèmes discrets | Espaces d'actions vastes ou continus |
| Faiblesse principale | Ne passe pas à l'échelle sous forme de table | Forte variance, lenteur |

## Ce que j'ai retenu de l'exercice

Sur la grille, le Q-learning a convergé proprement et le résultat était facile à inspecter : une table est transparente. La version policy gradient a demandé plus de réglages pour le même problème. La leçon se généralise : commencer par la méthode la plus simple que le problème autorise, et garder les outils plus lourds pour les cas où l'espace d'états l'exige vraiment.

## À retenir

- L'apprentissage par renforcement apprend à partir de récompenses, pas d'exemples étiquetés.
- La conception de la récompense, petites pénalités par pas comprises, définit le comportement obtenu.
- Le Q-learning stocke la valeur de chaque couple état-action et la met à jour avec l'équation de Bellman.
- Epsilon-greedy équilibre l'exploration de nouvelles actions et l'exploitation des actions connues.
- Le policy gradient ajuste directement les probabilités d'action, au prix d'un apprentissage plus bruité.
- Préférer la méthode tabulaire quand le problème est petit ; passer aux réseaux quand il ne l'est plus.
