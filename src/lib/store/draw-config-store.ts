import { defineStore } from 'pinia'
import { DRAW_CONFIG, DRAW_CONFIG_DEFAULTS, type DrawPreset } from '../config.ts'
import { reactive, toRef } from 'vue'
import { nextTickEnd } from '../pixi/tick-queue.ts'
import { omit } from './_helpers.ts'

const DEFAULTS = omit(DRAW_CONFIG_DEFAULTS, ['DRAW_LINES', 'DRAW_PARTICLES'])

export const useDrawConfigStore = defineStore('draw-config', () => {

    const config = reactive({ ...DEFAULTS })

    const DRAW_LINES = toRef(DRAW_CONFIG, 'DRAW_LINES')
    const DRAW_PARTICLES = toRef(DRAW_CONFIG, 'DRAW_PARTICLES')

    function updateConfig() {
      Object.assign(DRAW_CONFIG, config)
    }

    return {
      config,
      DRAW_LINES,
      DRAW_PARTICLES,
      resetDefaults: () => Object.assign(config, DEFAULTS),
      loadPreset: (preset: DrawPreset) => Object.assign(config, preset),
      queueConfigChange: () => {
        nextTickEnd(updateConfig)
      },
      init: () => updateConfig(),
    }
  },
  {
    persist: {
      afterHydrate: (context) => {
        context.store.init()
      },
    },
  },
)

// const DRAW_CONFIG_PRESETS = {
//   SOMETHING: {
//     name: 'Something',
//     // ...
//   },
// } as const satisfies Record<string, DrawPreset>