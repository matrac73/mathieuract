---
title: "Data preprocessing: the nine steps that matter"
summary: "Outliers, missing values, scaling, encoding, feature selection and enrichment: my working checklist before any model."
category: "data-science"
date: "2026-11-10"
readingMinutes: 5
order: 2
---

A mediocre model on clean data usually beats a great model on dirty data. Preprocessing is the least glamorous part of a project and the one where I have gained the most performance. Here is the checklist I keep.

## The checklist

1. Incoherent data
2. Duplicates
3. Outliers
4. Missing values
5. Row deletion
6. Scaling
7. Encoding categorical variables
8. Feature reduction
9. Feature enrichment

And one rule that sits above the list: **document every modification**.

## Cleaning: incoherence and duplicates

Incoherent data (a negative age, a date in the future, two units in one column) cannot be fixed by a formula. The method is a process: identify the problem, understand what the data should look like, decide on a correction strategy, implement it, validate the result, and document it.

Duplicates are easier: `df.drop_duplicates()`, optionally with `subset=` when only some columns define identity.

## Outliers: three simple methods

- **Z-score.** Count how many standard deviations a point is from the mean; flag beyond 2 or 3. Works for roughly normal data.
- **Percentiles.** Drop what falls below the 5th or above the 95th percentile. Simple, but it always removes something, even when there is no outlier.
- **Interquartile range (IQR).** Flag values below Q1 - 1.5 x IQR or above Q3 + 1.5 x IQR. Robust, because quartiles are not affected by the extreme values themselves.

```python
import numpy as np

def remove_outliers_iqr(data):
    q1, q3 = np.percentile(data, [25, 75])
    iqr = q3 - q1
    mask = (data >= q1 - 1.5 * iqr) & (data <= q3 + 1.5 * iqr)
    return data[mask]
```

A caveat I learned the hard way: on a tiny sample with one huge value, the z-score can miss the outlier, because that value inflates the standard deviation it is measured against. IQR is my default.

And before deleting anything, ask whether the outlier is an error or a real event. A traffic peak on a strike day is information, not noise.

## Missing values

Three options, in order of preference depending on context:

- **Impute with a statistic**: mean or median of the column (`df["col"].fillna(df["col"].median())`). The median resists outliers better.
- **Propagate a neighbour**: forward fill (`ffill`) or backward fill (`bfill`), natural for time series where the previous value is a decent guess.
- **Fill with a constant** such as 0, only when zero really means "nothing".

Deleting rows is the last resort, and acceptable when few rows are concerned and they are missing at random.

## Scaling and encoding

Many models (anything based on distances or gradients: k-means, KNN, SVM, neural networks) are sensitive to the scale of features. Standardisation puts every feature at mean 0 and standard deviation 1.

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # no fit on test data
```

Fitting on the training set only is not a detail: fitting on everything leaks test information into training. `inverse_transform` brings predictions back to the original units.

Categorical variables need numbers. **One-hot encoding** turns a column with *k* categories into *k* binary columns (`OneHotEncoder` in scikit-learn, or `pd.get_dummies`). It avoids inventing a false order between categories, at the price of more columns.

## Fewer features

More features is not better. Three tools I use:

- **PCA**: projects the data on new axes that capture the most variance. Efficient, but the new features lose their business meaning.
- **Recursive Feature Elimination (RFE)**: trains a model, removes the least important feature, and repeats until the target number is reached.
- **SelectKBest**: scores each feature individually with a statistical test (chi-squared, ANOVA F-test, mutual information) and keeps the top *k*. Fast, but blind to interactions.

## Better features

This is where domain knowledge pays. Four families:

- **Derived features**: ratios (price per square metre), differences (age from a birth date), text length, percentages, binning.
- **Time features**: hour, weekday, month, quarter, season, public or school holidays, any exceptional period.
- **Text features**: bag-of-words, TF-IDF, embeddings, sentiment.
- **External data**: weather, demographics, economic indicators, market trends.

On a traffic forecasting exercise, adding a holiday flag and the weather did more for the error than any change of model.

## Key takeaways

- Clean first, transform second, select and enrich last; log every change.
- IQR is a robust default for outliers; check that an outlier is an error before removing it.
- Prefer median imputation or forward fill to deleting rows.
- Fit scalers and encoders on the training set only.
- Feature enrichment with domain knowledge often beats a more complex model.
