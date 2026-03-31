import { useState } from 'react'
import './App.css'
import { DragDropProvider } from '@dnd-kit/react'
import Card from './components/Card'
import Hand from './components/Hand'
import { CARD_SUITS, CARD_VALUES, type ICard } from './utils/card'
import Board from './components/Board'
import Deck from './components/Deck'
import { addValueToWillChange, AnimatePresence } from 'framer-motion'

function App() {
  const [hand, setHand] = useState<ICard[]>([
    { suit: CARD_SUITS.Clubs, value: CARD_VALUES.Eight },
    { suit: CARD_SUITS.Diamonds, value: CARD_VALUES.Seven },
  ])

  const [board, setBoard] = useState<ICard[]>([
    { suit: CARD_SUITS.Spades, value: CARD_VALUES.Ace },
    { suit: CARD_SUITS.Hearts, value: CARD_VALUES.King },
  ])
  
  return (
    <section id="center">
      <AnimatePresence>

      <Deck deck={board} />
      <DragDropProvider onDragEnd={(event) => {
        if (event.canceled) return null

        const {target} = event.operation
      }}>
        <Hand hand={hand} />
      </DragDropProvider>
      <button onClick={() => {
        setHand((h) => h.concat({ suit: CARD_SUITS.Spades, value: CARD_VALUES.Ace }))
        setBoard((b) => b.splice(b.findIndex(({suit, value}) => suit == CARD_SUITS.Spades && value == CARD_VALUES.Ace), 1))
      }}
        >draw</button>
      </AnimatePresence>
    </section>
  )
}

export default App
