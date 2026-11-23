---
title: "Approximate distances in a network: the \"at most twice\" guarantee gains ground"
summary: "A result publicised in late October extends to much closer points an error guarantee from 1996 on computing distances in a network. The advanced algorithms course explains what such a guarantee is worth."
hook: "Computing every distance in a large network takes too long, so we accept a bounded error, and a researcher has just extended that bound to points that are much closer together."
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

## What was announced

On 30 October 2026, ScienceDaily relayed a result by Manoj Gupta, a faculty member at the Indian Institute of Technology Gandhinagar. It concerns a classic problem: computing the distance between every pair of points in a network, whether those points are routers, road junctions or accounts on a social network. Since 1996, a method by Dor, Halperin and Zwick has quickly produced approximate distances, guaranteed to be at most twice too long, but only for points that are far enough apart. Manoj Gupta's paper, presented at the FOCS 2025 conference, extends this guarantee to much closer points without making the computation heavier. Its abstract calls this the first improvement on that result in over 25 years.

## Giving up exactness to save time

A network is modelled as a graph: vertices (the points) joined by edges (the links). The distance between two vertices is here the number of edges on the shortest path between them. The press release recalls that some exact methods take cubic time: the number of operations grows like n³, where n is the number of vertices. Doubling the size of the network therefore multiplies the work by 8.

An order-of-magnitude calculation shows the problem. For one million vertices, n³ is 10¹⁸ operations. On a machine that performs one billion per second, that is about 32 years. Yet there are n² pairs, so 10¹² distances to write down: we cannot go below that, but 10¹² operations take only about 17 minutes.

```figure
file: fig-1.en.svg
caption: Cost of an exact computation in n³ and of an approximate one close to n², on logarithmic scales
scroll: The line for the exact computation is drawn, then the approximate one appears in orange, six orders of magnitude lower for one million vertices.
steps:
- An exact computation of all distances can cost n³ operations, where n is the number of vertices. On these logarithmic axes, that is a straight line of slope 3.
- For one million vertices, that makes 10¹⁸ operations, about 32 years on a machine running one billion of them per second.
- Approximate methods aim for a cost close to n², the number of pairs. We cannot do less, since each answer must at least be written down.
- At one million vertices, n² is 10¹² operations, about 17 minutes. This gap is what justifies accepting an approximate answer.
```

The advanced algorithms course has a whole chapter on this trade, under an explicit title: limiting running time by giving up optimal solutions. It defines the approximation ratio: the value of the solution returned, divided by the value of the best possible solution. An algorithm is a 2-approximation if, whatever the instance, it returns a solution at most twice the optimum.

The course's example is the travelling salesman problem, which looks for the shortest tour through all the points. We build a minimum spanning tree, that is, the cheapest set of edges connecting all the vertices, and then walk around it. The resulting tour weighs at most twice the tree, and the tree weighs less than the best tour: so the tour is at most twice too long. The point is that this bound is proved. It holds for every input, not only for the ones we tested.

## A guarantee has a domain of validity

The 1996 result is a 2-approximation in the course's sense: if the true distance is 10, the value returned lies between 10 and 20. But the proof only held for pairs that are far enough apart. The press release gives a case where it breaks: two vertices 2 edges apart, for which the method returns 5. The ratio is 2.5 and the promise is no longer kept.

```figure
file: fig-2.en.svg
caption: The "at most twice" guarantee respected for a distant pair, broken for a close pair
scroll: An allowed band appears on each axis, then an estimate in orange falls outside the band for the close pair.
steps:
- For a distant pair, 10 edges apart, a 2-approximation must return a value between 10 and 20. An estimate of 14 is therefore acceptable.
- For a close pair, 2 edges apart, the allowed band is much narrower: from 2 to 4.
- The press release cites a case where the older method returns 5. That is 2.5 times the true distance: the guarantee no longer applies.
```

According to the paper's abstract, the 1996 method guarantees the factor 2 for pairs at least k edges apart, where k is a setting: the larger k is, the faster the computation. The new algorithm keeps roughly the same running time, but its guarantee holds from a distance proportional to log k. Take k = log n. The running time becomes close to n², up to logarithmic factors. For one million vertices, k is about 20 and log k about 4, up to a constant that the abstract does not specify.

```figure
file: fig-3.en.svg
caption: Distances from which the guarantee is proved, in 1996 and then in 2025
scroll: The 1996 guaranteed zone appears to the right of the threshold k, then the 2025 zone extends in orange to the left, down to a threshold of the order of log k.
steps:
- We sort pairs of vertices by their true distance. Example for one million vertices, with a setting k = log₂ n ≈ 20.
- In 1996, the factor 2 is proved only for pairs at least k edges apart. Below that, nothing is promised.
- In 2025, for a comparable running time, the threshold drops to a distance of the order of log k, about 4 here, up to a constant.
- A zone without guarantee remains, that of very close pairs. It is much smaller than before, but it still exists.
```

This is what the course's notion makes clear. An approximation algorithm is only worth its proof, and a proof always covers a precise set of inputs. The research work here is not about going faster, but about widening that set. Close pairs are the hard case: an error of a few edges goes unnoticed on a long route, whereas it quickly exceeds a factor of two on a short one.

## What to take away

Three reservations. First, the ratio 2 bounds the worst case: it says nothing about the average error, which can be much smaller. Second, the algorithm is randomized: it samples vertices at random and returns a correct result for all pairs with high probability, not with certainty. The course files this kind of method under Monte Carlo algorithms. Third, the press release says so itself: the result is theoretical and does not immediately improve existing routing systems.

What I mostly take away is a reading habit. Faced with a method "guaranteed within a factor of 2", the right question is: guaranteed for which inputs? For nearly thirty years, the answer left out a large share of the close pairs.

## Sources

- [A computer scientist breaks through a limit that stood since 1996, ScienceDaily, 30 October 2026](https://sciencedaily.com/releases/2026/10/261029072146.htm)
- [Manoj Gupta, Improved 2-Approximate Shortest Paths for close vertex pairs, arXiv 2507.19859](https://arxiv.org/abs/2507.19859)
- [Rethinking distance in massive networks, IIT Gandhinagar press release on EurekAlert](https://www.eurekalert.org/news-releases/1119697)
