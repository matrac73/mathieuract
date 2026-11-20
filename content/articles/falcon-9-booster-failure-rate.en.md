---
title: "Thirty-six flights for one rocket: what the record says about wear"
summary: "The 36th flight of a Falcon 9 first stage, read through the failure rate: a record proves the vehicle held up, not that it does not age."
hook: "A rocket stage flying for the 36th time proves it has held up so far, not that it does not wear out: only the history of the whole fleet can tell."
category: "perspective"
date: "2026-07-09"
written: "2026-07"
readingMinutes: 5
course: "Surveillance des Systèmes (1A)"
news:
  title: "SpaceX launches Falcon 9 rocket on record-breaking 36th flight"
  source: "Spaceflight Now"
  url: "https://spaceflightnow.com/2026/07/09/live-coverage-spacex-to-launch-falcon-9-rocket-on-record-breaking-36th-flight/"
  date: "2026-07-09"
---

## A first stage lifts off for the 36th time

On Thursday 9 July 2026, at 5:25 a.m. Florida time, a Falcon 9 rocket lifted off from Cape Canaveral with 29 Starlink satellites. Its first stage, booster number 1067, was flying for the 36th time, which is a record for SpaceX. A little more than eight minutes after liftoff, it landed on a barge in the Atlantic. This stage has been flying since June 2021: it first carried a cargo capsule for NASA, then two crews, then batches of satellites. According to Space.com, the record across all vehicles still belongs to the shuttle Discovery, with 39 round trips to orbit.

The question I ask myself is simple: after 36 successful flights, is the 37th riskier than the second? The course on system monitoring provides the words to answer it.

## The failure rate, or the risk of the next flight

The course starts from the lifetime T of a component, seen as a random quantity. The reliability R(t) is the probability that the component has not yet failed at time t. Here I count time in number of flights, which is a simplification.

The useful quantity is the failure rate z(t). The course defines it as the "conditional density" of failure at time t, given that the component has survived until then. In plain words: among the vehicles still in working order after t flights, what share will be lost on the next one?

Two cases stand apart. If this rate is constant, equal to λ, the lifetime follows an exponential law: R(t) = e^(−λt). The course then says that the component "does not age": one that has survived so far has the same chances of holding on as a new one. The average lifetime, called MTTF (mean time to failure), equals 1/λ. With λ = 1% per flight, it is 100 flights, and the probability of reaching 36 flights is e^(−0.36) ≈ 70%.

If on the contrary the component wears out, the course offers the Weibull law, whose rate is z(t) = α × β × t^(β−1). When β is greater than 1, the rate increases with age. I take β = 2 and α = 0.00028, chosen so that the probability of reaching 36 flights is also 70%. The risk per flight then starts from almost zero and equals 2% on the 36th flight.

```figure
file: fig-1.en.svg
caption: Two assumptions about the risk of the next flight, depending on the number of flights already flown
scroll: A horizontal line then a rising line appear, split apart at the 36th flight, and the still unknown area is shaded
steps:
- First assumption, the failure rate is constant. Each flight has a 1% chance of being the last, whatever the age of the stage.
- Second assumption, the stage wears out. The risk is almost zero when it is new, then it grows with every flight.
- At the 36th flight, the gap between the two assumptions is clear. The risk is 1% in one case and 2% in the other.
- Everything on the right has never been observed on this rocket. That is where the two assumptions differ the most.
```

## Two models that agree on the past, not on what follows

These two models give exactly the same probability of reaching 36 flights. The record of booster 1067 therefore cannot tell them apart. They do separate as soon as one looks further.

The tool from the course is conditional reliability: the probability of lasting until t, given that one has lasted until t1, equals R(t) / R(t1). For 36 more flights, one has to compute R(72) / R(36). With the constant rate, this gives e^(−0.72) / e^(−0.36) = e^(−0.36), which is 70% again. With wear, R(72) = e^(−1.44) ≈ 24%, and the ratio drops to 34%. The same past leads to two futures, one twice as favourable as the other.

```figure
file: fig-2.en.svg
caption: Probability of reaching a given number of flights, with and without wear
scroll: Two falling curves meet at 36 flights, then move apart up to 72 flights
steps:
- With a constant rate of 1% per flight, the chance of reaching a given number of flights falls steadily.
- With wear, the curve first falls more slowly, then faster. The two curves cross at 36 flights, at 70%.
- At 72 flights, they no longer agree. There is a 49% chance left in one case and 24% in the other.
- For a stage that has already flown 36 times, this means a 70% or a 34% chance of flying 36 more.
```

## What a single record does not say

There is a second reason to be careful. A stage that is still flying is what the course calls a right-censored observation: all we know is that its lifetime exceeds 36 flights. The course gives the estimator of the rate in that case: the number of failures observed divided by the sum of the observation times. With a single stage and no failure, the calculation gives zero, which teaches nothing. And a risk of 3% or 5% per flight still leaves a 34% or 17% chance of 36 flights in a row without a loss.

```figure
file: fig-3.en.svg
caption: Probability of 36 flights in a row without a loss, for three levels of risk per flight
scroll: Three bars, each lower than the last, appear, then the conclusion is displayed
steps:
- If the risk is 1% per flight, a stage has a 70% chance of reaching 36 flights.
- With a risk three times higher, it still has one chance in three.
- Even at 5% per flight, about one stage in six would reach 36 flights.
- Seeing one stage complete 36 flights is therefore not enough to say which of these risks is the right one.
```

The information lies in the whole fleet. The Spaceflight Now tally stands at 635 booster landings for SpaceX, and this launch was the 80th Falcon 9 mission of the year according to Space.com. Each stage, lost or still in service, adds observation time, and it is by comparing the loss rate of young stages and old stages that one can see whether the rate climbs. I do not have this data per stage, so I draw no conclusion on the real shape of the curve.

The model also has a limit that the course points out. A lifetime model knows only two states, working or failed. A reused stage is inspected and refurbished between flights, which belongs rather to a degradation model, with intermediate states and preventive maintenance. What I take away: the number 36 measures the past endurance of one vehicle, and confidence in the 37th flight comes from what inspection shows and from what the whole fleet has been through.

## Sources

- [SpaceX launches Falcon 9 rocket on record-breaking 36th flight, Spaceflight Now, 9 July 2026](https://spaceflightnow.com/2026/07/09/live-coverage-spacex-to-launch-falcon-9-rocket-on-record-breaking-36th-flight/)
- [SpaceX Falcon 9 rocket launches for record-breaking 36th time, Space.com, 9 July 2026](https://www.space.com/space-exploration/launches-spacecraft/spacex-falcon-9-rocket-launch-36th-time-new-record)
- [SpaceX Breaks Rocket Reuse Record on 36th Falcon 9 Flight, AIAA, 9 July 2026](https://aiaa.org/2026/07/09/spacex-breaks-rocket-reuse-record-on-36th-falcon-9-flight/)
