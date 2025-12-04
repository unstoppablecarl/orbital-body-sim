<script setup lang="ts">
import { usePlaybackStore } from '../../lib/store/playback-store.ts'

const store = usePlaybackStore()
</script>
<template>
  <article>
    <header>
      <strong class="btn-label">
        Simulation
      </strong>
      &nbsp;
      <button role="button" @click="store.togglePlay()">
        <template v-if="!store.playing">Play</template>
        <template v-else>Pause</template>
      </button>
      &nbsp;
      <button role="button" v-if="!store.playing" @click="store.step()">
        Tick
      </button>
    </header>
    <div class="section">
      <div>
        <strong>Speed: </strong>{{ store.speedMultiplier }}
        &nbsp;
        <button role="button" @click="store.speedMultiplier = 1">
          Reset
        </button>
      </div>
      <input type="range" v-model="store.speedMultiplier" min="0.1" max="300" step="0.1" />
    </div>
  </article>
</template>