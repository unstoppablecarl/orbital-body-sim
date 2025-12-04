import { type Application, ParticleContainer, Pool, type Ticker } from 'pixi.js'
import { type Body } from '../simulation/Body.ts'
import type { Coord } from '../types.ts'
import { TrailParticle } from './TrailParticle.ts'
import { getTextures } from './textures.ts'
import { DRAW_CONFIG as c } from '../config.ts'
import { watch } from 'vue'
import { nextTickEnd } from './tick-queue.ts'
import { useDrawConfigStore } from '../store/draw-config-store.ts'

export type TrailManager = ReturnType<typeof makeTrailManager>

export function makeTrailManager(app: Application, container: ParticleContainer) {
  const { trailTexture } = getTextures(app)

  const drawConfigStore = useDrawConfigStore()

  watch(() => drawConfigStore.DRAW_PARTICLES, (value: boolean) => {
    if (!value) {
      nextTickEnd(() => resetAll())
    }
  })

  TrailParticle.setTexture(trailTexture)
  const pool = new Pool(TrailParticle, 100)

  function add(body: Body, coord: Coord) {
    if (container.particleChildren.length >= c.MAX_TRAIL_PARTICLES) {
      return
    }

    const particle = pool.get({
      body,
      coord,
    })
    container.addParticle(particle)
  }

  function remove(particle: TrailParticle) {
    container.removeParticle(particle)
    pool.return(particle)
  }

  function resetAll() {
    const particles = container.removeParticles(0, container.particleChildren.length - 1)

    for (const particle of particles as TrailParticle[]) {
      pool.return(particle)
    }
  }

  let elapsed = 0

  return {
    add,
    remove,
    resetAll,
    emit(body: Body, coords: Coord[]) {
      if (!drawConfigStore.DRAW_PARTICLES) {
        return
      }
      for (const coord of coords) {
        add(body, coord)
      }
    },
    update(
      ticker: Ticker,
      deltaTime: number,
    ) {
      elapsed += ticker.elapsedMS

      for (const particle of container.particleChildren as TrailParticle[]) {
        const expired = particle.update(deltaTime)
        if (expired) {
          remove(particle)
        }
      }
    },
  }
}