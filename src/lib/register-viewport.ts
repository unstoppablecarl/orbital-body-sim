import type {
  IBounceOptions,
  IDecelerateOptions,
  IDragOptions,
  IMouseEdgesOptions,
  IPinchOptions,
  IWheelOptions,
} from 'pixi-viewport'
import { Viewport } from 'pixi-viewport'
import { renderer } from 'vue3-pixi'
import { type Application, EventSystem, Rectangle, Ticker } from 'pixi.js'
import type { IClampOptions } from 'pixi-viewport/dist/plugins/Clamp'
import type { IClampZoomOptions } from 'pixi-viewport/dist/plugins/ClampZoom'

interface ViewportProps {
  app: Application,
  screenWidth?: number,
  screenHeight?: number,
  worldWidth?: number | null,
  worldHeight?: number | null,
  threshold?: number,
  passiveWheel?: boolean,
  stopPropagation?: boolean,
  allowPreserveDragOutside?: boolean,
  forceHitArea?: Rectangle | null,
  noTicker?: boolean,
  events: EventSystem,
  disableOnContextMenu?: boolean,
  ticker?: Ticker,

  drag?: boolean | IDragOptions,
  decelerate?: boolean | IDecelerateOptions,
  bounce?: boolean | IBounceOptions,
  pinch?: boolean | IPinchOptions,
  wheel?: boolean | IWheelOptions,
  clamp?: boolean | IClampOptions,
  mouseEdges?: boolean | IMouseEdgesOptions,
  clampZoom?: boolean | IClampZoomOptions,
}

interface ViewportComponent {
  (props: ViewportProps): any
}

// @ts-expect-error
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    Viewport: ViewportComponent
    PixiViewport: ViewportComponent
  }
}

export function registerViewport() {
  renderer.use({
    name: 'Viewport',
    createElement: (props) => {
      const viewportOptions = {
        ...props,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: props.worldWidth ?? 1000,
        worldHeight: props.worldHeight ?? 1000,
        events: props.app.renderer.events,
      }

      const viewport = new Viewport(viewportOptions)

      booleanPluginKey(viewport, 'bounce', props)
      booleanPluginKey(viewport, 'drag', props)
      booleanPluginKey(viewport, 'pinch', props)
      booleanPluginKey(viewport, 'wheel', props)
      booleanPluginKey(viewport, 'decelerate', props)
      booleanPluginKey(viewport, 'mouseEdges', props)
      booleanPluginKey(viewport, 'clamp', props)

      return viewport
    },
    patchProp(el, key: keyof ViewportProps, _prevValue, nextValue) {
      if (PATCH_KEYS.includes(key)) {
        patch(el, key, nextValue)
      }
    },
  })
}

function booleanPluginKey(viewport: Viewport, key: keyof ViewportProps, props: ViewportProps) {
  if (key in props) {
    const value = props[key]
    patch(viewport, key, value)
  }
}

function patch(viewport: Viewport, key: keyof ViewportProps, value: any) {
  let isBoolean = value === true || value === false
  if (isBoolean) {
    (viewport as any)[key]()
  } else {
    (viewport as any)[key](value)
  }
}

const PATCH_KEYS = [
  'bounce',
  'drag',
  'pinch',
  'wheel',
  'decelerate',
  'mouseEdges',
  'clamp',
]
