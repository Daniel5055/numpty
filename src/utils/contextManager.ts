import type { Dispatch, SetStateAction } from "react"

export type Context =  Promise<void>

type StateSetters<T> = { [K in keyof T]: Dispatch<SetStateAction<T[K]>>}

class ContextManager<T> {
    private ctx: Context = Promise.resolve()

    #state: StateSetters<T>

    constructor(state: StateSetters<T>) {
        this.#state = state
    }

    queue(callback: (ctx: ContextManager<T>) => ContextManager<T>): ContextManager<T> {
        this.ctx = callback(this).ctx

        return this
    }

    then(callback: () => Context | void): ContextManager<T> {
        this.ctx = this.ctx.then(callback)
        return this
    }

    wait(ms: number = 100): ContextManager<T> {
        this.ctx = this.ctx
            .then(() => new Promise((res) => setTimeout(res, ms)))

        return this
    }
    
    /**
     * WARNING: Callbacks passed here must be idempotent, they may be called multiple times
     */
    state<K extends keyof T>(key: K, callback: (v: T[K]) => void): ContextManager<T> {
        this.ctx = this.ctx.then(() => new Promise((resolve) => {
            this.#state[key]((val) => {
                callback(val)

                resolve()

                return val
            })
        }))

        return this
    }
}

export default ContextManager
