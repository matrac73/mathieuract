---
title: "Des qubits en silicium à 1,5 kelvin : ce que la distribution de Boltzmann interdit, et comment on la contourne"
summary: "Deux équipes font fonctionner des qubits en silicium au-dessus de 1 kelvin. La distribution de Boltzmann montre pourquoi le froid ne suffit plus à préparer un spin à cette température, et pourquoi il a fallu changer de méthode de lecture."
hook: "À 1,5 degré au-dessus du zéro absolu, le froid ne suffit plus à ranger un bit quantique dans un état connu : les chercheurs ont dû le préparer et le lire autrement."
category: "perspective"
date: "2020-04-15"
written: "2020-04"
readingMinutes: 5
course: "Physique quantique et statistique (1A)"
courseSlug: "physique-quantique-et-statistique-1a"
news:
  title: "Hot qubits break one of the biggest constraints to practical quantum computers"
  source: "UNSW Sydney (communiqué, EurekAlert)"
  url: "https://www.eurekalert.org/news-releases/575169"
  date: "2020-04-15"
---

## Ce qui s'est passé

Le 15 avril 2020, la revue Nature publie côte à côte deux articles sur des « qubits chauds ». Un qubit est la brique d'un ordinateur quantique : un objet à deux états que l'on sait préparer, manipuler et relire. L'équipe d'Andrew Dzurak, à l'université de Nouvelle-Galles du Sud (UNSW, Sydney), fait fonctionner une cellule de deux qubits en silicium à 1,5 kelvin, soit 1,5 degré au-dessus du zéro absolu. Celle de Menno Veldhorst, à Delft, réalise une opération entre deux qubits à 1,1 kelvin.

« Chaud » est relatif. Mais les puces à qubits supraconducteurs de Google ou d'IBM demandent environ 0,1 kelvin, quinze fois moins. D'après le communiqué de l'UNSW, on atteint 1,5 kelvin avec quelques milliers de dollars de réfrigération, contre des millions pour 0,1 kelvin. L'enjeu est aussi la chaleur : chaque paire de qubits ajoutée en produit, et les réfrigérateurs les plus froids en évacuent très peu. Plus haut en température, on pourrait loger l'électronique de commande à côté des qubits.

## La notion : la distribution de Boltzmann

Dans ces puces, le qubit est porté par le spin d'électrons piégés dans une boîte quantique, un minuscule piège creusé dans le silicium. Le spin se comporte comme une petite aiguille aimantée. Placé dans un champ magnétique, il n'a que deux états possibles : aligné avec le champ (état bas, moins d'énergie) ou opposé (état haut). L'écart d'énergie entre les deux vaut ΔE = h × f, où h est la constante de Planck et f la fréquence à laquelle on pilote le qubit.

Le cours de physique statistique dit ce qui arrive à un tel système quand il baigne dans un milieu à la température T. Il postule que la probabilité d'un état d'énergie E est proportionnelle à exp(−E / kT), où k est la constante de Boltzmann (1,38 × 10⁻²³ J/K). Le produit kT est l'énergie typique de l'agitation thermique. Pour deux états, la formule se réduit à ceci : la probabilité de trouver le spin en bas vaut 1 / (1 + exp(−ΔE / kT)). Tout dépend donc d'un seul rapport, ΔE / kT.

Prenons un réglage décrit par l'équipe australienne : un champ de 0,1 tesla, soit une fréquence de 3,5 GHz. L'écart vaut ΔE = 6,63 × 10⁻³⁴ × 3,5 × 10⁹ ≈ 2,3 × 10⁻²⁴ J. À 1,5 kelvin, kT ≈ 2,1 × 10⁻²³ J, environ neuf fois plus.

```figure
file: fig-1.svg
caption: L'écart d'énergie entre les deux états du spin, comparé à l'agitation thermique kT à deux températures
scroll: Deux barres apparaissent à côté des deux niveaux du spin : l'agitation thermique à 0,1 K, puis celle à 1,5 K, neuf fois plus haute que l'écart.
steps:
- Dans un champ magnétique, le spin a deux états. À 3,5 GHz, ils sont séparés par ΔE ≈ 2,3 × 10⁻²⁴ joule, la hauteur du trait pointillé.
- À 0,1 kelvin, l'agitation thermique kT vaut environ 0,6 fois cet écart. Le milieu a rarement de quoi faire monter le spin dans l'état haut.
- À 1,5 kelvin, kT vaut environ neuf fois l'écart. Pour l'agitation thermique, les deux états sont presque au même niveau.
```

## Ce que la notion fait comprendre

Mettons ces rapports dans la formule. À 0,1 kelvin, ΔE / kT ≈ 1,7 et le spin laissé à l'équilibre se trouve en bas 84 fois sur 100. À 1,5 kelvin, ΔE / kT ≈ 0,11 et la probabilité tombe à 53 %. C'est presque un tirage à pile ou face.

```figure
file: fig-2.svg
caption: Probabilité de trouver le spin dans l'état bas à l'équilibre thermique, pour un écart correspondant à 3,5 GHz
scroll: La courbe part de 100 % près du zéro absolu, chute vite, puis longe la ligne des 50 % ; deux points marquent 0,1 K et 1,5 K.
steps:
- Un calcul commence par un qubit dans un état connu. À 50 %, l'état de départ est un tirage à pile ou face et le calcul n'a pas de sens.
- La distribution de Boltzmann donne la courbe. Près du zéro absolu le spin est en bas à coup sûr, puis la certitude s'effondre dès quelques dixièmes de kelvin.
- À 0,1 kelvin, le spin laissé à lui-même est en bas 84 fois sur 100.
- À 1,5 kelvin, il n'y est plus que 53 fois sur 100. Attendre que le froid range le spin ne donne presque plus rien.
```

Voilà le vrai obstacle. Un calcul commence par des qubits dans un état connu, et la façon la plus simple de l'obtenir est de laisser le froid faire le travail. À 1,5 kelvin, Boltzmann dit que ce chemin est fermé. Les auteurs l'écrivent eux-mêmes : dans ce réglage, l'énergie du qubit est bien inférieure à l'énergie thermique.

Leur réponse est de ne plus s'appuyer sur l'équilibre thermique. Les deux boîtes quantiques sont coupées du réservoir d'électrons voisin, et la préparation comme la lecture ne passent que par le saut d'un électron d'une boîte à l'autre. Ce saut obéit à une règle quantique, le blocage de spin de Pauli : deux électrons ne peuvent partager la même boîte que si leurs spins sont opposés. Observer si l'électron passe revient donc à comparer les deux spins entre eux. La température du milieu n'entre plus dans la question posée.

```figure
file: fig-3.svg
caption: La lecture par blocage de spin : un électron ne rejoint la boîte voisine que si les deux spins sont opposés
scroll: Dans le cas de gauche une flèche fait passer l'électron d'une boîte à l'autre ; dans le cas de droite la flèche bute sur une croix ; la conclusion s'affiche en bas.
steps:
- Deux boîtes quantiques voisines contiennent chacune un spin. À gauche les deux spins sont opposés, à droite ils sont identiques.
- Spins opposés : l'électron de la boîte 2 peut rejoindre la boîte 1. On détecte ce déplacement.
- Spins identiques : la règle de Pauli interdit aux deux électrons de partager la boîte. Rien ne bouge.
- Le résultat dépend de l'orientation relative des deux spins, pas d'un équilibre avec un réservoir d'électrons. La méthode tient donc à 1,5 kelvin.
```

## Ce que la notion ne dit pas

La distribution de Boltzmann décrit un équilibre. Elle explique pourquoi le froid ne prépare plus le qubit, mais elle ne dit rien de la durée pendant laquelle un état préparé autrement reste utilisable. Or c'est là que la chaleur se paie. L'équipe de Sydney annonce des opérations sur un qubit fidèles à 98,6 % et un état qui se maintient environ 2 microsecondes. Celle de Delft atteint 99,3 % sur un qubit. Lee Bassett, de l'université de Pennsylvanie, rappelle dans IEEE Spectrum que d'autres technologies tiennent une centaine de microsecondes.

Je retiens deux choses. La première est qu'un calcul de trois lignes suffit à voir pourquoi 1,5 kelvin n'est pas une simple variante de 0,1 kelvin : le rapport ΔE / kT change de côté par rapport à 1, et la méthode doit changer avec lui. La seconde est l'échelle. Il s'agit de deux qubits, alors qu'une machine utile en demanderait des millions, et le communiqué lui-même la situe à au moins dix ans.

## Sources

- [Hot qubits break one of the biggest constraints to practical quantum computers, communiqué de l'UNSW, EurekAlert, 15 avril 2020](https://www.eurekalert.org/news-releases/575169)
- [Quantum computing milestone: researchers compute with hot silicon qubits, IEEE Spectrum, 15 avril 2020](https://spectrum.ieee.org/amp/quantum-computing-milestone-researchers-compute-with-hot-silicon-qubits-2650279920)
- [Yang et al., Silicon quantum processor unit cell operation above one Kelvin, Nature 580, 350-354 (2020), version arXiv](https://arxiv.org/abs/1902.09126)
- [Petit et al., Universal quantum logic in hot silicon qubits, Nature 580, 355-359 (2020), version arXiv](https://arxiv.org/abs/1910.05289)
