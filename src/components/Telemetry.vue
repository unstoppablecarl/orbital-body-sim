<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { onTick } from 'vue3-pixi'
import { preventTouch } from '../lib/util/preventTouch.ts'
import { useTelemetry } from '../lib/store/telemetry.ts'

const telemetry = useTelemetry()
const zoom = computed(() => telemetry.zoom.toFixed(2))
const bodiesCount = computed(() => telemetry.bodiesCount)
const particlesCount = computed(() => telemetry.particlesCount)
const universeMass = computed(() => Math.floor(telemetry.universeMass))

const telemetryRef = useTemplateRef('telemetryRef')

const fpsText = ref(0)
let lastTime = performance.now()
let frameCount = 0

onTick(() => {
  frameCount++
  const currentTime = performance.now()
  const deltaTime = currentTime - lastTime

  if (deltaTime >= 1000) {
    fpsText.value = Math.round((frameCount / deltaTime) * 1000)
    frameCount = 0
    lastTime = currentTime
  }
})
preventTouch(() => telemetryRef.value as HTMLDivElement)
</script>
<template>
  <div ref="telemetryRef" class="telemetry">
    <div>
      <strong>FPS: </strong>
      {{ fpsText }}
    </div>
    <div>
      <strong>Zoom: </strong>
      {{ zoom }}
    </div>
    <div>
      <strong>Bodies: </strong>
      {{ bodiesCount }}
    </div>
    <div>
      <strong>Particles: </strong>
      {{ particlesCount }}
    </div>

    <div>
      <strong>U Mass: </strong>
      {{ universeMass }}
    </div>
  </div>


</template>
<style>
.telemetry {
  touch-action: none !important;
  font-size: 12px;
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 100px;
  background: rgba(0, 0, 0, 0.6)
}
</style>
