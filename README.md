# pokebenchmark-dashboard

React + TypeScript dashboard for the [pokebenchmark](https://github.com/ShardulAgg/pokebenchmark-platform) benchmarking orchestrator.

## Features

- **Games catalog** — browse supported games with box art; launch new runs per game
- **Manual runs** — play the game yourself with keyboard/button controls, capture curated save states for the benchmark
- **Agent runs** — configure provider/model/skills, watch live game frames + LLM decisions over WebSocket
- **Skills editor** — create and edit markdown skill files (common or per-game)
- **Save state catalog** — browse curated checkpoints, filter by game
- **Comparison view** — side-by-side badge/step chart for multiple completed runs

## Run

```bash
npm install
npm run dev       # starts on :3000, proxies /api and /ws to the orchestrator
```

Set the orchestrator URL in `vite.config.ts` if not at `localhost:8000`.

## Build

```bash
npm run build     # outputs to dist/
```

## License

MIT
