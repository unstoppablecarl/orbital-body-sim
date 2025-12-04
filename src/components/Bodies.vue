<script lang="ts" setup>
import { type Container, type ParticleContainer, type Ticker } from 'pixi.js'
import { onMounted, useTemplateRef } from 'vue'
import { onTick, useApplication } from 'vue3-pixi'
import { Body } from '../lib/simulation/Body.ts'
import { usePlaybackStore } from '../lib/store/playback-store.ts'
import { useInitializerStore } from '../lib/store/initializer-store.ts'
import { makeTrailManager, type TrailManager } from '../lib/pixi/trailManager.ts'
import { type BodyManager, makeBodiesManager } from '../lib/pixi/bodyManager.ts'
import { useDrawConfigStore } from '../lib/store/draw-config-store.ts'
import { updateTelemetry } from '../lib/store/telemetry.ts'
import type { BodyPath } from '../lib/simulation/BodyPath.ts'
import { processTickEnd } from '../lib/pixi/tick-queue.ts'
import BlackHole from './BlackHole.vue'

const app = useApplication()
const playbackStore = usePlaybackStore()
const initStore = useInitializerStore()
const drawConfigStore = useDrawConfigStore()

const bodiesRef = useTemplateRef<ParticleContainer>('bodiesRef')
const trailsRef = useTemplateRef<ParticleContainer>('trailsRef')
const linesRef = useTemplateRef<Container<BodyPath>>('linesRef')

let bodiesContainer: ParticleContainer
let trailsContainer: ParticleContainer
let lineContainer: Container<BodyPath>
let trailManager: TrailManager
let bodyManager: BodyManager

onMounted(() => {
  bodiesContainer = bodiesRef.value as ParticleContainer
  trailsContainer = trailsRef.value as ParticleContainer
  lineContainer = linesRef.value as Container<BodyPath>

  trailManager = makeTrailManager(app.value, trailsContainer)
  bodyManager = makeBodiesManager({
    app: app.value,
    bodiesContainer,
    lineContainer,
  })
})

onTick((ticker: Ticker) => {
  if (initStore.startNewSimThisTick()) {
    newSim()
  }
  updatePhysics(ticker)

  updateTelemetry({
    trailsContainer,
    bodiesContainer,
  })
  playbackStore.resetPlayNextTick()
})

function newSim() {
  bodyManager.resetAll()
  trailManager.resetAll()
  bodyManager.populateSim()
}

function updatePhysics(ticker: Ticker) {
  const adjustedDt = ticker.deltaMS / 1000 * playbackStore.speedMultiplier
  if (playbackStore.shouldPlay) {
    trailManager.update(ticker, adjustedDt)
  }

  const bodies = bodiesContainer.particleChildren as Body[]
  for (let body of bodies) {
    if (playbackStore.shouldPlay) {
      const { particles } = bodyManager.update(body, adjustedDt)
      if (particles) {
        trailManager.emit(body, particles)
      }
    }

    if (body.toRemove) {
      bodyManager.remove(body)
    }
  }

  bodyManager.addPendingToSim()

  processTickEnd()
}

</script>
<template>
  <ParticleContainer ref="trailsRef" :visible="drawConfigStore.DRAW_PARTICLES" />
  <Container ref="linesRef" :visible="drawConfigStore.DRAW_LINES" />
  <ParticleContainer ref="bodiesRef"/>
  <BlackHole />
</template>