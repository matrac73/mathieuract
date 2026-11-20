---
title: "Talking to a satellite with a utility-meter chip: what Shannon allows"
summary: "Iridium opens a satellite service for standard connected devices. The capacity of the Gaussian channel explains why it carries short messages and why a narrow band costs it almost nothing."
hook: "A connected device can now talk to a satellite 780 km away, but only in short messages: at that distance the received signal is so weak that physics caps the data rate."
category: "perspective"
date: "2026-11-17"
written: "2026-11"
readingMinutes: 5
course: "Théorie de l_Information (1A)"
news:
  title: "Iridium Launches Service for Iridium NTN Direct; Its Standards-Based D2D Offering"
  source: "Via Satellite"
  url: "https://satellitetoday.com/connectivity/2026/11/17/iridium-launches-service-for-iridium-ntn-direct-its-standards-based-d2d-offering"
  date: "2026-11-17"
---

## What happened

On 17 November, the American operator Iridium opened Iridium NTN Direct for commercial service. It links connected devices directly to its constellation of 66 satellites, which orbit at an altitude of 780 km. What is new is that it follows a mobile-phone standard, NB-IoT, designed for low-power sensors: an off-the-shelf chip such as Nordic Semiconductor's nRF9151 module will be able to connect after a firmware update announced for January 2027, with no change of hardware.

The uses listed are modest: watches, emergency beacons, fleet tracking, meters, livestock collars. Consumer phones are not the target, and nobody mentions video. Neither the press release nor the trade press gives a data rate. On a ground network, NB-IoT occupies 180 kHz and tops out at a few tens of kilobits per second. I wondered whether choosing a narrow band was a constraint to live with or a sound decision. The first-year information theory course gives the answer.

## The notion: the capacity of the Gaussian channel

The course models a radio link as a Gaussian channel: what you receive is the transmitted signal plus random noise, the noise of electrons jiggling with heat inside the receiver. Shannon showed that this channel has a capacity, meaning a maximum rate below which you can transmit without error and above which you cannot, whatever the coding.

For a signal with received power P, occupying a bandwidth W, with noise of density N0 per hertz, the course gives:

C = W × log2(1 + P / (W × N0))

The quotient P / (W × N0) is the signal-to-noise ratio. It is often expressed in decibels (dB): 10 dB more means ten times more signal.

The course gives three examples. A telephone line: 3.3 kHz and 33 dB, hence 36 kbit/s. Wi-Fi: 40 MHz and 30 dB, hence 400 Mbit/s. 4G: 20 MHz and 20 dB, hence 133 Mbit/s. It adds a remark: when the signal-to-noise ratio is large, capacity grows only as its logarithm, and when it is small, capacity is roughly proportional to it.

```figure
file: fig-1.en.svg
caption: Maximum rate per hertz of bandwidth as a function of the signal-to-noise ratio, from Shannon's formula
scroll: The curve is drawn, the three course examples land on it, then an arrow carries 4G all the way to the left, where the satellite link sits.
steps:
- Shannon's formula gives the maximum rate per hertz of bandwidth. On the right the curve climbs slowly; on the left it hugs zero.
- The three course examples are all on the right. With 20 dB, 4G carries nearly 7 bits per second in each hertz.
- A satellite at 780 km is 260 times farther than an antenna 3 km away. Received power is divided by 260², which is 48 dB less.
- The link drops to −28 dB. Each hertz now carries only 0.002 bit per second, three thousand times less than 4G.
```

## What the formula says about the satellite

Let us do the calculation, as an order of magnitude. I start from the course's 4G example and assume it corresponds to an antenna 3 km away. A radio wave thins out as the square of the distance. At 780 km we are 260 times farther, so the received signal is 260² ≈ 68,000 times weaker, or 48 dB less. The signal-to-noise ratio goes from 20 dB to −28 dB: the signal is about 600 times weaker than the noise.

The formula then gives, over the same 20 MHz, 20,000,000 × log2(1.0016) ≈ 46 kbit/s. We have gone from 133 Mbit/s to 46 kbit/s. That is the order of magnitude of NB-IoT, not of a video stream.

The interesting result comes next. If I concentrate the same power into 180 kHz instead of 20 MHz, the signal-to-noise ratio climbs back to −7.5 dB and the capacity is 180,000 × log2(1.18) ≈ 42 kbit/s. The band is 111 times narrower and the maximum rate falls by only 8%.

```figure
file: fig-2.en.svg
caption: Maximum rate as a function of bandwidth, at fixed received power (that of the satellite link in the example)
scroll: The curve rises then flattens under a ceiling; two points appear, one at 20 MHz and one at 180 kHz, almost at the same height.
steps:
- At fixed received power, widening the band first raises the maximum rate, then less and less.
- The curve runs into a ceiling that depends only on received power and noise, here 46 kbit/s.
- With the 20 MHz of a 4G band, we touch that ceiling.
- With 180 kHz, the width of NB-IoT, we already reach 42 kbit/s. The narrow band costs almost nothing.
```

The course writes it in one line: when the band becomes very wide, and so the signal-to-noise ratio very low, capacity tends to (P / N0) × log2(e), that is 1.44 × P / N0. Bandwidth has dropped out of the formula. In this regime, only the energy you manage to collect matters. A narrowband standard, designed for simple and frugal chips, is therefore well suited to satellites: it gives up only a rate that physics was not offering.

## What to take away

The course stresses the diminishing returns of power: doubling it on a 4G network adds only 15% to the rate. For the satellite it is the opposite. We are on the linear part of the curve, and each doubling of received power doubles the rate. That is why all the effort goes into antennas and altitude, and not into buying more spectrum.

```figure
file: fig-3.en.svg
caption: Effect of doubling received power on the maximum rate, for a 4G network and for the satellite link in the example
scroll: Two grey bars give the starting rate; the 4G bar barely grows when power doubles, the satellite bar doubles in height.
steps:
- Two links over 20 MHz. The bars are not on the same scale: 133 Mbit/s for 4G, 46 kbit/s for the satellite.
- We double the received power in 4G. The maximum rate gains only 15%.
- We double the received power from the satellite. The maximum rate doubles. Every decibel gained at the antenna shows up in the rate.
```

My calculation remains an order of magnitude. The 3 km is an assumption of mine. A satellite antenna concentrates its energy into beams, which recovers part of the 48 dB. In the other direction, the device transmits with 200 mW at most (23 dBm in the standard), which makes the uplink tighter still. Finally, capacity is an upper bound, which the course says is reached under ideal coding conditions, and Iridium has not published the actual rate of its service. So the formula does not predict that rate. It says why it is counted in kilobits, and why the standard is not what limits it.

## Sources

- [Via Satellite, "Iridium Launches Service for Iridium NTN Direct; Its Standards-Based D2D Offering", 17 November 2026](https://satellitetoday.com/connectivity/2026/11/17/iridium-launches-service-for-iridium-ntn-direct-its-standards-based-d2d-offering)
- [Iridium press release of 17 November 2026, as carried by Finviz](https://finviz.com/news/423847/iridium-activates-iridium-ntn-direct-worlds-first-standards-based-nb-iot-and-d2d-service-with-truly-global-coverage)
- [SatNews, "Iridium Activates Commercial Service on Standards-Based NB-IoT Direct-to-Device Network", 18 November 2026](https://satnews.com/2026/11/18/iridium-activates-commercial-service-on-standards-based-nb-iot-direct-to-device-network/)
- [eoPortal, Iridium NEXT constellation page (66 satellites, 780 km)](https://www.eoportal.org/satellite-missions/iridium-next)
- [Wikipedia, "Narrowband IoT" (bandwidth, rates, transmit power)](https://en.wikipedia.org/wiki/Narrowband_IoT)
