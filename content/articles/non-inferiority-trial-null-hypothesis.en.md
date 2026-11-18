---
title: "Safe for the heart does not mean good for the heart"
summary: "The SYNCHRONIZE-CVOT trial shows that survodutide does not raise cardiovascular risk, without proving that it lowers it. The difference comes from the choice of the null hypothesis in a statistical test."
hook: "A trial of 5,500 patients shows that a new obesity drug does not harm the heart, without proving that it protects it: everything depends on which hypothesis the trial set out to refute."
category: "perspective"
date: "2026-11-09"
written: "2026-11"
readingMinutes: 5
course: "Statistiques et Apprentissage (1A)"
news:
  title: "Survodutide Meets CV Safety End Point in SYNCHRONIZE-CVOT"
  source: "AJMC (The American Journal of Managed Care)"
  url: "https://www.ajmc.com/view/survodutide-meets-cv-safety-end-point-in-synchronize-cvot"
  date: "2026-11-09"
---

On 9 November 2026, at the American Heart Association congress, Boehringer Ingelheim presented the results of the SYNCHRONIZE-CVOT trial, published the same day in The Lancet. About 5,500 adults with overweight or obesity and a high cardiovascular risk received weekly injections of survodutide, a new weight-loss drug, or a placebo, with a median follow-up of 22 months. The announced result is that the drug is "non-inferior" to placebo for the heart. This odd wording comes straight from the way a statistical test is built.

## What the trial measured

The trial counted serious cardiovascular events: cardiovascular death, heart attack, stroke, a procedure to reopen a coronary artery, an episode of heart failure. There were 136 among the 3,671 treated patients (3.7%) and 76 among the 1,836 patients on placebo (4.1%).

This comparison is summarised by a hazard ratio: the risk of an event in treated patients divided by the risk in the placebo group. It equals 1 if the drug changes nothing, less than 1 if it protects, more than 1 if it harms. The trial estimates it at 0.89. Because this estimate rests on a limited number of events, it comes with a 95% confidence interval, meaning the range of values compatible with the data: here from 0.67 to 1.18.

The rule was set before the trial: it would succeed if the upper bound of that interval stayed below 1.65. It is 1.18, so the trial succeeded.

## The notion: two hypotheses that do not play the same role

A statistical test confronts two hypotheses, written H0 and H1, and says from the data whether we keep H0 or reject it. The first-year statistics course insists on the asymmetry between the two. H0, the null hypothesis, is the "conservative" one: the hypothesis we least want to reject wrongly. The course uses the image of the presumption of innocence: we start from the idea that the accused is innocent, and convincing evidence is needed to conclude otherwise, because convicting an innocent person is worse than releasing a guilty one.

So there are two possible errors. A type I error is rejecting H0 when it is true. A type II error is keeping H0 when it is false. Both cannot be made very small at once. We therefore choose to cap the first at a level α, typically 5% or 1% according to the course, and do the best we can for the second.

The practical consequence is that the two outcomes do not carry the same weight. Rejecting H0 is a solid conclusion. Keeping it only means the evidence was not enough.

```figure
file: fig-1.en.svg
caption: The four outcomes of a test when the starting hypothesis is "the drug is too risky"
scroll: The table fills in cell by cell, until the two possible errors appear.
steps:
- We start from the cautious hypothesis H0, the drug is too risky. Reality, which nobody knows, lies in one of the two columns.
- At the end of the trial, we keep H0 or reject it. In two cells out of four, the decision is the right one.
- Rejecting H0 when it is true means approving a risky product. This is the type I error, the most serious one, whose probability is capped at α.
- Keeping H0 when it is false means blocking a good product. This type II error is not capped, it shrinks as the trial gets larger.
```

## Reading the result through this lens

In a safety trial, the error to avoid above all is declaring safe a drug that is not. The null hypothesis is therefore "the drug is too risky", translated as a hazard ratio greater than or equal to 1.65. It is up to the drug to prove otherwise. Here the whole confidence interval lies below 1.65: we reject H0, and that is a solid conclusion. Checking that the upper bound of a 95% interval falls below the threshold amounts to capping the type I error at 2.5%.

A second question can be asked of the same data: does the drug protect the heart? The cautious hypothesis becomes "it does not protect", meaning a ratio greater than or equal to 1. This time the interval, which reaches 1.18, contains 1. We cannot reject H0. The observed 0.89 is encouraging, but it remains compatible with no effect at all.

```figure
file: fig-2.en.svg
caption: The same confidence interval answers two different questions
scroll: The measured interval is compared first with the danger threshold at 1.65, then with the value 1 that marks no effect.
steps:
- The trial estimates the hazard ratio at 0.89, with a confidence interval running from 0.67 to 1.18. The value 1 means the drug changes nothing.
- The starting hypothesis is that the drug is too risky, meaning the true ratio lies beyond 1.65.
- The whole interval lies to the left of the threshold. The starting hypothesis is rejected, the risk is judged acceptable.
- To conclude there is a benefit, the whole interval would have to lie below 1. It goes past 1, so protection of the heart is not shown.
```

"Non-inferior" is therefore the exact name of what was proven. It is neither cautious phrasing nor a half failure.

## What the notion does not say

Why is the interval so wide? Its width depends mostly on the number of events observed. On a logarithmic scale, the uncertainty is roughly √(1/136 + 1/76) ≈ 0.14, which does give back the published interval, from 0.67 to 1.18. It shrinks like 1/√n: halving it takes four times as many events. If the true ratio were 0.89, my calculation gives about 1,230 events for the interval to fall below 1, close to six times the 212 observed.

```figure
file: fig-3.en.svg
caption: For the same estimate (0.89), the confidence interval narrows as the number of observed events grows
scroll: The intervals stack up and tighten around 0.89, until the last one sits to the left of 1.
steps:
- With the trial's 212 events, the interval runs from 0.67 to 1.18. It is wide because events are rare.
- With twice as many events and the same estimate, the interval narrows by a factor of √2. It still contains 1.
- With four times as many events, the width is halved. The upper bound still goes slightly past 1.
- With eight times as many events, the whole interval is below 1. The same 0.89 would then be proof of a benefit.
```

Two limits to finish. The 1.65 threshold is not a mathematical result: it is a convention, which sets what we agree to call "not too risky". And the test only concerns the heart. It says nothing about digestive side effects, which led about one treated patient in five to stop the drug, against 1.9% on placebo. What I take away: before reading the result of a trial, I look at which hypothesis it was trying to refute.

## Sources

- [Survodutide Meets CV Safety End Point in SYNCHRONIZE-CVOT, AJMC, 9 November 2026](https://www.ajmc.com/view/survodutide-meets-cv-safety-end-point-in-synchronize-cvot)
- [Survodutide meets cardiovascular safety endpoint in phase 3 obesity trial, Patient Care Online, 10 November 2026](https://www.patientcareonline.com/view/survodutide-meets-cardiovascular-safety-endpoint-in-phase-3-obesity-trial)
- [Survodutide shows cardiovascular safety in SYNCHRONIZE-CVOT, Pharmacy Times, 9 November 2026](https://www.pharmacytimes.com/view/survodutide-shows-cardiovascular-safety-in-synchronize-cvot)
- [Survodutide does not raise cardiovascular risk in patients with obesity, Healio, 9 November 2026](https://www.healio.com/news/cardiology/20261109/survodutide-does-not-raise-cardiovascular-risk-in-patients-with-obesity)
- Course notes "Statistiques et apprentissage", CentraleSupélec, chapter 3, statistical hypothesis tests
