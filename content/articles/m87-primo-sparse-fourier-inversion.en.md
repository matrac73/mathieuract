---
title: "The sharper M87 image: what the telescopes did not measure"
summary: "The PRIMO algorithm sharpens the image of the M87 black hole without any new observation. The Fourier inversion theorem shows why that requires adding an assumption to the measurements."
hook: "The new image of the M87 black hole is not a finer photograph: it is a computation that guesses, from simulations, what the telescopes could not measure."
category: "perspective"
date: "2023-04-13"
written: "2023-04"
readingMinutes: 5
course: "CIP (Convergence, Intégration et Probabilités) (1A)"
courseSlug: "cip-convergence-integration-et-probabilites-1a"
news:
  title: "A sharper look at the M87 black hole"
  source: "Institute for Advanced Study"
  url: "https://www.eurekalert.org/news-releases/985842"
  date: "2023-04-13"
---

## What happened

On 13 April 2023, a team led by Lia Medeiros of the Institute for Advanced Study publishes in The Astrophysical Journal Letters a new version of the image of the black hole in the galaxy M87, about 54 million light-years away. There is no new observation: the data are those of 2017, which produced the image released in 2019. Only the computation changes. An algorithm called PRIMO, fed with more than 30,000 simulated images, yields a ring about twice as thin, around a darker central region.

## The notion: an image is a sum of ripples

The CIP course defines the Fourier transform of an integrable function f: Ff(y) = (1/√(2π)) × ∫ f(x) e^(−ixy) dx. In words: for each frequency y, we measure how much f looks like a regular ripple of that frequency. Then comes the inversion theorem: if Ff is integrable too, then f(x) = (1/√(2π)) × ∫ Ff(y) e^(ixy) dy almost everywhere. We get the function back by adding up its ripples. The word that matters is hidden in the ∫ sign: the sum runs over all frequencies.

This theorem describes exactly the work of the Event Horizon Telescope, the network of radio telescopes that observes M87. Two distant dishes, combined, do not see the image: they measure a single value of its Fourier transform, that is, the strength of a single ripple. The farther apart the dishes, the tighter the ripple. The distance is counted in wavelengths, and the network observes at 1.3 mm. A distance of 8 billion wavelengths is 8 × 10⁹ × 1.3 mm ≈ 10,400 km, almost the diameter of the Earth. The matching ripple repeats every 1/(8 × 10⁹) radian, about 26 microarcseconds (µas, the unit of angle used here). The M87 ring is about 42 µas across: it fits in fewer than two of these ripples.

```figure
file: fig-1.en.svg
caption: A pair of telescopes measures a single ripple of the image, tighter as the telescopes move apart
scroll: The two telescopes move apart on the Earth and the stripes across the ring get tighter
steps:
- Two telescopes 4,900 km apart measure the strength of a wide ripple of the image. Its crests are 55 µas apart, more than the ring itself.
- Two telescopes 10,400 km apart, almost the diameter of the Earth, measure a tighter ripple of 26 µas. At this wavelength, this is roughly the finest detail reachable from the ground.
- Each pair gives only one ripple. To apply the inversion theorem, we would need all of them.
```

## What this says about the M87 image

In 2017, the network had seven stations at five sites. The rotation of the Earth moves the pairs as seen from the source, but the result stays thin: a few arcs in the frequency plane, and emptiness around them. The press release speaks of a jigsaw puzzle with missing pieces.

What we know in spite of this can be read on a curve. The scientific paper states that the measured amplitude drops to a first minimum at a distance of 3.75 billion wavelengths, which corresponds to a thin ring of 42 µas. So the diameter is well held by the data. The thickness of the ring, however, is read beyond 5 billion wavelengths, where, according to the authors, the measurements are sparse.

```figure
file: fig-2.en.svg
caption: Fourier transform of a 42 µas ring, computed for two thicknesses: the curves only separate at large distances
scroll: The thin ring curve is drawn, then the thick ring curve, then the zone where they differ lights up
steps:
- For a 42 µas ring, the measured amplitude falls as the telescopes move apart and vanishes near 3.75 billion wavelengths. The position of this zero gives the diameter.
- A ring twice as thick gives almost the same curve up to the zero. It only differs afterwards, with a lower bump.
- So the thickness is read between 5 and 8 billion wavelengths, where measurements are rare. Beyond that, the network measures nothing.
```

The inversion theorem asks for all frequencies, and we have a handful. Several different images are therefore compatible with the same measurements, and any reconstruction must add an assumption to pick one. In 2019, the assumption was generic, for example that two neighbouring pixels have similar brightness. PRIMO takes a more specific one: the image looks like what physics predicts. The algorithm extracts 20 typical patterns from the simulations, then blends them until the measurements are reproduced. Since each pattern ties regions of the frequency plane together, fitting the blend on the measured zones also sets its value in the empty zones.

```figure
file: fig-3.en.svg
caption: PRIMO fills the unmeasured frequencies with patterns learned from simulations
scroll: The measured arcs appear, then the patterns, then the frequency disc fills up and the ring gets thinner
steps:
- The 2017 measurements cover only a few arcs of the frequency plane. With a generic assumption, the 2019 image shows a wide ring.
- More than 30,000 simulated images of black holes are summarised into 20 typical patterns.
- The blend of patterns is fitted on the measured arcs. In doing so it also assigns a value to frequencies that were never observed.
- The resulting image keeps the same diameter, 41.5 µas, with a ring about twice as thin.
```

The result: a diameter of 41.5 ± 0.6 µas, consistent with earlier analyses, and a thickness of 9.6 ± 0.5 µas, less than a quarter of the diameter, where the cautious bound used to be one half.

## What to take away

What I take away is that this image is not a finer measurement, but the same measurement completed by a stronger assumption. The inversion theorem says what is missing, not how to replace it. If the simulations describe the gas around the black hole well, the filled-in frequencies are plausible. If they are wrong, the image inherits their error, and no Fourier formula will flag it.

The authors acknowledge part of this: a structure visible south of the ring is, they write, not required by the data, and it changes with the number of patterns kept. Members of the network who were not part of the study, quoted by Scientific American, welcome the method and ask for more tests. The diameter of the ring is carried by the measurements. Its thickness rests in part on what we already believe about black holes.

## Sources

- [A sharper look at the M87 black hole, Institute for Advanced Study press release (EurekAlert, 13 April 2023)](https://www.eurekalert.org/news-releases/985842)
- [The Image of the M87 Black Hole Reconstructed with PRIMO, Medeiros et al., The Astrophysical Journal Letters (arXiv 2304.06079)](https://ar5iv.labs.arxiv.org/html/2304.06079)
- [See the Sharp New Image of an Iconic Black Hole, Scientific American (13 April 2023)](https://www.scientificamerican.com/article/see-the-sharp-new-image-of-an-iconic-black-hole/)
- [Astronomers Capture First Image of a Black Hole, ESO press release (10 April 2019)](https://www.eso.org/public/news/eso1907/)
