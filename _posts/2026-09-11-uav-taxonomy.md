---
layout: default
title: "UAV Taxonomy and Observations"
show_title: true
date: 2026-09-11
---

I remember when I first started at NASA, spending a lot of time arguing about Taxonomy while trying to put together proposals or discussing different strengths and weaknesses within a problem domain. It always left a little bit of a sour taste in my mouth because it felt like arguing over semantics instead of content, and it often was. Still, I remember finding Hassanalian et al.'s representation of UAV taxonomy helpful in providing a framework to categorize different types of UAVs. Providing that framework is the goal of a taxonomy in the first place, rather than using it in an argument. The primary graphic of their paper is shown below.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/Classification-schemes-of-UAVs-based-on-weight-and-propulsion-Adapted-from-Reference.png" alt="Image of the taxonomy of UAVs by wingspan, weight, and means of propulsion" title="UAV Taxonomy from Classifications, applications, and design challenges of droves: a review" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
    <p style="font-size: 0.9em; margin-top: 8px;">
        <a href="https://www.researchgate.net/profile/Matthew-Stewart-8/publication/351037538/figure/fig2/AS:1015105982562309@1619031534868/Classification-schemes-of-UAVs-based-on-weight-and-propulsion-Adapted-from-Reference.png">Hassanalian, M., & Abdelkefi, A. (2017). Classifications, applications, and design challenges of drones: A review. Progress in Aerospace Sciences. https://doi.org/10.1016/j.paerosci.2017.04.003</a>
    </p>
</div>

About a decade after first seeing their taxonomy, I was going back through my slides from my UAV design class and, without the time pressure of upcoming classes, realized what it really was missing was a starting framework for someone to just learning to latch on to and to be refer back to throughout the class. What I imagined not just the diagram above but something more interactive. When you look at other overview papers like [Stewart et al.'s "UNMANNED AERIAL VEHICLES: FUNDAMENTALS, COMPONENTS, MECHANICS, AND REGULATIONS"](https://www.novapublishers.com/wp-content/uploads/2020/10/Unmanned-Aerial-Vehicles.pdf), they will always show a handful of pictures (in that paper, 8) of different types of UAVs to show their diversity of forms, but due to space limits they naturally were not able to show a representative example for each one. Not constrained by a page limit or a PDF, I envisioned something where each example could be moused over, with a reference to a UAV with that configuration popping up for easy viewing. My attempt is below, and I'll try to describe the intent behind some of my changes and a few observations I made revisiting this after a decade. 

<iframe src="/assets/plots/uav-classification-interactive.html"
        width="100%"
        style="border: none;"
        onload="this.style.height = this.contentWindow.document.documentElement.scrollHeight + 'px';">
</iframe>

Before we get into the observations, it’s worth mentioning the motivations for some of the category changes I made. I obviously changed the names of the size categories, and I did so in a way that matches neither the FAA's nor the DoD’s classifications. My logic was that if you asked someone what a drone is, they would probably say something like a DJI multirotor or maybe a package-delivery drone. If you said a small drone, they'd probably still think of something like a DJI, but more like a [DJI Mini](https://www.dji.com/mini-4-pro) as opposed to a [DJI Matrice](https://enterprise.dji.com/matrice-400/specs), which then becomes the reference for a default drone. If you were to say mini or nano drone, they probably wouldn’t distinguish between the two and would think of something that would sit on the palm of their hand for either. On the other hand, a large or big drone probably starts conjuring images of a [Predator](https://en.wikipedia.org/wiki/General_Atomics_MQ-1_Predator). So I tried to stick to something more colloquial than academic because my goal is to communicate basic structure to an audience who is not already embedded in the community, as opposed to classifications for shorthand communication among professionals.

This raises the question of why I kept UAV when drone is how most people refer to them. This is primarily to be more inclusive at the top end. I would consider Wisk or Ehang as Un*crewed* Aerial Vehicles, but the word drone doesn’t really allow for people to be onboard.

The last alteration is that I chose to remove the Bio Mav and unconventional categories. The unconventional categories exist in each domain and are really just a catch-all for anything that doesn’t fit in a box, which is a given for any taxonomy but not necessary to highlight, since it's understood that any classification has gaps. The Bio Mav was removed because I couldn’t find an example that didn’t fit into another category for its propulsion. In the original diagram, it broke out Taxidermy and Live. However, both still use flapping wings for propulsion, so we can safely call them ornithopters if we feel their control now qualifies them as aircraft and justifies their inclusion in this diagram in the first place.

## Observations

One of the other objectives, rather than a more interactive and expansive representation of each classification, was to capture their current domain usage. Which I categorized as:

* Commercial - Used in commerce activities or business activities with the intent to generate revenue.
* Defense - Military or national security use cases
* Research - Both research into the design of the UAV and for research applications like scientific data collection
* Hobbyist - The end users are there to have fun either through the joy of flying or augmenting another activity like photography

At a glance, we can see a few form factors with broad adoption across all domains: the 1m-15cm wingspan Horizontal Take-off and Landing and Multirotor, are used across all domains, reflecting their ease of use and low cost that allow wide adoption. Another broad trend is that the smaller we get, the more hobbyist and research focused things become. This makes sense; there isn’t a lot of functional work you can do at that scale. At that scale, information gathering is about all you can do, and information quality is generally better with larger equipment. Additionally, there are few places we want to look that require both something small and something that can fly. The one exception I found was the Cleo Robotics mini ducted fan aircraft, which targets the niche area of indoor operation in tall buildings where we would normally use ladders and humans to collect that information.

Another thing that stands out is that the number of different classifications decreases as size goes down. Generally, the complexity of the systems gets simplified as the size decreases, with the exception of the Mini Cyclocopter. This makes sense in that there is an achievable floor for manufacturing, especially mass production; to meet the flight physics demands at the smaller scale, all of the components need to be custom manufactured, as was the case with the Mini Cyclocopter, which greatly increases the engineering effort but also the number of potential failure points in the design and production.  

The most exciting thing for me revisiting this was how much research progress was made at the bottom of the scale. In the last few years, there were multiple Micro Monocopters that used either [magnets](https://www.science.org/doi/10.1126/sciadv.ads6858) or [light](https://www.science.org/doi/pdf/10.1126/sciadv.aef0912) as the control mechanism. But the most surprising was to find something to place in the smart dust category. The [Acoustic Resonators using Helmholtz resonance](https://www.science.org/doi/pdf/10.1126/sciadv.aef5620) to produce thrust and lift. The rotor version pictured is technically a little too large for the classification, but the thrust-borne microflier from their paper is right on that size border, and at 0.15 mg is even below the weight range initially scoped for Smart Dust. It's an incredibly cool and creative concept that I thoroughly enjoyed reading.

A stray thought I had while looking at these solutions is that, at that scale, it made perfect sense to me that we’d need to move an external power source, but the biological equivalent doesn’t have the same constraint. Indicating there is still plenty of research at the bottom, even if we don’t quite have an immediate commercial.