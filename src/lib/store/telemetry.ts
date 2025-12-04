import { reactive } from 'vue'
import type { ParticleContainer } from 'pixi.js'
import type { Body } from '../simulation/Body.ts'

const telemetry = reactive({
  bodiesCount: 1,
  universeMass: 1,
  particlesCount: 1,
  zoom: 1,
})

export const useTelemetry = () => telemetry

export function updateTelemetry(
  {
    trailsContainer,
    bodiesContainer,
  }: {
    trailsContainer: ParticleContainer,
    bodiesContainer: ParticleContainer
  }) {
  telemetry.particlesCount = trailsContainer.particleChildren.length
  telemetry.bodiesCount = bodiesContainer.particleChildren.length
  telemetry.universeMass = bodiesContainer.particleChildren.reduce((sum, f) => sum + (f as Body).mass, 0)
}