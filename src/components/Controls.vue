<script setup lang="ts">
import { useTemplateRef } from 'vue'
import SimSettings from './Controls/SimInitSettings.vue'
import { preventTouch } from '../lib/util/preventTouch.ts'
import SimConfigSettings from './Controls/SimConfigSettings.vue'
import DrawConfigSettings from './Controls/DrawConfigSettings.vue'
import Playback from './Controls/Playback.vue'

const controlsRef = useTemplateRef('controlsRef')

preventTouch(() => controlsRef.value as HTMLDivElement)
</script>
<template>
  <div ref="controlsRef" class="controls">
    <Playback />
    <SimSettings />
    <SimConfigSettings />
    <DrawConfigSettings />
  </div>
</template>
<style lang="scss">
.controls {
  touch-action: none !important;
  font-size: 12px;
  height: 100vh;
  overflow: scroll;
  padding: 0 12px 10px 0;
  position: absolute;
  top: 10px;
  left: 10px;
}
</style>