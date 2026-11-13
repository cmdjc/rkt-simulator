import { describe, it, expect } from 'vitest';
import { rockets } from '../../src/data/rockets';
import { motors } from '../../src/data/motors';
import { Simulation } from '../../src/sim/simulation';
import { vec } from '../../src/sim/vec';
import type { Rocket, Motor } from '../../src/sim/types';

function flyFirstNonCato(rocket: Rocket, motor: Motor): Simulation | null {
  for (let seed = 0; seed < 20; seed++) {
    const sim = new Simulation({
      rocket, motor, seed, challenge: { type: 'none' },
      environment: { groundHeight: 0, wind: { base: vec(0, 0, 0), gust: 0 }, bounds: { radius: 500 } },
    });
    for (let n = 0; !sim.done && n < 400000; n++) sim.step();
    if (sim.state.outcome !== 'cato') return sim;
  }
  return null;
}

describe('every catalog rocket with every motor', () => {
  it('flies to a finite landing', () => {
    const bad: string[] = [];
    for (const rocket of rockets) {
      for (const motor of motors) {
        const sim = flyFirstNonCato(rocket, motor);
        if (!sim) { bad.push(`${rocket.id} + ${motor.id}: CATO on every seed`); continue; }
        const { position, velocity, apogee } = sim.state;
        if (![position.x, position.y, position.z, velocity.x, velocity.y, velocity.z, apogee].every(Number.isFinite)) {
          bad.push(`${rocket.id} + ${motor.id}`);
        }
      }
    }
    expect(bad).toEqual([]);
  }, 60_000);
});
