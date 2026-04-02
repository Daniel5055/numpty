export type Context =  Promise<void>

class ContextManager {
    ctx: Context = Promise.resolve()

    queue(callback: (ctx: ContextManager) => ContextManager): ContextManager {
        this.ctx = callback(this).ctx

        return this
    }

    then(callback: () => Context | void): ContextManager {
        this.ctx = this.ctx.then(callback)
        return this
    }

    wait(ms: number = 100): ContextManager {
        this.ctx = this.ctx
            .then(() => new Promise((res) => setTimeout(res, ms)))

        return this
    }
}

export default ContextManager
