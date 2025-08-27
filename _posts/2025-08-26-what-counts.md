---
layout: default
title: "What Counts?"
show_title: true
date: 2025-07-28
---

In the [initial post](https://cram9030.github.io/2025/06/21/eng-disagree.html) in this series, I spoke about how the core issue is the engineering disagreement between a technical leader and the rank-and-file engineers. I proposed that there were three primary assumptions that were the crux of the disagreement

- Assumed prior distributions
- What data points to include in the sample
- The risk of shared failure modes

We covered the assumed prior distributions in the last post, and in this one, we will be covering the "What data points to include in the sample?"

## Does it matter?

In the previous post, we gave the example of having two failures and 50 passing tests. But what if one of those failures doesn't have a clear root cause? What if there is some ambiguity where the required operations, Conditions $C$, were not met? Well, we probably wouldn't include them in our sample because they inform us about a condition we don't expect to have. Mathematically, it starts looking like

$$P(S\ge 1-T|\neg C)$$

but for our analysis, we are only interested in 

$$P(S\ge 1-T| C)$$

as we mentioned before. To some people, this might feel a little like cheating because the designer gets to dictate the conditions $C$. Generally, if $C$ is too restrictive, then the product being designed won't be useful and won't sell, and will therefore fail. Alternatively, the not welcome analogy I've given before is for a toaster; an example of $\neg C$ might be having a fork in the toaster. You really shouldn't do it, and while it's great if you design a fork-proof toaster, there are plenty of toasters that worked and have sold very well without that feature, so as a testing criterion, a "shove a fork in it" test wouldn't be relevant. 

A little less dramatic but much more common in a development environment are failures due to test setup. Let's say, for example, the operator plugged in the wrong wire while setting up the test, or a safety cut-off was set not assuming transport loss, or a sensor was not correctly calibrated. Those are all examples of issues that are part of the conditions for a correct test, but are not indicative of the unit's design, so we would not really want to include them in our assessment of the Line Replacement Unit (LRU).

Returning to the problem at hand, though, what if one of those two failures was due to condition $C$ not being met? Would it change anything? Well, not really even a single failure would still result in 15.8% probability of successfully meeting our design criteria, which again our apathetic employee wouldn't be willing to bet their job on. 

| Metric             | Prior       |Posterior    |
| ------------------ | ----------- | ----------- |
| P(S>1-T)           | 0.5264586605| 0.158000984 |
| Mean               | 0.9992      | 0.9993      |
| Mode               | 0.9999      | 0.9986      |
| Vairance           | 0.000000487 | 0.00000087  |
| Standard Deviation | 0.000698    | 0.00093     |

The cost of the information collection to gain our confidence would decrease dramatically to approximately 1600 successful tests after that. This probably isn't worth doing and would likely result in another design change.

For the moment, though, let's imagine that one sample would make the difference. Let's say we already had 1600 successful tests, then we had that second failure. Now that failure is between the apathetic employee being willing to bet their job on it or not. How do we establish whether we include that failure in our accounting or not?

## Setting up our analysis

One of the most common mechanisms for root cause analysis is [Ishikawa diagrams](https://en.wikipedia.org/wiki/Ishikawa_diagram) (also known as a fishbone diagram), which is intended to help identify the causes of an identified defect or failure. The causes that extend to the left, creating the fishbone, can vary from organization to organization. The most commonly included causes tend to be

- Equipment: The tools being used to achieve the stated goal are often either the equipment used to test or manufacture.
- Process: The sequence of actions used often to either test or manufacture
- People: Frequently interpreted as human error, but can also be the lack of the correct people.
- Management: Often, these will be the instructions from the management, but could also be organization-wide prioritization or objectives.
- Environment: The ambient environment, temperature, humidity, etc., but could also include more human factor-related environmental conditions like the presence of distractions.
- Materials: The raw components used, frequently wires, integrated circuits, etc.

<div style="text-align: center;">
    <a title="FabianLange at de.wikipedia, CC BY-SA 3.0 &lt;http://creativecommons.org/licenses/by-sa/3.0/&gt;, via Wikimedia Commons" href="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ishikawa_Fishbone_Diagram.svg/2560px-Ishikawa_Fishbone_Diagram.svg.png"><img width="100%" style="max-width: 3200px; min-width: 800px;" alt="Ishikawa Fishbone Diagram" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ishikawa_Fishbone_Diagram.svg/2560px-Ishikawa_Fishbone_Diagram.svg.png"></a>
    <p style="font-size: 0.9em; margin-top: 8px; font-style: italic;">
        Example fishbone diagram with commond causes.
    </p>
</div>

The Ishikawa diagrams have a lot of advantages in that they are easy to understand at a glance, and they provide a consistent way of decomposing the problem. Unfortunately, they are very much a qualitative mechanism, and as we mentioned in the [last post](https://cram9030.github.io/2025/06/21/eng-disagree.html), there is [plenty of evidence](https://www.nature.com/articles/s41599-024-03403-9) that humans struggle to correctly weigh highly unlikely events, so moving to something a little more quantitative is probably necessary. 

In an attempt to make this process more quantitative, we will represent our problem at hand as a [Directed Acyclic Graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)(DAG), which we will use as the basis of our development of a [Bayesian Network](https://en.wikipedia.org/wiki/Bayesian_network). We will be using Erdogan Taskesen's [BNLearn python package](https://erdogant.github.io/bnlearn/pages/html/index.html), though for this post, we will only be using the inference and not the learning aspects of it. 

To start with, we need to set up the scenario a little further. First, we will assume there is some sort of failure in the test, as we discussed above, there are a lot of potential failure causes. In this example, we will focus on Equipment, Design, Material, and Configuration, which we define as:

- Equipment - The equipment around the unit under test, like the power supplies, data acquisition device, test software, etc.
- Design - Failures fundamental to the design, these could be things as straightforward as the wrong value of a resistor, or a little more exotic, like Electromagnetic Interference causing bad responses. This would also include the design of software, interfaces, etc.
- Material - This covers failures of a particular component independent of the design. If a diode fails because the design would always cause it to be exposed to overcurrent, it would be a design failure, but if it failed just because it was a bad part, then it would be a material failure.
- Configuration - $C$ or the conditions that the system must be operated in, ambient temperature, input voltage, wiring setup, etc.

These together are what we'd call the explanatory variables, which provide the explanation of the failure. If we were to determine that the configuration or equipment was the primary source of the failure, we might choose to remove it from our assessment of the failure rate. On the other hand, the design and the material failures would need to be included, though the action in response to them might be different. A material failure might just warrant a change in the incoming inspection or the sourcing of the material, while a design failure would warrant a design or operational condition change.

Now that we've established the explanatory variables, we should look into the evidence variables.

- Early Exit Failure - The test failed because the test did not finish
- Recorded Evidence - Evidence that comes from the data recorded during the test
- Visual Evidence - Evidence that comes from a visual inspection after the test
- Incoming Inspection - All inspections or checks prior to the verification testing
- Employee Testimony - Testimony of the employee about the test setup

With that, we can now create our DAG, which we will use to develop our Bayesian network.

<div style="text-align: center; margin-bottom: 30px;">
  <div class="mermaid">
    flowchart TD
        Equipment((Equipment)) --> Recorded((Recorded))
        Design((Design)) --> Recorded
        Equipment --> Failure((Failure))
        Material((Material)) --> Failure
        Design --> Failure
        Material --> Inspection((Inspection))
        Material --> Visual((Visual))
        Design --> Visual
        Configuration((Configuration)) --> Failure
        Configuration --> Employee((Employee))

        %% Styling to match your website's color scheme
        classDef default fill:#e8f5e9,stroke:#007FBF,stroke-width:2px,color:#333
        classDef highlight fill:#4BA3D3,stroke:#00547F,stroke-width:3px,color:white
        
        %% Apply highlight style to key nodes if desired
        class Failure,Employee,Recorded,Visual,Inspection highlight
  </div>
  <p style="font-size: 0.9em; margin-top: 20px;">
    Directed Acyclic Graph showing relationships between variables
  </p>
</div>

From the setup of the DAG, we can see that all of the explanatory variables could explain an early failure. On the other hand, the employee testimony is the only additional evidence that the configuration was set up correctly. The inspections only provide evidence of the material, not anything else, but the visual inspection after the failure can provide evidence for both the material and the design. Finally, the recorded evidence can provide evidence of a design flaw or an equipment failure.

## Establishing Expectations

This next section is where there would commonly be disagreement and dissent about the approach. It requires establishing the Conditional Probability Distribution (CPD) table, which will be used for the creation of the Discrete Bayesian Network. This is controversial because at this stage of development, you necessarily do not have data to estimate or learn the probabilities, so you are heavily dependent on expert knowledge, augmenting things like data sheets for the component and equipment. 

We are going to start by walking through an example to create an initial set of CPD tables, focusing on establishing the logical rules we'd want to apply, which could later be used for meta-analysis.

### Base Rates

We will start with the base rate for each of the explanatory variables. For this analysis, 1 represents a failure that was present, and 0 represents that the failure was not present.

<div class="tables-grid-4">
<div class="table-container" markdown="1">

#### Equipment Base Rate

| Equipment  | Probability |
|  0         | 0.95        |
|  1         | 0.05        |

</div>
<div class="table-container" markdown="1">

#### Configuration Base Rate

| Configuration | Probability |
| 0             | 0.7         |
| 1             | 0.3         |

</div>
<div class="table-container" markdown="1">

#### Design Base Rate

| Design   |  Probability  |
| 0        | 0.99999       |
| 1        | 1e<sup>-5<sup>|

</div>
<div class="table-container" markdown="1">

#### Material Base Rate

| Material | Probability |
| 0        | 0.9999      |
| 1        | 0.0001      |

</div>
</div>

The material base rate would typically be based on the information from the supplier. It should also be expected to be lower than the design because we are assuming the design takes into account the anticipated failure rate of a single component. The design base rate is what the design reliability target was, though it would also be reasonable to use the distribution updated with the most recent data, but that won't substantially change the discussion here. If the equipment failure was just a hardware failure, then the data sheet or supplier recommendation would likely have been sufficient, but once it starts including alterations through unique setup and local development, that estimate might not be as true. In an ideal scenario, both the equipment and configuration base rates could be estimated by many different tests; instead, they have to be estimated, and some rough rules can help us do this.

1. The equipment base rate will always be lower than the manufacturer's provided values because of equipment that is unique to the setup being used. For example, rigging, mounts, wiring, or even more likely, scripts.
2. The configuration base rate will always be the lowest base rate of the four explanatory variables.
3. The configuration base rate should include every time the test was set up, even if it was not run. 
4. The configuration base rate should be proportional to the time it takes to execute the tests and is limited by the acceptable amount of time. For example, a test takes 5 minutes to run and 5 minutes to set up, but only four tests are run an hour, which implies that the configuration was either
   1. Incorrectly set up and had to be set up multiple times
   2. Something has changed in the setup, making it more complicated and taking longer, and therefore more likely to fail

Of the two base rates, the equipment is probably the least controversial, but there are times when it starts deviating significantly from expectation, which need to be watched for. In the case of the configuration time example, if every test setup is not recorded, then the proxy of time can be used. In the example given, we would normally expect 6 tests an hour, but are getting only four, which implies a setup failure at least once every time the test was set up. In many situations, that would probably be the floor of expectations, even for a new test setup or process, just because it is so pronounced. In our example, we follow the rule established, which is probably reasonable for a prototype; the Configuration probabilities would be pretty out of bounds for any sort of production setup.

### Conditional Probabilities
The conditional probabilities are where it gets a little more interesting because now we start getting into conditional dependencies on the evidence. To generate these values, we applied pretty simple logic. For example, the majority of the time, an employee says something was set up correctly, it was, but if they indicate it was set up incorrectly, then it is even more likely they set it up incorrectly. It's only human nature to want to assume you did something right, so we give extra weight if someone indicates they made a mistake.

<div class="tables-grid-2">
<div class="table-container" markdown="1">

#### Employee Testimony Conditional Probabilities

| Incorrect Configuration                    | False | True |
| Employee Indicates Correct Configuration   | 0.85  | 0.1  |
| Employee Indicates Incorrect Configuration | 0.15  | 0.9  |

</div>
<div class="table-container" markdown="1">

#### Material Inspection Conditional Probabilities

| Material Failure    | False | True  | 
| Inspection Passed   | 0.95  | 0.1   |
| Inspection Failed   | 0.5   | 0.9   |

</div>
</div>

The Recorded Evidence followed the logic that the vast majority of the time, if the recording indicates there was some sort of failure, there was in fact a failure, but every now and then, that might not be the case. The easiest way to think of this is if you have a threshold, well, occasionally a 3-sigma (or even rarer) events happen, and when they do, that might look like a failure. Visual evidence has a similar vein, but it probably won't be as reliable as the recorded evidence, and you see that in the values we chose.

<div class="tables-grid-2">
<div class="table-container" markdown="1">

#### Recorded Evidence Conditional Probabilities

| Equipment Failure   | False | False | True  | True |
|---------------------|-------|-------|-------|------|
| Design Failure      | False | True  | False | True |
| No Recorded Evidence| 0.99  | 0.02  | 0.4   | 0.01 |
| Recorded Evidence   | 0.01  | 0.98  | 0.6   | 0.99 |

</div>
<div class="table-container" markdown="1">

#### Visual Evidence Conditional Probabilities

| Material Failure    | False          | False | True  | True |
|---------------------|----------------|-------|-------|------|
| Design Failure      | False          | True  | False | True |
| No Visual Evidence  | 0.9999         | 0.35  | 0.3   | 0.25 |
| Visual Evidence     | 1e<sup>-4<sup> | 0.65  | 0.7   | 0.75 |

</div>
</div>

Now, what about the big conditional probability distribution table for failure? Well, that's a little harder. The general principle is that equipment is what you monitor the other failures with, so if there is an equipment failure, all the results should be less confident. If everything is working well, then it should be really unlikely to get a false positive (that's a value that probably should be a little lower than shown in the table), and finally, the more failures that exist at once, the more likely evidence of a failure would exist. 

<div class="tables-grid-1">
<div class="table-container" markdown="1">

#### Failure Evidence Conditional Probabilities

| Material Failure      | False | False | False | False | False | False | False | False | True  | True  | True  | True  | True  | True  | True  | True  |
|-----------------------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| Design Failure        | False | False | False | False | True  | True  | True  | True  | False | False | False | False | True  | True  | True  | True  |
|-----------------------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| Configuration Failure | False | False | True  | True  | False | False | True  | True  | False | False | True  | True  | False | False | True  | True  |
|-----------------------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| Equipment Failure     | False | True  | False | True  | False | True  | False | True  | False | True  | False | True  | False | True  | False | True  |
| No Failure            | 0.9999999      | 0.7 | 0.35 | 0.3 | 0.04 | 0.1 | 0.09 | 0.02 | 0.15 | 0.11 | 0.075 | 0.02 | 0.025 | 0.12 | 0.1 | 0.125 |
| Failure               | 1e<sup>-7<sup> | 0.3 | 0.65 | 0.7 | 0.96 | 0.9 | 0.91 | 0.98 | 0.85 | 0.89 | 0.925 | 0.98 | 0.975 | 0.88 | 0.9 | 0.875 |

</div>
</div>

## Inference

Now that we've set up the problem and provided the probabilities, we can use probabilistic inference to assign known values to the states and see what the most likely explanatory variable is. We can start with the condition that we are most likely to find ourselves in immediately, where we know there is a failure, but we've done no additional evidence collection. The table below shows the probabilities of a failure (the value 1) for each of the potential root causes.

|    |   Material |   Design |   Configuration |   Equipment |           p |
|----|------------|----------|-----------------|-------------|-------------|
|  0 |          0 |        0 |               0 |           0 | 3.22273e-07 |
|----|------------|----------|-----------------|-------------|-------------|
|  1 |          0 |        0 |               0 |           1 | 0.0508852   |
|----|------------|----------|-----------------|-------------|-------------|
|**2**|      **0** |    **0** |          **1**  |      **0**  | **0.89776** |
|----|------------|----------|-----------------|-------------|-------------|
|  3 |          0 |        0 |               1 |           1 | 0.0508852   |
|----|------------|----------|-----------------|-------------|-------------|
|  4 |          0 |        1 |               0 |           0 | 3.09385e-05 |
|----|------------|----------|-----------------|-------------|-------------|
|  5 |          0 |        1 |               0 |           1 | 1.52657e-06 |
|----|------------|----------|-----------------|-------------|-------------|
|  6 |          0 |        1 |               1 |           0 | 1.25688e-05 |
|----|------------|----------|-----------------|-------------|-------------|
|  7 |          0 |        1 |               1 |           1 | 7.12399e-07 |
|----|------------|----------|-----------------|-------------|-------------|
|  8 |          1 |        0 |               0 |           0 | 0.000273959 |
|----|------------|----------|-----------------|-------------|-------------|
|  9 |          1 |        0 |               0 |           1 | 1.50974e-05 |
|----|------------|----------|-----------------|-------------|-------------|
| 10 |          1 |        0 |               1 |           0 | 0.000127771 |
|----|------------|----------|-----------------|-------------|-------------|
| 11 |          1 |        0 |               1 |           1 | 7.12464e-06 |
|----|------------|----------|-----------------|-------------|-------------|
| 12 |          1 |        1 |               0 |           0 | 3.1425e-09  |
|----|------------|----------|-----------------|-------------|-------------|
| 13 |          1 |        1 |               0 |           1 | 1.4928e-10  |
|----|------------|----------|-----------------|-------------|-------------|
| 14 |          1 |        1 |               1 |           0 | 1.24319e-09 |
|----|------------|----------|-----------------|-------------|-------------|
| 15 |          1 |        1 |               1 |           1 | 6.36135e-11 |
|----|------------|----------|-----------------|-------------|-------------|

We can see that just knowing a failure existed, we should immediately suspect a configuration issue, which comes in at nearly 90% likelihood. Let's move forward in our investigation, though, and assume that we now have evidence of a Failure, but with Employee Testimony that it was set up correctly, recorded evidence of a failure, visual evidence of a failure, and a good material inspection prior to the failure. How does that change the results?

|    |   Material |   Design |   Configuration |   Equipment |           p |
|----|------------|----------|-----------------|-------------|-------------|
|  0 |          0 |        0 |               0 |           0 | 1.23374e-08 |
|----|------------|----------|-----------------|-------------|-------------|
|  1 |          0 |        0 |               0 |           1 | 0.11688     |
|----|------------|----------|-----------------|-------------|-------------|
|  2 |          0 |        0 |               1 |           0 | 0.00404334  |
|----|------------|----------|-----------------|-------------|-------------|
|  3 |          0 |        0 |               1 |           1 | 0.0137506   |
|----|------------|----------|-----------------|-------------|-------------|
|**4**|      **0** |    **1** |           **0** |       **0** | **0.754463**|
|----|------------|----------|-----------------|-------------|-------------|
|  5 |          0 |        1 |               0 |           1 | 0.0376066   |
|----|------------|----------|-----------------|-------------|-------------|
|  6 |          0 |        1 |               1 |           0 | 0.0360589   |
|----|------------|----------|-----------------|-------------|-------------|
|  7 |          0 |        1 |               1 |           1 | 0.00206468  |
|----|------------|----------|-----------------|-------------|-------------|
|  8 |          1 |        0 |               0 |           0 | 0.00772786  |
|----|------------|----------|-----------------|-------------|-------------|
|  9 |          1 |        0 |               0 |           1 | 0.0255522   |
|----|------------|----------|-----------------|-------------|-------------|
| 10 |          1 |        0 |               1 |           0 | 0.00042402  |
|----|------------|----------|-----------------|-------------|-------------|
| 11 |          1 |        0 |               1 |           1 | 0.00141863  |
|----|------------|----------|-----------------|-------------|-------------|
| 12 |          1 |        1 |               0 |           0 | 9.30762e-06 |
|----|------------|----------|-----------------|-------------|-------------|
| 13 |          1 |        1 |               0 |           1 | 4.46655e-07 |
|----|------------|----------|-----------------|-------------|-------------|
| 14 |          1 |        1 |               1 |           0 | 4.33193e-07 |
|----|------------|----------|-----------------|-------------|-------------|
| 15 |          1 |        1 |               1 |           1 | 2.23925e-08 |
|----|------------|----------|-----------------|-------------|-------------|

Well, we can see that it becomes far more likely that it is, in fact, a design failure! In this case, nearly 3 out of 4 times it would be a design failure, and this does make sense. We've set up a process that is intended to test the design, so if the process is followed, we should expect that a design failure is the root cause.

## Boundaries
At this point, there are often questions about not knowing the actual conditional probabilities for the system at hand. It is frequently interpreted that because we don't have empirical evidence, the previous analysis would be invalidated because they are *just guesses*. First it's important to keep in mind that in the "Does it matter?" section we already established that it does not in fact matter but even under the conditions that it did matter the question is not if the analysis above is incorrect (the answer is yes it is incorrect because it does not reflect reality perfectly) but when the particular assumptions about the conditional probabilities being altered would start changing our response to them. In short, there are really two questions at hand

1. When do our assumptions break?
2. How close are we to breaking these assumptions?

To help us understand this, we can establish an anticipated range of values and sample within that range. To do this, I created a [Google Collab Notebook](https://colab.research.google.com/drive/19KIrzLr2xuI75vP5n5rNbNvNwHU6W1t-?usp=sharing), which has all the code used for this blog post hosted there. All the results from here on are assuming a premature failure, employee testimony that the configuration was correct, visual evidence of a failure, recorded evidence of a failure, and a successful material inspection.

{% include plotly-chart.html 
   file="Prob_Trades.html"
   height="750"
   caption="Relationship between failure modes" %}

We'd expect this to follow a clear line, and it does for the most part. The relevant part is how few situations are where the configuration would be the root cause. It's also worth noting that as the Equipment failure becomes more likely, the spread increases, which is due to the fact that it becomes more likely that there was actually no failure in the system under test. This is important because if we have another way to gather more evidence about the state of the equipment the explantory variables will reduce even more heavily to a design or material failure.

So now that we have a general feel, we can start looking at what design failures are sensitive to and where some of those boundaries are.

{% include plotly-chart.html 
   file="Equipment.html"
   height="750"
   caption="Relationship between Equipment failure rate and Probability of Material or Design Fault" %}

The equipment failure relationships make sense in that as the equipment is less likely to fail, the higher likelihood of a failure is due to a design failure. The more likely the equipment is to fail, the more likely it is that a material and a equipment failure will happen.

{% include plotly-chart.html 
   file="Design.html"
   height="750"
   caption="Relationship between Design failure rate and Probability of Material or Design Fault" %}

{% include plotly-chart.html 
   file="Material.html"
   height="750"
   caption="Relationship between Material failure rate and Probability of Material or Design Fault" %}

The relationship between the design and material failure is as we'd expect. If the Material is less likely to fail, but one or the other has failed, then it is more likely that it was a design failure, and vice versa.

For the conditional probabilities, we won't show all the plots. If you are interested, you can look into the notebook. More importantly, for the ones not shown, the design failure was essentially uniform with the parameters for Recorded Evidence, Employee Testimony, Material Inspection, and the Conditional Failure, implying that lack of detailed knowledge of those parameters would not significantly impact the interpretation of the results.

{% include plotly-chart.html 
   file="Visual.html"
   height="450"
   caption="Relationship between Visual Evidence and Probability of Material or Design Fault" %}

Of interest, though, is the visual evidence. Primarily, we see sensitivity to the likelihood that no failure exists (Variable 0) and the visual evidence of a material failure (Variable 2) displays some sensitivity to the design failures. Not having visual evidence of a failure indicating there is no failure makes sense, and in the case of the visual evidence of the material failure, the less likely that is to be the case, the more likely a failure would be a design failure. In essence, if a material failure always resulted in visual evidence, then that visual evidence would provide more support for the material failure explanatory variable. 

From this, we can see that changing the conditional probabilities doesn't provide a clear grouping or clustering, so we can't really tell how close we are to breaking those assumptions. There almost certainly exists a combination of conditional probabilities that would change the most likely failure from a design failure to a material failure, but there are almost no combinations that would change a design failure to a configuration failure, so the test most certainly failed under relevant conditions $C$. It also indicates that finding a way to have additional evidence relating to the equipment would go a long way towards determining the root cause.

## Conclusions
After looking at our inference and our sensitivity study, we can feel pretty confident that if we are doing testing and there is a failure, it's most likely to be a design failure. We'd need to have strong evidence, like employee testimony of an incorrect configuration or a failed material inspection, to think we could not include the failure in our analysis. To put it simply, it should, in fact, count it. The biggest question remaining might be whether we want to weight the update to the alpha and beta parameters from the previous post to account for the existing uncertainty, but as we already established at the design targets, we've established that even that weighted solution puts a significant burden on the design, likely requiring a redesign or material process change.

## Refrences
1. [Human behavior in the context of low-probability high-impact events](https://www.nature.com/articles/s41599-024-03403-9)
2. Probabilistic Reasoning In Intelligent Systems: Networks of Plausible Inference, Judea Pearl