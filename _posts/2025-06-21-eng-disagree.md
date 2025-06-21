---
layout: default
title: "Engineering disagreements at low probabilities"
show_title: true
date: 2025-06-21
---

A few months ago, I encountered an interesting situation where a component failed during testing, prompting a technical leader to request a design change. This isn't especially surprising, especially during early development cycles. What was interesting about the situation was the disagreement between the leader and the rank-and-file engineers. I ended up going on a minor socialization campaign of listening to the concerns of the engineers and explaining the decision in multiple different ways. What struck me at the time and has stayed with me over these months was that both groups were operating with nearly the same information; not only that, but they had also had numerous exchanges to try to establish baseline facts and arrive at a shared understanding. They should be on the same page! So why did they have a disagreement?

This probably stuck with me because of availability bias, as I was (and continue to be at the time of writing) reading [Eliezer Yudkowsky's "Rationality - From AI to Zombies"](https://www.readthesequences.com/), also known as "The Sequences." In particular, the sequence titled [Is That Your True Rejection?](https://www.readthesequences.com/Is-That-Your-True-Rejection) came to mind where Yudkowsky provides a list of reasons why two rationalists trying to resolve a dispute would continue to disagree:

> - Uncommon, but well-supported, scientific knowledge or math;
> - Long inferential distances;
> - Hard-to-verbalize intuitions, perhaps stemming from specific visualiza­tions;
> - Zeitgeists inherited from a profession (that may have good reason for it);
> - Patterns perceptually recognized from experience;
> - Sheer habits of thought;
> - Emotional commitments to believing in a particular outcome;
> - Fear of a past mistake being disproven;
> - Deep self-deception for the sake of pride or other personal benefits

Initially, I assumed the resistance was primarily a combination of the last three bullets, mostly related to emotional attachment, combined with an admittedly complicated timeline. Over the next few months, I began to think differently as more and more engineers started to voice their displeasure with what they felt was not data-driven decision-making. This really centered on a different set of rejections, namely, hard-to-verbalize intuitions and patterns perceptually recognized from experience. 

With that in mind, I set out to write this blog post to explore why those intuitions and experiences cropped up this way and where the core assumption between the two parties might have been mismatched. 

## Aerospace Background
First, it's helpful to provide some industry background to establish context before discussing the misunderstanding. In commercial aerospace, the concept of 10<sup>-9</sup> as a safety target gets thrown around a lot. The 10<sup>-9</sup> is the average probability of catastrophic failures per flight hour. Wes Ryan created an excellent single-slide summary of the origin of that concept from the FAA as part of NASA's AAM Ecosystem Working Group (AEWG) Aircraft Working Group. I've taken the relevant slide out below.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/ryan_aircraft_safety.png" alt="Slide explaining the origins of the aircraft targeted design safety ratio" title="Slide of origins of 10^-9" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
    <p style="font-size: 0.9em; margin-top: 8px;">
        <a href="https://ntrs.nasa.gov/api/citations/20220015641/downloads/20221027%20AEWG%20Workshop%20Expected%20Safety%20Rev1.pdf">Expected Safety Level For AAM</a> by 
        Wes Ryan
    </p>
</div>

The key point for this discussion is that the vehicle design safety target is extremely small. Small enough that it is not really possible to assume that there is no prior knowledge and test to the probability that is specified. Beyond that, an individual component or Line Replaceable Unit (LRU) isn't really capable of exceeding a 10<sup>-4</sup> or 10<sup>-5</sup> reliability. It's not a mathematical proof that causes that but rather the fact that around there, the necessarily shared framework (the enclosures' mechanical properties, thermal conditions, etc.) have shared failure modes that start becoming economically unsustainable to ameliorate, especially when the option of replacement is available. This is common across nearly all engineering fields. There are cases where this is not true; the oldest operational GPS satellite is currently [USA-132](https://en.wikipedia.org/wiki/USA-132), which was launched in July 1997, reaching an operational age of 28 years, though it was only designed for 10 years life or undersea cables which average around [12 years in service](https://blog.telegeography.com/2023-mythbusting-part-2) but generally for commercial aircraft maintenance is costly but not prohibitive enough to really cross this boundary. 

## Different Assumptions Broken Down

A significant part of the disagreement between the two parties stemmed from a few key factors.

- Assumed prior distributions
- What data points to include in the sample
- The risk of shared failure modes

Each of these components combined to arrive at the two different points of view and are worth looking into a little closer. I will break these down into a few independent posts, and in this one, we will discuss the assumed prior distributions.

### Assumed Prior Distributions

To facilitate the discussion in this section, we will utilize a [Beta Distribution](https://en.wikipedia.org/wiki/Beta_distribution#) because it enables us to simplify the problem setup to a single value, representing either a successful test (1) or a failed test (0). In a broader sense, what we are looking for is the probability that components will successfully complete an average flight. In particular, the test is being substituted for successful flight with the goal of assessing the proportion of failures given the operational conditions of C less than the design safety target T. Which is to say, what we really want to know is

$$P(failure\le T|C)$$ 

Even though we are interested in the failure rate, since the success rate is just the one minus the failure rate, we will reformulate the question as

$$P(S\ge 1-T|C)$$

where S is success. When we conduct the tests, we update our priors with the sampled test data to establish the posterior distribution, which will enable us to answer our core question: the probability of being less than the design safety target. To do this, we need to use Bayes' Theorem. 

$$f(S|test\:results) \propto f(test\:results|S)f(S)$$

Using the Beta distribution, we can establish

$$f(test\:results|S) \propto S^{P-1}(1-S)^{F-1}$$

where P is the number of passed tests, and F is the number of failed tests. The prior function f(S) is where the disagreement arises. For the remainder of the analysis, I'll be using a [Bayesian Distribution Visualizer](/tools/bayesian_viz_tool/) that I created specifically for this purpose. There were a lot of different tools available that I also drew inspiration from ([University of Iowa](https://homepage.divms.uiowa.edu/~mbognar/applets/beta.html), [MIT Mathlets](https://mathlets.org/mathlets/beta-distribution/), [Mrinalcs](https://mrinalcs.shinyapps.io/beta-distribution-visualization/?ref=mrinalcs.github.io)). However, none of them displayed the posterior and prior on the same plot. It was also a bit of a fun exercise to create my own and provides a convient tool to test intuitions with.

The simplest starting point would be to assume the prior distribution has no information, which would be a uniform distribution. To provide some concrete numbers for the rest of this discussion, we will assume that 

$$P=50\\F=2\\T=10^{-5}$$

This results in the figure below for a uniform distribution. What is interesting is that while the posterior distribution looks like it aligns better with our objective because, before 0.8, there is essentially no density, it actually is slightly worse for our objective going from P(S>1-T) ~ 0.1% to P(S>1-T) ~ 0.00004% primarily because the mode has shifted to the right but not far enough and the greatly reduced variance coupled with the very tight margins of T result in a *decrease* in probability of meeting our design target. 

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/bayesian-beta-uniform.png" alt="Beta distribution with an value of alpha = 1 and beta = 1 and 50 success and 2 failure" title="Assuming a uniform prior distribution" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
    <p style="font-size: 0.9em; margin-top: 8px;">
        Beta distribution with an value of alpha = 1 and beta = 1 and 50 success and 2 failure
    </p>
</div>

A full breakdown in the comparison of the prior and posterior are in the table below.

| Metric             | Prior       |Posterior    |
| ------------------ | ----------- | ----------- |
| P(S>1-T)           | 0.0010135364| 0.0000000387|
| Mean               | 0.5         | 0.9615      |
| Mode               | N/A         | 0.9444      |
| Vairance           | 0.83333     | 0.00095     |
| Standard Deviation | 0.28868     | 0.03089     |

The probability that the design objective was meet was not just by a little bit, either. It was off by multiple orders of magnitude. This was the argument I initially brought to the engineers to help explain the decision that had been made. It didn't really matter the shades of grey of a failure or that there were additional conditionalities (to be covered in the next post) at a probability of 0.00004% of meeting the objective the likelihood of success is just too low for anyone to reasonably take that risk without maing a change. The uncertainty around any explanation would be unlikely to change the results by the multiple orders of magnitude that would be necessary to start getting comfortable with the idea. 

The way I think about it is if you think the failure to meet the objective would cost you your job, what *reasonable* probability would you need? (Note the emphasis on reasonable here [100% is not a probability](https://www.readthesequences.com/Zero-And-One-Are-Not-Probabilities)) Maybe you don't love your job and have a foot out the door anyway, so you'll take a coin toss (50-50). Or maybe the job market is terrible, and you're paying for your kid's tuition and your mortgage and supporting your aging parents? In that scenario, you'd probably be pushing for something above 90%. In either case, though, the naive 0.00004% isn't within striking distance, no matter how elegant your argument is. 

Moreover, you start getting into information costs at this point. How much information would you need to start being convinced otherwise? For the moment, let's assume that the previous 52 tests are immutable; how many more would we need to feel satisfied? The answer is pretty humbling for the indifferent party. It would take an additional 4550 successful tests without another failure. A single additional failure would require an additional 1,560 tests. 

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/beta-uniform-50p.png" alt="Beta distribution with an value of alpha = 1 and beta = 1 and 4600 success and 2 failure" title="Zoomed in distribution for a 50% confidence to meet the safety target" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
    <p style="font-size: 0.9em; margin-top: 8px;">
        Beta distribution with an value of alpha = 1 and beta = 1 and 4600 success and 2 failure
    </p>
</div>

As sort of covered in the previous section, though, there is a lot of design work going into meeting the target safety level, and by virtue of the design, there is a knowledge base, K, that should inform the prior distribution. This is what really has stuck with me from my initial explanation; while it's accurate, it's misleadingly pessimistic. Which is what really prompted me to  explore some more realistic starting places. 

To begin, let's attempt to create a prior distribution that reflects design knowledge. First, we know that the design safety target of T was the objective. From there, let's assume that the probability that it is either above or below that value is 50%. This is probably reasonable during development. Based on the slide from the Aerospace Background section, we know that in production, about 10% of failures are from systems. It is unlikely to be 10% for each system, but pre-production should be expected to be much more likely to fail; after all, at this point in time, you've never even tested it. So starting with the assumption that 50% of the time the system will met the target criteria instead of maybe 90% that might be expected in operation seems fair as our goal is to explore the decision making which only requires an accurate enough model.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/beta-10en5.png" alt="Beta distribution with an value of alpha = 1500 and beta = 1.1 and 50 success and 2 failure" title="Zoomed in distribution for a prior distribution ~50% confidence to meet the safety target" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
    <p style="font-size: 0.9em; margin-top: 8px;">
        Beta distribution with an value of alpha = 1500 and beta = 1.1 and 50 success and 2 failure. Chosen to represent the case where 50% of the time the design criteria would be met.
    </p>
</div>

From there, we can see how much those two failures greatly decrease the probability that the design safety target will be met. Going all the way from a coin flip to 1.6%. Now, 1.6% is still many orders of magnitude closer than when we used the uniform prior distribution, but it is still a far cry from what even the most apathetic employee might be willing to bet their job on. One of the nice things about using the Beta distribution is we can treat the prior alpha and beta parameters as successes and failures. In this case, we are essentially saying we value our design knowledge at 1,500 successful tests and a single failure. 

| Metric             | Prior       |Posterior    |
| ------------------ | ----------- | ----------- |
| P(S>1-T)           | 0.5264586605| 0.0162344028|
| Mean               | 0.9992      | 0.9980      |
| Mode               | 0.9999      | 0.9986      |
| Vairance           | 0.000000487 | 0.000001282 |
| Standard Deviation | 0.000698    | 0.00113     |

So, a reasonable but optimistic apathetic designer would probably still not be willing to bet their job; how confident do we have to be in our knowledge base and design before we'd still have 50% confidence that we met our design target? The plot below shows the necessary prior distribution to satisfy our apathetic designer.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/beta-10en5-50p-post.png" alt="Beta distribution with an value of alpha = 4700 and beta = 1.1 and 50 success and 2 failure" title="Zoomed in distribution for a posterior distribution ~50% confidence to meet the safety target" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
    <p style="font-size: 0.9em; margin-top: 8px;">
        Beta distribution with an value of alpha = 4700 and beta = 1.1 and 50 success and 2 failure. Chosen to represent the case where the posterior distribution would have the design objective met 50% of the time.
    </p>
</div>

When looking at the resulting plot and tables, essentially everything has shifted to the right, and the variance continues to decrease. This shift results in going from 1.6% confidence that the criteria are met to about 50%! It also means having the confidence of about 3,200 more successfully passed tests.

Realistically, there's not a practical prior distribution that would ever satisfy our life constrained engineer. At this point, even satisfying our apathetic engineer probably requires overconfidence; being 95% confident in a complicated design is a pretty high bar, especially without integrated testing. 

| Metric             | Prior       |Posterior    |
| ------------------ | ----------- | ----------- |
| P(S>1-T)           | 0.949482    | 0.502369    |
| Mean               | 0.999766    | 0.99934779  |
| Mode               | 0.9999787   | 0.999558    |
| Vairance           | 4.97507e-8  | 0.000000137 |
| Standard Deviation | 0.000223    | 0.00037     |

Generally, though, these differences in distribution aren't well differentiated in the human mind and their resulting impact on the posterior distribution; therefore, our expected outcomes aren't well calibrated either. If we think of Kahneman and Tversky's work on [Prospect theory](https://en.wikipedia.org/wiki/Prospect_theory), where individuals were unconsciously treating probabilities 1% the same as 5%, being able to naturally distinguish a probability density distribution with a mean of 0.9992 compared to one of 0.9997 isn't something we are well equipped for even though they have a massive impact on the interpretation of the results. 

## Conclusions
What had set me on this path to write this post was dissatisfaction with my own explanations, which depended on an assumed uniform prior distribution, and the reason I even needed to make the explanation in the first place, given that both parties had the same information. That ties back into the "Patterns perceptually recognized from experience" genre of disagreement. I hadn't fully analyzed the conditions, but from experience, I knew that when the likelihood of meeting the design target is so low (0.00004%) that even after correction (1.6%), it would still be an unacceptable level, and the decision would remain unchanged. This also relates to part of the original disagreement, which involves balancing the probability of additional issues arising against the time required to identify them and the potential for introducing new issues through a change. These sorts of decisions tend to combine both hard-to-verbalize intuitions and patterns perceptually recognized from experience to inform the decision-making.

The situation becomes further complicated when the acceptable risk varies among different parties. Even more so when you consider humans aren't good at weighing low-probability events in the first place.

In the next post in this series, I'll start exploring the inclusion of failures into the decision-making even if the operational conditions of C are not met.

## Refrences
1. [Rationality - From AI to Zombies](https://www.readthesequences.com/HomePage)
2. [Basics of Bayesian Statistics](https://www.stat.cmu.edu/~brian/463-663/week09/Chapter%2003.pdf)