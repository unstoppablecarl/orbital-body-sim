type CB = () => void
let queue: CB[] = []

export function nextTickEnd(cb: CB) {
  queue.push(cb)
}

export function processTickEnd() {
  for (let cb of queue) {
    cb()
  }
  queue = []
}