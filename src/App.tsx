import { useRef } from 'react'
import './App.css'
import { DragDropProvider } from '@dnd-kit/react'
import Hand from './components/Hand'
import { boardId, CARD_SUITS, type ICard } from './utils/card'
import Board from './components/Board'
import { AnimatePresence } from 'framer-motion'
import useGameState from './hooks/useGameState'
import { ClientEngine } from './utils/engines/client'
import SimpleAi from './utils/ai/simpleAi'
import { boardUnique, boardUnresolved, validDefence } from './utils/board'
import Deck from './components/Deck'


function App() {

  const player1 = "Daniel"
  const player2 = "CPU"
  const trump = CARD_SUITS.Spades
  const engine = useRef(new ClientEngine(player1, player2, trump))
  useRef(new SimpleAi(player2, engine.current))

  const {
    hand,
    opHand,
    board,
    deck,
    discard,

    matchState,
    attacking,
    attack,
    defend,
    reverse,
    concede,
    finish,
    grant,
    grantEnd,
  } = useGameState(player1, engine.current)

  return (
    <div id="container">
    <section id="left">
      <Deck deck={deck ? [deck] : []} />
    </section>
    <section id="right">
      <Deck deck={discard} />
    </section>
    <section id="center">
      <AnimatePresence>

      <DragDropProvider onDragEnd={(event) => {
        if (event.canceled) return

        const {target, source} = event.operation
        const card = source?.data as ICard
        const targetCard = target?.data as ICard | undefined

        if (matchState === "PendingAttack") {
          if (target?.id === boardId) {

              attack(card)
            }
        } else if (matchState === "PendingDefence") {
          const valid = boardUnresolved(board)
          if (board.length === 1 && valid.length === 1 && target?.id === boardId) {
            if (card.value === valid[0].value) {
              reverse(card)
            }
          } else if (target?.id !== boardId && targetCard) {
            if (validDefence(targetCard, [card], trump).length === 1) {
              defend(card, targetCard)
            }
          }
        } else if (matchState === "PendingGrant") {
          if (target?.id === boardId) {
            const valid = boardUnique(board)
            if (valid.includes(card.value)) {
              console.log('grantin', card)
              grant(card)
            } else {
              grantEnd(card)
            }
          }
        }
      }}>
          <Hand hand={opHand}  opponent={true}/>
          <Board board={board} attacking={attacking} />
          <Hand hand={hand}  opponent={false}/>
      </DragDropProvider>
      </AnimatePresence>
      {matchState === "PendingAttack" && <button onClick={finish}>Finish</button>}
      {matchState === "PendingDefence" && <button onClick={concede}>Concede</button>}
      {matchState === "PendingGrant" && <button onClick={() => grantEnd()}>Done Granting</button>}
      {matchState === "Wait" && <button>Waiting</button>}
    </section>
    </div>
  )
}

export default App
