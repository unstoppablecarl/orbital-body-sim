import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { type BodyGeneratorPreset } from '../simulation/bodyGenerator.ts'
import { RNG, type SeededRng } from '../simulation/seeded-rng.ts'

export type SimInitSettings = BodyGeneratorPreset & {
  rng: SeededRng
}

const randomSeed = () => Math.floor(Math.random() * 1000000)
export const useInitializerStore = defineStore('initializer', () => {
    const seed = ref(randomSeed())
    const initSettings = reactive<BodyGeneratorPreset>({
      ...SIM_INIT_PRESETS.DEFAULT,
    })

    // load on init
    let newSimNextTick = true

    function resetDefaults() {
      Object.assign(initSettings, { ...SIM_INIT_PRESETS.DEFAULT })
    }

    function loadPreset(preset: BodyGeneratorPreset) {
      Object.assign(initSettings, { ...preset })
    }

    function getQueuedSimSettings(): SimInitSettings {
      newSimNextTick = false

      return {
        rng: RNG.setSeed(seed.value),
        ...initSettings,
      }
    }

    function queueNewSim() {
      newSimNextTick = true
    }

    return {
      seed,
      resetDefaults,
      initSettings,
      loadPreset,
      queueNewSim,
      getQueuedSimSettings,
      newRandomSeed: () => seed.value = randomSeed(),
      startNewSimThisTick: () => newSimNextTick,
    }
  },
  {
    persist: true,
  },
)

export const SIM_INIT_PRESETS = {
  DEFAULT: {
    name: 'Default',
    bodiesCount: 100,
    startDistanceMax: 400,
    blackHoleMass: 100000,
    massMin: 1,
    massMax: 100,
    startVelocityVarianceMin: 0.95,
    startVelocityVarianceMax: 1.05,
  },
  TIGHT_PLANETARY_SYSTEM: {
    name: 'Tight Planetary System',
    bodiesCount: 30,
    startDistanceMax: 200,
    blackHoleMass: 500,
    massMin: 1,
    massMax: 5,
    startVelocityVarianceMin: 0.95,
    startVelocityVarianceMax: 1.05,
  },
  LOOSE_GALACTIC_DISK: {
    name: 'Loose Galactic Disk',
    bodiesCount: 100,
    startDistanceMax: 600,
    blackHoleMass: 2000,
    massMin: 5,
    // star clusters
    massMax: 20,
    // allows spirals/arms to form
    startVelocityVarianceMin: 0.8,
    startVelocityVarianceMax: 1.2,
  },
} as const satisfies Record<string, BodyGeneratorPreset>