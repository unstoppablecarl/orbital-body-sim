import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const usePlaybackStore = defineStore('playback', () => {
    const playNextTick = ref(false)
    const speedMultiplier = ref(1)
    const playing = ref(true)

    return {
      playing,
      speedMultiplier,
      playNextTick,
      togglePlay: () => playing.value = !playing.value,
      shouldPlay: computed(() => playing.value || playNextTick.value),
      step: () => playNextTick.value = true,
      resetPlayNextTick: () => playNextTick.value = false,
    }
  },
  {
    persist: {
      pick: [
        'playing',
        'speedMultiplier',
      ],
    },
  },
)