---
layout: default
title: "Failed vibes and and beam lines"
date: 2025-04-18
youtubeId: _zPU7vsjgZI
---

I've been a huge fan of [3Blue1Brown](https://www.youtube.com/@3blue1brown) for years. His ability to communicate nuanced topics in an approachable way, leveraging beautiful animations and visuals. I attempted to use the community version of Grant's Python library, [Manim](https://www.manim.community/), to help with review material for the UAV Design Class I was teaching at San Jose State University. I always kept it to a relatively simple, short animation with no transitions.

I've been using AI-assisted coding (mostly with Claude) to explore how it would fit with my workflow and as an excuse to revisit previous projects that I had set aside for various reasons. I like those because I already have a baseline of how I worked on it before and am interested in completing it. Like many others, I saw/heard of [Andrej Karpathy definition of vibe coding](https://x.com/karpathy/status/1886192184808149383?lang=en). I thought creating animations for interesting topics was a great use case for vibe code. It met all the criteria, where I was just going to judge what looked good and communicate the topic, but it would not cost anyone anything if I failed. 

That left me with a question of what topic? Well, I've returned to Euler-Bernoulli beam theory many times in my career and have always felt that while the existing material was good, there could be a way to cover it better. So, with a target and a plan, I endeavored to watch YouTube while Claude generated excellent animations under my general direction. Unfortunately, it didn't really work out that way.

## The Plan
I had a relatively simple plan of how I wanted to approach this.

1. Tell Claude what my objective was and have it propose how to structure my GitHub repo
2. Have an independent chat for each scene
    1. Introduction
    2. Beam types
    3. Cross-sectional difference changing the second moments of area
    4. Modulus of elasticity
    5. Slope, curvature, and displacement derivate definitions
3. Rendering scripts

## The Execution
So how did it go? Well, Claude gave a pretty good suggestion for the repository structure and provided the rendering scripts, a ReadMe, and some basic scripts, but that's about where the vibing ended. All the code and setup can be seen in my [beam_bending_visualizations](https://github.com/cram9030/beam_bending_visualizations) repo. It's unsurprising that things did not run out of the box. Some of it was not being able to just release myself to the vibes. The suggested virtual environment was a mix of conda and pip, which resulted in inconsistent versioning. There were also some issues because I was using WSL, and setting up xdg-open to be used as a preview was non-trivial and not worth the effort.

More substantially, the [Manim Text](https://docs.manim.community/en/stable/reference/manim.mobject.text.text_mobject.Text.html) class never actually worked, even though it is a very basic functionality for Manim. I ended up having to pivot to MathTex or Tex for all the text, which was fine, but I had to explicitly add that to every prompt afterward. Which I often forgot to do and ended up just fixing it manually more often than not.

With that, I went to try to work through the Second Area of Inertia scene and provided the prompt below. 
>I need you to create a scene file beam-bending-formulation.py. There should be a class  
>  
>class BeamArea Inertia(Scene)  
>  
>that will create an image like the one attached. In this version the bean should be undeflected with the neutral axis aligned with the x-axis.  
>  
>- It should start with a circular cross section displaying the equation for the second moment of area I = \frac{\pi}{4}r^4 with the radius r labeled on the cross sectional area  
>- Then transition into a square cross section and the equation transitioning to the second moment of area I = \frac{a^4}{12} with the side of the square labeled a  
>- Then transition into a rectangle with the equation transitioning to I = \frac{bh^3}{12} with the short side of the rectangle labeled h and the long side labeled h  

It did a decent job creating the three-dimensional shape but required multiple different prompts to get it there. I was never able to get it to effectively add text into the 3D environment. I never found a way to update the prompting to make it into something effective. Having scenes in three dimensions was a huge challenge, but Claude did a decent job if everything stayed in two dimensions.

I began to have better success after I had spent some time getting the first 3D class put together and could refer to it as a reference, but I was very quickly no longer "giving into the vibes" and had firmly moved into AI-assisted coding. The most success I found was actually using the [Manim documentation](https://docs.manim.community/en/stable/reference.html) to determine which functionality I thought was correct, providing specific references to that Manim class combined with referring to an existing class already in the repository got to the point where I was able to turn around scenes fairly quickly.

One of the things that I nearly completely gave up on trying to get Claude to generate was the use of [add_fixed_in_frame_mobjects](https://docs.manim.community/en/stable/reference/manim.camera.three_d_camera.ThreeDCamera.html#manim.camera.three_d_camera.ThreeDCamera.add_fixed_in_frame_mobjects) this is a critical function to get text to align with the camera in a 3D scene. To give an example of how frequently this was a necessary add, I've added a snippet of the code below. Basically, every scene had a similar frequency of the function being used, but unless I explicitly gave it capital letter instructions to use that specific function, it was either inconsistently used or not at all. I ended up just adding it in myself.

{% include clickable-code-block.html 
   filename="beam-bending-formulation.py"
   repo_url="https://github.com/cram9030/beam_bending_visualizations/blob/main/animations/scenes/beam-bending-formulation.py#L76"
   code="# Add circular beam and components
self.play(Create(circular_beam))
self.play(Create(neutral_axis))
self.add_fixed_in_frame_mobjects(neutral_label)
self.play(Write(neutral_label))
self.play(Create(x_direction), Create(y_direction), Create(z_direction))
self.add_fixed_orientation_mobjects(x_label, y_label, z_label)
self.play(Write(x_label), Write(y_label), Write(z_label))
self.play(Create(circular_cross))
self.add_fixed_orientation_mobjects(radius_label)
self.play(Create(radius_line), Write(radius_label))
self.add_fixed_in_frame_mobjects(circular_eq)
self.play(Write(circular_eq))
self.wait(1)"
%}

Because of these limitations, my workflow was dramatically different from what I had planned. I've sketched out a comparison below. 

<div style="text-align: center; margin-bottom: 30px;">
  <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; max-width: 100%; overflow-x: auto;">
    <!-- Left side - Planned Execution -->
    <div style="flex: 1; min-width: 280px; max-width: 45%;">
      <h3>Planned Execution</h3>
      <div class="mermaid">
      flowchart TD
        style A1 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style B1 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style C1 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style D1 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style E1 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style F1 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style G1 fill:#E91E63,stroke:#C2185B,stroke-width:2px,color:white,font-weight:bold

          A1["Claude Prompt for Scene"] --> B1["Generate Video"]
          B1 --> C1["Check Video"]
          C1 -->|"Not quite right"| A1
          C1 -->|"Looks good"| D1["Repeat for All Scenes"]
          D1 -->|"Next Scene"| A1
          D1 --> E1["Generate Completed Video"]
          E1 --> F1["Voice Over Using Manim Voice"]
          F1 --> G1["Profit!"]
      </div>
    </div>
    
    <!-- Right side - Actual Execution -->
    <div style="flex: 1; min-width: 280px; max-width: 45%;">
      <h3>Actual Execution</h3>
      <div class="mermaid">
      flowchart TD

        style A2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style B2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style C2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style D2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style E2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style F2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style G2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style H2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style I2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style J2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style K2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold
        style L2 fill:#E91E63,stroke:#C2185B,stroke-width:2px,color:white,font-weight:bold
        style M2 fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:white,font-weight:bold

          M2["Search Manim Documentation for Animation"] --> A2["Claude Prompt for Scene"]
          A2 --> B2["Generate Video"]
          B2 --> C2["Check Video"]
          C2 -->|"Not quite right"| A2
          C2 -->|"Looks good"| D2["Repeat for All Scenes"]
          
          C2 --> E2["Verbalize Content"]
          E2 --> F2["Adjust Animation Timing"]
          F2 --> G2["Update Code"]
          G2 --> B2
          
          D2 --> H2["Generate All Scenes"]
          H2 --> I2["Import into Premier Pro"]
          I2 --> J2["Voice Over in Premier Pro"]
          J2 --> K2["Adjust Visual Timing and Auto Edits"]
          K2 -->|"Hard to Fix in Premier Pro"| G2
          K2 --> L2["Good Enough"]
      </div>
    </div>
  </div>
  <p style="font-size: 0.9em; margin-top: 20px;">
    Comparing planned vs actual workflow for 3blue1brown style videos
  </p>
</div>

I wasn't giving general descriptions running it and then telling Claude what was wrong. Instead, I was using Claude to generate large chunks of relatively repetitive code or functions, then sweeping back through, cleaning it up, and coming back to provide macro feedback. An example of this working pretty well was when I had already set up a scene and then only requested a function that would add load arrows. I already had an example ready and provided explicit Manim class Line3D.

>Write a function that will be used to draw a series of arrows which are perpendicular to the top_tip line and are distributed across that line with a variation in magnitude that is a u shape with the maximum length at the start and end. The function will be used in the BeamtoPlateScene in the intro-scene.py. Provide an example of how to use the function in that class but do not try and rewrite the class.
>  
>Do not start programming immediately instead ask clarifying questions and collect requirements.
>   
>\# Root label line  
>top_root = Line3D(start=np.array([beam_length/2, -side_length1.5, -height_rect/2]),end=np.array([beam_length/2, side_length1.5, -height_rect/2]),color=YELLOW)

This resulted in a function that I never had to touch again [create_distributed_load_arrows](https://github.com/cram9030/beam_bending_visualizations/blob/6e6e39f836428be4a22ae6b40158940d3d634358/animations/scenes/intro-scene.py#L580).

The pivot from [Manim Voiceover](https://www.manim.community/plugin/manim-voiceover/) to Premier Pro was mostly because I had not understood the actual capabilities of Manim Voiceover. I wanted to use my own voice, and Manim Voiceover is really for text-to-speech use. I already have the Adobe Suite, so the pivot was pretty painless; it was just the time it took me to install Premier Pro. Many of the changes relating to the feedback loop were just a personal underestimation of the complexity of the work. I made a lot of videos of myself speaking during the pandemic, but the animations not being triggered off a command like slides was a significant change.

## The Results
There are really two different assessments of this approach. The first is the resulting video, which came out relatively well.

<div style="text-align: center; margin: 2rem 0;">
    {% include youtubePlayer.html id=page.youtubeId %}
</div>

The code, on the other hand... Well, most of the content went into two files: the [intro-scene.py](https://github.com/cram9030/beam_bending_visualizations/blob/6e6e39f836428be4a22ae6b40158940d3d634358/animations/scenes/intro-scene.py) and [beam-bending-scene.py](https://github.com/cram9030/beam_bending_visualizations/blob/6e6e39f836428be4a22ae6b40158940d3d634358/animations/scenes/beam-bending-scene.py) which ended up being 903 and 2568 lines of code respectively. The length itself is cringe-worthy, but there are also some spots with a ton of duplicate code. The intro scene could have easily been broken up without much trouble, but I was trying my best to just let the vibes take over even though it made me feel pretty dirty. The beam-bending scene had more justification for being so long because there were so many shared animations across the scenes, but it was begging for a little more structure. It is fine for something I am unlikely to ever revisit, but there's no way I'll be able to hop into this repo effectively again.

## What I think happened

I think the challenges with 3D rendering are common across many different use cases for LLMs. There is a similarity in the problems I was having trying to convey the concept of a 3D dimensional object and especially text that should be placed relative to the view with [Adam Karvonen's observations](https://adamkarvonen.github.io/machine_learning/2025/04/13/llm-manufacturing-eval.html) about the limitations of Accurate Visual Perception and Basic Physical Plausability when trying to task an LLM with manufacturing tasks. In my case, attaching screenshots of the 3D view and describing what was wrong only made things worse.

For the "vibe" part, well, I think there were a few core issues:

1. Specifying a particular library, in this case, Manim, which, while it has an active community, isn't huge, seems to have limited the ability to just throw it over.
2. Trying to simplify the setup forced virtualization, which caused the LLM to have inconsistent state knowledge, which cropped up in numerous ways.
3. I probably wasn't a knowledgeable enough developer to effectively vibe. If I had known the Manim classes and animation types, I would have been able to say to use those specifically, which would have resulted in a better-quality first response without the extra documentation overhead. 

## Conclusions
Vibe coding isn't for me, but AI-assisted development still made it easier to jump into a side project like this and do something. The mere psychological aspect of having something to help with the initial setup and ask questions was enough to keep me engaged. Even if I was tired and annoyed, there was the promise of just one more prompt getting the correct die role to unlock me that scouring through Google links doesn't have and requires a lower mental effort than diving deep into the documentation and code to formulate my own solution. That being said, that state was helpful to grind out a lot of straightforward new scenes, but what really unlocked things was when I was fully rested and mentally engaged. I did more pre-work to make sure that the prompting was closer to what I needed. Essentially, I was doing more work to understand the feasibility of the problem, develop a clear plan for it, have an example, and just let Claude move those things into action.