<script setup lang="ts">
import { Application as AppComponent, type Application as Vue3PixiApp, External, onTick } from 'vue3-pixi'
import { useTemplateRef } from 'vue'
import type { Viewport } from 'pixi-viewport'
import Controls from './Controls.vue'
import Bodies from './Bodies.vue'
import Telemetry from './Telemetry.vue'
import { preventTouch } from '../lib/util/preventTouch.ts'
import { useTelemetry } from '../lib/store/telemetry.ts'
import { onWindowEvent } from '../lib/util/windowEvent.ts'

const telemetry = useTelemetry()
const appRef = useTemplateRef<Vue3PixiApp>('appRef')
const viewportRef = useTemplateRef<Viewport>('viewportRef')

onWindowEvent('resize', () => {
  if (viewportRef.value) {
    viewportRef.value.resize(window.innerWidth, window.innerHeight)
  }
})

onWindowEvent('beforeunload', () => {
  appRef?.value?.app.destroy(true, true)
})

preventTouch(() => (appRef.value as Vue3PixiApp).canvas)

onTick(() => telemetry.zoom = viewportRef?.value?.scale?.x ?? 1)

const appOptions = {
  backgroundColor: '#000',
  resizeTo: window,
}
</script>
<template>
  <AppComponent ref="appRef" v-bind="appOptions" id="pixi-app">
    <Viewport
      ref="viewportRef"
      :app="appRef?.app"
      :drag="true"
      :wheel="true"
      :pinch="true"
      :decellerate="true"
    >
      <Bodies />
    </Viewport>
    <External>
      <Controls />
      <Telemetry />
    </External>
  </AppComponent>
</template>
