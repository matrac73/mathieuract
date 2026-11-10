---
title: "Time series forecasting: from AR to LSTM"
summary: "Stationarity, AR, MA, ARIMA, SARIMAX and LSTM in plain words, and how I choose between them."
category: "data-science"
date: "2026-11-10"
readingMinutes: 5
order: 4
---

A time series is the one kind of dataset where shuffling the rows destroys the information. Order is the signal. That single fact changes how you split, how you model and how you evaluate.

## First, stationarity

Classical models assume the series is **stationary**: its mean and variance do not change over time. A series with a trend or growing swings is not.

The standard fix is **differencing**: replace each value by its change from the previous one. Differencing once removes a linear trend; twice removes a quadratic one. A quick plot, or a statistical test such as the augmented Dickey-Fuller test, tells you whether it worked.

## The classical family, one letter at a time

**AR (autoregressive).** The next value is a linear combination of the *p* previous values. The coefficients are estimated by least squares or maximum likelihood. To forecast several steps ahead, predictions are fed back in as inputs, so errors accumulate with the horizon.

**MA (moving average).** Despite the name, an MA(*q*) model is not the rolling mean of the last values. It models the next value from the *q* previous **forecast errors**. The rolling mean is a smoother and a naive baseline, and a useful one, but it is a different object.

**ARMA.** AR and MA combined. Its limit: it only models stationary series, so it cannot follow a rising trend.

**ARIMA.** ARMA with the differencing built in. The "I" (integrated) adds a parameter *d*: the number of times the series is differenced. The model is written ARIMA(p, d, q).

**SARIMAX.** Adds two things: **seasonal** terms (seasonal AR and MA components that link a value to the same moment in previous cycles, with a period *s*) and **exogenous** variables (the X: weather, holidays, prices).

## Choosing p and q

Two plots do most of the work:

- The **ACF** (autocorrelation function) shows the correlation of the series with its own lags.
- The **PACF** (partial autocorrelation) shows the correlation with a lag once shorter lags are accounted for.

The rule of thumb: the lags where the PACF exceeds the significance threshold suggest the AR order *p*; the lags where the ACF does suggest the MA order *q*. Then compare a few candidates with a criterion such as AIC rather than trusting the eye alone.

```python
import statsmodels.api as sm

model = sm.tsa.SARIMAX(
    train,
    order=(1, 1, 1),              # p, d, q
    seasonal_order=(1, 1, 1, 12)  # P, D, Q, period
)
fit = model.fit(disp=False)
forecast = fit.forecast(steps=len(test))
```

## Neural networks: RNN and LSTM

A **recurrent neural network** reads a sequence one step at a time and keeps a hidden state, a memory of what it has seen. It is trained by backpropagation through time. On long sequences, the gradient shrinks at every step back and the network forgets distant events: the **vanishing gradient** problem.

The **LSTM** (Long Short-Term Memory) addresses this with a memory cell and three gates:

- the **forget gate** decides what to drop from memory,
- the **input gate** decides what new information to store,
- the **output gate** decides what to expose at this step.

The network learns what to remember over long periods. The price is more parameters, more computation and more data needed.

To train one, the series is cut into sliding windows: the last *n* values as input, the next value as target.

```python
import numpy as np

def make_windows(series, n_steps):
    X, y = [], []
    for i in range(len(series) - n_steps):
        X.append(series[i:i + n_steps])
        y.append(series[i + n_steps])
    return np.array(X), np.array(y)
```

## How I choose

| Situation | Starting point |
|---|---|
| Short series, one variable, clear seasonality | SARIMA |
| Known external drivers (weather, calendar) | SARIMAX, or gradient boosting on lag and calendar features |
| Long history, many related series, non-linear effects | LSTM or other deep models |
| Any situation | A naive baseline first |

The baseline matters. "Same value as yesterday" or "same value as last week" is surprisingly hard to beat, and a model that does not beat it is not worth deploying.

## Evaluating without cheating

- Split **chronologically**: train on the past, test on what follows. Never shuffle.
- Test on several periods if you can (a normal week, a holiday period).
- Use error metrics in the unit of the problem (MAE, RMSE) and a relative one (MAPE) for communication.
- Plot the forecast over the actual values. A model that simply repeats the previous value can have a decent score and no usefulness.

## Key takeaways

- Order is the information: split by time, never at random.
- Make the series stationary by differencing before using classical models.
- AR uses past values, MA uses past errors, ARIMA adds differencing, SARIMAX adds seasonality and external variables.
- ACF and PACF suggest the orders; AIC arbitrates.
- LSTMs handle long memory and non-linearity, but need data and computation.
- Always compare with a naive baseline.
