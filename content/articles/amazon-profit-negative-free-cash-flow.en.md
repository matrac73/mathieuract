---
title: "Amazon: a large profit and a shrinking cash pile"
summary: "Amazon earned $134.8 billion over twelve months and still spent $42.4 billion more than it took in. Depreciation explains the gap between the two figures."
hook: "Amazon earns a lot of money and still spends more than it takes in: a data center is paid for at once, but weighs on profit only in slices spread over years."
category: "perspective"
date: "2026-10-29"
written: "2026-10"
readingMinutes: 5
course: "Corporate Finance and Law (2A)"
courseSlug: "corporate-finance-and-law-2a"
news:
  title: "Amazon.com Announces Third Quarter Results"
  source: "Amazon"
  url: "https://aboutamazon.com/news/company-news/amazon-earnings-q3-2026-report"
  date: "2026-10-29"
---

On October 29, 2026, Amazon published its third-quarter accounts. Sales reached $201.9 billion and operating income $28.1 billion, or 13.9% of sales, which the company presents as its highest margin. Yet the same release states that, over the last twelve months, free cash flow was negative by $42.4 billion, when it had been positive by $14.8 billion a year earlier.

So a company can make money and have less of it in the bank. This is neither a mistake nor a trick: the two figures do not measure the same thing, and the corporate finance course I took at CentraleSupélec spends a whole chapter on that difference.

## A cost that is not counted all at once

The income statement is the table that explains the profit of a period. The course splits its expenses into two kinds. Cash expenses, such as wages or rent, reduce profit and the cash balance at the same time. Calculated expenses reduce profit while no money leaves the company. The main one is the depreciation allowance.

Depreciation answers a simple question: when a company buys something that will be used for several years, which year should bear its cost? Accounting answers that the cost must be spread over the period of use. The course takes the example of a car bought for €10,000 at the end of year 0 and depreciated over 5 years. Cash drops by €10,000 on the day of purchase. The profit of year 0 does not move. Then, every year for five years, the income statement carries a €2,000 expense, and the car loses €2,000 of value on the balance sheet: 8,000, 6,000, 4,000, 2,000, then 0.

```figure
file: fig-1.en.svg
caption: The same €10,000 expense, seen by the cash balance and seen by profit
scroll: The expense appears as one block in cash, then as five small slices in profit.
steps:
- The company buys a car for €10,000 at the end of year 0. Cash drops by €10,000 that day.
- The profit of year 0 does not move. For the income statement, the company has swapped money for an asset of the same value.
- Over the next five years, the income statement carries a €2,000 expense each year, while not a single euro leaves. This is the depreciation allowance.
- In total, both tables do count €10,000. Only the timing differs, and that lag is what separates profit from cash.
```

The course sums this up in a sentence I find useful: the result is partly virtual, the cash is real.

## From profit to cash

To follow the money, a third table is needed, the cash flow statement, which separates three families of movements: operations, investment and financing.

Operating cash flow is rebuilt from profit. Start from net income, add back depreciation, since it reduced profit without leaving the bank account, and adjust for payment lags with customers and suppliers. Investment cash flow, for its part, counts equipment purchases when they are paid, in full. The sum of the two is free cash flow: what the company has left once its investments are paid, for instance to repay its debt.

Let us apply this to Amazon, over the twelve months ended late September 2026. Net income is $134.8 billion. Operating cash flow is higher, $168.3 billion, notably because $79.4 billion of depreciation was added back. Equipment purchases, net of disposals, reach $210.7 billion. Free cash flow is therefore 168.3 − 210.7 = −42.4 billion.

```figure
file: fig-2.en.svg
caption: From Amazon's net income to its free cash flow, over twelve months
scroll: The bars add up from left to right until they fall below zero.
steps:
- Over twelve months, Amazon reports a net income of $134.8 billion.
- The money actually brought in by the business is higher, $168.3 billion, because depreciation reduces profit without leaving the bank account.
- But Amazon paid $210.7 billion for equipment, counted here in full, at the time of payment.
- So $42.4 billion is missing. This is free cash flow, negative despite the profit.
```

## What this says about Amazon

The gap comes from a change of pace. In one year, equipment purchases went from $120.1 billion to $215.2 billion, an increase Amazon attributes mainly to artificial intelligence. Depreciation only rose from $61.9 billion to $79.4 billion. This is mechanical: a server bought this year weighs on profit for only a fraction of its price, while the full price has left the bank account.

```figure
file: fig-3.en.svg
caption: Amazon's equipment purchases and depreciation, two twelve-month periods
scroll: Purchases nearly double from one year to the next, while depreciation barely rises.
steps:
- Over the twelve months ended late September 2025, Amazon buys $120.1 billion of equipment and records $61.9 billion of depreciation as an expense.
- One year later, purchases climb to $215.2 billion.
- Depreciation follows from far behind, at $79.4 billion, because each purchase is spread over several years.
- The gap, about $136 billion, is spending already paid that has not yet reduced profit. It will do so in the coming years.
```

Two consequences follow. The first is immediate: the money has to come from somewhere else. Over the same period, Amazon borrowed $130.0 billion in long-term debt. The second is deferred. The equipment paid for today will turn into depreciation expenses for years, whether sales follow or not. Today's profit does not yet carry the full cost of the current investment, and the company expects about $220 billion of capital spending in 2026.

## What the notion does not say

Depreciation describes a schedule, not a verdict. A negative free cash flow does not mean Amazon is in trouble: a company that invests heavily has this profile, and everything depends on what these data centers will bring in. To judge that, the course offers another tool, net present value, which compares the initial outlay with future receipts brought back to today's value.

It is also worth remembering that the depreciation period is an accounting choice. Spreading a server over more years lightens the yearly expense and raises profit, without changing anything in the bank account. That is a reason to read the two tables together. Finally, the depreciation figure Amazon publishes also bundles other items, such as video content and leases: the $136 billion gap is an order of magnitude, not an exact measure.

## Sources

- [Amazon, third quarter 2026 results](https://aboutamazon.com/news/company-news/amazon-earnings-q3-2026-report)
- [Full release with financial tables, Business Wire via Finviz](https://finviz.com/news/412054/amazoncom-announces-third-quarter-results)
- "Corporate Finance and Law" course, CentraleSupélec: chapter on depreciations and provisions, and the finance revision sheet
