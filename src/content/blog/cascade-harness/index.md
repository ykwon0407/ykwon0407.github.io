---
title: "Harness Cascade: Switching Harnesses Mid-Run Boosts Accuracy and Cuts Cost"
date: 2026-10-17
draft: false
---

Yongchan Kwon, Sanjana Srivastava, Shang Zhu, Zain Hasan, James Zou

<div class="tldr">

## TLDR

- **For open models, the harness matters as much as the model.** Even with the same model, harness choice and reasoning effort can change accuracy by up to 12 percentage points and cost by up to 3×.
- **Harness cascade can improve accuracy and substantially cut costs.** A second harness can catch mistakes by independently checking earlier work, while handing the task to a cheaper finisher can substantially reduce costs. In one experiment, switching achieved 82.0% accuracy (vs. 77.9% for the best single harness) at 30% lower cost.
- **The benefits generalize across models and benchmarks.** We observe similar improvements with two models (DeepSeek V4.1 Flash and GLM 5.3 Flash) and across two coding benchmarks (Terminal-Bench 2.1 and DeepSWE 1.1). Many switching configurations remain on the Pareto frontier, even when transferred to a different benchmark.
- Check out our [git repo](https://github.com/ykwon0407/harness-cascade) and give it a try with the [Together API](https://www.together.ai/serverless-inference).

</div>

## Introducing harness cascade

As real-world coding tasks get longer and more complex, the harness plays an increasingly important role. It decides what information the model sees, which tools it can use, and how much it is asked to think.

Typically, we choose a *single* harness at the beginning and stick with it until the task is done, but different parts of that task may call for different ways of working. A simple edit may need only a little thought, while a tricky bug may require careful investigation and a review of earlier findings. The work changes, but the harness stays the same. Is the choice we made at the start still the best one later on? What if we could switch harnesses along the way—would it help, hurt, or barely matter? That was exactly what we wanted to find out.

We introduce **harness cascade**, where an AI agent starts with one harness and switches to another at an intermediate stage. Here is how it works. One harness starts the task. After a few steps of thinking and executing tool calls, it writes a short summary of its progress and stops. A second harness then picks up the same workspace from that summary and finishes the job. The two harnesses can differ in how they manage context, which tools they offer or how much reasoning effort they use, and a harness can even switch to a fresh copy of itself! It is a simple idea, yet it turns out to be practically attractive.

## Switching harnesses can improve accuracy and cut cost

We tested harness switching on Terminal-Bench 2.1 with DeepSeek V4.1 Flash. We used four solo configurations — Claude Code (CC) and Pi, each at the endpoint's `low` and `max` reasoning effort, written `CC-low`, `CC-max`, `Pi-low` and `Pi-max` — and all 16 ordered switches between them, such as `CC-max → Pi-max`. Every switch happens after five tool turns. Each of the 20 configurations ran every task three times. Details are in the appendix.

<!-- figure: tb21_deepseek.html height=620 -->

*Each dot is one of the 20 configurations. Up and to the left is better. Hover for exact numbers.*

Interestingly, the choice of harness can make a big difference in cost, even at the same accuracy: `CC-max` and `Pi-max` both solve 77.9% of tasks, but `CC-max` costs 73% more per task than `Pi-max`. Moreover, harness cascades fill the frontier. `CC-max → Pi-max` is the most accurate configuration we tested, at 82.0% — four points above both max solos — and costs 30% less than `CC-max`. At the cheap end, `CC-low → CC-low` reaches 80.5% for $0.066, more accurate than every solo at 40% of `CC-max`'s price. Eleven of the 16 switches beat the best solo on accuracy.

## Benefit of harness cascade generalizes across models and benchmarks

**A second model: GLM 5.3 Flash.** We ran the same 20 configurations (4 solos + 16 switches) on Terminal-Bench 2.1.

<!-- figure: tb21_glm.html height=620 -->

GLM 5.3 Flash shows the same pattern more sharply: all four points on its frontier are harness switches, and no solo makes it. `Pi-low → Pi-max` is the most accurate configuration at 73.8%, 22% cheaper than `Pi-max` at 72.7%. `Pi-low → Pi-low` is the cheapest of all 20 configurations and still beats both low-effort solos.

**Additional benchmark: DeepSWE 1.1.** We also tested DeepSeek V4.1 Flash on DeepSWE 1.1 using the same harnesses, with the four solos and four switches selected from the Pareto frontier in Terminal-Bench 2.1. Note that these switches were selected based on Terminal-Bench results, so they may not be transferable to DeepSWE.

<!-- figure: deepswe_deepseek.html height=620 -->

Three of the four switches are still on the frontier. `CC-low → CC-low` is the cheapest configuration of all: $0.31 per task, 37% less than the cheapest solo (`CC-low`, $0.49), for a 2.7-point drop in accuracy that is not statistically significant (p = 0.45). `CC-max → Pi-max`, the most accurate switch on Terminal-Bench, falls just off the frontier here: `Pi-max → Pi-max` beats it by 1.3 points for $0.007 less. It still matches `CC-max`'s 61.5% at 30% lower cost, the same saving we saw on Terminal-Bench.

## Why does harness cascade work?

**Cost: a cheaper finisher and a fresh context cut the bill.** Every model call resends the whole previous conversation so far, so a long solo run sends the same tokens again and again: on Terminal-Bench, a `CC-max` run on DeepSeek sends 4.83M prompt tokens per task (an average output length is less than 75k). A switch replaces the first harness's history with a short summary, and handing the rest of the task to Pi, which writes less, cuts further: `CC-max → Pi-max` sends 1.90M prompt tokens (−61%) and writes 26% less output, for 30% lower cost.

The fresh context matters, but how much it saves depends on the price of resending. On DeepSeek, resent tokens come from the cache at 1/50 of the normal price, so resending is cheap. That is why restarting Claude Code itself (`CC-max → CC-max`) cuts prompt tokens from 4.83M to 2.91M but costs only 4% less than `CC-max` alone, within noise. However, GLM's cached input is only 5 times cheaper than uncached, so the fresh context alone makes all four self-switches 2–15% cheaper than their solos. On long DeepSWE tasks there is much more to resend: compared with `CC-low` alone, `CC-low → CC-low` cuts prompt tokens from 14.8M to 9.1M per task and costs 37% less. Only on short Terminal-Bench tasks with DeepSeek's cheap cache is there too little to save, and there the summary and restart make most self-switches 12–22% more expensive.

**Accuracy: a careful second look.** The second harness treats the first one's conclusions as claims to check, not beliefs it already holds. One task, `dna-insert`, shows this well. The agent must design two short DNA strands, called primers, for a 39-letter edit, and their melting temperatures must be within 5 °C of each other. The trap: the edit starts and ends with the same two letters, so it is easy to count them on the wrong side, which throws one temperature off by about 4 °C. GLM with all the single harnesses fell for this trap every time (0 of 12). They decided the edit was 37 letters long and never questioned it.

In a switch, the first harness often made the same mistake and wrote "37 nt insertion" into its summary. But the second harness was instructed to independently verify the generated files rather than rely solely on the summary. It checked, found that the edit was actually 39 letters, and corrected the boundary. Switches passed 16 of 48 attempts, and `Pi-low → Pi-low` passed 3 of 3 where `Pi-low` alone passed none. The summary was wrong; what helped was that the second harness checked it.

The accuracy gains deserve more caution than the cost savings (See Appendix). On DeepSeek's Terminal-Bench runs, the 16 switches beat running their finishing harness alone by 2.4 points on average (p = 0.007), and the fresh session alone helps: `CC-low → CC-low` beats `CC-low` by 6.0 points (p = 0.008). On GLM and on DeepSWE, accuracy is unchanged within noise.

## How harness cascade works

The first harness works on the task for N tool turns, a user setting (five in our experiments), and then writes a short summary: what it did, what it checked, and what is left. The second harness picks up the task in the same workspace with the original task and the summary, under a generic prompt that tells it to treat the summary as a hint and trust the files when they disagree. The verifier grades what the second harness leaves behind.

## Conclusion

A harness doesn't have to be a decision we make once and stick with for the entire task. Our experiments suggest that switching harnesses mid-task can offer a better balance of accuracy and cost, sometimes simply by giving the same harness a fresh start. Try out the harness cascade [here](https://github.com/ykwon0407/harness-cascade)!

---

## Appendix

### Implementation details

- **Dataset.** On Terminal-Bench 2.1, we ran 89 tasks × 20 configurations × 3 repeats for each of DeepSeek V4.1 Flash and GLM 5.3 Flash. On DeepSWE 1.1, we ran 113 tasks × 8 configurations × 2 repeats with DeepSeek V4.1 Flash: the four solos and the four switches on DeepSeek's Terminal-Bench 2.1 front (`CC-low → Pi-low`, `CC-low → CC-low`, `Pi-max → Pi-max`, `CC-max → Pi-max`), with the same `low` / `max` efforts. On both benchmarks, each (configuration, task) cell is averaged over its repeats first, so every task counts once.

- **Harness.** Both Claude Code and Pi reach the model through a local proxy that counts tool turns, and Claude Code runs in `--bare` mode, following Fable's Terminal-Bench 2.1 setting. Due to its design, the bare mode would make Claude cheaper to run, so our cost estimates can be viewed as conservative.

- **Harness switch.** Every switch happens at tool turn 5. There is no early exit: the second harness always runs, even when the first one has already finished the task, so every switch configuration is a real two-stage run.

- **Cost.** Cost is per task, using Together's per-token prices (DeepSeek V4.1 Flash: $0.30 input, $0.006 cached input, $1.20 output per million tokens; GLM 5.3 Flash: $0.15, $0.03, $0.50). To reflect realistic usage, the first call of each session and the summary call count as uncached.

### How certain are these numbers?

The uncertainty here is run-to-run: we treat the 89 (or 113) tasks as fixed and use the standard derivation of each task's repeats. On average, one configuration's accuracy has a standard error of about 1.6 points on Terminal-Bench 2.1 (1.9 for GLM) and 2.5 points on DeepSWE 1.1, and a difference between two configurations about 2.2–3.2 points on Terminal-Bench 2.1 and 3.3–3.7 on DeepSWE 1.1. That is, accuracy gaps of a few points should be read with care, even where switching looks strong. By contrast, most cost differences are statistically significant.
