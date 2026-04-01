import { useState } from 'react'
import './App.css'
import { DragDropProvider } from '@dnd-kit/react'
import Card from './components/Card'
import Hand from './components/Hand'
import { boardId, type ICard } from './utils/card'
import Board from './components/Board'
import Deck from './components/Deck'
import { AnimatePresence } from 'framer-motion'
import useGameState from './hooks/useGameState'

function App() {
  const {
    hand,
    deck,
    board,

    attacking,
    attack,
    draw,
    defend,
    concede,
    finish,
  } = useGameState()

  return (
    <section id="center">
      <AnimatePresence>

      <Deck deck={deck} />
      <DragDropProvider onDragEnd={(event) => {
        if (event.canceled) return

        const {target, source} = event.operation
        const card = source?.data as ICard
        const targetCard = target?.data as ICard | undefined

        if (attacking) {
          if (target?.id === boardId) {

              const result = attack(card)

              if (!result) return
            }
        } else {
          if (target?.id !== boardId && targetCard) {
            const result = defend(card, targetCard)
            
            if (!result) return
          }
        }
      }}>
        <Board board={board} attacking={attacking} />
        <Hand hand={hand} />
      </DragDropProvider>
      </AnimatePresence>
      <button onClick={() => draw()}>draw</button>
    </section>
  )
}

export default App
