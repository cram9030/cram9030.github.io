---
layout: default
title: "FlexiblE and Reconfigurable Voxel-based Robot (FERVOR)"
status: "ended"
featured: true
description: "Modular structural continuum robot "
thumbnail: "/assets/images/FERVORwIRBalls-01.png"
---

<div style="text-align: center; margin: 2rem 0;">
    <img src="/assets/images/FERVORwIRBalls-01.png" alt="Modular robot" title="FERVOR" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
</div>

## Project Details

FERVOR (FlexiblE and Reconfigurable Voxel-based Robot) was a novel approach to limbless locomotion that combined structural deformation with directional friction to achieve movement. The robot was built using digital cellular solids - a modular lattice structure that could be reconfigured to create different gaits and behaviors. This innovative design allowed for a mechanically simple yet highly stable platform that could potentially navigate tight spaces while being protected by an airtight shell.

The project successfully demonstrated a new paradigm for modular robotics by achieving rectilinear motion through wave propagation in its structure. Using just two linear actuators, FERVOR could generate structural waves that, when combined with directionally-biased friction elements, produced forward motion. The system achieved this while maintaining minimal changes to its cross-sectional shape, making it ideal for confined space applications. The modular nature of the design also allowed for rapid reconfiguration and testing of different structural arrangements.

As the technical lead for this project during my time at UCSC, I led the design and development of both the physical platform and its simulation framework. I developed a Python-based Physical Finite Element Analysis (PFEA) simulation that could accurately predict the robot's behavior, with node rotation predictions within 2 degrees of measured values and extension deformation predictions within 15% error. This simulation framework was crucial for understanding how different configurations would behave before physical testing.

### Related Publications and Links
1. [Cramer, N., et al. "Design and testing of FERVOR: FlexiblE and reconfigurable voxel-based robot." 2017 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS). IEEE, 2017.](https://ieeexplore.ieee.org/document/8206100)