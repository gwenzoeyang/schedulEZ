# SchedulEZ Project Reflections

## What Was Hard

- **Data flow between frontend and backend**: Understanding how MongoDB data needed to be transformed, passed through the API, and consumed by Vue components took significant debugging. Issues like meeting times not displaying correctly required tracing data through multiple layers.
- **Deployment configuration**: Getting CORS, environment variables, and API URLs working between locally-run and deployed versions was frustrating. Small issues like typos in environment variable names caused blank pages that were hard to diagnose.
- **Git conflicts during rebase**: Syncing with upstream template changes while preserving my own modifications led to confusing merge conflicts, especially in configuration files like deno.json.

## What Was Easy

- **Vue component development**: Once I understood the reactivity system, building UI components like the schedule grid and course cards felt intuitive.
- **Visual styling**: CSS and Tailwind made it straightforward to achieve the look I wanted, including the pastel color palette.
- **localStorage for schedules**: Storing user schedules client-side avoided backend complexity and worked reliably.

## What Went Well

- **Core functionality delivered**: The app successfully lets users browse courses, build visual schedules, and plan bus transportation—the main goals from Assignment 2.
- **AI integration**: Adding course recommendations created genuine value beyond a basic planner.
- **Iterative development**: Building features incrementally and testing frequently caught issues early.

## Mistakes and Future Avoidance

- **Too much debug logging**: I added extensive console.log statements during debugging, then had to clean them all up later. In the future, I'd use a debug flag or logging library that can be toggled off.
- **Inconsistent API naming**: Endpoint names didn't always match between frontend and backend, causing 404 errors. I'd establish naming conventions upfront and document them.
- **Deferred backend syncs too long**: I should have set up the passthrough configuration earlier rather than scrambling at the end.

## Skills Acquired vs. Need Development

**Acquired:**
- Vue.js component architecture and reactivity
- REST API design and debugging
- Deployment with Render
- Working with MongoDB data

**Need Further Development:**
- Backend authentication and sync patterns
- Testing (I relied heavily on manual testing)
- Git workflows for complex merges

## Use of Context Tool

I used the Context tool to save snapshots of working code states and prompts throughout development. This helped when I needed to reference earlier implementations or roll back changes that broke functionality.

## Use of Agentic Coding Tools (Claude)

Claude was my primary coding partner throughout this project. I used it for:
- **Debugging**: Pasting error messages and getting targeted fixes
- **Feature implementation**: Describing what I wanted and receiving working code
- **Refactoring**: Cleaning up debug statements, improving code structure
- **Learning**: Understanding why certain approaches worked or failed

The most effective pattern was providing Claude with specific context (error messages, current code, desired behavior) rather than vague requests.

## Conclusions on LLMs in Software Development

LLMs excel at **tactical coding tasks**: fixing bugs, implementing well-defined features, and explaining unfamiliar code. They significantly accelerate development when you know what you want to build. However, they work best as collaborators, not replacements—I still needed to make architectural decisions, verify outputs, and understand the code well enough to debug when AI-generated solutions didn't work. The biggest productivity gains came from using LLMs to handle tedious implementation details while I focused on design and user experience decisions.