---
layout: default
title: "Does draft and trade value relate to winning?"
show_title: true
date: 2026-06-06
---

In previous posts, we proposed the [Expected Approximate Value Above Replacement]({% post_url 2026-05-09-eaar %}) and explored different [methods to project a player's growth]({% post_url 2026-05-24-project-model %}), all with the objective of being able to create a tool to assess a draft class. We used those techniques we developed in the first two posts to create an [NFL Team Trade History Analyzer](https://cram9030.github.io/tools/nfl_trade_history/) and [NFL Draft Class Analyzer](https://cram9030.github.io/tools/nfl_draft_class/). Each of these tools serves a slightly different purpose and can hopefully be used to provide a more objective assessment of a general manager's performance for a given draft.

Let’s first take a look at what we can get from the NFL Team Trade History Analyzer by looking at an example using the Detroit Lions 2025 draft trades.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/trade-analysis-DET-2025.png" alt="A picture of all the pictures from the trades of the Lions 2025 draft and the relative value they recieved from 5 different charts." title="Detroit Lions 2025 Trade Value" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
    <p style="font-size: 0.9em; margin-top: 8px;">
    </p>
</div>

Each trade has its own row, and the columns represent one of the five different trade charts. The units are not normalized, but the colors are, so a quick glance at the depth of the red in this case will give an idea of how bad the trade was, or green (in the much rarer case for Brad Holmes), how good the trade was. Underneath each value there is also the equivilant pick value, which is another way of normalizing the comparison, and at the very bottom we see the total amount of value. For this draft, we can see that the Lions GM Brad Holmes cummlatively lost the equivilant of somewhere between the 12th pick in the second round (44) according to the Fitzgerald-Spielberger chart or the 32nd pick in the third round (95) in on the Jimmy Johnson chart. So in general the picks in this draft class would need to cumlatively out perform somewhere between a second and late third round pick to have made the trades worth it. 

Now we can look at the actual contributions of a given draft class. We won't use 2025 as our example. While we don't need to wait three or four seasons to start assessing them, one season is not enough. Instead, we'll use the absolutely bumper class of 2023 as our example.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/draft-class-DET-2023.png" alt="A picture of all the pictures of the Lions 2023 draft  picksand the relative value they recieved in expected value above replacement." title="Detroit Lions 2023 Draft Value" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
    <p style="font-size: 0.9em; margin-top: 8px;">
    </p>
</div>

Each player gets a row, and their Approximate Value per year is reflected with an asterisk on the years that are projected by the model. We can see each projected model in the far columns that give us a range of performance expectations. There is a final row that is the aggregation of all the players' contributions down at the bottom.

As a Lions fan, I look at all the red in the first table and am pretty displeased, but all the green in the second is pretty nice. I've been a pretty frequent critic of Brad Holmes trading habits in large part because I was familiar with how unfavorable trading up was. I could go look at the charts and see that he was consistently losing value, but he was hitting on picks, and the team was improving every year. It raises the question, "How much does trade value actually contribute to winning?" 

Well, let’s take a look. We already know that there is a [decently strong correlation between draft picks per year and winning](https://codeandfootball.wordpress.com/2011/04/06/winning-versus-draft-picksyear-a-small-but-real-correlation/) of about 0.378, but we probably want to go a little deeper, given that we saw in [previous post players get better as they gain more experience ({% post_url 2026-05-24-project-model %}). This plot requires a little bit of explanation. The Lag years are the number of years after the draft. So if we use the 2023 draft from above as an example, the Lag 0 is the 2023 season, Lag 1 is 2024, Lag 2 is 2025, and Lag 3 will be the upcoming 2026 season.

<iframe src="/assets/plots/draft_lag_class-surplus_vs_win-pct.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

The first thing to note when we are looking at this is that win percentage will always give an artificially capped correlation in comparison to something like point differential or [Simple Rating System](https://www.sports-reference.com/blog/2015/03/srs-calculation-details/?_gl=1*aclyix*_ga*ODMyMDI0MTYyLjE3NzgyOTY0OTM.*_ga_80FRT7VJ60*czE3ODA3ODY4NjAkbzI5JGcxJHQxNzgwNzg4NjQzJGo2MCRsMCRoMA..), because the range is limited to 0 and 1, and even the best teams tend to have about a 0.8 % win percentage, and the worst 0.125 % the range is artificially narrowed. That being said, we do see a trend, particularly in the rookie years of a draft class, have the lowest correlation to winning. The correlation to winning increases every year until it peaks in the third year with a Pearson's correlation coefficient of 0.339. This is actually rather impressive given the fact that in the NFL’s correlation of win percentage from one year to the next is 0.33, but the correllation to the second and third years from that season are ~0.3 and ~0.21, respectively. ([Link](https://harvardsportsanalysis.org/2018/01/how-much-correlation-between-seasons-is-there-in-each-major-north-american-sports-league/)) So the quality of the draft class correlates more closely with winning in years 2 and beyond than winning the season prior to the draft class does. This provides a pretty good face validity check that it aligns well with expectations, and the magnitude of correlation aligns broadly with year-over-year metrics.

Now we can move on to looking at the trade value.
<iframe src="/assets/plots/draft_lag_trade-av_vs_win-pct.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

This is much less convincing; the correlation coefficient ranges would be described as [weak, negligible, or poor](https://pmc.ncbi.nlm.nih.gov/articles/PMC6107969/table/tbl1/) depending on the domain. That being said, there is some logic apparent here. When a team trades down, they acquire more picks later in the draft, even if they get more value over the lifetime of the contract. Later draft picks tend to see the field less, either due to lack of opportunities or slower growth. As we saw [previously though]({% post_url 2026-05-24-project-model %}), first round picks have much higher first year AV than the population as a whole, so it’s reasonable to expect the growth pattern to be slower for later picks as well. So the first two years have a negative correlation, good trade value results in more later picks that have less immediate impact, but by year three it is positive and peaking, then tailing off in year four, just like the draft class in general.

There are a few additional things to note here. In a perfect market, there would be absolutely no correlation because all of the trades would be balanced. Any imbalance would be primarily from the winner’s curse because there are multiple bidders. Even in the imperfect market as it is trade are very rarely incredibly one-sided, with trades for quarterbacks being the primary exceptions. There is some evidence that those QB trades are contributing to the low correlation. While the Pearson and Spearman’s coefficients are nearly identical for the draft class when it comes to the trade values, this is not the case. This implies that the outliers were having a meaningful effect. It’s also worth noting that the sample size decreases every year because trades where the players were no longer in the league were removed, which could also be biasing the data, though the quantity removed is small.

| Number of Years From the Draft | Spearman's Correlation Coefficient | Sample Size |
| - | ----- | --- |
| 0 | 0.023 | 416 |
| 1 | 0.022 | 413 |
| 2 | 0.088 | 410 |
| 3 | 0.059 | 407 |

The natural next question is if the Net AV by adding the trade value to the draft value every years will continue to increase the correllation with winning. Due to the strong cluster in the trade plots, they don’t visually look much different, so instead, a heat map of the correlation coefficient is shown below.

<iframe src="/assets/plots/draft_lag_correlation_heatmap.html"
        width="100%"
        height="800"
        frameborder="0">
</iframe>

We see in years three and four the correlation is positive, the Net value does increase the correlation with winning and other more stable metrics like point differential and SRS, but in relatively small amounts. This is a strong indication of other confounding variables. It is relatively simple to come up with a long list of likely confounding variables like free agent signings, veteran trades, injuries, and coaching changes.

With all of this in mind, it does look like there is some correlation with gaining value through trades, but in comparison to just hitting on picks, it is much lower. This analysis probably underestimates the impact of gaining value through draft day trades due to the inclusion of outlier trades for quarterbacks, think the Trey Lance trade as a high value trade that should have had a negative correlation, but the Niners finding Brock Purdy essentially completely offset it. Some additional support of this is the strength of correlation between the [strength of correlation between the number of picks and winning over a long period of time](https://codeandfootball.wordpress.com/2011/04/06/winning-versus-draft-picksyear-a-small-but-real-correlation/), but draft picks are aquired in ways beyond pick-for-pick trades included here, including veteran trades, compensatory picks, and even trades for coaches are all examples.

 **I think I walk away from this analysis confident that drafting well is incredibly important to a team's success, but believing that gaining value on trades has a small enough impact that context like championship window, positional composition of the team, free agent class strength, draft class strength, cap situation, and even NIL could easily outweigh the impact of gaining value from draft day trades.** In short, it is not meaningless, but being good at other aspects of the game matters more. If anything, the contributions might fit more in the aggregation of marginal gains bucket, where the consistent investment in trading down eventually results in a critical mass of value that would correlate to winning, just not over the period of a rookie contract. If that is the case, then it might only manifest for long-tenured GMs like Chris Ballard, Howie Roseman, or John Schneider, which leaves us in the quandary of determining if we are just witnessing survivor bias or not. That’s not where I thought I would be, and maybe with further analysis, removing QBs, I will find myself once again raging against bad value trade-ups on draft day, but for now, I probably owe an apology to Brad Holmes.