---
title: "Unsupervised learning: clustering and dimension reduction"
summary: "K-means, hierarchical clustering, DBSCAN, PCA and NMF: how each one works and when I reach for it."
category: "data-science"
date: "2026-11-10"
readingMinutes: 5
order: 3
---

Unsupervised learning starts where labels stop: nobody tells the algorithm what the right answer is, it has to find structure on its own. In practice that means two jobs: grouping similar observations (clustering) and compressing many variables into a few (dimension reduction).

## K-means: the default

K-means looks for *k* groups by repeating two steps:

1. Assign each point to the nearest centre (Euclidean distance).
2. Move each centre to the mean of its points.

The centres are initialised at random and the loop stops when they no longer move. The algorithm minimises the **within-cluster variance**.

```python
from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=3, n_init=10, random_state=0)
labels = kmeans.fit_predict(X)
centers = kmeans.cluster_centers_
```

It is fast and easy to explain. Its limits are just as clear: you must choose *k* in advance, the result depends on the initialisation, it assumes roughly round clusters of similar size, and it is sensitive to scale, so standardise first.

## Hierarchical clustering: no k required upfront

Instead of a single partition, hierarchical clustering builds a tree of nested groups, the **dendrogram**.

- **Agglomerative (bottom-up)**: every point starts as its own cluster; the two most similar clusters are merged, the similarity matrix is updated, and so on until one cluster remains.
- **Divisive (top-down)**: everything starts in one cluster, which is split recursively.

The agglomerative version is the one found in most libraries. The dendrogram is the real output: you cut it at the height that makes sense and read the number of clusters from it. The cost is computation, which grows quickly with the number of points; I use it on thousands of rows, not millions.

## DBSCAN: clusters as dense regions

DBSCAN defines a cluster as a zone where points are dense. Two parameters:

- **epsilon**: the radius of the neighbourhood around a point.
- **minPts**: the minimum number of neighbours for a point to be a *core point*.

Core points that are neighbours are connected into a cluster. Points that are not core but lie near a core point join that cluster as border points. Everything else is labelled **noise**.

Two properties make it valuable: it finds clusters of arbitrary shape, and it identifies outliers natively instead of forcing them into a group. The number of clusters is not a parameter. The difficulty moves to the choice of epsilon, and it struggles when clusters have very different densities.

## Which clustering algorithm?

| Situation | My first choice |
|---|---|
| Large dataset, compact groups, known k | K-means |
| Small dataset, want to see the structure | Hierarchical + dendrogram |
| Irregular shapes, noise, unknown k | DBSCAN |

## PCA: fewer axes, most of the variance

Principal Component Analysis builds new axes, linear combinations of the original variables, ordered by the variance they capture.

1. **Centre** the data (and scale it if units differ).
2. Compute the **covariance matrix**.
3. Decompose it into **eigenvectors** (the directions) and **eigenvalues** (the variance carried by each direction).
4. **Project** the data on the first few directions.

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)
print(pca.explained_variance_ratio_)
```

I use it for three things: visualising a dataset in two dimensions, removing redundancy between correlated variables before a model, and speeding up training. The `explained_variance_ratio_` tells you how much you lose. The downside is interpretability: a component is a mix of everything.

## NMF: parts that add up

Non-negative Matrix Factorisation approximates a non-negative matrix X as the product of two smaller non-negative matrices, W and H. Both start with random values and are updated in turn to reduce the reconstruction error, until convergence.

- **W** gives the weight of each observation on each component.
- **H** gives the contribution of each variable to each component.

Because nothing can be negative, components can only add up, never cancel each other. They tend to look like *parts*: topics in a collection of documents, typical profiles in usage data. That makes NMF easier to interpret than PCA when data are counts or intensities.

## How to know whether it worked

Without labels, there is no accuracy. I rely on:

- **Inertia** (within-cluster sum of squares) plotted against *k*, looking for the elbow.
- **Silhouette coefficient**, between -1 and 1, which compares how close a point is to its own cluster and to the nearest other one.
- **Common sense**: can I name each cluster? If a segmentation cannot be described in business terms, it will not be used.

## Key takeaways

- Clustering groups rows; dimension reduction compresses columns. They combine well.
- K-means is the fast default but needs k, scaling and compact clusters.
- A dendrogram shows the structure before you commit to a number of clusters.
- DBSCAN handles odd shapes and flags noise; tuning epsilon is the price.
- PCA maximises variance; NMF gives additive, more readable components.
- Validate with silhouette and inertia, then with whether the clusters can be named.
