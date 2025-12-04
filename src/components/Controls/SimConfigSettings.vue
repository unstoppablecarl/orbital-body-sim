<script setup lang="ts">
import { useSimConfigStore } from '../../lib/store/sim-config-store.ts'

const store = useSimConfigStore()

</script>
<template>
  <article>
    <header>Sim Config</header>
    <form>
      <fieldset>
        <div class="grid">
          <div>
            <label>
              Min Mass
            </label>
            <input
              v-model="store.config.MIN_MASS"
              type="number"
            />
          </div>
          <div>
            <label>
              Max Frag #
            </label>
            <input
              type="number"
              v-model="store.config.MAX_FRAGMENT_COUNT"
            />
          </div>
        </div>

        <div class="grid">
          <div>
            <label>
              Frag coold. S
            </label>
            <input
              v-model="store.config.FRAGMENT_COOLDOWN_SECONDS"
              type="number"
            />
          </div>

          <div>
            <label>
              Expl. Force
            </label>
            <input
              type="number"
              v-model="store.config.EXPLOSIVE_FORCE"
            />
          </div>
        </div>

        <div class="grid">
          <div>
            <label>
              Max Bodies
            </label>
            <input
              type="number"
              v-model="store.config.MAX_BODIES"
            />
          </div>

          <div>
            <label>
              Merge Bias
            </label>
            <input
              type="number"
              v-model="store.config.BINDING_CONSTANT"
            />
          </div>
        </div>
      </fieldset>

      <button role="button" @click.prevent="store.resetDefaults()">Reset</button>
      &nbsp;
      <button role="button" @click.prevent="store.queueConfigChange()">Apply</button>
    </form>
  </article>
</template>
