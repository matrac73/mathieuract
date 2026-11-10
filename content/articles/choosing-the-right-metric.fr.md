---
title: "Choisir la bonne métrique pour son modèle"
summary: "Matrice de confusion, précision, rappel, F-scores, ROC-AUC, R2, MAE, MAPE, silhouette : ce que chacune dit vraiment."
category: "data-science"
date: "2026-11-10"
readingMinutes: 5
order: 5
---

Un modèle ne vaut que par la question que pose sa métrique. J'ai vu une accuracy de 95 % qui ne voulait rien dire, et un score modeste qui méritait d'être déployé. Cette note est ma carte des principales métriques, classées par type de problème.

## Classification : partir de la matrice de confusion

Tout découle de quatre comptages :

| | Prédit positif | Prédit négatif |
|---|---|---|
| **Réellement positif** | Vrai positif (VP) | Faux négatif (FN) |
| **Réellement négatif** | Faux positif (FP) | Vrai négatif (VN) |

À partir de là :

- **Accuracy** (exactitude) = (VP + VN) / total. Part des prédictions correctes.
- **Précision** = VP / (VP + FP). Quand le modèle dit « positif », à quelle fréquence a-t-il raison ?
- **Rappel** (sensibilité) = VP / (VP + FN). Parmi les vrais positifs, combien ont été trouvés ?
- **Spécificité** = VN / (VN + FP). Parmi les vrais négatifs, combien ont été correctement écartés ?
- **F1-score** = moyenne harmonique de la précision et du rappel.
- **F2-score** = même idée, mais le rappel pèse plus que la précision.

## Le piège de l'accuracy

Si 1 % des transactions sont frauduleuses, un modèle qui répond toujours « pas de fraude » atteint 99 % d'accuracy et n'attrape rien. Sur des classes déséquilibrées, l'accuracy mesure surtout le déséquilibre.

La question utile est : **quelle erreur coûte le plus cher ?**

- Manquer un positif coûte cher (dépistage, fraude) : privilégier le **rappel**, ou le F2.
- Une fausse alerte coûte cher (filtre anti-spam qui bloque un vrai courriel) : privilégier la **précision**.
- Les deux comptent : **F1**.

## Au-delà d'un seuil unique

La plupart des classifieurs produisent une probabilité ; la classe vient d'un seuil, 0,5 par défaut. Déplacer ce seuil échange de la précision contre du rappel.

- La **courbe ROC** trace le taux de vrais positifs en fonction du taux de faux positifs pour tous les seuils.
- L'**AUC** est l'aire sous cette courbe : 0,5 correspond au hasard, 1 à la perfection. Elle se lit comme la probabilité qu'un positif tiré au hasard obtienne un score supérieur à celui d'un négatif tiré au hasard.
- L'**entropie croisée binaire** (log loss) pénalise lourdement les probabilités fausses et sûres d'elles. C'est la fonction de perte sur laquelle la plupart des classifieurs sont entraînés.
- Le **score de Brier** est l'erreur quadratique moyenne des probabilités prédites ; il indique si elles sont bien calibrées.

Deux autres, utiles à l'occasion : le **kappa de Cohen**, un accord corrigé du hasard, et le **score de Jaccard**, intersection sur union, courant en multi-étiquettes et en segmentation.

```python
from sklearn.metrics import classification_report, roc_auc_score

print(classification_report(y_test, y_pred))
print(roc_auc_score(y_test, y_proba))
```

## Régression et prévision

- **MAE** (erreur absolue moyenne) : taille moyenne de l'erreur, dans l'unité de la cible. Facile à expliquer.
- **MSE** (erreur quadratique moyenne) : met les erreurs au carré, les grandes dominent donc.
- **RMSE** : racine de la MSE, de retour dans l'unité de la cible. À utiliser quand les grosses erreurs sont disproportionnellement graves.
- **MAPE** (erreur absolue moyenne en pourcentage) : erreur relative, pratique pour communiquer, mais elle explose quand les valeurs réelles approchent de zéro.
- **MASE** (erreur absolue moyenne normalisée) : l'erreur divisée par celle d'une prévision naïve. En dessous de 1, le modèle bat la référence naïve. Très utile en séries temporelles.
- **R2** : part de la variance expliquée par le modèle. Le **R2 ajusté** corrige du nombre de variables, car le R2 simple ne baisse jamais quand on en ajoute une.

Pour comparer des modèles plutôt que d'en juger un seul, l'**AIC** et le **BIC** arbitrent entre qualité d'ajustement et complexité : plus bas, c'est mieux, et le BIC pénalise davantage les paramètres supplémentaires.

## Clustering : pas d'étiquettes, d'autres questions

- **Inertie** : somme des carrés des distances aux centres. Elle baisse toujours quand *k* augmente ; on cherche donc le coude, pas le minimum.
- **Coefficient de silhouette** : entre -1 et 1 ; compare la cohésion à l'intérieur d'un cluster et la séparation d'avec le plus proche.
- **Indice de Dunn** : plus petite distance entre clusters divisée par le plus grand diamètre de cluster. Plus il est élevé, mieux c'est.

## Petit guide de sélection

| Problème | Métrique par défaut | À vérifier aussi |
|---|---|---|
| Classification équilibrée | Accuracy, F1 | Matrice de confusion |
| Classification déséquilibrée | Rappel ou précision, F-score | ROC-AUC, courbe précision-rappel |
| Probabilités réutilisées en aval | Log loss | Score de Brier |
| Régression | RMSE ou MAE | R2 |
| Prévision | MAE, MAPE | MASE face à une prévision naïve |
| Clustering | Silhouette | Inertie, interprétabilité |

## Trois habitudes

D'abord, choisir la métrique **avant** d'entraîner, avec ceux qui utiliseront le modèle, en termes de coût métier. Ensuite, toujours la calculer sur des données que le modèle n'a jamais vues. Enfin, présenter au moins deux métriques et une référence : un chiffre seul n'a pas de sens.

## À retenir

- Toutes les métriques de classification viennent de la matrice de confusion ; la lire en premier.
- L'accuracy trompe sur des données déséquilibrées ; arbitrer entre précision et rappel selon le coût de chaque erreur.
- Le ROC-AUC juge le classement sur tous les seuils ; la log loss et le Brier jugent les probabilités.
- La MAE est lisible, la RMSE punit les grosses erreurs, la MAPE est relative, la MASE compare au naïf.
- En clustering, combiner la silhouette avec le sens métier des groupes.
- Une métrique sans référence ne dit rien.
