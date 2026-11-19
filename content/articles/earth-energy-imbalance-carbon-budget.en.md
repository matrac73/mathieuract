---
title: "One watt per square metre too many: the radiation budget behind the carbon budget"
summary: "The annual climate indicators report gives the 1.5 °C carbon budget three years. The radiation budget from my course explains why a 1 W/m² gap is enough, and why we count a stock."
hook: "Earth keeps about 1 watt per square metre more than it sends back, and at the current pace of emissions the carbon budget compatible with 1.5 °C will be used up in three years."
category: "perspective"
date: "2025-06-19"
written: "2025-06"
readingMinutes: 5
course: "Limites Planétaires (1A)"
news:
  title: "Indicators of Global Climate Change 2024: annual update of key indicators of the state of the climate system and human influence"
  source: "Earth System Science Data"
  url: "https://essd.copernicus.org/articles/17/2641/2025/"
  date: "2025-06-19"
---

## What was published

On 19 June 2025, more than sixty researchers publish the annual update of the climate indicators in the journal Earth System Science Data. Three figures stand out. Observed warming in 2024 reaches 1.52 °C above 1850-1900, of which 1.36 °C is attributed to human activity. Earth is accumulating energy at a rate of about 1 W/m² on average over the last twelve years. And the remaining carbon budget for an even chance of limiting warming to 1.5 °C is estimated at 130 billion tonnes of CO2 (130 GtCO2) at the start of 2025, a little over three years of emissions at the current level of 42 GtCO2 a year.

These figures are easy to read with two tools from the Planetary Boundaries course: Earth's radiation budget and the residence times of carbon.

## The radiation budget, as taught in the course

The radiation budget is the bookkeeping of the energy that enters and leaves the planet as radiation. The course writes it in one line:

(1 − α) × Sc/4 = (1 − ε) × σ × Ts⁴

On the left, what Earth absorbs. Sc is the solar constant, 1368 W/m². It is divided by 4 because Earth intercepts sunlight as a disc but spreads that energy over a sphere, which gives 342 W/m² on average. The albedo α is the share reflected back to space, 0.31 in the tutorial. That leaves 235 W/m² absorbed.

On the right, what Earth sends back as infrared. A surface at temperature Ts emits σ × Ts⁴, where σ is the Stefan constant. At 288 K (15 °C), that is 390 W/m². But the atmosphere holds some of it back: this is the greenhouse effect, written ε, equal to 0.4 in the tutorial. Only 60% gets out, that is 235 W/m². Both sides are equal and the temperature does not move.

```figure
file: fig-1.en.svg
caption: Earth's mean radiation budget, at equilibrium and then with a stronger greenhouse effect
scroll: The fluxes appear one by one, then the outgoing infrared flux drops and a 1 W/m² surplus stays in the ocean
steps:
- Earth receives 342 W/m² from the Sun on average. It reflects 107 and absorbs 235.
- At equilibrium, it sends exactly 235 W/m² back to space as infrared. Its temperature is stable.
- When the greenhouse effect grows, the atmosphere holds back a little more infrared. Only about 234 W/m² gets out, and 1 W/m² stays.
- That surplus does not vanish. It warms the planet, and 91% of this heat is stored in the ocean.
```

## What the budget says about the report

Adding greenhouse gases amounts to raising ε. The right-hand side of the equation shrinks while the left-hand side does not change. The equality is broken, and the only way to restore it is for Ts to rise until Earth emits 235 W/m² again. The imbalance measured by the report is therefore the part of the warming that has not happened yet: as long as it is positive, the planet keeps warming.

A gap of 1 W/m² looks small next to 235. It is 0.4% of the absorbed flux. But it applies to the whole surface of the globe, 5.1 × 10¹⁴ m², all the time: that is about 5 × 10¹⁴ watts. And it is growing. The report gives 0.43 W/m² over 1975-1994, 0.89 over 2005-2024 and 0.99 over 2012-2024.

```figure
file: fig-2.en.svg
caption: Earth's energy imbalance by measurement period (Forster et al., 2025)
scroll: Three bars appear one after the other, each taller than the last
steps:
- Between 1975 and 1994, Earth kept on average 0.43 W/m² more than it sent back.
- Over 2005-2024, the mean gap reaches 0.89 W/m², about twice as much.
- Over the last twelve years, it is 0.99 W/m². The imbalance is growing instead of closing.
- That is still only 0.4% of the 235 W/m² absorbed. Climate is decided by a small gap between two large fluxes.
```

The course also gives a way to estimate what comes next. Differentiating the equation, a relative change in the emitted flux equals 4 × ΔTs/Ts. To get rid of 1 more W/m², that is 0.43% of 235, you need ΔTs ≈ 288 × 0.0043 / 4 ≈ 0.3 °C. The tutorial adds that feedbacks (water vapour, ice) amplify this result by a factor of 2 to 3. With an atmosphere frozen at its current composition, there would therefore be roughly 0.6 to 0.9 °C still to come. This is an order of magnitude, not a forecast.

That leaves the question of the budget. We count cumulative tonnes because CO2 accumulates. The tutorial shows that vegetation and the surface ocean take back about half of our emissions within a few years, but that the rest persists: it takes around 370 years for mixing with the deep ocean, and hundreds of thousands of years for a full return underground. On the scale of a human life, every tonne emitted is there to stay. What sets ε, and so the temperature, is the total emitted, not the flow of a given year.

With the tutorial's conversion, 1 ppm of atmospheric CO2 = 7.7 GtCO2, the 130 GtCO2 budget amounts to 17 ppm emitted, of which about 8 would stay in the air.

```figure
file: fig-3.en.svg
caption: The remaining carbon budget for 1.5 °C, spent at the pace of emissions
scroll: A straight line falls from 130 GtCO2 and hits zero in early 2028, then a second dashed line falls half as fast
steps:
- At the start of 2025, 130 GtCO2 can still be emitted to keep an even chance of staying below 1.5 °C.
- Current emissions take 42 GtCO2 a year out of this total. The budget does not refill from one year to the next.
- At this pace, it is used up in 130 / 42 ≈ 3.1 years, that is in early 2028.
- Halving emissions only doubles that delay, to early 2031. Only stopping emissions stops the counter.
```

## What to take away

Climate does not depend on the size of the fluxes but on their difference, and that difference is currently 1 W/m² in the wrong direction. Because CO2 stays, cutting emissions slows the rise without stopping it. Only a capped total of emissions stabilises the temperature.

The course model has its limits. It reduces Earth to a point, with a single albedo and a single greenhouse effect. It says nothing about how fast the ocean takes up heat, nor about regions. And the 130 GtCO2 budget is a central estimate with an even chance, not a physical threshold: going past it triggers nothing in particular the next day, it only makes the 1.5 °C target less and less likely.

## Sources

- [Forster et al., Indicators of Global Climate Change 2024, Earth System Science Data, 19 June 2025](https://essd.copernicus.org/articles/17/2641/2025/)
- [University of Leeds, Scientists find three years left of remaining carbon budget for 1.5°C, 19 June 2025](https://climate.leeds.ac.uk/news/scientists-find-three-years-left-of-remaining-carbon-budget-for-1-5c/)
- Planetary Boundaries course (CentraleSupélec, first year), tutorial "Bilan radiatif et cycle du carbone", D. Paillard
