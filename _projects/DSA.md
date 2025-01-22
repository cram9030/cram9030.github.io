---
layout: default
title: "Distributed Spacecraft Autonomy (DSA)"
status: "ended"
featured: true
description: "Multi-spacecraft advance command and control methodologies for distributed space systems."
thumbnail: "/assets/images/DSA.jpg"
youtubeId: 7lOMHxqG6oE
---

<h1 class="project-title">{{ page.title }}</h1>

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/DSA.jpg" alt="DSA" title="Distributed Spacecraft Autonomy" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
</div>

## Project Details

The Distributed Spacecraft Autonomy (DSA) project was developed to advance distributed decision making methodologies for distributed space systems. The project focused on enabling multiple spacecraft to work together autonomously while reducing the need for ground control intervention. DSA implemented a novel approach to distributed coordination by combining inter-satellite networking capabilities with autonomous planning algorithms to allow spacecraft to share data and make collective decisions in real-time.

The project successfully demonstrated autonomous coordination between multiple spacecraft with 96.4% consensus and 99.2% coverage in simulated performance tests. A key achievement was reducing response time to observations from approximately 8 hours for ground-in-the-loop operations to less than 5 minutes using autonomous coordination. The system was selected to fly as a technology demonstration payload on NASA's Starling mission, validating the approach of using distributed autonomy for space-based data collection and service-providing missions.

<div style="text-align: center; margin: 2rem 0;">
    {% include youtubePlayer.html id=page.youtubeId %}
</div>

As Technical Manager and Research Computer Scientist, I led the growth of the project from an understaffed team to a 16-person organization managing a $14M lifecycle budget. I directed the development of flight software that met NASA Software Engineering standards using C++ and implemented test infrastructure utilizing Docker for automated testing. The project's success led to its selection for briefing to Congress and eventual adaptation to SpaceROS, where I demonstrated that the communications infrastructure could be implemented in one-third the development time compared to traditional approaches using RTI Connext DDS Micro.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/LPNT.jpg" alt="DSA LPNT" title="Distributed " style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
</div>

Lunar Position Navigation and Timing (LPNT) was developed to address a critical infrastructure gap for future lunar operations – the lack of a GNSS-like navigation system on the Moon. Rather than attempting to extend terrestrial GNSS capabilities to lunar distances, LPNT proposed an innovative solution that leveraged communication satellites already required for lunar missions to create a distributed, low-cost navigation network.
The project demonstrated significant technical achievements through its decentralized approach to lunar navigation. Using a modified distributed extended Kalman Filter (DEKF), the system achieved positioning accuracy of 472.5m, with best-case performance reaching 47.9m using centralized estimation. The system's scalability was validated through deployment across 100 representative processors spanning three different hardware architectures, proving the feasibility of implementing this solution across a heterogeneous lunar satellite network.
As both Project Manager and technical contributor, I directed the overall development while providing algorithm development support for the core navigation capabilities. When the lead developer departed, I stepped in as the primary technical resource, guiding the team in developing and implementing the C++ flight software. This dual role enabled me to ensure both programmatic success and technical excellence, maintaining continuity of the complex distributed algorithms while meeting NASA's rigorous flight software standards.

### Related Publications and Links
1. [Distributed Spacecraft Autonomy (DSA) GCD APR](https://ntrs.nasa.gov/citations/20220013607)
2. [Cramer, Nicholas, et al. "Design and testing of autonomous distributed space systems." 35th Annual Small Satellite Conference. No. SSC21-NST-04. 2021.](https://ntrs.nasa.gov/api/citations/20210016930/downloads/SmallSat2021.pdf)
3. [Kempa, Brian, Nick B. Cramer, and Jeremy D. Frank. "Swarm Mentality: Toward Automatic Swarm State Awareness with Runtime Verification." AAAI 2022 Spring Symposium Series. 2022.](https://ntrs.nasa.gov/api/citations/20220002625/downloads/Kempa_AAAI_Final.pdf)
4. [Niemoeller, Samantha Claire, et al. "Scheduling Position, Navigation and Time Service Requests from Non-dedicated Lunar Constellations." IEEE Aerospace Conference. 2022.](https://ntrs.nasa.gov/citations/20210018009)
5. [Frank, Jeremy, et al. "Distributed scheduling of position estimation updates in ad-hoc lunar constellations." AAAI Spring Symposium Series. AAAI. 2022.](https://brainaid.com/pubs/SSS-22-Frank-et-al.pdf)
6. [Adams, Caleb, et al. "Development of a High-Performance, Heterogenous, Scalable Test-Bed for Distributed Spacecraft." 2023 IEEE Aerospace Conference. IEEE, 2023.](https://ieeexplore.ieee.org/document/10115695)
7. [Hagenau, Benjamin, et al. "Introducing the lunar autonomous pnt system (laps) simulator." 2021 IEEE Aerospace Conference (50100). IEEE, 2021.](https://ieeexplore.ieee.org/document/9438538)
8. [Cellucci, Daniel, Nick B. Cramer, and Jeremy D. Frank. "Distributed spacecraft autonomy." ASCEND 2020. 2020. 4232.](https://arc.aiaa.org/doi/abs/10.2514/6.2020-4232)
9. [https://www.nasa.gov/game-changing-development-projects/distributed-spacecraft-autonomy-dsa/](https://www.nasa.gov/game-changing-development-projects/distributed-spacecraft-autonomy-dsa/)