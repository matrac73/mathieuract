---
title: "Silicon qubits at 1.5 kelvin: what the Boltzmann distribution rules out, and how to work around it"
summary: "Two teams run silicon qubits above 1 kelvin. The Boltzmann distribution shows why cold alone can no longer prepare a spin at that temperature, and why the readout method had to change."
hook: "At 1.5 degrees above absolute zero, cold alone can no longer put a quantum bit into a known state: the researchers had to prepare it and read it another way."
category: "perspective"
date: "2020-04-15"
written: "2020-04"
readingMinutes: 5
course: "Physique quantique et statistique (1A)"
courseSlug: "physique-quantique-et-statistique-1a"
news:
  title: "Hot qubits break one of the biggest constraints to practical quantum computers"
  source: "UNSW Sydney (press release, EurekAlert)"
  url: "https://www.eurekalert.org/news-releases/575169"
  date: "2020-04-15"
---

## What happened

On 15 April 2020, the journal Nature publishes two papers on "hot qubits" back to back. A qubit is the building block of a quantum computer: an object with two states that one can prepare, manipulate and read back. Andrew Dzurak's team at the University of New South Wales (UNSW, Sydney) runs a cell of two silicon qubits at 1.5 kelvin, that is 1.5 degrees above absolute zero. Menno Veldhorst's team in Delft performs an operation between two qubits at 1.1 kelvin.

"Hot" is relative. But the superconducting qubit chips from Google or IBM need about 0.1 kelvin, fifteen times lower. According to the UNSW release, 1.5 kelvin can be reached with a few thousand dollars of refrigeration, against millions for 0.1 kelvin. Heat is the other issue: every added pair of qubits produces some, and the coldest refrigerators remove very little. At a higher temperature, the control electronics could sit next to the qubits.

## The notion: the Boltzmann distribution

In these chips, the qubit is carried by the spin of electrons trapped in a quantum dot, a tiny trap built into the silicon. The spin behaves like a small magnetic needle. In a magnetic field it has only two possible states: aligned with the field (low state, less energy) or opposed to it (high state). The energy gap between the two is ΔE = h × f, where h is Planck's constant and f the frequency at which the qubit is driven.

The statistical physics course says what happens to such a system when it sits in surroundings at temperature T. It postulates that the probability of a state of energy E is proportional to exp(−E / kT), where k is Boltzmann's constant (1.38 × 10⁻²³ J/K). The product kT is the typical energy of thermal agitation. For two states, the formula reduces to this: the probability of finding the spin low is 1 / (1 + exp(−ΔE / kT)). Everything depends on a single ratio, ΔE / kT.

Take a setting described by the Australian team: a field of 0.1 tesla, which means a frequency of 3.5 GHz. The gap is ΔE = 6.63 × 10⁻³⁴ × 3.5 × 10⁹ ≈ 2.3 × 10⁻²⁴ J. At 1.5 kelvin, kT ≈ 2.1 × 10⁻²³ J, about nine times more.

```figure
file: fig-1.en.svg
caption: The energy gap between the two spin states, compared with the thermal agitation kT at two temperatures
scroll: Two bars appear next to the two spin levels: thermal agitation at 0.1 K, then at 1.5 K, nine times taller than the gap.
steps:
- In a magnetic field, the spin has two states. At 3.5 GHz they are separated by ΔE ≈ 2.3 × 10⁻²⁴ joule, the height of the dotted line.
- At 0.1 kelvin, the thermal agitation kT is about 0.6 times that gap. The surroundings rarely have enough to lift the spin into the high state.
- At 1.5 kelvin, kT is about nine times the gap. As far as thermal agitation is concerned, the two states are almost level.
```

## What the notion explains

Put these ratios into the formula. At 0.1 kelvin, ΔE / kT ≈ 1.7 and a spin left at equilibrium is found low 84 times out of 100. At 1.5 kelvin, ΔE / kT ≈ 0.11 and the probability falls to 53%. That is almost a coin toss.

```figure
file: fig-2.en.svg
caption: Probability of finding the spin in the low state at thermal equilibrium, for a gap corresponding to 3.5 GHz
scroll: The curve starts at 100% near absolute zero, drops quickly, then runs along the 50% line; two points mark 0.1 K and 1.5 K.
steps:
- A computation starts with a qubit in a known state. At 50%, the starting state is a coin toss and the computation means nothing.
- The Boltzmann distribution gives the curve. Near absolute zero the spin is certainly low, then the certainty collapses within a few tenths of a kelvin.
- At 0.1 kelvin, a spin left to itself is low 84 times out of 100.
- At 1.5 kelvin, it is low only 53 times out of 100. Waiting for the cold to settle the spin yields almost nothing.
```

This is the real obstacle. A computation starts with qubits in a known state, and the simplest way to get there is to let the cold do the work. At 1.5 kelvin, Boltzmann says that road is closed. The authors write it themselves: in this setting, the qubit energy is well below the thermal energy.

Their answer is to stop relying on thermal equilibrium. The two quantum dots are cut off from the neighbouring electron reservoir, and both preparation and readout rely only on an electron hopping from one dot to the other. That hop obeys a quantum rule, Pauli spin blockade: two electrons can share the same dot only if their spins are opposite. Watching whether the electron crosses therefore amounts to comparing the two spins with each other. The temperature of the surroundings is no longer part of the question being asked.

```figure
file: fig-3.en.svg
caption: Readout by spin blockade: an electron joins the neighbouring dot only if the two spins are opposite
scroll: In the left case an arrow carries the electron from one dot to the other; in the right case the arrow hits a cross; the conclusion appears at the bottom.
steps:
- Two neighbouring quantum dots each hold a spin. On the left the two spins are opposite, on the right they are identical.
- Opposite spins: the electron in dot 2 can join dot 1. That movement is detected.
- Identical spins: Pauli's rule forbids the two electrons from sharing the dot. Nothing moves.
- The result depends on the relative orientation of the two spins, not on an equilibrium with an electron reservoir. So the method holds at 1.5 kelvin.
```

## What the notion does not say

The Boltzmann distribution describes an equilibrium. It explains why the cold no longer prepares the qubit, but it says nothing about how long a state prepared some other way remains usable. That is where the heat has a price. The Sydney team reports single-qubit operations with 98.6% fidelity and a state that holds for about 2 microseconds. The Delft team reaches 99.3% on one qubit. Lee Bassett, of the University of Pennsylvania, points out in IEEE Spectrum that other technologies hold for about a hundred microseconds.

I take two things from this. The first is that a three-line calculation is enough to see why 1.5 kelvin is not just a variant of 0.1 kelvin: the ratio ΔE / kT moves to the other side of 1, and the method has to change with it. The second is scale. This is two qubits, whereas a useful machine would need millions, and the release itself places it at least ten years away.

## Sources

- [Hot qubits break one of the biggest constraints to practical quantum computers, UNSW press release, EurekAlert, 15 April 2020](https://www.eurekalert.org/news-releases/575169)
- [Quantum computing milestone: researchers compute with hot silicon qubits, IEEE Spectrum, 15 April 2020](https://spectrum.ieee.org/amp/quantum-computing-milestone-researchers-compute-with-hot-silicon-qubits-2650279920)
- [Yang et al., Silicon quantum processor unit cell operation above one Kelvin, Nature 580, 350-354 (2020), arXiv version](https://arxiv.org/abs/1902.09126)
- [Petit et al., Universal quantum logic in hot silicon qubits, Nature 580, 355-359 (2020), arXiv version](https://arxiv.org/abs/1910.05289)
