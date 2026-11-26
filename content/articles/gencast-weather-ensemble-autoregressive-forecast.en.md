---
title: "GenCast: why a weather AI produces fifty forecasts instead of one"
summary: "Google DeepMind's GenCast weather model moves forward in 12-hour steps and adds randomness at each step, like an autoregressive process: forecasting theory explains why this calls for an ensemble of scenarios."
hook: "Fifteen days out, the best single weather forecast looks like the seasonal average, so Google DeepMind's AI draws fifty possible futures and counts those in which the storm happens."
category: "perspective"
date: "2024-12-04"
written: "2024-12"
readingMinutes: 5
course: "Séries Chronologiques (3A)"
courseSlug: "series-chronologiques-3a"
news:
  title: "GenCast predicts weather and the risks of extreme conditions with state-of-the-art accuracy"
  source: "Google DeepMind"
  url: "https://deepmind.google/discover/blog/gencast-predicts-weather-and-the-risks-of-extreme-conditions-with-sota-accuracy/"
  date: "2024-12-04"
---

## What happened

On 4 December 2024, Google DeepMind presents GenCast, an artificial intelligence model for weather forecasting, described the same day in the journal Nature. It does not give one forecast but an "ensemble" of 50 or more scenarios, each describing one possible evolution of the weather over 15 days, on a global grid with 0.25° cells. Trained on forty years of weather archives ending in 2018 and tested on the year 2019, it does better than ENS, the ensemble system of the European forecasting centre (ECMWF), on 97.2% of the 1,320 combinations of variables and lead times that were compared. One 15-day scenario is computed in 8 minutes on a single specialised Google chip, where a classical ensemble keeps a supercomputer busy for hours.

What interests me here is the choice to produce fifty answers. The time series course shows that this is not a stylistic whim.

## The notion: forecasting an autoregressive series

A time series is a sequence of measurements over time. The simplest model the course uses to describe one is the autoregressive process of order 1, written AR(1): tomorrow's value is a fraction of today's, plus an unpredictable shock. We write X(t) = φ × X(t−1) + ε(t), where φ is a number between −1 and 1 and ε(t) is a random draw with standard deviation σ. The course justifies this random term as follows: to account for the unpredictable nature of future observations, we choose a model that has a random component.

The course then derives the best forecast h steps ahead: φ^h × X(n). Since the future shocks are unknown, they are replaced by their mean, zero, and all that remains is the memory of the current value, which fades step after step. The error of this forecast has variance σ² × (1 − φ^(2h)) / (1 − φ²).

Take a made-up example, not fitted to real data. X is the temperature deviation from normal, one step lasts 12 hours, φ = 0.9 and σ = 1 °C. Today it is 4 °C warmer than normal. In 12 hours, the forecast is +3.6 °C, give or take 1 °C. In three days (6 steps), it is 4 × 0.9⁶ ≈ +2.1 °C, give or take 1.9 °C. In fifteen days (30 steps), it is +0.2 °C, give or take 2.3 °C. Now 2.3 °C, that is σ / √(1 − φ²), is the ordinary standard deviation of the series: at that horizon, the forecast says "normal, with the usual spread". This is the sentence from the course: the smaller the horizon, the better the forecast.

```figure
file: fig-1.en.svg
caption: Forecast of an AR(1) process (φ = 0.9 per 12-hour step, σ = 1 °C) starting from a +4 °C deviation
scroll: The forecast curve sinks towards zero while the uncertainty zone widens up to the usual variability of the series.
steps:
- Today, the temperature is 4 °C above normal. This is the only information we have.
- The best forecast multiplies this deviation by 0.9 at each 12-hour step. The memory of the starting point fades and the curve returns towards normal.
- The shock of each step accumulates. The zone where reality falls about two times in three widens quickly, then levels off.
- At fifteen days, the forecast is almost zero and the zone reaches ± 2.3 °C, the ordinary spread of the series. The forecast no longer says anything specific.
```

## What this explains about GenCast

GenCast is built on the same skeleton. According to the scientific paper, it computes the state of the atmosphere 12 hours ahead from the two most recent states, which makes it the analogue of an autoregressive process of order 2, then feeds its output back in as input, 30 times in a row, to reach 15 days. Two major differences: the function linking the states is not a multiplication by φ but a neural network, and the state is not one number but more than 80 variables over the whole grid.

The decisive common point is the ε term. At each step, GenCast starts from randomly drawn noise, which the network turns into a plausible weather state (this is the principle of a diffusion model). So it does not replace the shock by its mean: it actually draws it.

```figure
file: fig-2.en.svg
caption: How GenCast works, step by step
scroll: The two input states go through the model together with random noise, the output goes back in as input, then the whole loop is repeated fifty times.
steps:
- The starting point is the state of the atmosphere now and 12 hours earlier.
- The model receives these two states and randomly drawn noise. It outputs one possible state 12 hours ahead.
- This state is fed back in as input. Thirty steps give one fifteen-day scenario.
- Running the loop again with other draws gives fifty different scenarios, all starting from the same situation.
```

Figure 1 shows why this is necessary. The best single forecast is an average over all possible shocks: it is smooth and returns towards normal. The authors observe the same thing in weather: the mean of their ensemble is blurry, whereas each scenario taken alone keeps the sharpness of a real map. Imagine a storm present in twenty scenarios out of fifty, in slightly different places: it disappears from the mean. It remains in the ensemble, and counting is enough to obtain a probability.

```figure
file: fig-3.en.svg
caption: Five simulated paths of the same AR(1), their average, and how a probability is read
scroll: One jagged path appears, then four more, then their smoother average, and finally a count on day four.
steps:
- Drawing the shock at each step gives one jagged scenario, as agitated as the real series.
- Four other draws give four other stories. All start from +4 °C and diverge within a few days.
- Their average is smoother and returns towards normal. It looks like none of the scenarios.
- On day four, two scenarios out of five exceed +2 °C. Counting scenarios gives a probability, which the average alone does not.
```

## What the notion does not say

The AR(1) formula sets a limit for a given model: it does not say at what horizon the real atmosphere stops being predictable, nor that GenCast reaches it. It also assumes a stationary series, meaning one whose mean and spread do not change over time. A model learned from archives inherits this assumption: it reproduces the climate it has seen. Finally, the two input states do not come from nowhere. DeepMind states that traditional physical models remain essential, because they supply the training data and the initial state of every forecast.

What I take away: for a system where chance enters at every step, the right answer to "what will the weather be in ten days" is not a map, it is a distribution. GenCast makes it cheap enough to compute in a few minutes.

## Sources

- [GenCast predicts weather and the risks of extreme conditions with state-of-the-art accuracy, Google DeepMind, 4 December 2024](https://deepmind.google/discover/blog/gencast-predicts-weather-and-the-risks-of-extreme-conditions-with-sota-accuracy/)
- [GenCast: Diffusion-based ensemble forecasting for medium-range weather, arXiv abstract](https://arxiv.org/abs/2312.15796)
- [GenCast: Diffusion-based ensemble forecasting for medium-range weather, arXiv full text (v2)](https://arxiv.org/html/2312.15796v2)
- "Séries Chronologiques" course (3A), CentraleSupélec, 2022 lecture notes: chapter 1 (the forecasting problem) and chapter 4 (linear prediction, example 4.1 on the AR(1)).
