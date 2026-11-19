---
title: "Artemis II: why NASA shortened Orion's reentry"
summary: "The return of Artemis II read through the heat equation: in a heat shield, how deep the heat gets depends on the time it is given, and the inside keeps heating while the surface cools."
hook: "To spare Orion's heat shield, NASA chose a steeper, shorter reentry: heat sinks slowly into a material, and giving it less time limits the damage deep inside."
category: "perspective"
date: "2026-04-10"
written: "2026-04"
readingMinutes: 5
course: "EDP (Équations aux Dérivées Partielles) (1A)"
news:
  title: "As it happened: Artemis 2 splashes down, 'a perfect mission'"
  source: "Astronomy Magazine"
  url: "https://www.astronomy.com/space-exploration/artemis-2-splashes-down/"
  date: "2026-04-10"
---

On April 10, 2026, at 8:07 p.m. US Eastern time, the Orion capsule of the Artemis II mission splashed down in the Pacific near San Diego. Reid Wiseman, Victor Glover, Christina Koch and Jeremy Hansen are back from a flight of just over nine days around the Moon. The most closely watched part of the trip lasted a quarter of an hour: the passage through the atmosphere.

## A deliberately shorter reentry

Orion meets the atmosphere at an altitude of 122 km, at about 40,000 km/h. Braking against the air turns that speed into heat, with a peak between 2,200 and 2,760 °C. The capsule is protected by a shield 5 meters across, made of an ablative material called Avcoat. Ablative means it is designed to burn away little by little at the surface.

In 2022, the uncrewed test flight Artemis I used a "skip" entry: the capsule dips into the upper atmosphere, comes back out thanks to its lift, then dips again. It covered 3,178 nautical miles, about 5,900 km, with roughly twenty minutes of heating. The shield came back damaged: material was missing in more than a hundred places.

For Artemis II, the shield has the same design. So NASA changed the trajectory: a steeper entry, with no skip, over 1,071 nautical miles (about 2,000 km) and roughly 14 minutes of heating.

```figure
file: fig-1.en.svg
caption: Two ways to come back from the Moon, with a skip (Artemis I) or directly (Artemis II). Schematic, only the distances and the entry altitude are to scale.
scroll: The skip trajectory of Artemis I is drawn first, then the direct entry of Artemis II appears in orange, three times shorter.
steps:
- Orion meets the atmosphere at an altitude of 122 km, at about 40,000 km/h. All of that speed has to become heat.
- In 2022, Artemis I dips, comes back out thanks to its lift, then dips again. That makes about 5,900 km and 20 minutes of heating.
- Between the two dips, the capsule climbs. Heating at the surface of the shield drops, then picks up again.
- In 2026, Artemis II comes in steeper, with no skip. About 2,000 km and 14 minutes of heating, in one go.
```

## The heat equation

The partial differential equations course devotes a chapter to the heat equation. It reads ∂u/∂t − α Δu = f. Here u is the temperature at each point and each instant, f is a heat source, and Δu measures the gap between the temperature of a point and that of its neighbors. The coefficient α is the diffusivity of the material. In plain words: a point colder than its surroundings warms up, a hotter point cools down, and α sets the pace of this leveling. The course calls it a "regularizing effect": the solution is always smoother than the starting situation.

What interests me here is the unit of α: m²/s. A length squared divided by a time. In this equation, time and distance are therefore not proportional. The course brings this out when it solves the equation numerically: with a space step hx and a time step ht, the explicit scheme is stable only if α × ht / hx² ≤ 1/2. If you halve the space step, you have to divide the time step by 4.

The same rule holds for real heat: in a time t, it penetrates to a depth of the order of √(α × t). Take an insulator with diffusivity α = 10⁻⁷ m²/s, a value I pick for the example and which is not that of Avcoat. If its surface is kept hot, the depth at which the temperature reaches roughly half of the surface value is 4.6 mm after three and a half minutes, 9.2 mm after 14 minutes and 18 mm after 56 minutes.

```figure
file: fig-2.en.svg
caption: Temperature inside an insulator whose surface is kept hot (α = 10⁻⁷ m²/s, an example value), at three instants.
scroll: The temperature profiles spread to the right at each step, and the half-temperature point moves back more and more slowly.
steps:
- A wall of insulator, cold at the start. Its left face is brought to a fixed temperature, which we take as the unit.
- After three and a half minutes, the heat has barely gone in. The temperature falls to half the surface value by 4.6 mm.
- After 14 minutes, four times later, that point has only moved back to 9.2 mm.
- After 56 minutes, it is at 18 mm. To go twice as deep, heat needs four times as long.
```

## What the skip changes

In December 2024, NASA explained the Artemis I damage. Between the two dips, heating decreased and thermal energy built up inside the Avcoat. The gases produced by the heated material could not escape, for lack of permeability. Pressure rose, the outer layer cracked and pieces came off.

The heat equation sheds light on the first half of that explanation. When the surface stops being heated, the heat that has already gone in does not stop. It keeps spreading toward the cold, hence toward the inside. I go back to my example insulator, with heat deposited near the surface and then no further input. Between 2 and 8 minutes, the surface loses half of its temperature, but at a depth of 10 mm the temperature goes from 12% to 30% of the initial surface value. The skip creates this situation: a surface that calms down and an inside that keeps heating.

This makes the choice made for Artemis II easier to understand. Going from 20 to 14 minutes only reduces the depth reached by a factor √(14/20) ≈ 0.84. The main gain lies elsewhere: without a skip, there is no longer a pause during which heat migrates inward. NASA puts it this way: limit the time spent in the temperature range where the damage appeared.

```figure
file: fig-3.en.svg
caption: Heat deposited at the surface and then left alone, in the same example insulator. Simplified model, with no gain or loss at the surface.
scroll: The temperature peak at the surface sags and widens, then an orange arrow shows the temperature rising at a depth of 10 mm.
steps:
- After a first heating phase, the heat is concentrated in the first few millimeters.
- Heating stops. Six minutes later, the profile has sagged and spread inward.
- At the surface, the temperature has been halved.
- At a depth of 10 mm, it has gone from 12% to 30% of the starting value. The inside heats up while the surface cools.
```

## What the equation does not say

The course itself has a reservation about this model. The heat equation predicts that a distant point warms up a tiny bit instantly, which is physically impossible. It draws a rule from this: do not ask whether a model is true, ask whether it is useful for the application at hand.

Here, it is useful for two things: the square rule between time and depth, and the fact that the inside of a material is still heating after the surface. It says nothing about gases, pressure or cracks. An ablative shield transforms and its surface recedes, which my constant-diffusivity calculation ignores. NASA in fact needed 121 tests, spread over eight campaigns, to reproduce the phenomenon on the ground.

The trajectory is only a workaround. For the following missions, NASA is building shields with uniform permeability, so that the gases can get out. As for the Artemis II shield, its inspection will tell whether the short reentry delivered.

## Sources

- [Astronomy Magazine, "As it happened: Artemis 2 splashes down, 'a perfect mission'" (April 10, 2026)](https://www.astronomy.com/space-exploration/artemis-2-splashes-down/)
- [NASA, "NASA Identifies Cause of Artemis I Orion Heat Shield Char Loss" (December 5, 2024)](https://www.nasa.gov/missions/artemis/nasa-identifies-cause-of-artemis-i-orion-heat-shield-char-loss)
- [Space.com, "The Artemis 1 moon mission had a heat shield issue. Here's why NASA doesn't think it will happen again on Artemis 2" (February 17, 2026)](https://www.space.com/space-exploration/artemis/the-artemis-1-moon-mission-had-a-heat-shield-issue-heres-why-nasa-doesnt-think-it-will-happen-again-on-artemis-2)
