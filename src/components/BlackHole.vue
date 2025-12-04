<script setup lang="ts">
import { radiusToScale } from '../lib/simulation/Body.ts'
import { onMounted, ref } from 'vue'
import { getTextures } from '../lib/pixi/textures.ts'
import { useApplication } from 'vue3-pixi'

const app = useApplication()
const texture = ref()
const scale = radiusToScale(10)

onMounted(() => {
  const { blackHoleTexture } = getTextures(app.value)
  texture.value = blackHoleTexture
})
</script>
<template>
  <Container>
    <Sprite
      :anchor="{x: 0.5, y: 0.5}"
      :scale="scale"
      :x="app.canvas.width * 0.5"
      :y="app.canvas.height * 0.5"
      :texture="texture"
    />
  </Container>
</template>
