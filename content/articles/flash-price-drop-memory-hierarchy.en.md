---
title: "Flash gets cheaper, RAM does not: the memory hierarchy"
summary: "Storage chip prices lost 20% in two weeks while main memory barely moved. The memory hierarchy, taught in first year, explains why one cannot replace the other."
hook: "Storage chips are getting cheaper while main memory stays expensive, because a computer cannot swap one for the other: storage is thousands of times slower."
category: "perspective"
date: "2026-11-17"
written: "2026-11"
readingMinutes: 5
course: "SIP (Systèmes d_Information et Programmation) (1A)"
courseSlug: "sip-systemes-d-information-et-programmation-1a"
news:
  title: "NAND Spot Prices Reverse Course, Sliding 20% in 2 Weeks amid Weak Consumer Demand, YMTC Competition"
  source: "TrendForce"
  url: "https://www.trendforce.com/news/2026/11/17/news-nand-spot-prices-reverse-course-sliding-20-in-2-weeks-amid-weak-consumer-demand-ymtc-competition/"
  date: "2026-11-17"
---

For more than a year, memory chips have been scarce and their prices have been rising, pulled up by the data centres of artificial intelligence. On 17 November, the research firm TrendForce reported a first crack: NAND flash memory, the kind used for storage in phones and SSDs, lost about 20% in two weeks on the spot market, meaning the market where chips are bought for immediate delivery. Main memory, or DRAM, is not following.

## What happened

According to Bank of America figures relayed by TrendForce, a wafer of 512-gigabit NAND chips is worth 14.30 dollars, 32% less than in the previous quarter. The reasons given are on the demand side: phones and PCs are selling less well, manufacturers are trimming the storage capacity of their models, and Chinese traders are clearing their inventories.

DRAM tells a different story. According to TechRadar, which quotes the TrendForce bulletin for the week to 17 November, mainstream DDR4 slipped by only 1.43% on the spot market, and DDR5 stayed roughly stable. Contract prices, the ones large buyers pay, are still going up: Bank of America still forecasts an 8% rise this quarter. Fortune recalls that a 16-gigabit DDR5 chip went from 8.70 dollars in October 2025 to 48 dollars in September 2026.

```figure
file: fig-1.en.svg
caption: In November 2026, the price of flash memory drops, the price of main memory hardly does
scroll: The two bars appear one after the other, the tall one for flash, the very small one for DRAM
steps:
- We measure the change in the spot price, the price of a purchase delivered right away.
- NAND flash memory, the one used for storage, loses about 20% in two weeks.
- DRAM, the main memory, gives up only 1.43% in one week for DDR4.
- And in the contracts of large buyers, DRAM is still rising, with an 8% increase forecast this quarter.
```

A question follows naturally. If storage is getting cheaper and main memory remains very expensive, why not fit more of one and less of the other?

## The memory hierarchy

The first-year SIP course answers with a table that students learn early: the memory hierarchy. A computer does not have one memory but several, ordered by their distance to the processor.

Right next to the processor are the registers and the cache memory. The course notes describe them as "small but very fast": a cache access takes 1 to 12 nanoseconds (billionths of a second), at a cost of around 5,000 euros per gigabyte. Next comes the main memory, or RAM, which holds the programs currently running: 5 to 40 nanoseconds per access, 2.5 to 18 euros per gigabyte. At the bottom are hard drives and SSDs: 85 microseconds to 16 milliseconds per access, but only 0.02 to 0.44 euro per gigabyte. These prices are those of the course notes, not of the 2026 market, but what matters is the order of the levels.

```figure
file: fig-2.en.svg
caption: The memory hierarchy from the course, with the access time and cost of each level
scroll: The levels stack up from the processor down to the disk, then the speed gap between RAM and disk appears in orange
steps:
- Next to the processor, registers and cache are tiny, very fast and very expensive.
- Main memory holds the running programs. It answers in 5 to 40 nanoseconds.
- The hard drive or SSD keeps data when the power is off. It is far cheaper, but answers in microseconds.
- Between the slowest RAM access and the fastest disk access, there is already a factor of 2,000.
```

Each level therefore trades speed for price. The course also gives the reason why a program is copied from the disk into RAM before it runs: main memories are "much faster than disks". With the figures in the table, 85 microseconds divided by 40 nanoseconds gives a little over 2,000, and that is the case most favourable to the disk.

## Why cheap flash does not relieve RAM

Let us take a worked example, with values chosen inside the ranges of the course. A RAM access costs 20 nanoseconds, an SSD access 100 microseconds, that is 100,000 nanoseconds. Imagine a machine from which a little RAM is removed, so that 1% of its accesses have to fetch the data from the SSD. The average access time becomes 0.99 × 20 + 0.01 × 100,000 ≈ 1,020 nanoseconds. The machine is about 50 times slower, although 99% of its accesses have not changed.

```figure
file: fig-3.en.svg
caption: Average access time when a small share of accesses moves from RAM (20 ns) to the SSD (100 µs)
scroll: A straight line rises from the bottom left corner, then an orange dot marks the case where 1% of accesses go to the SSD
steps:
- When all the data fits in main memory, an access takes 20 nanoseconds.
- Each access sent to the SSD costs 100,000 nanoseconds. The average climbs in a straight line.
- With only 1% of accesses on the SSD, the average reaches about 1,020 nanoseconds, 50 times more.
```

This is what the hierarchy makes clear about the news. Flash and DRAM are not two grades of the same product, but two levels that do not do the same job. A phone maker can reduce storage when it costs too much, and that is what TrendForce describes. It cannot make up for a lack of main memory with storage that has become affordable. A price drop on one level is therefore not passed on to the other, and the two prices can diverge for a long time.

## What the notion does not say

The hierarchy explains why demand does not slide from one chip to the other. It says nothing about the level of prices, which depends on supply. On that point, the sources give two elements that the course does not contain. First, the DRAM market is held by three manufacturers, against six for NAND. Second, the HBM memory made for AI chips uses, according to a TrendForce analyst quoted by TechRadar, three to four times more production capacity than ordinary DRAM, which leaves less room for the latter.

Proportions also matter: for now the drop concerns the spot market, which is only a small share of volumes. Shop prices follow with a delay.

What I take away is that the first-year table, which looks like a simple list of components, in fact describes a constraint: you cannot go down a level without paying in time.

## Sources

- [TrendForce, "NAND Spot Prices Reverse Course, Sliding 20% in 2 Weeks amid Weak Consumer Demand, YMTC Competition", 17 November 2026](https://www.trendforce.com/news/2026/11/17/news-nand-spot-prices-reverse-course-sliding-20-in-2-weeks-amid-weak-consumer-demand-ymtc-competition/)
- [TechRadar, "NAND prices could finally be set to fall, but DRAM is refusing to budge so far", 24 November 2026](https://www.techradar.com/pro/nand-prices-could-finally-be-set-to-fall-in-the-first-bit-of-good-news-for-component-fans-for-some-time-but-dram-is-refusing-to-budge-so-far)
- [Fortune, "Memory chip CEO warns 2027 shortage will be so bad that 'even money can't buy goods'", 10 November 2026](https://fortune.com/2026/11/10/team-group-ceo-memory-chip-shortage-2027-even-money-cant-buy-goods/)
