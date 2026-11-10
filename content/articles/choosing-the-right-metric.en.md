---
title: "Choosing the right metric for your model"
summary: "Confusion matrix, precision, recall, F-scores, ROC-AUC, R2, MAE, MAPE, silhouette: what each one really tells you."
category: "data-science"
date: "2026-11-10"
readingMinutes: 5
order: 5
---

A model is only as good as the question its metric asks. I have seen a 95% accuracy that meant nothing, and a modest score that was worth deploying. This note is my map of the main metrics, grouped by type of problem.

## Classification: start from the confusion matrix

Everything comes from four counts:

| | Predicted positive | Predicted negative |
|---|---|---|
| **Actually positive** | True positive (TP) | False negative (FN) |
| **Actually negative** | False positive (FP) | True negative (TN) |

From there:

- **Accuracy** = (TP + TN) / total. Share of correct predictions.
- **Precision** = TP / (TP + FP). When the model says "positive", how often is it right?
- **Recall** (sensitivity) = TP / (TP + FN). Of all real positives, how many were found?
- **Specificity** = TN / (TN + FP). Of all real negatives, how many were correctly left alone?
- **F1-score** = harmonic mean of precision and recall.
- **F2-score** = same idea, but recall weighs more than precision.

## The accuracy trap

If 1% of transactions are fraudulent, a model that always answers "not fraud" reaches 99% accuracy and catches nothing. On unbalanced classes, accuracy mostly measures the imbalance.

The useful question is: **which error costs more?**

- Missing a positive is expensive (disease screening, fraud): favour **recall**, or F2.
- A false alarm is expensive (spam filter that blocks a real email): favour **precision**.
- Both matter: **F1**.

## Beyond a single threshold

Most classifiers output a probability; the class comes from a threshold, 0.5 by default. Moving the threshold trades precision for recall.

- The **ROC curve** plots the true positive rate against the false positive rate for all thresholds.
- The **AUC** is the area under that curve: 0.5 is random, 1 is perfect. It reads as the probability that a random positive is scored higher than a random negative.
- **Binary cross-entropy** (log loss) penalises confident wrong probabilities heavily. It is the loss most classifiers are trained on.
- The **Brier score** is the mean squared error of predicted probabilities; it tells you whether probabilities are well calibrated.

Two more that are useful occasionally: **Cohen's kappa**, agreement corrected for chance, and the **Jaccard score**, intersection over union, common for multi-label problems and segmentation.

```python
from sklearn.metrics import classification_report, roc_auc_score

print(classification_report(y_test, y_pred))
print(roc_auc_score(y_test, y_proba))
```

## Regression and forecasting

- **MAE** (mean absolute error): average size of the error, in the unit of the target. Easy to explain.
- **MSE** (mean squared error): squares the errors, so large ones dominate.
- **RMSE**: square root of MSE, back in the unit of the target. Use it when large errors are disproportionately bad.
- **MAPE** (mean absolute percentage error): relative error, good for communication, but it explodes when actual values approach zero.
- **MASE** (mean absolute scaled error): the error divided by that of a naive forecast. Below 1, the model beats the naive baseline. Very useful for time series.
- **R2**: share of the variance explained by the model. **Adjusted R2** corrects for the number of features, since plain R2 never decreases when you add one.

For comparing models rather than judging one, **AIC** and **BIC** balance fit against complexity: lower is better, and BIC penalises extra parameters more.

## Clustering: no labels, different questions

- **Inertia**: sum of squared distances to cluster centres. It always falls as *k* grows, so look for the elbow rather than the minimum.
- **Silhouette coefficient**: between -1 and 1; compares cohesion inside a cluster with separation from the nearest one.
- **Dunn index**: smallest distance between clusters divided by the largest cluster diameter. Higher is better.

## A short selection guide

| Problem | Default metric | Check also |
|---|---|---|
| Balanced classification | Accuracy, F1 | Confusion matrix |
| Unbalanced classification | Recall or precision, F-score | ROC-AUC, precision-recall curve |
| Probabilities used downstream | Log loss | Brier score |
| Regression | RMSE or MAE | R2 |
| Forecasting | MAE, MAPE | MASE against a naive forecast |
| Clustering | Silhouette | Inertia, interpretability |

## Three habits

First, choose the metric **before** training, with whoever will use the model, in terms of business cost. Second, always compute it on data the model has never seen. Third, report at least two metrics and a baseline: a number alone has no meaning.

## Key takeaways

- Every classification metric comes from the confusion matrix; read it first.
- Accuracy misleads on unbalanced data; choose between precision and recall based on the cost of each error.
- ROC-AUC judges the ranking across thresholds; log loss and Brier judge the probabilities.
- MAE is readable, RMSE punishes large errors, MAPE is relative, MASE compares to naive.
- For clustering, combine silhouette with whether the clusters make sense.
- A metric without a baseline says nothing.
