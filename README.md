# Bowled - Spin Bowling Game

A 3D browser-based spin bowling game built with React and Three.js. Master the art of spin bowling by controlling power and angle to hit the stumps.

## How to Play

- **Drag down** for bowling power
- **Drag left/right** for angle
- Watch the **spin indicator** to predict the ball's deviation after bouncing
- Hit the stumps to score points (middle stump = 3 points, others = 1 point)
- You have 3 lives - don't miss!

## Run Locally

**Prerequisites:** Node.js 20 or higher

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Deploy to Netlify

This project is configured for automatic deployment on Netlify:

1. Push to GitHub
2. Connect your repository to Netlify
3. Netlify will automatically detect the build settings from `netlify.toml`

## Tech Stack

- React 19
- Three.js / React Three Fiber
- Zustand (state management)
- Tailwind CSS
- Vite

## Acknowledgments

This game was built using Google AI Studio.

## License

MIT
