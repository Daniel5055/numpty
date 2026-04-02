import { MersenneTwister19937, Random } from "random-js";
import { type ICard } from "../card";
import type { Engine } from "../engines/engine";
import { boardUnique, boardUnresolved, validDefence } from "../board";

class SimpleAi {
    public engine: Engine

    private random = new Random(MersenneTwister19937.seedWithArray([0, 1]))

    private id: string

    constructor(id: string, engine: Engine) {
        this.engine = engine
        engine.drawn(id, this.onDraw.bind(this))
        engine.attacked(id, this.onAttack.bind(this))
        engine.defended(id, this.onDefend.bind(this))
        engine.reversed(id, this.onReverse.bind(this))
        engine.conceded(id, this.onConceded.bind(this))
        engine.finished(id, this.onFinished.bind(this))
        engine.granted(id, this.onGranted.bind(this))

        this.id = id
    }

    onDraw() {
        console.log(this.engine.attacker)
        if (this.engine.attacker == this.id) {
            const card = this.choose(this.engine.hand(this.id))
            this.engine.attack(this.id, card)
        }
    }

    onAttack(card: ICard): boolean {
        const valid = validDefence(card, this.engine.hand(this.id), this.engine.trump)
        console.log('defend', valid, this.engine.hand(this.id))
        if (valid.length === 0) {
            this.engine.concede(this.id)
            return false
        } else {
            this.engine.defend(this.id, this.choose(valid), card)
            return true
        }
    }

    onDefend(): boolean {
        const board = this.engine.board()
        const valid = this.engine.hand(this.id).filter((c) => boardUnique(board).includes(c.value))
        console.log(boardUnique(board))

        if (valid.length === 0) {
            if (boardUnresolved(board).length === 0) {
                this.engine.finish(this.id)
            } 
            return false
        } else {
            this.engine.attack(this.id, this.choose(valid))
            return true
        }
    }

    onReverse(card: ICard): boolean {
        console.log('reversed')
        const valid = this.engine.hand(this.id).filter((c) => c.value === card.value)
        if (valid.length === 0) {
            // Handle the attacks until we can't
            const attacks = boardUnresolved(this.engine.board())
            let result = false
            for (let a = attacks[0], i = 0; i < attacks.length; a = attacks[++i]) {
                result = this.onAttack(a)
                if (!result) {
                    this.engine.concede(this.id)
                    break
                }
            }
            return result
        } else {
            this.engine.reverse(this.id, this.choose(valid))
            return true
        }
    }

    onConceded(): void {
        const valid = boardUnique(this.engine.board())
        const extra = this.engine.hand(this.id).filter((c) => valid.includes(c.value))

        this.engine.grant(this.id, extra)

        const card = this.choose(this.engine.hand(this.id))
        this.engine.attack(this.id, card)
    }

    onFinished(): void {
        // Do nothing
    }

    onGranted(): void {
        // Do nothing
    }

    // Choose a card randomly from set
    private choose(cards: ICard[]): ICard {
        const i = this.random.integer(0, cards.length - 1)
        return cards[i]
    }
} 

export default SimpleAi
