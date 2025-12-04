import { onMounted, onUnmounted } from 'vue'

function preventTouchEvent(event: TouchEvent) {
  if (event.touches.length > 1) {
    event.preventDefault()
  }
}

function preventWheelZoom(event: MouseEvent) {
  // Check if the event is a pinch-to-zoom gesture (e.g., two fingers on trackpad)
  // This is a common heuristic, but might not cover all edge cases.
  // The 'ctrlKey' check is often used for mouse wheel zoom on Windows/Linux,
  // but on macOS trackpads, it's typically a multi-touch gesture.
  if (event.ctrlKey || event.metaKey || event.altKey) {
    event.preventDefault()
  }
}

export function preventTouch(getter: () => HTMLElement) {

  onMounted(() => {
    const element = getter()
    element.addEventListener('touchstart', preventTouchEvent, { passive: false })
    element.addEventListener('touchmove', preventTouchEvent, { passive: false })
    element.addEventListener('wheel', preventWheelZoom, { passive: false })
  })

  onUnmounted(() => {
    const element = getter()
    element.removeEventListener('touchstart', preventTouchEvent)
    element.removeEventListener('touchmove', preventTouchEvent)
    element.removeEventListener('wheel', preventWheelZoom)
  })
}