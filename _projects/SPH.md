---
layout: default
title: "Smoothed Partical Hydrodynamics for Contact Mechanics"
status: "ended"
featured: true
description: "Study on the use of SPH to simulation contact mechanics."
thumbnail: "/assets/images/SPH.jpg"
youtubeId: ChH7T8njWHQ
youtubeId1: Cs4p0SmFzTk
---

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/SPH.jpg" alt="Simulation at multiple time steps of a micro fiber bending" title="Microfiber SPH Simulation Dragging Across a Smooth Surface" style="max-width: 50%; height: auto; display: block; margin: 0 auto;">
</div>

## Project Details

The Smoothed Particle Hydrodynamics (SPH) Contact Mechanics project emerged from the challenge of modeling complex material interactions at the micro-scale. Traditional finite element methods struggled to capture the time-dependent behavior of polymers and complex contact mechanics, particularly when studying micro-fiber deformation. This research leveraged SPH, a mesh-free particle method originally developed for astrophysics, adapting it to analyze contact mechanics between viscoelastic materials at scales where surface forces become significant relative to body forces.

<div style="text-align: center; margin: 2rem 0;">
    {% include youtubePlayer.html id=page.youtubeId %}
</div>

The research demonstrated that SPH could effectively model both the bulk material behavior and surface interactions of viscoelastic materials at the micro-scale. Through careful validation against experimental data collected from custom-built test rigs, the project showed good correlation between numerical predictions and physical measurements for both static and dynamic loading conditions. A key innovation was the development of new contact force models that incorporated surface energy effects while maintaining computational efficiency. The research produced both high-fidelity numerical models and simplified analytical approximations suitable for real-time applications. These developments proved particularly valuable for designing micro-textured surfaces for prosthetic adhesion, where the complex interplay between material properties and surface geometry determines performance.

My role centered on developing the core numerical methods and experimental validation approaches. Incorporating novel contact mechanics models and viscoelastic material behavior. I designed and built test apparatus to measure forces and deformation at multiple scales, providing crucial validation data. A significant contribution was developing methods to extract simplified analytical models from the full SPH simulations, enabling real-time control applications while maintaining physical accuracy. This work resulted in multiple peer-reviewed publications and established a framework for analyzing micro-scale contact mechanics that continues to influence the field.

<div style="text-align: center; margin: 2rem 0;">
    {% include youtubePlayer.html id=page.youtubeId1 %}
</div>

Looking back at this project after almost a decade what stood out the most was how poor the experimental validation was. It was laughable, far away from anything close, but even with that, I find some of the simulations rather compelling. The microfiber and flat PDMS blocks plastic deformation and shedding of particles have some face validity. Like most of these sorts of simulations, the boundary conditions were especially problematic. I stuck to impossibly smooth surfaces because when I didn't, large chunks of the fibers or blocks would break off, resulting in tiny time steps and never-ending simulations that caused me to run out of space on my desktop. 

### Related Publications and Links
1. [Cramer, N., & Teodorescu, M. (2013). "Analysis of polymer micro fibers a smoothed particle hydrodynamics approach." ASME IDETC/CIE](https://drive.google.com/file/d/1k1D57a3mi6FH0IKLVvIrBVO103bId7_2/view?usp=sharing)
2. Cramer, N., & Teodorescu, M. (2014). "Predicting Vibration of Micro-Scale Structures: Accurate SPH Approach and Simplified Generalized Kelvin Model." ASME IDETC/CIE
3. [Cramer, N., et al. (2015). "Analysis of Contact Mechanics and Smoothed Particle Hydrodynamic Simulations of Viscoelastic Polymer Sine Waves." ASME IDETC/CIE](https://drive.google.com/file/d/1sKptM6Ml0-J0tF2IHur5ARNCQx65l08m/view?usp=drive_link)