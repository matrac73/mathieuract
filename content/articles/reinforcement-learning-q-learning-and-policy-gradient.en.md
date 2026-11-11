---
title: "Reinforcement learning: Q-learning and policy gradient"
summary: "Two ways to teach an agent by trial and error, explained on a small grid world with obstacles."
category: "data-science"
date: "2026-11-10"
written: "2023-06"
scene: "maze"
readingMinutes: 5
order: 6
---

Reinforcement learning is the branch of machine learning with no dataset. An agent acts, the environment answers with a reward, and the agent has to work out which behaviour pays off over time. To understand it, I implemented the two classic approaches on the same toy problem.

## The setting: a grid world

A 10 x 10 grid. The agent starts in one corner and must reach a goal cell. Some cells are obstacles.

- **State**: the agent's position.
- **Actions**: up, down, left, right.
- **Rewards**: +1 for reaching the goal, -1 for hitting an obstacle (the episode ends in both cases), and -0.1 for every other step.

That small step penalty matters: without it, wandering forever costs nothing. With it, the agent is pushed towards the shortest safe path. Designing the reward is designing the behaviour.

An **episode** is one attempt, from the start until the goal or an obstacle.

## Q-learning: learn the value of each action

Q-learning maintains a table Q with one entry per (state, action) pair: the expected total reward if I take this action here and then act optimally. Here: 100 states x 4 actions.

After each step, the entry is updated with the Bellman equation:

> Q(s, a) ← Q(s, a) + α [ r + γ max Q(s', a') − Q(s, a) ]

- **α (learning rate)**: how much a new experience overwrites the old estimate.
- **γ (discount factor)**: how much future rewards count compared with immediate ones. Close to 1, the agent is patient.
- **r + γ max Q(s', a')**: the reward just received plus the best value available from the next state.

```python
best_next = np.max(Q[next_state])
Q[state, action] += alpha * (reward + gamma * best_next - Q[state, action])
```

## Exploration versus exploitation

If the agent always picks the action with the highest Q-value, it never discovers better paths. If it always acts randomly, it never uses what it knows.

The usual compromise is **epsilon-greedy**: with probability ε (say 10%) take a random action, otherwise take the best known one. A common refinement is to start with a high ε and decrease it over time.

After enough episodes, taking the maximum Q-value in each cell gives a map of how good each position is, and following the best action from cell to cell traces the learned path.

**Strengths**: simple to understand and implement, well suited to small, discrete environments.

**Limits**: the table grows with the number of states and actions, so it does not extend to continuous or very large spaces as is, and it needs enough exploration to converge. Deep Q-learning replaces the table with a neural network to go further.

## Policy gradient: learn the behaviour directly

The second approach skips the value table. It learns a **policy**: a function, typically a small neural network, that takes the state as input and outputs a probability for each action. The policy is stochastic, so exploration is built in.

The basic algorithm (REINFORCE) goes like this:

1. **Initialise** the policy network with random weights.
2. **Play an episode** by sampling actions from the policy; record states, actions and rewards.
3. **Compute the return** G_t for each step: the discounted sum of the rewards that followed (a Monte Carlo estimate).
4. **Update the weights** so that actions followed by high returns become more likely:

> θ ← θ + α ∇ log π(a | s) · G_t

In code, this becomes a loss to minimise:

```python
loss = -(log_probs * returns).sum()
loss.backward()
optimizer.step()
```

Normalising the returns (subtracting their mean, dividing by their standard deviation) makes training noticeably more stable.

**Strengths**: handles continuous or large action spaces, and can learn stochastic policies.

**Limits**: the gradient estimate is noisy, so learning is slower and less stable, and it needs many episodes. Actor-critic methods combine both ideas, a policy and a value estimate, to reduce that noise.

## Side by side

| | Q-learning | Policy gradient |
|---|---|---|
| What is learned | Value of each action | Probability of each action |
| Exploration | Added (epsilon-greedy) | Built into the policy |
| Best for | Small discrete problems | Large or continuous action spaces |
| Main weakness | Does not scale as a table | High variance, slow |

## What I took from the exercise

On the grid, Q-learning converged cleanly and the result was easy to inspect: a table is transparent. The policy gradient version took more tuning for the same problem. The lesson generalises: start with the simplest method the problem allows, and keep the heavier tools for when the state space really requires them.

## Key takeaways

- Reinforcement learning learns from rewards, not from labelled examples.
- The reward design, including small step penalties, defines the behaviour you get.
- Q-learning stores the value of each state-action pair and updates it with the Bellman equation.
- Epsilon-greedy balances exploring new actions and exploiting known ones.
- Policy gradient adjusts action probabilities directly, at the cost of noisier learning.
- Prefer the tabular method when the problem is small; move to networks when it is not.
