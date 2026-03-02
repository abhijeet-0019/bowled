import { create } from 'zustand';

export type SpinDirection = 'Left' | 'Right';

export interface Spin {
  direction: SpinDirection;
  degree: number;
}

export type GameState = 'start' | 'playing' | 'gameover';
export type BallState = 'idle' | 'aiming' | 'flying' | 'bounced' | 'hit' | 'missed';
export type StumpHit = 'middle' | 'off' | 'leg' | null;

interface GameStore {
  score: number;
  highScore: number;
  lives: number;
  spin: Spin;
  gameState: GameState;
  ballState: BallState;
  stumpHit: StumpHit;
  bouncePoint: [number, number, number] | null;
  
  // Actions
  startGame: () => void;
  resetDelivery: () => void;
  throwBall: () => void;
  bounceBall: () => void;
  hitStump: (hit: StumpHit) => void;
  missBall: () => void;
  setAiming: (aiming: boolean) => void;
  setBouncePoint: (point: [number, number, number] | null) => void;
}

const generateSpin = (score: number): Spin => {
  const direction = Math.random() > 0.5 ? 'Left' : 'Right';
  let min = 5, max = 10;
  if (score >= 6 && score <= 15) {
    min = 10; max = 18;
  } else if (score > 15) {
    min = 18; max = 25;
  }
  const degree = Math.floor(Math.random() * (max - min + 1)) + min;
  return { direction, degree };
};

export const useGameStore = create<GameStore>((set, get) => ({
  score: 0,
  highScore: parseInt(localStorage.getItem('cricketHighScore') || '0', 10),
  lives: 3,
  spin: generateSpin(0),
  gameState: 'start',
  ballState: 'idle',
  stumpHit: null,
  bouncePoint: null,

  startGame: () => set({
    score: 0,
    lives: 3,
    spin: generateSpin(0),
    gameState: 'playing',
    ballState: 'idle',
    stumpHit: null,
    bouncePoint: null
  }),

  resetDelivery: () => {
    const { score, lives } = get();
    if (lives <= 0) {
      set({ gameState: 'gameover' });
    } else {
      set({
        ballState: 'idle',
        spin: generateSpin(score),
        stumpHit: null,
        bouncePoint: null
      });
    }
  },

  throwBall: () => set({ ballState: 'flying' }),
  
  bounceBall: () => set({ ballState: 'bounced' }),

  hitStump: (hit: StumpHit) => {
    const { score, highScore } = get();
    const isMiddle = hit === 'middle';
    const points = isMiddle ? 3 : 1;
    const newScore = score + points;
    const newHighScore = Math.max(newScore, highScore);
    localStorage.setItem('cricketHighScore', newHighScore.toString());
    
    set({
      score: newScore,
      highScore: newHighScore,
      ballState: 'hit',
      stumpHit: hit
    });
  },

  missBall: () => {
    const { lives } = get();
    set({
      lives: lives - 1,
      ballState: 'missed'
    });
  },

  setAiming: (aiming: boolean) => set({
    ballState: aiming ? 'aiming' : 'idle'
  }),

  setBouncePoint: (point) => set({ bouncePoint: point })
}));
