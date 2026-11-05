# Training research notes

What the evidence says, and what each point means for Iron Ledger's rules. Written 2026-11-05.
Confidence: **strong** = several meta-analyses agree; **moderate** = one good meta-analysis or a consensus; **weak** = coaching practice, little direct data.

## 1. Deloads

- **What:** "a period of reduced training stress designed to mitigate physiological and psychological fatigue, promote recovery, and enhance preparedness for subsequent training" (Bell et al. 2023, Delphi consensus of 21–34 strength and physique coaches).
- **How often:** the background literature puts it at about every 4–6 weeks, lasting about 7 days. The consensus itself agreed (100%) that a deload can be **pre-planned, autoregulated, or both**: scheduled, or triggered when fatigue shows up regardless of the week, and it "could be data-driven". *Moderate.*
- **How:** reduce **volume** first (fewer sets 100%, fewer reps 100%, fewer exercises 95%). Intensity "may stay the same while volume drops" (95%) or come down a little. **Keep training frequency the same** (100%). *Moderate.*
- **Not a week off:** Coleman et al. 2024 (PeerJ, n=39) put a full week off in the middle of 9 weeks. Compared with training straight through, it slightly *reduced* lower-body strength gains and did nothing for muscle growth. So a deload means lifting lighter, not stopping. *Weak–moderate (one small study).*
- **Novices:** the consensus says deloads may vary with experience. Novices recover quickly and stall less often, so the reactive trigger matters more for them than the calendar does. *Weak.*

**In the app (built on `deload-week`):**
- It's due after 5 straight full weeks, or after 3 when two warning signs show together: 2+ stalled lifts, recovery trending down, or a joint running hot.
- A deload week keeps the same number of lift days, halves the sets, uses about 90% weight (held when the plate step is too coarse), and stops 3–4 reps short of failure. Cardio is easy, with no long-session build.
- Deload sessions are left out of progression and stall checks.

## 2. Volume (sets per muscle per week)

- Volume has a dose–response relationship with both strength and size, with diminishing returns. Returns flatten **sooner for strength than for size** (Pelland et al. 2024 meta-regression, 67 studies, preprint; Schoenfeld et al. 2017; Ralston et al. 2017). *Strong for the direction; the exact numbers are moderate.*
- **Counting:** "fractional" counting (a set counts 1 for the main muscle and 0.5 for helpers) predicted size best (Pelland 2024). Iron Ledger already weights muscles 1 / .75 / .5 / .25, which is the same idea.
- **Novices:** a very low dose (about 1–4 sets a week) under-performs, but around 5–10 hard sets a week per muscle gets most of the gain (Ralston 2017). The 10–20 ranges in `MUSCLES` are reasonable *upper* targets. For someone a month in, the low end of each range is plenty.

**For the app:** keep `lo/hi`, and possibly start novices around `lo` and let the range open up with training age. Set counting is already fractional.

## 3. Frequency

- Once volume is equal, how often you train a muscle makes little difference to size. **For strength it helps**: practising a lift more often builds skill (Pelland 2024). *Moderate.*

**For the app:** a session builder should hit each main movement pattern (push, pull, squat, hinge) about 2× a week, rather than 1× with more sets.

## 4. Load and rep ranges: when strength and size split apart

- **Size:** muscles grow about equally with any load from about 30% of 1RM up, as long as sets go near failure. Moderate loads (about 6–15 reps) take the least time (Schoenfeld et al. 2021, the "repetition continuum" revisited). *Strong.*
- **Strength:** heavier is better for 1RM, so 1–5 reps beats 8–12 in most studies (same review). Strength is also **specific** to the exercise you practise. *Strong.*
- **How close to failure:** growth rises the closer sets get to failure. Strength barely depends on it, so stopping about 3–5 reps short works for strength (Robinson et al. 2024, Sports Medicine meta-regression). *Moderate.*
- **Your question, in short:** at novice level almost anything works. Strength and size come from the same training, mostly through better technique and coordination (neural) plus some growth. As you advance, they separate:
  - Getting **stronger** needs heavy, specific, lower-rep practice of the lift itself.
  - Getting **bigger** needs enough hard sets near failure, at whatever load.

  Most programs mix both: one heavy main lift, then accessories at higher reps.

**For the app:**
- Main lifts: 4–8 reps, 1–3 reps left in the tank.
- Accessories: 8–15 (or up to 20–30 on small muscles like calves and lateral raises), 0–2 reps left.
- A dumbbell or capped barbell can still drive growth by adding reps (the cap rule already does this).

## 5. Training level: novice, intermediate, advanced

- **Classic model** (Rippetoe & Kilgore, *Practical Programming*): the label is defined by how fast you can progress, not by what you lift.
  - **Novice:** adds weight every session.
  - **Intermediate:** progresses week to week.
  - **Advanced:** progresses over multi-week blocks (4–8 weeks or more).
- **Modern critique** (Barbell Medicine): the biology doesn't change between the labels. What shrinks is how much improvement is left, while day-to-day noise grows. They advise judging a stall over 3–4 weeks against a 6–8-week baseline and adjusting from how the lifter actually performs.
- **For the app:** detect the level *per lift*, from how fast it has actually progressed, not from a single label. Some evidence suggests trained lifters respond best around 80% of 1RM and untrained ones around 60% (Rhea 2003; older and methodologically criticised). *Weak.*
  - **Novice:** session-to-session double progression (what the app does now).
  - **Intermediate:** when a lift stalls twice despite good recovery, switch to weekly progression (e.g. a heavy day plus a volume day, with small jumps).
  - **Advanced:** blocks with planned deloads.

## 6. Strength standards and balance

- **Strength Level** (strengthlevel.com):
  - Levels are percentiles of its users: beginner beats about 5% of them, novice 20%, intermediate 50%, advanced 80%, elite 95%.
  - The data comes from 46M qualifying lifts logged by users, split by sex and bodyweight. It covers many exercises, dumbbell and isolation lifts included (dumbbell bench is per dumbbell).
  - Example: dumbbell bench for a 150 lb man runs 34 / 52 / 75 / 103 / 133 lb per hand.
  - Caveat: users choose to log their lifts, so the levels skew toward people who train and log. It's the only broad dataset, though.
- **ExRx / Kilgore tables:** the original source, covering the main barbell lifts only. They're built on expert judgement, not population data. ExRx says outright that they are *not* designed to judge healthy strength or imbalances that relate to injury risk.
- **van den Hoek et al. 2024** (JSAMS, 809,986 drug-tested powerlifting entries): rigorous norms for squat, bench and deadlift, but from competitors, so they suit only the top end. The 90th percentile for men aged 18–35 is squat 2.83×, bench 1.95×, deadlift 3.25× bodyweight.
- **Balance:** no study ties "balanced" ratios between lifts to injury or outcomes. The ratios are coaching heuristics (e.g. a row roughly equal to a bench, deadlift about 1.2× squat). Comparing *each lift's percentile* tells you more and is easier to explain. "Bench 500, calf raise 10" would show up as about the 99th and 1st percentiles.

**For the app (next step):**
- Compute a percentile per pattern from e1RM and bodyweight.
- Treat any pattern 1+ level below the others as a priority, which gives it more slots in the session builder.
- For small muscles, keep checking balance by weekly sets in range, not strength.
- Open questions:
  - Licensing: Strength Level's tables are their product. Embedding them in a *public* app needs permission, or a fitted approximation (ratio × bodyweight curves) built from public sources.
  - No rack: squat and bench standards don't apply directly. The app needs the dumbbell and variant standards.

## Sources

- Bell L. et al. (2023). Integrating deloading into strength and physique sports training programmes: an international Delphi consensus approach. *Sports Medicine – Open* 9:87. PMC10511399.
- Coleman M. et al. (2024). Gaining more from doing less? The effects of a one-week deload period during supervised resistance training on muscular adaptations. *PeerJ* 12:e16777.
- Pelland J. et al. (2024). The resistance training dose-response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gain. SportRxiv preprint 537.
- Schoenfeld B. et al. (2021). Loading recommendations for muscle strength, hypertrophy, and local endurance: a re-examination of the repetition continuum. *Sports* 9(2):32.
- Robinson Z. et al. (2024). Exploring the dose–response relationship between estimated resistance training proximity to failure, strength gain, and muscle hypertrophy. *Sports Medicine*.
- Ralston G. et al. (2017). The effect of weekly set volume on strength gain: a meta-analysis. *Sports Medicine* 47:2585–2601.
- van den Hoek D. et al. (2024). Normative data for the squat, bench press and deadlift exercises in powerlifting. *J Sci Med Sport* 27(10):734–742.
- Strength Level, strength standards and methodology: strengthlevel.com.
- ExRx, Strength standards (Kilgore): exrx.net/Questions/StrengthTests.
- Barbell Medicine, "Progressive Loading Part 3: The Death of the Novice-Intermediate-Advanced Framework".
- Rippetoe M., Kilgore L. *Practical Programming for Strength Training*.
