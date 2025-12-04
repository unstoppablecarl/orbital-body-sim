import { Body, type BodyOptions, makeBodyPool } from '../simulation/Body.ts'
import { type Application, type Container, type ParticleContainer } from 'pixi.js'
import { SIM_CONFIG as c } from '../config.ts'
import type { BodyPath } from '../simulation/BodyPath.ts'
import { useInitializerStore } from '../store/initializer-store.ts'
import { bodyGenerator } from '../simulation/bodyGenerator.ts'
import { getTextures } from './textures.ts'
import { useDrawConfigStore } from '../store/draw-config-store.ts'
import { watch } from 'vue'
import { nextTickEnd } from './tick-queue.ts'

export type BodyManager = ReturnType<typeof makeBodiesManager>

export function makeBodiesManager(
  {
    app,
    bodiesContainer,
    lineContainer,
  }: {
    app: Application,
    bodiesContainer: ParticleContainer,
    lineContainer: Container<BodyPath>,
  },
) {
  const store = useInitializerStore()
  const { bodyTexture } = getTextures(app)
  const drawConfigStore = useDrawConfigStore()
  const bodyPool = makeBodyPool(bodyTexture, c.MAX_BODIES)

  let bodiesToAdd: BodyOptions[] = []

  watch(() => drawConfigStore.DRAW_LINES, (value: boolean) => {
    if (!value) {
      nextTickEnd(() => clearLines())
    }
  })

  function populateSim() {
    const center = {
      x: app.canvas.width * 0.5,
      y: app.canvas.height * 0.5,
    }

    const settings = store.getQueuedSimSettings()
    const bodies = bodyGenerator({
      ...settings,
      center,
      bodyTexture,
    })

    addToPending(bodies)
  }

  function add(options: BodyOptions) {
    const body = bodyPool.get(options)
    bodiesContainer.addParticle(body)
    lineContainer.addChild(body.path)
  }

  function remove(body: Body) {
    bodiesContainer.removeParticle(body)
    lineContainer.removeChild(body.path)
    bodyPool.return(body)
  }

  function resetAll() {
    clearPending()
    bodiesContainer.particleChildren.forEach(b => remove(b as Body))
    lineContainer.removeChild(...lineContainer.children)
  }

  function addToPending(bodies: BodyOptions[]) {
    bodiesToAdd = bodiesToAdd.concat(bodies)
  }

  function update(body: Body, adjustedDt: number) {
    const bodies = bodiesContainer.particleChildren as Body[]
    const { fragments, particles } = body.updateGrav(bodies, adjustedDt)

    if (fragments) {
      addToPending(fragments)
    }

    return { particles }
  }

  function clearPending() {
    bodiesToAdd = []
  }

  function addPendingToSim() {
    const available = c.MAX_BODIES - bodiesContainer.particleChildren.length
    if (available <= 0) {
      bodiesToAdd = []
      return
    }
    if (bodiesToAdd.length > available) {
      bodiesToAdd = bodiesToAdd.slice(0, available)
    }
    for (let b of bodiesToAdd) {
      add(b)
    }

    bodiesToAdd = []
  }

  function clearLines() {
    for (let b of bodiesContainer.particleChildren as Body[]) {
      b.path.reset()
    }
  }

  return {
    populateSim,
    update,
    addPendingToSim,
    clearPending,
    remove,
    resetAll,
  }
}