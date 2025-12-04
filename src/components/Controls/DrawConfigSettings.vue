<script setup lang="ts">
import { useDrawConfigStore } from '../../lib/store/draw-config-store.ts'

const store = useDrawConfigStore()

</script>
<template>
  <article>
    <header>Draw Config</header>
    <form>
      <fieldset>
        <div class="section">
          <div class="sub-heading">Path Lines
            &nbsp;
            <button role="button" @click.prevent="store.DRAW_LINES = !store.DRAW_LINES">
              <template v-if="store.DRAW_LINES">
                Turn Off
              </template>
              <template v-else>
                Turn On
              </template>
            </button>
          </div>
          <div class="grid">
            <div>
              <label>
                <span data-placement="right" data-tooltip="Length of each line segment">
                  Seg. Length
                </span>
              </label>
              <input
                v-model="store.config.DIST_PER_LINE_SEGMENT"
                type="number"
              />
            </div>
            <div>
              <label>
                Max Seg.
              </label>
              <input
                type="number"
                v-model="store.config.MAX_LINE_SEGMENTS"
              />
            </div>
          </div>
        </div>

        <div class="section">
          <div class="sub-heading">Trail Particles
            &nbsp;
            <button role="button" @click.prevent="store.DRAW_PARTICLES = !store.DRAW_PARTICLES">
              <template v-if="store.DRAW_PARTICLES">
                Turn Off
              </template>
              <template v-else>
                Turn On
              </template>
            </button>

          </div>

          <div class="grid">
            <div>
              <label>
                <span data-tooltip="Lifespan in Seconds">
                  Lifespan Sec.
                </span>
              </label>
              <input
                v-model="store.config.TRAIL_PARTICLE_LIFESPAN"
                type="number"
              />
            </div>

            <div>
              <label>
                Max Count
              </label>
              <input
                v-model="store.config.MAX_TRAIL_PARTICLES"
                type="number"
              />
            </div>
          </div>
          <div class="grid">
            <div>
              <label>
                <span data-tooltip="Initial Scale of Particle from body">
                  Scale
                </span>
              </label>
              <input
                v-model="store.config.PARTICLE_INITIAL_SCALE_OF_BODY"
                type="number"
              />
            </div>
          </div>
        </div>
      </fieldset>
      <button role="button" @click.prevent="store.resetDefaults()">Reset</button>
      &nbsp;
      <button role="button" @click.prevent="store.queueConfigChange()">Apply</button>
    </form>
  </article>
</template>
