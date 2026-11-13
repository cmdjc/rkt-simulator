# rkt-simulator

A model-rocket flight simulator for the browser, set in a blocky, lively world.
You pick a rocket and a motor from the real Estes catalog, choose an
environment, and fly. Flights happen under a day/night cycle, through weather,
over stepped procedural terrain.

Play it at https://cmdjc.github.io/rkt-simulator/

## Features

- Physics first. Each flight is deterministic for its seed. The simulation
  models thrust curves, air drag, wind and gusts, rail tip-off, CATO (the
  motor explodes), and crash outcomes. A fixed time step keeps the physics
  independent of the frame rate.
- Five recovery devices: parachute, streamer, tumble, helicopter, and glider.
  The devices come from the real Estes descriptions, and combinations fly
  together (the Space Shuttle uses a parachute and a glider). Streamers
  flutter, rotors spin the rocket down in a spiral, and gliders bank in a
  circle. A rocket with no listed device rolls a random one at ejection.
- True scale: 1 world unit is 1 meter. Rockets render at catalog size
  (0.27 m to 2.05 m) on a pad with a 1 m launch rod. Everyday objects stand
  in a ring around the pad for comparison: a baseball, a wine bottle, a dog,
  a cow, a car, a person, a house, an elephant, and more. The rocket
  selector gives a size hint, for example "Height 41 cm, about as tall as a
  wine bottle".
- Real Estes catalog. Rockets and motors come from the manufacturer specs.
  The selectors support type-ahead search and filter for compatible motors.
  You can also overload a rocket and see what happens.
- Launch-attitude gimbal. Three colored rings (X red, Y green, Z blue) around
  the rocket set the launch direction. Drag a ring to tilt or spin the
  rocket. Double-click or double-tap a ring to type an exact angle. The rod
  tilts with the rocket. In flight the rocket points along its direction of
  travel, and it hangs nose-up under a deployed canopy or rotor. After a
  landing or a crash, the gimbal reappears where the rocket lies, and Launch
  flies again from that spot.
- Eight environments: park, urban, mountain, desert, open sea, rooftop, a
  giant bathtub (launch next to a rubber duck), and a backyard guarded by an
  angry dog.
- A living world. Each environment uses its own ground colors, stepped
  terrain, and water. The sky has a sun, a square moon, stars, and
  drifting clouds. Trees and grass sway in the wind. Villagers, farm animals,
  and birds move around. The weather can bring rain, snow, or thunderstorms.
- Challenges: a height goal with a rainbow ring every 50 m up to 1000 m, and
  a scored landing zone.
- Synthesized sound effects, muted by default.

## Controls

| Input | Action |
| --- | --- |
| Mouse drag | Orbit the camera |
| Scroll | Zoom |
| W A S D | Pan the camera |
| Q / E | Move the camera down / up |
| `Space` | Launch / reset |
| `C` | Toggle follow / orbit camera |
| `F` | Cycle simulation speed (1x / 4x / 16x) |
| `M` | Mute / unmute |

## Run locally

You need Node.js 22 or later.

```sh
npm install
npm run dev        # http://localhost:5173
```

To build and serve the production bundle:

```sh
npm run build
npm run preview    # http://localhost:4173
```

## Project layout

```
src/
  sim/       physics: rng, thrust curves, atmosphere, integration, flight
             phases, outcomes, challenges (no Three.js imports)
  data/      rocket and motor catalog
  world/     Three.js scene: environments, terrain, sky, weather, water,
             vegetation, creatures, effects, rocket mesh, scale objects
  ui/        DOM overlay: selectors, HUD, flight summary
  audio/     synthesized sound effects
tests/       vitest suites for sim, data, ui, world, audio
```

The code in `src/sim` and `src/data` never imports `three`, `world`, or `ui`.
The world layer reads the simulation state and never writes it. All
randomness in the simulation comes from a seeded generator, so a seed
reproduces a flight.

## Tests

```sh
npm run quality    # typecheck, tests, and production build
npm test           # tests only
```

These URL query parameters help with testing and screenshots:
`?env=<id>`, `?tod=<0..1>` (time of day), `?weather=rain|storm|snow`,
`?cam=az,el,dist[,targetY]`, and `?seed=<n>`.

## Deployment

A push to `main` runs `.github/workflows/deploy.yml`. The workflow runs the
quality gate, builds `dist/`, and publishes it to GitHub Pages.

## License

Apache 2.0. See [LICENSE](LICENSE).
