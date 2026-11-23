---
title: "Distances approchées dans un réseau : la garantie « au plus deux fois » gagne du terrain"
summary: "Un résultat relayé fin octobre étend à des points bien plus proches une garantie d'erreur vieille de 1996 sur le calcul des distances dans un réseau. Le cours d'algorithmique avancée explique ce que vaut une telle garantie."
hook: "Calculer toutes les distances d'un grand réseau prend trop de temps, alors on accepte une erreur bornée, et un chercheur vient d'étendre cette borne à des points bien plus proches."
category: "perspective"
date: "2026-10-30"
written: "2026-10"
readingMinutes: 5
course: "ALGO+ (3A)"
courseSlug: "algo-3a"
news:
  title: "A computer scientist breaks through a limit that stood since 1996"
  source: "ScienceDaily (Indian Institute of Technology Gandhinagar)"
  url: "https://sciencedaily.com/releases/2026/10/261029072146.htm"
  date: "2026-10-30"
---

## Ce qui a été annoncé

Le 30 octobre 2026, ScienceDaily a relayé un résultat de Manoj Gupta, enseignant-chercheur à l'Indian Institute of Technology Gandhinagar. Il porte sur un problème classique : calculer la distance entre toutes les paires de points d'un réseau, qu'il s'agisse de routeurs, de carrefours ou de comptes d'un réseau social. Depuis 1996, une méthode due à Dor, Halperin et Zwick donnait rapidement des distances approchées, garanties au plus deux fois trop longues, mais seulement pour des points assez éloignés. L'article de Manoj Gupta, présenté à la conférence FOCS 2025, étend cette garantie à des points nettement plus proches, sans alourdir le calcul. Son résumé parle de la première amélioration de ce résultat en plus de 25 ans.

## Renoncer à l'exact pour gagner du temps

Un réseau se modélise par un graphe : des sommets (les points) reliés par des arêtes (les liens). La distance entre deux sommets est ici le nombre d'arêtes du plus court chemin qui les relie. Le communiqué rappelle que certaines méthodes exactes demandent un temps cubique : le nombre d'opérations croît comme n³, où n est le nombre de sommets. Doubler la taille du réseau multiplie donc le travail par 8.

Un calcul d'ordre de grandeur montre le problème. Pour un million de sommets, n³ vaut 10¹⁸ opérations. Sur une machine qui en fait un milliard par seconde, cela représente environ 32 ans. Or il y a n² paires, soit 10¹² distances à écrire : on ne peut pas descendre en dessous, mais 10¹² opérations ne prennent qu'environ 17 minutes.

```figure
file: fig-1.svg
caption: Coût d'un calcul exact en n³ et d'un calcul approché proche de n², en échelles logarithmiques
scroll: La droite du calcul exact se trace, puis celle du calcul approché apparaît en orange, six ordres de grandeur plus bas pour un million de sommets.
steps:
- Un calcul exact de toutes les distances peut coûter n³ opérations, où n est le nombre de sommets. Sur ces axes logarithmiques, c'est une droite de pente 3.
- Pour un million de sommets, cela fait 10¹⁸ opérations, soit environ 32 ans sur une machine qui en exécute un milliard par seconde.
- Les méthodes approchées visent un coût proche de n², le nombre de paires. On ne peut pas faire moins, puisqu'il faut au moins écrire chaque réponse.
- À un million de sommets, n² vaut 10¹² opérations, environ 17 minutes. C'est cet écart qui justifie d'accepter une réponse approchée.
```

Le cours d'algorithmique avancée a un chapitre entier sur ce marché, sous un titre explicite : limiter le temps d'exécution en abandonnant les solutions optimales. Il y définit le rapport d'approximation : la valeur de la solution rendue, divisée par celle de la meilleure solution possible. Un algorithme est une 2-approximation si, quelle que soit l'instance, il rend une solution au plus deux fois l'optimal.

L'exemple du cours est le voyageur de commerce, qui cherche la tournée la plus courte passant par tous les points. On construit un arbre couvrant de poids minimum, c'est-à-dire le jeu d'arêtes le moins coûteux qui relie tous les sommets, puis on en fait le tour. La tournée obtenue pèse au plus deux fois l'arbre, et l'arbre pèse moins que la meilleure tournée : elle est donc au plus deux fois trop longue. L'intérêt est que cette borne est démontrée. Elle vaut pour toutes les entrées, pas seulement pour celles que l'on a testées.

## Une garantie a un domaine de validité

Le résultat de 1996 est une 2-approximation au sens du cours : si la vraie distance est 10, la valeur rendue est comprise entre 10 et 20. Mais la démonstration ne tenait que pour des paires assez éloignées. Le communiqué donne un cas où elle casse : deux sommets à 2 arêtes l'un de l'autre, pour lesquels la méthode rend 5. Le rapport vaut 2,5 et la promesse n'est plus tenue.

```figure
file: fig-2.svg
caption: La garantie « au plus deux fois » respectée pour une paire éloignée, rompue pour une paire proche
scroll: Une bande autorisée apparaît sur chaque axe, puis une estimation en orange tombe en dehors de la bande pour la paire proche.
steps:
- Pour une paire éloignée, à 10 arêtes de distance, une 2-approximation doit rendre une valeur entre 10 et 20. Une estimation de 14 est donc acceptable.
- Pour une paire proche, à 2 arêtes, la bande autorisée est bien plus étroite : de 2 à 4.
- Le communiqué cite un cas où l'ancienne méthode rend 5. C'est 2,5 fois la vraie distance : la garantie ne s'applique plus.
```

D'après le résumé de l'article, la méthode de 1996 garantit le facteur 2 pour les paires distantes d'au moins k arêtes, où k est un réglage : plus k est grand, plus le calcul est rapide. Le nouvel algorithme garde à peu près le même temps de calcul, mais sa garantie vaut dès une distance proportionnelle à log k. Prenons k = log n. Le temps de calcul devient proche de n², à des facteurs logarithmiques près. Pour un million de sommets, k vaut environ 20 et log k environ 4, à une constante près que le résumé ne précise pas.

```figure
file: fig-3.svg
caption: Distances à partir desquelles la garantie est démontrée, en 1996 puis en 2025
scroll: La zone garantie de 1996 apparaît à droite du seuil k, puis celle de 2025 s'étend en orange vers la gauche jusqu'à un seuil de l'ordre de log k.
steps:
- On range les paires de sommets selon leur vraie distance. Exemple pour un million de sommets, avec un réglage k = log₂ n ≈ 20.
- En 1996, le facteur 2 n'est démontré que pour les paires distantes d'au moins k arêtes. En dessous, rien n'est promis.
- En 2025, pour un temps de calcul comparable, le seuil descend à une distance de l'ordre de log k, soit environ 4 ici, à une constante près.
- Il reste une zone sans garantie, celle des paires très proches. Elle est beaucoup plus petite qu'avant, mais elle existe encore.
```

C'est ce que la notion du cours fait comprendre. Un algorithme d'approximation ne vaut que par sa démonstration, et celle-ci porte toujours sur un ensemble précis d'entrées. Le travail de recherche ne consiste pas ici à aller plus vite, mais à élargir cet ensemble. Les paires proches sont le cas difficile : une erreur de quelques arêtes ne se voit pas sur un long trajet, alors qu'elle dépasse vite le double sur un trajet court.

## Ce qu'il faut en retenir

Trois réserves. D'abord, le rapport 2 borne le pire cas : il ne dit rien de l'erreur moyenne, qui peut être bien plus faible. Ensuite, l'algorithme est randomisé : il tire des sommets au hasard et rend un résultat correct pour toutes les paires avec une forte probabilité, pas avec certitude. Le cours range ce type de méthode parmi les algorithmes de Monte-Carlo. Enfin, le communiqué le dit lui-même : le résultat est théorique et n'améliore pas dans l'immédiat les systèmes de routage existants.

Je retiens surtout une habitude de lecture. Devant une méthode « garantie à un facteur 2 », la bonne question est : garantie pour quelles entrées ? Pendant près de trente ans, la réponse excluait une grande partie des paires proches.

## Sources

- [A computer scientist breaks through a limit that stood since 1996, ScienceDaily, 30 octobre 2026](https://sciencedaily.com/releases/2026/10/261029072146.htm)
- [Manoj Gupta, Improved 2-Approximate Shortest Paths for close vertex pairs, arXiv 2507.19859](https://arxiv.org/abs/2507.19859)
- [Rethinking distance in massive networks, communiqué de l'IIT Gandhinagar sur EurekAlert](https://www.eurekalert.org/news-releases/1119697)
