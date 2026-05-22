---
layout: default
title: "Projecting a Players Value"
show_title: true
date: 2026-05-20
---

It is a common refrain that a draft class can not be judged until at least three years after the draft, with some people (Jeff Risdon comes to mind) who insist it shouldn't be judge until the full rookie contract is complete. I don't agree while closing the book after one year is probably a little to sporty especially for picks that are not in the first round and things like injuries can knock a course off three years is much to long. The reason is pretty simple a rookie contract is only 4 years long. I don't include the 5th year option for first round players because while they are controlled it is essentially at market rate or higher which is why so many of them are declined. 

When I am talking about assessing a player I mean in a quantiative sense based on their performance relative to the [expected approximate value above replacement](https://cram9030.github.io/2026/05/09/eaar.html). The concept that we don't need to wait for a players full contract to play out makes sense. Typically a player who is very good as a rookie will continue to be good and while there are late bloomers they are far more likely to follow a consistent development and growth path than bursting to stardom. The plot below shows the average AV by year in the league and position.

<iframe src="/assets/plots/position_career_av_normalized.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

The general patterns are ones we would expect which is that positions generally improve over time. In the later years there is certainly a risk of surviorship bias where only good players are still in the league by year 9 but the period of their rookie contract because the average career between 3 and 4 years for most positions. ([statista](https://www.statista.com/statistics/240102/average-player-career-length-in-the-national-football-league/)) Some of the more interesting things to note is that Cornerbacks have the highest AV over their rookie contract. While I ahven't dug into it my suspicion is that it has more to do with the amount of injuries at the position and the relatively year to year inconsistency for the performance. With frequent injuries back ups get more play time that other positions might raising the floor and the large year to year variations are likely to be heavily correlated with the good defense increasing the AV in a way that might not be the case for say a defensive tackle. 

On thing that jumped out to me was how low the AV was for QB but I figured that was most likely because the QBs outside the first round are basically always back ups early in their career so I isolated the first round players and made the same plot.

<iframe src="/assets/plots/position_career_av_normalized_r1.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

The plot shows more of what we would have expected which is that QBs end up being the most valuable and have an absolutely massive jump from year one to year two. One of the more interesting things about both plots is how bad Tight End and Safety performance generally is. There's a case that this is just the positional weighting of AV pulling them down but that would only explain the magnitude not the particular shape where those positions performance doesn't really platue. If I had to guess this is less of an indication of the players themselves and more a reflection of teams with bad process more likely to draft less than premium positions being bad in general. Basically there are more Isaiah Simmons and Mark Barrons in the first round than there are Kyle Hamiltons. Simmons and Barron were bad process by team GMs that were fired within two seasons for bottoming out. In short the hypothesis is that generally drafting Safeties and Tight Ends in the first round is an symptom of a bad process which would result in a bad team making the players look worse while the team bottoms out. 

With these plots in mind we can see clear trends which should let us create a projected model. 

## Parametric

The parametric is the most straight forward when we look at the graphs above we can see patterns and might think to ourselves "if I squint that looks like a quadratic curve." The parametric solution is just taking a curve and fitting the parameters for each position. Then when we want to adjust it to an individual player who say was let's say twice as good as an average player at their position in the rookie year then we can assume their career will look essentially the same as an average player just twice as good. In short we scale the average players career progression by how well the player in question as done in the years they've played so far. 

Let's take [Penei Sewell](https://www.pro-football-reference.com/players/S/SewePe00.htm) as an example. In his rookie year he had a **7 AV** but from the plot above we can see that the average OT in their rookie year produced **2.98 AV** which means for Penei Sewell's projection from his rookie year we would scale his career trajectory relative to the average career trajectory by **2.35** so we assume that for the rest of his career Sewell will stay 2.38 times better than the average offensive tackle. That seems reasonable for their rookie year but what about beyond that? We take basically the same approach where we average the first two years of the player we are interested in and the average player then create the scaling function. So using Sewell as out example again

|              | Year 1 | Year 2   | Average |
|--------------|--------|----------|---------|
| Penei Sewell | 7.0    | 13.0     | 10.0    |
| Average OT   | 2.98   |  4.03    |  3.505  |
|              |        | **Scale**| 2.85    |

In this case we've gotten more information that Sewell is even better than average tackle so the next time we project his future years we will use the 2.85 scale instead of the 2.35 from his rookie year. In this manner we are able to adjust to the individual player. While in this example we used the actual means the models will use the projected zero intercept so the values will be a little different. That can be seen in the parametric quadratic fit plot shown below where the OT rookie year value is ~2.1 AV.

<iframe src="/assets/plots/parametric_curves_quadratic.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

When we compare this plot with the ones above we can see they generally match but that they decay much faster at the end and tend to have lower values. That is because the first plot only inclued players who were still playing at that year but when projecting a players performance the possibility of them no longer being in the league must be taken into accound so those players were included and allocated a zero AV. By in large only well above average players make it to the later years in their career or else they will be replaced by cheaper younger options. 

| Position | Cubic | Gamma | Quadratic | Quartic |
|----------|-------|-------|-----------|---------|
| CB | 3.1733 | 3.4248 | 3.1527 | 3.1615 |
| DE | 2.6059 | 2.7319 | 2.6215 | 2.6017 |
| DT | 2.8288 | 2.9513 | 2.8164 | 2.8403 |
| LB | 2.3594 | 2.5769 | 2.3339 | 2.3548 |
| OC | 2.9435 | 2.9873 | 2.9414 | 2.9366 |
| OG | 2.4153 | 2.5587 | 2.3969 | 2.4146 |
| OT | 2.6581 | 2.7773 | 2.6347 | 2.6468 |
| QB | 3.9833 | 3.9602 | 3.9873 | 3.9569 |
| RB | 1.5791 | 2.1437 | 1.5851 | 1.5773 |
| S | 1.5453 | 1.7735 | 1.5515 | 1.5452 |
| TE | 1.3064 | 1.4408 | 1.3040 | 1.3037 |
| WR | 1.9735 | 2.1365 | 1.9623 | 1.9674 |
| **Overall** | **2.4477** | **2.6219** | **2.4406** | **2.4422** |

We also compared the mean AV error multiple different options for the parametric fit including quadratic, quartic, cubic, and Gamma which is most commonly used in statiscial distributions. We see that the quadratic ended up being the best. The plot and table don't give any indication why but by in large it's mostly due to the fact that as the later years got closer to zero so the fit being better there had less impact on the strict mean. That being said when fits are so close that an artifact like that can give these results it's typically best to just go with the model with fewer parameters.

Why don't we see how out model did with Sewell?

<iframe src="/assets/plots/det_2021_penei_sewell_projection.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

We can see that the model kept under predicting Sewell's performance. This is mostly because even though we scalled the model to Sewell's previous performance the rate of improvement by Sewell year to year was just to large. There were things we could do to try to predict Sewell better but models that try to capture the whole population of NFL players in just 3 parameter will always struggle to capture the top 1% of players like Sewell. It actually does a better job on his draft mate Derick Barnes.

<iframe src="/assets/plots/det_2021_derrick_barnes_projection.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

We can see that Barnes actual performance bounced around the projected average doesn't seem so bad. Barnes is a lot closer to an average NFL player than Sewell is so this makes sense.

## K-Nearest Neighbors



## Ridge

## Results
