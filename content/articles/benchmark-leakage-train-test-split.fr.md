---
title: "Quand l'IA a déjà vu le sujet de l'examen"
summary: "Une prépublication montre que des modèles de langage récitent les questions de leurs propres tests d'évaluation. La séparation entre données d'entraînement et données de test explique pourquoi leurs notes ne valent alors plus grand-chose."
hook: "Quand un modèle d'IA a déjà vu les questions de l'examen pendant son apprentissage, sa note mesure sa mémoire et non ce qu'il sait faire, et un classement entier peut s'inverser."
category: "perspective"
date: "2026-11-16"
written: "2026-11"
readingMinutes: 5
course: "Machine Learning (2A)"
courseSlug: "machine-learning-2a"
news:
  title: "Benchleaking Is Accelerating: Benchmark contamination has worsened sharply in the past month"
  source: "arXiv"
  url: "https://arxiv.org/abs/2611.21315"
  date: "2026-11-16"
---

Le 16 novembre 2026, huit chercheurs ont déposé sur arXiv une prépublication, c'est-à-dire un article pas encore relu par des pairs, consacrée à ce qu'ils appellent le « benchleaking » : les questions d'un test d'évaluation se retrouvent dans les données qui ont servi à entraîner le modèle. Ils ont sondé quatre modèles de langage publics sur vingt tests courants. L'un d'eux, ERNIE-5.5-Flash-Base, restitue mot pour mot 96,3 % des problèmes de HumanEval, un test de programmation, alors qu'on ne les lui a pas montrés. Un autre, DeepSeek-V4-Flash-Base, n'en restitue que 9,1 %.

## La règle de base : ne jamais réviser sur le sujet

Le cours de Machine Learning pose cette règle dès le premier devoir. On y découpe un jeu de données en deux : 90 % pour l'entraînement, 10 % pour le test, et l'on doit rapporter l'erreur du modèle sur les deux parties. Le modèle ajuste ses paramètres sur la première. La seconde ne sert qu'à une chose : estimer comment il se comportera sur des données qu'il n'a jamais rencontrées.

```figure
file: fig-1.svg
caption: La séparation entraînement / test, et ce qu'une fuite lui fait
scroll: Le jeu de données se coupe en deux, le modèle apprend sur une part, est noté sur l'autre, puis une flèche orange fait passer le test du côté de l'entraînement
steps:
- On part d'un jeu de données complet, où chaque question est accompagnée de sa réponse.
- On le coupe en deux. Dans le devoir du cours, 90 % vont à l'entraînement et 10 % sont mis de côté pour le test.
- Le modèle ajuste ses paramètres sur la partie entraînement, et sur elle seule.
- On lui pose ensuite les questions du test. Le score obtenu estime ce qu'il fera sur des données nouvelles.
- Si les questions du test ont fui vers l'entraînement, le score est gonflé par des réponses déjà vues et n'estime plus rien de tel.
```

Pourquoi cette précaution ? Parce que l'erreur d'entraînement est une mesure trop flatteuse. Le cours le fait vérifier sur deux cas limites : un classifieur des plus proches voisins avec k = 1, qui répond en recopiant l'étiquette de l'exemple connu le plus proche, a toujours une erreur nulle sur ses exemples d'entraînement. Un arbre de décision dont on laisse la profondeur croître aussi. Ces modèles n'ont rien compris de particulier : ils ont assez de capacité pour tout retenir.

Un corrigé du cours résume la situation normale : l'erreur d'entraînement doit être plus petite que l'erreur de test, et quand on augmente la complexité du modèle, la première continue de baisser tandis que la seconde baisse d'abord puis remonte. Cet écart s'appelle le surapprentissage : le modèle colle à ses exemples et généralise moins bien.

```figure
file: fig-2.svg
caption: Erreur d'entraînement et erreur de test quand la complexité du modèle augmente
scroll: La courbe d'entraînement descend vers zéro, la courbe de test remonte, puis une courbe orange montre l'erreur de test s'effondrer quand le test a déjà été vu
steps:
- Plus le modèle est complexe, plus son erreur sur les exemples d'entraînement baisse. Elle peut atteindre zéro, comme pour le plus proche voisin.
- L'erreur de test baisse d'abord, puis remonte : le modèle retient ses exemples au lieu d'en tirer une règle.
- L'écart entre les deux courbes est le surapprentissage. On ne le voit que parce que le test est resté à l'écart.
- Si le test a été vu pendant l'entraînement, son erreur suit la courbe d'entraînement. L'écart disparaît du graphique, pas de la réalité.
```

## Ce que la fuite fait à la note

Un grand modèle de langage a largement de quoi mémoriser un test de 164 problèmes comme HumanEval. Si ces problèmes et leurs solutions figurent dans ses données d'entraînement, ils deviennent de fait des exemples d'entraînement, et le score mesuré sur eux est une erreur d'entraînement déguisée.

Un petit calcul de mon cru donne l'ordre de grandeur. Supposons qu'un modèle sache résoudre 60 % de problèmes nouveaux, et que la moitié du test ait fui et soit récitée sans faute. Le score affiché vaut 0,5 × 100 % + 0,5 × 60 % = 80 %. Vingt points viennent de la mémoire.

Pour détecter la fuite, les auteurs montrent au modèle quelques questions résolues, puis le laissent écrire au-delà de sa réponse. Certains enchaînent alors sur d'autres questions du même test, réponses comprises. Une question n'est dite « fuitée » que si elle correspond exactement au test.

Ils proposent ensuite un score corrigé, qu'ils nomment « Anti-Hack » : on recalcule la note en comptant comme fausse chaque question fuitée. Pour ERNIE sur HumanEval, 96,3 % de 164 problèmes en font environ 158. Il en reste 6, et la note passe de 100 à 3,66, soit 6 / 164. En moyenne sur les vingt tests, ce modèle tombe de 85,17 à 68,55, alors que DeepSeek ne perd que 1,5 point.

```figure
file: fig-3.svg
caption: Score moyen des quatre modèles, avant et après avoir compté les questions fuitées comme fausses (données de la prépublication)
scroll: Les barres grises des scores publiés apparaissent, puis les barres corrigées, et celle d'ERNIE, en orange, passe sous toutes les autres
steps:
- Scores moyens publiés sur vingt tests. ERNIE-5.5-Flash-Base est premier avec 85,2, devant trois modèles groupés autour de 78 à 80.
- On compte comme fausse chaque question que le modèle sait réciter. Trois modèles perdent entre 1,3 et 5 points.
- Le même calcul fait tomber ERNIE à 68,6.
- Il perd 16,6 points et passe de la première à la dernière place. Le classement dépendait de la fuite.
```

## Ce que la notion ne dit pas

Le score corrigé est un plancher, pas la vraie valeur. Un modèle qui récite un problème aurait peut-être su le résoudre sans l'avoir vu : la compétence réelle d'ERNIE sur HumanEval se situe quelque part entre 3,66 et 100, et ces chiffres ne disent pas où.

À l'inverse, une fuite non détectée ne prouve pas l'absence de fuite. Les auteurs le reconnaissent : leur critère ignore les questions reformulées, et un taux mesuré de zéro n'établit pas que les données d'entraînement étaient propres.

Je retiens que la règle du premier devoir du cours est la plus difficile à tenir à grande échelle. Sur un petit fichier, mettre 10 % de côté est trivial. Quand l'entraînement puise dans le web et que les tests y sont publiés, on ne sait plus très bien ce que le modèle a vu. Une note qui ne le précise pas se lit avec prudence, comme une possible erreur d'entraînement.

## Sources

- [Benchleaking Is Accelerating (arXiv:2611.21315, résumé)](https://arxiv.org/abs/2611.21315)
- [Benchleaking Is Accelerating (texte intégral, version 1)](https://arxiv.org/html/2611.21315v1)
