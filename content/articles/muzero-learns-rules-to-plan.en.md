---
title: "MuZero: learning the rules in order to think ahead"
summary: "DeepMind publishes in Nature a program that plays Go, chess and 57 Atari games without knowing their rules. The reinforcement learning chapter of my course shows what is new about it."
hook: "MuZero plays Go and chess at the highest level without being given the rules: it learns to predict the effect of its moves, which lets it think before it plays."
category: "perspective"
date: "2020-12-23"
written: "2020-12"
readingMinutes: 5
course: "Data Analysis and Machine Learning (3A)"
courseSlug: "data-analysis-and-machine-learning-3a"
news:
  title: "MuZero: Mastering Go, chess, shogi and Atari without rules"
  source: "DeepMind"
  url: "https://deepmind.google/discover/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/"
  date: "2020-12-23"
---

On 23 December 2020, the DeepMind laboratory publishes in the journal Nature the full description of MuZero, a program whose first version had been circulating since 2019. MuZero matches AlphaZero, the laboratory's previous program, at Go, chess and shogi, and it sets the best known result on a suite of 57 Atari video games. The difference fits in one sentence: AlphaZero was given the rules of each game, MuZero is not.

## Deciding when you know the rules

My third-year course devotes a chapter to reinforcement learning, which is the art of learning a good sequence of decisions by trial and error. The setting is simple. An agent is in a state (a position on a board, a cell of a maze). It chooses an action. The environment returns a new state and a reward, positive or negative. Two functions therefore describe the game entirely: the one that gives the next state and the one that gives the reward. These are the rules.

The course takes the example of a maze where each move costs 10 and the exit pays 200. I keep a version reduced to a corridor. The value of a cell is the total reward one can expect starting from there, a future gain being counted at 90% of its amount for each step of waiting. One step from the exit, the value is 200. Two steps away, it is −10 + 0.9 × 200 = 170. Three steps away, −10 + 0.9 × 170 = 143.

```figure
file: fig-1.en.svg
caption: When the rules are known, the value of each cell is computed backwards from the exit
scroll: The values fill in cell after cell, from the exit to the far end of the corridor
steps:
- A corridor of four cells leads to the exit. Each step costs 10, the exit pays 200, and a gain to come counts for 90% of its amount.
- One step from the exit, there is nothing to compute. The cell is worth 200.
- Two steps away, you pay 10 and then stand on a cell worth 200. The cell is worth 170.
- The same calculation is repeated one cell further, relying on the value just found.
- All the values are known without taking a single step. This calculation requires knowing the rules in advance.
```

The course calls this calculation dynamic programming. It works without ever playing, but it assumes that one knows in advance where each action leads and what it pays.

## Learning by feel

When the environment is unknown, the course presents another algorithm, Q-learning. The agent keeps a table that scores the quality of each action in each state. It plays, observes the reward and the state it lands in, then corrects the relevant score by taking a step towards what it has just observed. In the corridor, two steps from the exit, with a starting score of 0 and a correction step of one half, the score becomes 0.5 × 0 + 0.5 × (−10 + 0.9 × 200) = 85. On the next pass it rises to 127.5, and it gradually approaches 170.

This method has two limits. The table has one row per state: the maze in the course has 25, a Go board or a video game screen has far too many. Above all, the agent foresees nothing. It knows that an action worked well in the past, without being able to imagine what will happen three moves later. The course says it in its own way: reinforcement learning is not planning, because the environment is only imperfectly known.

## MuZero builds its own rules

The course points out that any algorithm of this kind must choose a way to represent the environment and to update it after each observation. Q-learning chooses a table of scores. MuZero chooses to rebuild the two missing functions.

A neural network turns what the program observes into an internal state. A second one predicts, for a given action, the next internal state and the reward. A third one estimates the value of the position and the moves worth examining. The program does not try to reproduce the screen frame by frame. It only learns the three quantities that are useful for deciding: reward, value and choice of move. With them, it unrolls a tree of imagined moves, as AlphaZero did with the real rules.

```figure
file: fig-2.en.svg
caption: MuZero imagines the rest of the game inside a model it has learned, then chooses its move
scroll: The tree of imagined moves unfolds to the right, then the chosen branch turns orange
steps:
- The program translates what it observes into an internal state, a list of numbers that it has learned to build by itself.
- For each possible move, it predicts the next state and the immediate reward. No rule was supplied, these are its own predictions.
- It also predicts the value of each imagined state, meaning what one can expect to win afterwards. The figures in the diagram are made up for the example.
- It starts again from the imagined states and thus explores several moves ahead.
- Move B pays nothing right away but leads to a better position. It is the one that gets played.
```

The published results show that this thinking matters. At Go, MuZero's strength increases by more than 1,000 Elo points when the time allowed per move goes from 0.1 to 50 seconds, which DeepMind compares to the gap between a strong amateur and the strongest professional. According to the laboratory, this progression almost exactly follows that of AlphaZero, which nevertheless has a perfect simulator. The learned model therefore replaces the rules with no visible loss.

```figure
file: fig-3.en.svg
caption: Four methods, according to whether they are given the rules and whether they look ahead before acting
scroll: The rows of the table appear one by one, down to MuZero's
steps:
- The dynamic programming of the course computes the best decision in advance, provided it is given the rules.
- Q-learning does without the rules, but it foresees nothing. It only records what worked.
- AlphaZero looks several moves ahead, because it was given the rules of Go, chess and shogi.
- MuZero fills the cell that was left empty. It learns the rules by playing, then uses them to look ahead.
```

## What this does not say

What I take away is that the line the course draws between a known and an unknown environment is not fixed: one can learn a model, then reason on it as if it had been given. DeepMind sees this as a step towards real problems, where nobody supplies the rules.

Some reservations remain. The games tested give a clear score and can be replayed as many times as needed, which is rare outside a computer. MuZero's model is only good for the situations it has encountered, and nothing guarantees its predictions elsewhere. The course recalls that the convergence guarantees of Q-learning already rest on assumptions. For a model learned by a neural network, the proof remains, at this stage, the outcome of the games.

## Sources

- [DeepMind, "MuZero: Mastering Go, chess, shogi and Atari without rules", 23 December 2020](https://deepmind.google/discover/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/)
- [Schrittwieser et al., "Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model", arXiv:1911.08265](https://arxiv.org/abs/1911.08265)
