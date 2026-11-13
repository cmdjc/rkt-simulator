import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { environments } from '../../src/world/environments';
import type { BuildContext } from '../../src/world/environments/types';
import { mulberry32 } from '../../src/sim/rng';

function makeCtx(): BuildContext {
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);
  return {
    scene,
    root,
    showTargetZone: false,
    registerSystem: () => {},
  };
}

describe('environment groundAt sampler', () => {
  it('every environment sets ctx.groundAt', () => {
    for (const def of environments) {
      const ctx = makeCtx();
      const params = def.makeParams(mulberry32(1));
      def.build(ctx, params, mulberry32(2));
      expect(typeof ctx.groundAt, `${def.id} must set ctx.groundAt`).toBe('function');
      expect(Number.isFinite(ctx.groundAt!(0, 0)), `${def.id} finite at pad`).toBe(true);
    }
  });

  it('hilly terrain varies away from the pad while the pad itself is flattened', () => {
    const def = environments.find((e) => e.id === 'mountain')!;
    const ctx = makeCtx();
    const params = def.makeParams(mulberry32(1));
    def.build(ctx, params, mulberry32(2));
    const groundAt = ctx.groundAt!;
    expect(groundAt(0, 0)).toBeCloseTo(params.groundHeight, 5);
    let min = Infinity, max = -Infinity;
    for (let x = -200; x <= 200; x += 20) {
      for (let z = -200; z <= 200; z += 20) {
        const h = groundAt(x, z);
        min = Math.min(min, h); max = Math.max(max, h);
      }
    }
    expect(max - min).toBeGreaterThan(10); // real relief, not a flat plane
  });

  it('bathtub lands on the water surface inside the rim, floor outside', () => {
    const def = environments.find((e) => e.id === 'bathtub')!;
    const ctx = makeCtx();
    const params = def.makeParams(mulberry32(1));
    def.build(ctx, params, mulberry32(2));
    const groundAt = ctx.groundAt!;
    expect(params.launchY).toBe(2.5);
    expect(groundAt(0, 0)).toBeCloseTo(2.5, 5);       // water surface
    expect(groundAt(30, 0)).toBeCloseTo(2.5, 5);      // still inside the tub
    expect(groundAt(59, 0)).toBeCloseTo(0, 5);        // porcelain floor beyond the rim
  });
});

describe('rooftop and landing-zone surfaces', () => {
  function build(id: string, showTargetZone = false) {
    const def = environments.find((e) => e.id === id)!;
    const ctx = { ...makeCtx(), showTargetZone };
    const params = def.makeParams(mulberry32(1));
    def.build(ctx, params, mulberry32(2));
    return { ctx, params };
  }

  it('rooftop lands on the roof over the house and on the street beyond it', () => {
    const { ctx, params } = build('rooftop');
    expect(ctx.groundAt!(5, -5)).toBeCloseTo(params.groundHeight, 5);
    expect(ctx.groundAt!(30, 0)).toBeLessThan(params.groundHeight - 5);
  });

  it.each(['rooftop', 'bathtub', 'park'])('%s draws the landing-zone ring on the landing surface', (id) => {
    const { ctx, params } = build(id, true);
    const ring = ctx.root.children.find((c) => (c as THREE.Mesh).geometry instanceof THREE.RingGeometry)!;
    const { center } = params.targetZone!;
    expect(ring).toBeDefined();
    expect(ring.position.y).toBeCloseTo(ctx.groundAt!(center.x, center.z) + 0.05, 5);
  });
});
