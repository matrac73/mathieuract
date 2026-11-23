---
title: "Détecteur de textes d'IA : ce que vaut vraiment une alerte"
summary: "OpenAI publie un détecteur de textes écrits par IA qui repère 26 % d'entre eux et accuse à tort 9 % des textes humains. Le théorème de Bayes dit ce que vaut une alerte."
hook: "Quand un détecteur qui se trompe sur 9 % des textes humains signale une copie, l'élève l'a écrite lui-même trois fois sur quatre, si un élève sur dix seulement utilise une IA."
category: "perspective"
date: "2023-01-31"
written: "2023-01"
readingMinutes: 5
course: "Statistiques (3A)"
courseSlug: "statistiques-3a"
news:
  title: "New AI classifier for indicating AI-written text"
  source: "OpenAI"
  url: "https://openai.com/blog/new-ai-classifier-for-indicating-ai-written-text"
  date: "2023-01-31"
---

Le 31 janvier 2023, OpenAI, l'entreprise qui a lancé ChatGPT deux mois plus tôt, met en ligne un outil gratuit qui lit un texte et indique s'il a probablement été écrit par une IA. Elle publie elle-même ses performances : sur un jeu de textes en anglais, l'outil signale 26 % des textes réellement écrits par une IA, et il signale à tort 9 % des textes écrits par des humains. Elle ajoute qu'il ne doit pas servir d'élément principal pour prendre une décision. Selon TechCrunch, plusieurs grands districts scolaires américains ont déjà interdit ChatGPT sur leurs réseaux, et l'on devine que beaucoup d'enseignants vont essayer l'outil sur leurs copies.

## Deux chiffres qui ne répondent pas à la question

Mon cours de statistiques de troisième année donne un nom à ces deux chiffres. Le taux de vrais positifs (26 %) est la probabilité qu'un texte soit signalé sachant qu'il vient d'une IA. Le taux de faux positifs (9 %), que le cours appelle aussi taux de fausses alertes, est la probabilité qu'un texte soit signalé sachant qu'un humain l'a écrit. Les deux partent de la vérité pour aller vers l'alerte.

L'enseignant, lui, fait le chemin inverse. Il a une alerte sous les yeux et veut connaître la probabilité que la copie vienne d'une IA. Passer d'un sens à l'autre est le rôle du théorème de Bayes, que le cours présente comme la façon de mettre à jour une croyance à la lumière d'une nouvelle observation. Il faut trois ingrédients : ce que l'on croyait avant d'observer (la probabilité a priori), la force de l'indice, et l'on obtient ce que l'on doit croire après (la probabilité a posteriori).

Prenons 1 000 copies et supposons que 100 d'entre elles, soit 10 %, ont été écrites par une IA. Ce chiffre est une hypothèse de ma part, personne ne le connaît. Le détecteur signale 26 % des 100 copies d'IA, soit 26 copies. Il signale aussi 9 % des 900 copies d'élèves, soit 81 copies. Il y a donc 107 alertes, dont 26 justifiées : une copie signalée vient d'une IA avec une probabilité de 26 / 107 ≈ 24 %.

```figure
file: fig-1.svg
caption: Sur 1 000 copies dont 100 écrites par IA, le détecteur lève 107 alertes, dont 81 visent des élèves honnêtes
scroll: Les copies signalées se colorent dans chaque groupe, puis le total des alertes apparaît sous le rectangle
steps:
- On part de 1 000 copies. La bande étroite à gauche représente les 100 copies écrites par une IA, le reste les 900 copies écrites par les élèves.
- Le détecteur repère 26 % des copies d'IA. Cela fait 26 copies signalées à juste titre.
- Il signale aussi 9 % des copies d'élèves. Comme elles sont neuf fois plus nombreuses, cela fait 81 alertes à tort.
- Parmi les 107 copies signalées, 26 seulement viennent d'une IA. Une alerte désigne donc un tricheur une fois sur quatre.
```

## Tout dépend de ce que l'on croyait avant

Le résultat surprend parce que les élèves honnêtes sont nombreux : 9 % d'un grand groupe pèse plus que 26 % d'un petit. Le théorème de Bayes s'écrit simplement avec des cotes, c'est-à-dire le rapport entre la probabilité qu'une chose soit vraie et la probabilité qu'elle soit fausse. Une alerte multiplie la cote par 26 / 9 ≈ 2,9, quelle que soit la situation de départ. Avec 10 % de copies d'IA, la cote de départ est de 1 contre 9. Elle passe à 2,9 contre 9, ce qui redonne 24 %.

Le même détecteur donne donc des réponses très différentes selon la classe. Si une copie sur deux vient d'une IA, une alerte porte la probabilité de 50 % à 74 %. Si une sur cinquante en vient, elle la porte de 2 % à moins de 6 %. Le silence de l'outil n'apprend presque rien non plus : avec 10 % de copies d'IA au départ, une copie non signalée garde 8 % de chances d'en être une, puisque l'outil en laisse passer 74 sur 100.

```figure
file: fig-2.svg
caption: Probabilité qu'un texte signalé vienne d'une IA, selon la part de textes d'IA avant le test
scroll: La courbe du détecteur se trace au-dessus de la diagonale, puis trois points de lecture apparaissent l'un après l'autre
steps:
- L'axe horizontal donne ce que l'on croit avant le test, l'axe vertical ce que l'on doit croire après une alerte. Sur la diagonale, le test n'apprendrait rien.
- La courbe du détecteur d'OpenAI passe au-dessus de la diagonale. Une alerte fait monter la probabilité, mais d'une quantité limitée.
- Si 10 % des textes viennent d'une IA avant le test, une alerte porte cette probabilité à 24 %.
- Si la moitié des textes en vient, une alerte la porte à 74 %.
- Pour dépasser 91 % après une alerte, il faut partir d'au moins 78 %. Il faut déjà être presque sûr pour que l'outil suffise.
```

## Accuser, c'est choisir un seuil

Le cours ajoute une règle de décision. Un faux positif et un faux négatif n'ont pas le même coût, et il faut déclarer « positif » seulement si la cote a posteriori dépasse le rapport entre ces deux coûts. Supposons qu'accuser à tort un élève soit dix fois plus grave que laisser passer une copie d'IA. Il faut alors une cote d'au moins 10 contre 1, soit une probabilité de 91 %. Comme l'alerte ne multiplie la cote que par 2,9, il faudrait partir d'une cote de 3,5 contre 1, soit 78 % de soupçon avant même d'ouvrir l'outil.

On comprend ainsi l'avertissement d'OpenAI. L'entreprise dit avoir réglé son seuil pour garder un taux de faux positifs bas, au prix d'une détection faible. C'est le bon côté à privilégier, comme le montre ce calcul : à 10 % de copies d'IA, un outil qui les repérerait toutes mais garderait 9 % de fausses alertes ne donnerait que 55 % de certitude.

```figure
file: fig-3.svg
caption: Ce que vaudrait une alerte avec d'autres réglages, pour 10 % de copies d'IA au départ
scroll: Les barres s'ajoutent une à une, de l'outil actuel à un outil qui ne lèverait presque aucune fausse alerte
steps:
- Avec les chiffres publiés par OpenAI, une copie signalée vient d'une IA avec une probabilité de 24 %.
- Un outil imaginaire qui repérerait toutes les copies d'IA, avec les mêmes fausses alertes, n'atteindrait que 55 %.
- En gardant 26 % de détection mais avec 1 % de fausses alertes, on monterait à 74 %.
- Avec une fausse alerte pour mille textes humains, on atteindrait 97 %. C'est le taux de fausses alertes qui fait la valeur d'une alerte.
```

## Ce que le calcul ne dit pas

Ce calcul repose sur deux fragilités. La première est la probabilité a priori : je ne sais pas combien d'élèves utilisent une IA, et le résultat en dépend entièrement. La seconde est que les 26 % et 9 % ont été mesurés sur un jeu de textes précis. OpenAI prévient que l'outil est très peu fiable sous 1 000 caractères, moins bon hors de l'anglais, et qu'un texte d'IA retouché peut lui échapper. Dans une vraie classe, les deux taux peuvent donc être moins bons.

Je retiens une règle simple : un indice ne vaut que par le rapport entre ses deux taux, et ici ce rapport est proche de 3. Une alerte de ce détecteur doit faire relire la copie de plus près, et non conclure.

## Sources

- [OpenAI, « New AI classifier for indicating AI-written text », 31 janvier 2023](https://openai.com/blog/new-ai-classifier-for-indicating-ai-written-text)
- [TechCrunch, « OpenAI releases tool to detect AI-generated text, including from ChatGPT », 31 janvier 2023](https://techcrunch.com/2023/01/31/openai-releases-tool-to-detect-ai-generated-text-including-from-chatgpt/)
