---
title: "The machine learning pipeline, end to end"
summary: "The eight steps I follow on every ML project, from loading data to tuning, and where the time really goes."
category: "data-science"
date: "2026-11-10"
readingMinutes: 4
order: 1
---

Most machine learning projects do not fail on the model. They fail somewhere in the plumbing around it. When I organised my own notes, I ended up with the same eight steps every time, so I now treat them as a checklist.

## The eight steps

1. **Import** the data
2. **Explore** it (EDA)
3. **Preprocess** it
4. **Split** train and test
5. **Train** a model
6. **Display** the predictions
7. **Measure** with the right metric
8. **Tune**

Nothing original here, and that is the point. The order matters more than the sophistication of any single step.

## Explore before you touch anything

Four pandas calls give me a first picture of any table: `df.shape`, `df.head()`, `df.info()` and `df.describe()`. Size, a sample, types and missing values, basic statistics.

Then I look at the features against the target:

- **Bar plots or box plots** of the target by category (hour, weekday, month for anything time-related).
- **Side-by-side comparisons** of two subsets, for example winter versus summer, to see whether a feature changes the behaviour.
- **A correlation matrix** to spot redundant features and obvious drivers.

```python
import seaborn as sns

sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="YlGnBu")
```

The goal of EDA is not pretty charts. It is to form hypotheses about what will help the model, and to find the problems that preprocessing will have to fix.

## Preprocess, and write down what you changed

Cleaning (incoherent values, duplicates, outliers, missing values), then transforming (scaling, encoding), then selecting or creating features. I cover this in a separate note, because it is usually where most of the performance comes from.

One habit I picked up: keep a log of every modification. Three weeks later, nobody remembers why 4% of the rows vanished.

## Split: the step that keeps you honest

For a classic tabular dataset, a random split is fine:

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

For a time series, a random split is a mistake: the model would learn from the future to predict the past. The test set must be a contiguous period that comes *after* the training period. I usually pick several test windows (a quiet week, a holiday period) to check that the model holds in different regimes.

The same logic applies to preprocessing: fit scalers and encoders on the training set only, then apply them to the test set. Otherwise information leaks.

## Train: pick the family first

The choice of model starts with the type of problem, not with the algorithm that is fashionable:

| Problem | You have | Typical tools |
|---|---|---|
| Supervised | Labelled examples | Regression, classification, ensembles |
| Unsupervised | No labels | Clustering, dimension reduction |
| Time series | Ordered observations | ARIMA family, recurrent networks |
| Reinforcement | An environment and rewards | Q-learning, policy gradient |

Within a family, I start with the simplest model that could work. A linear model or a small tree gives a baseline in minutes, and any complex model then has to justify itself against it.

## Display, measure, tune

**Display** the predictions against the real values before reading any score. A plot of the forecast over the test period shows in two seconds what a single number hides: a lag, a systematic bias, a blind spot on peaks.

**Measure** with a metric that reflects the real cost of errors. Accuracy on an unbalanced dataset is the classic trap.

**Tune** last. Hyperparameter search (grid search, random search, with cross-validation) brings the final few percent. It will not rescue poor features or a leaky split, so it does not deserve to be the first reflex.

## Where the time actually goes

In my experience, the split between steps looks nothing like what tutorials suggest. Exploration and preprocessing take most of the effort. Training is a few lines. And the loop is never linear: a bad metric sends you back to features, a strange plot sends you back to cleaning.

## Key takeaways

- Follow the same eight steps every time; skip none, even on small projects.
- Explore first: `shape`, `head`, `info`, `describe`, then features against the target.
- Split before you fit anything, and never randomly on a time series.
- Start with a simple baseline; make complex models earn their place.
- Look at the predictions before trusting a score, and tune last.
