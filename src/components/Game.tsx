import { DragDropProvider } from '@dnd-kit/react'
import { AnimatePresence } from 'framer-motion'
import useGameState from '../hooks/useGameState'
import { validDefence, boardUnique, boardReversible } from '../utils/board'
import { CARD_SUITS, blankCard, type ICard, boardId } from '../utils/card'
import Board from './Board'
import Deck from './Deck'
import Hand from './Hand'
import type { MkEngine } from '../utils/engines/engine'

interface GameProps {
    mkEngine: MkEngine
}

function Game({ mkEngine }: GameProps) {
  const id1 = "Daniel"
  const id2 = "CPU"
  const trump = CARD_SUITS.Spades

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
  } = useGameState(id1, id2, trump, mkEngine)

  const boardDroppable =
    (!attacking && boardReversible(board)) ||
    attacking

  return (
    <div id="container">
    <section id="left">
      <Deck deck={deck ? [blankCard(-1), deck] : [blankCard(-1)]} />
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
          if (target?.id === boardId && boardReversible(board)) {
            const valid = boardUnique(board)
            if (card.value === valid[0]) {
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
              grant(card)
            } else {
              grantEnd(card)
            }
          }
        }
      }}>
          <Hand hand={opHand}  opponent={true}/>
          <Board board={board} droppable={boardDroppable} attacking={attacking} />
          <Hand hand={hand}  opponent={false}/>
      </DragDropProvider>
      </AnimatePresence>
      {matchState === "PendingAttack" && <button onClick={finish}>Finish</button>}
      {matchState === "PendingDefence" && <button onClick={concede}>Concede</button>}
      {matchState === "PendingGrant" && <button onClick={() => grantEnd()}>Done Granting</button>}
      {(matchState === "Wait" || matchState === "PendingExtraAttack") && <button>Waiting</button>}
    </section>
    </div>
  )
}

export default Game
