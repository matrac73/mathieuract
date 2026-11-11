---
title: "Market sizing and mental maths for case interviews"
summary: "Top-down and bottom-up estimates, segmentation, rounding, growth and discounting shortcuts, and the sanity check."
category: "consulting"
date: "2026-11-10"
written: "2024-10"
scene: "bars"
readingMinutes: 5
order: 8
---

Nobody expects you to know how many bottles a vineyard produces or how much a taxi earns in a year. What is expected is a number you can defend, built from assumptions you can state. Market sizing is a structuring exercise that happens to end with arithmetic.

## Two ways to build an estimate

**Top-down (demand side).** Start from a population and narrow it down:

> Market = population x share concerned x purchases per person per year x price

**Bottom-up (supply or capacity side).** Start from one unit and scale up:

> Revenue = capacity of one unit x utilisation x price x number of units

The capacity approach is the one I forget least often now, because it fits small-business questions well. Take a single taxi: 8 hours a day x 250 days x 50 km/h average gives 100,000 km a year. If half of that distance carries a paying customer at 1.40 per km, revenue is about 70,000 a year. Four assumptions, each open to discussion, and a result in twenty seconds.

When time allows, doing both and comparing them is the best possible check.

## Segment where behaviour differs

A single average hides too much. The trick is to choose the one factor that really discriminates behaviour: age, income, urban or rural, level of development of the country.

For a consumer product sold worldwide, splitting the population by level of development (with a different purchase rate in each group) is far more convincing than applying one rate to seven or eight billion people. Two or three segments are enough; five is a waste of time.

## A five-step routine

1. **Clarify the scope**: which geography, which year, volume or value?
2. **Write the formula** before any number, and say it aloud.
3. **State each assumption** with a one-line justification. Ask whether a figure is available; the interviewer often has one.
4. **Compute** with round numbers.
5. **Sanity-check** the result, then say what it means.

Step 2 is the one that matters: once the formula is accepted, the numbers are a detail.

## Mental maths that hold up under pressure

**Round, then say so.** 82,500 / 0.75 is unpleasant; "about 80,000 divided by three quarters, so about 110,000" is fine. Announce the rounding and keep its direction in mind.

**Carry units, write the zeros as letters.** Use k, m and bn. Most errors in interviews are a factor of ten or a thousand, not a wrong digit.

**Break percentages down.** 35% = 25% + 10%. 15% = 10% + half of it. 70% of 180 = 7 x 18 = 126.

**Growth over a few years.** For small rates, compound growth is roughly rate x years, plus a little. 5% a year over five years is about 28%, not 25%. For doubling, the **rule of 72**: years to double ≈ 72 / rate. At 12%, money doubles in about six years.

**Discounting.** A future amount is worth less today:

> Present value = future value / (1 + r)^n

The rule of 72 gives the shortcut: at 12% over six years, divide by about two.

**Per-unit cost.** Fixed costs must be spread over volume: (annual fixed costs + investment / years of depreciation) / units, plus the variable cost per unit. This gives the break-even price to compare with the market price.

## Margin and return are different questions

One lesson from an investment case stayed with me. Net margin (profit / sales) and return on equity (profit / capital invested) can move in opposite directions. Financing a second asset with debt lowered the margin, because of interest, yet raised the return on equity, because the same capital now earned more profit. Leverage amplifies returns, and it amplifies risk just as well, since fixed interest payments remain when demand drops.

Always check which ratio the question is really about.

## The sanity check

Before announcing a result, I test it three ways:

- **Order of magnitude**: per person, per day, per unit, does it look plausible?
- **Comparison**: against the total market, a known figure or the client's current size. A segment estimate larger than the whole market means an error upstream.
- **Sensitivity**: which assumption changes the answer most? In capacity estimates it is almost always utilisation. Name it; it is also the first risk to mention in the conclusion.

Then end with a sentence, not a figure: "about 3 billion, so the segment is big enough to matter for a client of this size."

## Key takeaways

- A market size is a formula first; agree on it before using numbers.
- Top-down starts from the population, bottom-up from the capacity of one unit; use one to check the other.
- Segment on the single factor that changes behaviour most.
- Round openly, track units, and use the rule of 72 for growth and discounting.
- Distinguish margin from return on capital, and remember that leverage raises both return and risk.
- Sanity-check the order of magnitude and name the most sensitive assumption.
