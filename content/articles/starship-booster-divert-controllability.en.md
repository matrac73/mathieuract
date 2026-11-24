---
title: "Starship: why the booster aimed for the sea instead of the tower"
summary: "On 13 November, Starship's first stage was diverted to the Gulf of Mexico instead of returning to its tower. Controllability and state feedback explain the logic behind giving up the catch."
hook: "Bringing a 72-metre rocket back between the arms of a tower requires that its path can still be corrected; when that is no longer guaranteed, the sensible decision is to aim for the sea."
category: "perspective"
date: "2026-11-13"
written: "2026-11"
readingMinutes: 5
course: "Commande des systèmes dynamiques (2A)"
courseSlug: "commande-des-systemes-dynamiques-2a"
news:
  title: "Starship: booster diverted to the sea on the 15th test flight"
  source: "CBS News"
  url: "https://www.cbsnews.com/news/spacex-launches-starship-flight-rocket/"
  date: "2026-11-13"
---

On Friday 13 November 2026, SpaceX launched its Starship rocket for the fifteenth time from Texas, hoping to catch both stages between the mechanical arms of the launch tower. The first stage, a 72-metre booster, separated about 2 minutes 20 seconds after liftoff, turned around, and was then diverted to the Gulf of Mexico a little more than six minutes into the flight. It exploded just before hitting the water. CBS News mentions a "technical problem" without further detail, and the AP notes that SpaceX gave no explanation. The upper stage went on to orbit and, according to the Daily Wire, the tower caught it the next day after 14 trips around the Earth.

```figure
file: fig-1.en.svg
caption: The 13 November flight: the planned return to the tower and the actual diversion to the sea
scroll: The trajectory builds up step by step, ending with the orange branch that heads for the sea instead of the tower.
steps:
- The rocket lifts off from Texas. About 2 minutes 20 seconds later, the booster separates from the ship, which carries on to orbit.
- The booster flips and relights engines to head back to where it started.
- The plan was to end between the arms of the tower, as on three earlier flights.
- A little more than six minutes after liftoff, it is diverted to the Gulf of Mexico and explodes just before the water.
```

## What the course means by controlling a system

The control course describes a system by its state, meaning the list of quantities that is enough to predict what comes next. I take a very reduced model of the booster: a single horizontal axis and two quantities, the offset d from the tower axis and the lateral speed v. The control u is the lateral acceleration the engines can produce by tilting. The equations fit in two lines: the derivative of d is v, the derivative of v is u.

Left alone, this system never comes back to the tower. A 10 m offset stays at 10 m, and a lateral speed of 1 m/s adds one metre of offset every second, forever. The course reads this from the eigenvalues of the system matrix, which here are zero twice: nothing pulls the state back to equilibrium.

The first question of the course is then controllability: a system is controllable if there is a control that can take it from one state to another in finite time. Kalman's criterion answers it with a rank computation on a matrix built from the model. Here the rank is 2, as many as there are state quantities: by acting on acceleration alone, one can set both the offset and the speed.

The second step is state feedback: the control is computed from the measured state, u = −l1 × d − l2 × v. A theorem from the course (Wonham) says that, if the system is controllable, l1 and l2 can be chosen to impose the desired behaviour. With the recipe given in the revision lecture, a damping ratio of 0.7 and a natural frequency of 1 rad/s, one gets l1 = 1 and l2 = 1.4. A 10 m offset therefore triggers an acceleration of 1 m/s² towards the tower, and the control then brakes as speed builds up.

```figure
file: fig-2.en.svg
caption: Offset from the tower over time, without control and then with state feedback
scroll: The grey line stays at 10 m, then the orange curve brings the offset down to zero in about three seconds.
steps:
- The booster is 10 m away from the tower axis. Without control, this offset does not shrink by itself.
- State feedback computes the lateral thrust from the measured offset and speed.
- With this law, the offset falls back to zero, with a slight overshoot of less than 50 cm.
- After 3 seconds, less than 50 cm of offset remains.
```

## What this says about the diversion

Kalman's criterion assumes that the control can take any value. A rocket does not have that luxury: its thrust is bounded, so is its fuel, and the ground arrives at a fixed time. The practical question therefore becomes: from the current state, with the controls still available and the time that is left, is the tower among the reachable states?

A simple calculation makes this concrete. If lateral acceleration is limited to 2 m/s² and T seconds remain, the best one can do is accelerate for half the time and brake for the other half. The largest recoverable offset is then 2 × T² / 4. With 10 seconds, that is 50 m. A booster that is 30 m off can reach the tower. The same booster 65 m off no longer can, even though the model is still "controllable" according to the criterion. These figures are mine and serve as an illustration; they are not SpaceX's.

```figure
file: fig-3.en.svg
caption: Recoverable lateral offset against time left, for an acceleration limited to 2 m/s²
scroll: The curve separates what can be recovered from what cannot, then two points appear on either side of it.
steps:
- With bounded thrust, the offset that can still be cancelled depends on the time left. It grows as the square of that time.
- Ten seconds from the tower, a 30 m offset lies under the curve. The catch is still possible.
- At that same moment, the limit is 50 m.
- A 65 m offset lies above it. No control brings the booster back to the tower, so it is better to aim for the sea.
```

Seen this way, the diversion is a control decision and not a piloting accident. A launch tower cannot be replaced in a few days, and SpaceX's live commentary did present the outcome as consistent with the safety checks meant to protect the pad. If an engine, a fuel reserve or a measurement leaves its expected range, the guarantee of reaching the tower disappears, and the sea becomes the only safe target.

## What the notion does not say

It does not say what happened on board. The cause was not known when the articles I read were published. The Daily Wire mentions a low-fuel alarm, but neither CBS nor the AP confirms it, and I do not rely on it.

My two-quantity model is also very far from a real booster, which moves in three dimensions, rotates, and gets lighter as it burns its fuel. What is worth remembering fits in one sentence: the controllability criterion of the course answers yes or no for a control without limits, whereas a real vehicle must check at every instant that its target is still reachable with what it has left. The course says so in its own way when it warns that tuning a loop too fast is hard on the actuators.

## Sources

- [CBS News, William Harwood: Starship's 15th flight and the booster diversion (13 November 2026)](https://www.cbsnews.com/news/spacex-launches-starship-flight-rocket/)
- [AP, Marcia Dunn, carried by Live 5 News: the missed double catch (13 November 2026)](https://www.live5news.com/2026/11/13/spacexs-attempt-starship-double-catch-is-thwarted-when-booster-ends-up-gulf-mexico/)
- [AP, carried by the Atlanta Journal-Constitution (updated 14 November 2026)](https://www.ajc.com/news/2026/11/spacexs-starship-soars-into-orbit-after-booster-explosion-prevents-an-unprecedented-double-catch/)
- [Daily Wire: the upper stage catch (14 November 2026)](https://www.dailywire.com/news/spacex-makes-history-with-starship-catch-after-booster-bails-on-landing)
- Course "Commande des systèmes dynamiques" (2A), CentraleSupélec: revision lecture "L'auto pour les (très) nuls" and summary sheets (controllability, Kalman's criterion, state feedback).
