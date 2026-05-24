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

<iframe src="/assets/plots/det_2021_penei_sewell_parametric.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

We can see that the model kept under predicting Sewell's performance. This is mostly because even though we scalled the model to Sewell's previous performance the rate of improvement by Sewell year to year was just to large. There were things we could do to try to predict Sewell better but models that try to capture the whole population of NFL players in just 3 parameter will always struggle to capture the top 1% of players like Sewell. It actually does a better job on his draft mate Derick Barnes.

<iframe src="/assets/plots/det_2021_derrick_barnes_parametric.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

We can see that Barnes actual performance bounced around the projected average doesn't seem so bad. Barnes is a lot closer to an average NFL player than Sewell is so this makes sense.

## K-Nearest Neighbors

K-Nearest Neighbors (KNN) has a pretty simple concept behind it. Players who played the same position, were drafted around the same slot, and performed the same way are probably going to perform in a similar way in the future. The steps to KNN are

1. Determine the number of neighbors to look at. In our case we chose 10.
2. Calculate distance from the current player to nearby players. In our case this is done by 
   - Normalizing the player we are trying to projects draft pick: $pick_{norm}\frac{pick}{draft \ size}$
   - Normalizing the approximate value of the years they've played. In this case we are taking the players AV in year $i$ and dividing by the maximum AV per that position : $norm \ AV_{i} = \frac{AV_{i}}{max(AV)}$
   - Calculate the euclidean norm: $\sqrt{pick_{norm}^2 + \Sigma_{i \in years_{played}} norm \ AV_{i}^2}$
3. Find the $k$ closest scores to the one calculated in step 2
4. Average the scores of the closest players for their remaining years and use that as the players projection

This has to be better for players like Penei Sewell right?

<iframe src="/assets/plots/det_2021_penei_sewell_KNN.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

Maybe not as much as we think it should group Sewell with players like Lane Johnson, Tyron Smith, and Trent Williams those players all made the Pro-Bowl in their third season but just as valid would be Jedrick Wills Jr or Russel Okung. In any case even taking those top teir players most of them don't stay at the lofty AV height that Sewell has with only Tryon Smith actually exceeding an AV of 9 in year 4 (note the plots are years of experience prior to that season so a rookie has 0 years of experience a sophmore has 1, etc.). Orlando Brown Jr. might be the closest analog and he would also represent a step down in performance to a still lofty AV of 13. Let's take a moment to wonder at the absolute tear which has been the start of Sewell's career.

## Linear

The final model is the Linear Regression model. It is a fairly straightforward model that assumes there is a linear relationship between the played years and the projected years.

$$y = Ax$$

where $y$ is an array of the future years, $x$ is the array of played years, and $A$ is the linear relationship between them. So in the case where we have 2 years and we are trying to project a 10 year career it would look like:

$$\begin{bmatrix}AV_2 \\ AV_{3} \\ AV_{4} \\ AV_{5} \\ AV_{6} \\ AV_{7} \\ AV_{8} \\ AV_{9}\end{bmatrix} = A \begin{bmatrix}AV_0 \\ AV_1 \end{bmatrix}$$

where $AV_0$ would equal the players rookie year, etc. and the relationship between the a players rookie year and their third year in the league is the matrix cell $A_{11}$ and the whole matrix can be solved by effectively stacking all the players in the training set and minimizing the error between the projected and actual solutions.

$$min ||y-Ax||$$

Unlike the other models that have been used this does mean there needs to be a unique matrix for each year and position. We can once again take a look at how it does with Penei Sewell just a gut check. 

<iframe src="/assets/plots/det_2021_penei_sewell_linear.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

We can see that it is the most pessimestic model based on the rookie year but afterwards seems pretty close to the ther models

## Results

So far we have looked at q few different models and at this point there's probably a question about which one is the best and given our look at Sewell there's probably a question of if we wouldn't be better off just assuming the player will perform the same the next year as they did the year prior instead of trying to project their performance. We'll we did exactly that and provided a table below comparing all the different proposed solution to that baseline heuristic.

| Position | knn | linear | parametric/cubic | parametric/gamma | parametric/quadratic | parametric/quartic | Heuristic |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| CB | 3.1711 | 2.9305 | 3.1733 | 3.4248 | 3.1527 | 3.1615 | 4.2071 |
| DE | 2.6000 | 2.5114 | 2.6059 | 2.7319 | 2.6215 | 2.6017 | 3.0302 |
| DT | 2.9695 | 2.7169 | 2.8288 | 2.9513 | 2.8164 | 2.8403 | 3.0204 |
| LB | 2.5174 | 2.2821 | 2.3594 | 2.5769 | 2.3339 | 2.3548 | 2.9704 |
| OC | 3.3076 | 2.9517 | 2.9435 | 2.9873 | 2.9414 | 2.9366 | 3.1481 |
| OG | 2.4755 | 2.3790 | 2.4153 | 2.5587 | 2.3969 | 2.4146 | 2.9841 |
| OT | 2.5990 | 2.5138 | 2.6581 | 2.7773 | 2.6347 | 2.6468 | 3.0622 |
| QB | 4.1938 | 4.0039 | 3.9833 | 3.9602 | 3.9873 | 3.9569 | 4.9412 |
| RB | 1.6545 | 1.5034 | 1.5791 | 2.1437 | 1.5851 | 1.5773 | 2.6661 |
| S | 1.5944 | 1.4747 | 1.5453 | 1.7735 | 1.5515 | 1.5452 | 2.0527 |
| TE | 1.2564 | 1.2625 | 1.3064 | 1.4408 | 1.3040 | 1.3037 | 1.5364 |
| WR | 2.0298 | 1.9720 | 1.9735 | 2.1365 | 1.9623 | 1.9674 | 2.4497 |
| **Overall** | **2.5308** | **2.3752** | **2.4476** | **2.6219** | **2.4406** | **2.4422** | **3.0057** |

What we see is that the over all best performing solution was the linear regression but all the solutions did pretty poorly on QBs. There is a pretty obvious reason for that which is most QBs don't play. Generally speaking there will only be between 40 and 50 QBs to play in a season but there are close to 80 of them rostered at any given point. The average QB does very little and the AV is all concentrated in a very few high performing QBs. If we simply split out first round QBs we'd probably do a lot better across the board. 

Even the worst performing model had a mean AV error of about 3 AV projecting using the first two years to project the next eight years. This probably underestimates the error a little because in the later years the players performance will be heavily biased towards 0 AV when players retire. That being said when training directly only for players still in the league there was only about an 0.25 AV increase. As we saw with the Derrick Barnes example above the year to year performance might be challing but the over all accuracy would be reasonable. An error of 3 AV is basically the value of hitting on a late fourth round pick being spread out over 8 years.

These models are used in projecting the quality of draft classes with less than 4 completed season in the [Draft Analyzer Tool](https://cram9030.github.io/tools/nfl_draft_class/).