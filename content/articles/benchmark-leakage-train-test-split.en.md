---
title: "When the AI has already seen the exam paper"
summary: "A preprint shows language models reciting the questions of their own evaluation tests. The split between training data and test data explains why their scores then mean very little."
hook: "When an AI model has already seen the exam questions during its training, its grade measures its memory and not what it can do, and a whole ranking can flip."
category: "perspective"
date: "2026-11-16"
written: "2026-11"
readingMinutes: 5
course: "Machine Learning (2A)"
courseSlug: "machine-learning-2a"
news:
  title: "Benchleaking Is Accelerating: Benchmark contamination has worsened sharply in the past month"
  source: "arXiv"
  url: "https://arxiv.org/abs/2611.21315"
  date: "2026-11-16"
---

On 16 November 2026, eight researchers posted a preprint on arXiv, meaning a paper that has not yet been peer reviewed, about what they call "benchleaking": the questions of an evaluation test end up in the data used to train the model. They probed four public language models on twenty common tests. One of them, ERNIE-5.5-Flash-Base, reproduces word for word 96.3% of the problems in HumanEval, a programming test, although it was not shown them. Another, DeepSeek-V4-Flash-Base, reproduces only 9.1%.

## The basic rule: never revise on the exam paper

The Machine Learning course sets this rule in its first assignment. A dataset is cut in two: 90% for training, 10% for testing, and the model's error must be reported on both parts. The model adjusts its parameters on the first part. The second has a single purpose: to estimate how the model will behave on data it has never met.

```figure
file: fig-1.en.svg
caption: The train / test split, and what a leak does to it
scroll: The dataset is cut in two, the model learns on one part and is graded on the other, then an orange arrow moves the test over to the training side
steps:
- We start from a complete dataset, where each question comes with its answer.
- We cut it in two. In the course assignment, 90% goes to training and 10% is set aside for the test.
- The model adjusts its parameters on the training part, and on that part only.
- We then ask it the test questions. The score estimates what it will do on new data.
- If the test questions have leaked into training, the score is inflated by answers already seen and no longer estimates anything of the kind.
```

Why this precaution? Because training error is too flattering a measure. The course has students check two limiting cases: a nearest-neighbour classifier with k = 1, which answers by copying the label of the closest known example, always has zero error on its training examples. So does a decision tree whose depth is allowed to grow. These models have not understood anything in particular: they have enough capacity to retain everything.

A course answer key sums up the normal situation: training error should be smaller than test error, and as model complexity increases, the first keeps falling while the second falls at first and then rises again. This gap is called overfitting: the model sticks to its examples and generalises less well.

```figure
file: fig-2.en.svg
caption: Training error and test error as model complexity increases
scroll: The training curve drops towards zero, the test curve rises again, then an orange curve shows test error collapsing when the test has already been seen
steps:
- The more complex the model, the lower its error on the training examples. It can reach zero, as with the nearest neighbour.
- Test error falls at first, then rises: the model retains its examples instead of drawing a rule from them.
- The gap between the two curves is overfitting. We only see it because the test was kept apart.
- If the test was seen during training, its error follows the training curve. The gap disappears from the chart, not from reality.
```

## What the leak does to the grade

A large language model has more than enough capacity to memorise a test of 164 problems such as HumanEval. If these problems and their solutions are in its training data, they become training examples in practice, and the score measured on them is a training error in disguise.

A small calculation of my own gives the order of magnitude. Suppose a model can solve 60% of new problems, and half of the test has leaked and is recited flawlessly. The displayed score is 0.5 × 100% + 0.5 × 60% = 80%. Twenty points come from memory.

To detect the leak, the authors show the model a few solved questions, then let it write beyond its answer. Some models then carry on with other questions from the same test, answers included. A question is called "leaked" only if it matches the test exactly.

They then propose a corrected score, which they name "Anti-Hack": the grade is recomputed with every leaked question counted as wrong. For ERNIE on HumanEval, 96.3% of 164 problems is about 158. That leaves 6, and the grade goes from 100 to 3.66, which is 6 / 164. Averaged over the twenty tests, this model falls from 85.17 to 68.55, while DeepSeek loses only 1.5 points.

```figure
file: fig-3.en.svg
caption: Average score of the four models, before and after counting leaked questions as wrong (data from the preprint)
scroll: The grey bars of the published scores appear, then the corrected bars, and ERNIE's bar, in orange, drops below all the others
steps:
- Published average scores over twenty tests. ERNIE-5.5-Flash-Base is first with 85.2, ahead of three models grouped around 78 to 80.
- Every question the model can recite is counted as wrong. Three models lose between 1.3 and 5 points.
- The same calculation brings ERNIE down to 68.6.
- It loses 16.6 points and goes from first place to last. The ranking depended on the leak.
```

## What the notion does not say

The corrected score is a floor, not the true value. A model that recites a problem might have been able to solve it without having seen it: ERNIE's real ability on HumanEval lies somewhere between 3.66 and 100, and these numbers do not say where.

Conversely, an undetected leak does not prove there is no leak. The authors acknowledge it: their criterion ignores reworded questions, and a measured rate of zero does not establish that the training data were clean.

My takeaway is that the rule from the course's first assignment is the hardest one to keep at large scale. On a small file, setting 10% aside is trivial. When training draws on the web and the tests are published there, nobody quite knows what the model has seen. A grade that does not say so should be read with caution, as a possible training error.

## Sources

- [Benchleaking Is Accelerating (arXiv:2611.21315, abstract)](https://arxiv.org/abs/2611.21315)
- [Benchleaking Is Accelerating (full text, version 1)](https://arxiv.org/html/2611.21315v1)
