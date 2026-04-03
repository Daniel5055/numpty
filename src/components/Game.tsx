import { DragDropProvider } from "@dnd-kit/react"
import { AnimatePresence } from "framer-motion"
import useGameState from "../hooks/useGameState"
import { boardReversible, boardUnique, validDefence } from "../utils/board"
import { blankCard, boardId, type ICard } from "../utils/card"
import type { MkEngine } from "../utils/engines/engine"
import Board from "./Board"
import Deck from "./Deck"
import Hand from "./Hand"

interface GameProps {
  mkEngine: MkEngine
}

function Game({ mkEngine }: GameProps) {
  const id1 = "Daniel"
  const id2 = "CPU"

  const {
    matchState,
    attacking,
    trump,
    deckCount,

    hand,
    opHand,
    board,
    deck,
    discard,

    attack,
    defend,
    reverse,
    concede,
    finish,
    grant,
    grantEnd,
  } = useGameState(id1, id2, mkEngine)

  const boardDroppable = (!attacking && boardReversible(board)) || attacking

  return (
    <div id="container">
      <section id="left">
        <Deck
          deck={(deckCount > 0 ? [blankCard(-1)] : []).concat(
            deck ? [deck] : [],
          )}
          trump={trump}
        />
      </section>
      <section id="right">
        <Deck deck={discard} />
      </section>
      <section id="center">
        <AnimatePresence>
          <DragDropProvider
            onDragEnd={(event) => {
              if (event.canceled || !trump?.suit) return

              const { target, source } = event.operation
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
                  if (
                    validDefence(targetCard, [card], trump?.suit).length === 1
                  ) {
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
            }}
          >
            <Hand hand={opHand} opponent={true} />
            <Board
              board={board}
              droppable={boardDroppable}
              attacking={attacking}
            />
            <Hand hand={hand} opponent={false} />
          </DragDropProvider>
        </AnimatePresence>
        {matchState === "PendingAttack" && (
          <button onClick={finish}>Finish</button>
        )}
        {matchState === "PendingDefence" && (
          <button onClick={concede}>Concede</button>
        )}
        {matchState === "PendingGrant" && (
          <button onClick={() => grantEnd()}>Done Granting</button>
        )}
        {(matchState === "Wait" || matchState === "PendingExtraAttack") && (
          <button>Waiting</button>
        )}
      </section>
    </div>
  )
}

export default Game
