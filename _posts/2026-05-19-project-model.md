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

The plot shows more of what we would have expected which is that QBs end up being the most valuable and have an absolutely massive jump from year one to year two. One of the more interesting things about both plots is how bad Tight End and Safety performance generally is. 

With these plots in mind we can see clear trends which should let us create a projected model.