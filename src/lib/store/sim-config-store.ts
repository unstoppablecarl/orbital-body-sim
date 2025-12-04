import { defineStore } from 'pinia'
import { DRAW_CONFIG, SIM_CONFIG_DEFAULTS, type SimPreset } from '../config.ts'
import { reactive } from 'vue'
import { nextTickEnd } from '../pixi/tick-queue.ts'

export const useSimConfigStore = defineStore('sim-config', () => {
    const config = reactive({ ...SIM_CONFIG_DEFAULTS })

    function updateConfig() {
      Object.assign(DRAW_CONFIG, config)
    }

    return {
      config,
      resetDefaults: () => Object.assign(config, SIM_CONFIG_DEFAULTS),
      loadPreset: (preset: SimPreset) => Object.assign(config, preset),
      queueConfigChange: () => {
        nextTickEnd(updateConfig)
      },
      init: () => updateConfig(),
    }
  },
  {
    persist: {
      afterHydrate: (context) => context.store.init(),
    },
  },
)

// const SIM_CONFIG_PRESETS = {
//   SOMETHING: {
//     name: 'Something',
//     // ...
//   },
// } as const satisfies Record<string, SimPreset>