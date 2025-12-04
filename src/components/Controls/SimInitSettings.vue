<script setup lang="ts">
import { useInitializerStore } from '../../lib/store/initializer-store.ts'

const initialStore = useInitializerStore()

</script>
<template>
  <article>
    <header>Sim Init Settings</header>
    <form>
      <fieldset>
        <div class="grid">
          <div>
            <label>
              Seed
              <button role="button" @click.prevent="initialStore.newRandomSeed()">🎲</button>
            </label>
            <input
              v-model="initialStore.seed"
              type="number"
              placeholder="Seed"
            />
          </div>

          <div>
            <label>
              Max Dist
            </label>
            <input
              type="number"
              v-model="initialStore.initSettings.startDistanceMax"
              placeholder="Bounds"
            />
          </div>
        </div>

        <div class="grid">
          <div>
            <label>
              Bodies Count
            </label>
            <input
              v-model="initialStore.initSettings.bodiesCount"
              type="number"
              placeholder="Generated Bodies"
            />
          </div>

          <div>
            <label>
              Central Mass
            </label>
            <input
              type="number"
              v-model="initialStore.initSettings.blackHoleMass"
              placeholder="Black Hole Mass"
            />
          </div>
        </div>

        <div class="grid">
          <div>
            <label>
              Mass Min
            </label>
            <input
              type="number"
              v-model="initialStore.initSettings.massMin"
              placeholder="Mass Min"
            />
          </div>
          <div>
            <label>
              Mass Max
            </label>
            <input
              type="number"
              v-model="initialStore.initSettings.massMax"
              placeholder="Mass Max"
            />
          </div>
        </div>

        <div class="grid">
          <div>
            <label>
              Velocity Min
            </label>
            <input
              type="number"
              v-model="initialStore.initSettings.startVelocityVarianceMin"
              placeholder="Velocity Min"
            />
          </div>
          <div>
            <label>
              Velocity Max
            </label>
            <input
              type="number"
              v-model="initialStore.initSettings.startVelocityVarianceMax"
              placeholder="Velocity Max"
            />
          </div>
        </div>
      </fieldset>

      <button role="button" @click.prevent="initialStore.resetDefaults()">Reset</button>
      &nbsp;
      <button role="button" @click.prevent="initialStore.queueNewSim()">Rerun Sim</button>
    </form>
  </article>
</template>
