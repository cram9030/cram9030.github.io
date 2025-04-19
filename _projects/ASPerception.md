---
layout: default
title: "Autonomous Systems Perception"
status: "ended"
featured: true
description: "Capabilities and gaps analysis of percption technologies for Advanced Air Mobility"
thumbnail: "/assets/images/drone_fog.png"
---

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/drone_fog.png" alt="Drone with lights to determine which sensors can detect it" title="Drone in the fog at the end of the chamber" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
</div>

## Project Details

The Autonomous Systems Perception project was a collaborative effort between NASA Ames Research Center and Sandia National Laboratories to evaluate and characterize perception system capabilities for autonomous urban air mobility applications. The project focused on understanding how various sensor technologies perform in degraded visual environments, particularly fog conditions, which present significant challenges for autonomous aviation systems. The project started with the development of a notional autonomous Advanced Air Mobility architecture might be and identifying the current capabilities and gaps. Then through a novel perception testbed incorporating visual spectrum cameras, long-wave infrared sensors, and LIDAR, the project aimed to establish baseline performance metrics and identify capability gaps that would need to be addressed for safe autonomous flight operations.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/ASArchitecture.jpg" alt="Autonomous System Archtiecture" title="Notional Autonomous AAM Architecture" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
</div>

The project successfully developed and validated a comprehensive test methodology for evaluating perception sensors in controlled fog conditions. Through extensive testing at Sandia's Fog Chamber facility, the team collected nearly 2 terabytes of synchronized sensor data across multiple fog densities and target scenarios. This data provided unprecedented insights into sensor performance degradation in fog and established a public dataset for the research community. The project also produced a detailed analysis of commercial-off-the-shelf sensor capabilities against theoretical requirements for autonomous aviation operations, identifying critical gaps in current technology readiness levels.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/Sandia_Test.jpg" alt="Images of the various sensors reaction with in fog" title="Sensor performance during fog conditions" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
</div>

As the technical lead for this project, I scoped the problem space and established the interagency agreement between NASA and Sandia National Laboratories. I designed and built the perception testbed, selecting appropriate hardware components and developing the ROS-based software architecture for synchronized data collection and monitoring. I led the test campaign at Sandia's facilities, managing both the technical execution and cross-agency coordination. Additionally, I conducted comprehensive analysis of sensor technologies and their capabilities relative to autonomous aviation requirements, contributing significant portions to multiple publications documenting the project's findings.

### Related Publications and Links
1. [Gorospe, G. E., Cramer, N. B., et al. (2021) "Perception Testing in Fog for Autonomous Flight"](https://workshops.larc.nasa.gov/RAM_Fog_Test/Sandia_Test_Documentation_v1.pdf)
2. [Shish, K. H., Cramer, N., et al. (2021) "Survey of Capabilities and Gaps in External Perception Sensors for Autonomous Urban Air Mobility Applications" AIAA Scitech 2021 Forum](https://drive.google.com/file/d/1VxFzZIv9WQInlU3RIIxT-cejyc06mkXz/view?usp=drive_link)
3. [Building Future Air Taxis to See Through the Fog](https://www.nasa.gov/aeronautics/building-future-air-taxis-to-see-through-the-fog/)
4. [https://workshops.larc.nasa.gov/RAM_Fog_Test/](https://workshops.larc.nasa.gov/RAM_Fog_Test/)
5. [Testing sensors in fog to make future transportation safer](https://newsreleases.sandia.gov/fog_tests/)
6. [Lombaerts, Thomas, et al. "Adaptive multi-sensor fusion based object tracking for autonomous urban air mobility operations." AIAA SciTech 2022 Forum. 2022.](https://ntrs.nasa.gov/api/citations/20210025369/downloads/AIAASciTech2022KFforObjTrack.pdf)