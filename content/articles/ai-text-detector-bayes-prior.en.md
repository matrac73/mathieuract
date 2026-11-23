---
title: "AI text detector: what an alert is really worth"
summary: "OpenAI releases a detector of AI-written text that catches 26% of it and wrongly accuses 9% of human texts. Bayes' theorem tells what an alert is worth."
hook: "When a detector that is wrong on 9% of human texts flags an essay, the student wrote it themselves three times out of four, if only one student in ten uses an AI."
category: "perspective"
date: "2023-01-31"
written: "2023-01"
readingMinutes: 5
course: "Statistiques (3A)"
courseSlug: "statistiques-3a"
news:
  title: "New AI classifier for indicating AI-written text"
  source: "OpenAI"
  url: "https://openai.com/blog/new-ai-classifier-for-indicating-ai-written-text"
  date: "2023-01-31"
---

On January 31, 2023, OpenAI, the company that launched ChatGPT two months earlier, puts online a free tool that reads a text and says whether it was probably written by an AI. The company publishes the performance itself: on a set of English texts, the tool flags 26% of the texts that really were written by an AI, and it wrongly flags 9% of the texts written by humans. It adds that the tool should not be used as a primary decision-making tool. According to TechCrunch, several large American school districts have already banned ChatGPT on their networks, and one can guess that many teachers will try the tool on their students' essays.

## Two figures that do not answer the question

My third-year statistics course gives these two figures a name. The true positive rate (26%) is the probability that a text is flagged given that it comes from an AI. The false positive rate (9%), which the course also calls the false alarm rate, is the probability that a text is flagged given that a human wrote it. Both go from the truth to the alert.

The teacher goes the other way. They have an alert in front of them and want the probability that the essay comes from an AI. Going from one direction to the other is the job of Bayes' theorem, which the course presents as the way to update a belief in light of new evidence. It takes three ingredients: what we believed before observing (the prior probability), the strength of the evidence, and it returns what we should believe afterwards (the posterior probability).

Take 1,000 essays and assume that 100 of them, or 10%, were written by an AI. This figure is an assumption of mine, nobody knows it. The detector flags 26% of the 100 AI essays, which is 26 essays. It also flags 9% of the 900 student essays, which is 81 essays. There are therefore 107 alerts, 26 of them justified: a flagged essay comes from an AI with a probability of 26 / 107 ≈ 24%.

```figure
file: fig-1.en.svg
caption: Out of 1,000 essays, 100 of them AI-written, the detector raises 107 alerts, 81 of which target honest students
scroll: The flagged essays are coloured in each group, then the total number of alerts appears under the rectangle
steps:
- We start from 1,000 essays. The narrow band on the left stands for the 100 essays written by an AI, the rest for the 900 essays written by the students.
- The detector catches 26% of the AI essays. That makes 26 essays rightly flagged.
- It also flags 9% of the student essays. Since there are nine times as many of them, that makes 81 wrong alerts.
- Among the 107 flagged essays, only 26 come from an AI. An alert points to a cheater one time out of four.
```

## Everything depends on what we believed before

The result is surprising because honest students are numerous: 9% of a large group weighs more than 26% of a small one. Bayes' theorem is simple to write with odds, meaning the ratio between the probability that something is true and the probability that it is false. An alert multiplies the odds by 26 / 9 ≈ 2.9, whatever the starting point. With 10% of AI essays, the starting odds are 1 to 9. They become 2.9 to 9, which gives 24% again.

The same detector therefore gives very different answers from one class to another. If one essay in two comes from an AI, an alert takes the probability from 50% to 74%. If one in fifty does, it takes it from 2% to less than 6%. The silence of the tool teaches almost nothing either: with 10% of AI essays at the start, an essay that is not flagged still has an 8% chance of being one, since the tool lets 74 out of 100 through.

```figure
file: fig-2.en.svg
caption: Probability that a flagged text comes from an AI, depending on the share of AI texts before the test
scroll: The detector's curve is drawn above the diagonal, then three reading points appear one after the other
steps:
- The horizontal axis gives what we believe before the test, the vertical axis what we should believe after an alert. On the diagonal, the test would teach nothing.
- The curve of OpenAI's detector runs above the diagonal. An alert raises the probability, but by a limited amount.
- If 10% of the texts come from an AI before the test, an alert takes this probability to 24%.
- If half of the texts do, an alert takes it to 74%.
- To exceed 91% after an alert, we must start from at least 78%. We must already be almost sure for the tool to be enough.
```

## Accusing means choosing a threshold

The course adds a decision rule. A false positive and a false negative do not have the same cost, and we should declare "positive" only if the posterior odds exceed the ratio between these two costs. Suppose that wrongly accusing a student is ten times worse than letting an AI essay through. We then need odds of at least 10 to 1, which is a probability of 91%. Since the alert only multiplies the odds by 2.9, we would have to start from odds of 3.5 to 1, which is 78% of suspicion before even opening the tool.

This explains OpenAI's warning. The company says it set its threshold to keep the false positive rate low, at the price of weak detection. It is the right side to favour, as this calculation shows: at 10% of AI essays, a tool that caught all of them but kept 9% of false alarms would give only 55% of certainty.

```figure
file: fig-3.en.svg
caption: What an alert would be worth with other settings, for 10% of AI essays at the start
scroll: The bars are added one by one, from the current tool to a tool that would raise almost no false alarm
steps:
- With the figures published by OpenAI, a flagged essay comes from an AI with a probability of 24%.
- An imaginary tool that caught every AI essay, with the same false alarms, would only reach 55%.
- Keeping 26% detection but with 1% of false alarms, we would rise to 74%.
- With one false alarm per thousand human texts, we would reach 97%. It is the false alarm rate that makes an alert valuable.
```

## What the calculation does not say

This calculation has two weak points. The first is the prior probability: I do not know how many students use an AI, and the result depends on it entirely. The second is that the 26% and 9% were measured on a specific set of texts. OpenAI warns that the tool is very unreliable below 1,000 characters, worse outside English, and that an edited AI text can escape it. In a real class, both rates may therefore be worse.

I keep one simple rule: a piece of evidence is only worth the ratio between its two rates, and here this ratio is close to 3. An alert from this detector should lead to reading the essay more closely, not to a conclusion.

## Sources

- [OpenAI, "New AI classifier for indicating AI-written text", January 31, 2023](https://openai.com/blog/new-ai-classifier-for-indicating-ai-written-text)
- [TechCrunch, "OpenAI releases tool to detect AI-generated text, including from ChatGPT", January 31, 2023](https://techcrunch.com/2023/01/31/openai-releases-tool-to-detect-ai-generated-text-including-from-chatgpt/)
