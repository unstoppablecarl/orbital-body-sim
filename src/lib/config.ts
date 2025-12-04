import { reactive } from 'vue'

export const G = 1
export const BODY_SPRITE_SIZE = 256

// bodies with x or y > UNIVERSE_SIZE or < -UNIVERSE_SIZE are removed
export const UNIVERSE_SIZE = 10000

export type DrawPreset = typeof DRAW_CONFIG_DEFAULTS

export const DRAW_CONFIG_DEFAULTS = {
  DRAW_LINES: true,
  MAX_LINE_SEGMENTS: 200,
  DIST_PER_LINE_SEGMENT: 10,

  DRAW_PARTICLES: true,
  MAX_TRAIL_PARTICLES: 20000,
  TRAIL_PARTICLE_LIFESPAN: 5,
  PARTICLE_INITIAL_SCALE_OF_BODY: 0.9,
}

export type SimPreset = typeof SIM_CONFIG_DEFAULTS
export const SIM_CONFIG_DEFAULTS = {
  MIN_MASS: 1,
  MAX_FRAGMENT_COUNT: 30,
  BINDING_CONSTANT: 10,
  FRAGMENT_COOLDOWN_SECONDS: 1,
  EXPLOSIVE_FORCE: 1.2,
  MAX_BODIES: 1000,
}

export const DRAW_CONFIG: DrawPreset = reactive({
  ...DRAW_CONFIG_DEFAULTS,
})

export const SIM_CONFIG: SimPreset = reactive({
  ...SIM_CONFIG_DEFAULTS,
})

