import './style.css'
import init, { greet } from '../wasm_src/pkg/'
;(async () => {
  await init()
  greet('World from Rust and WASM!')
})()