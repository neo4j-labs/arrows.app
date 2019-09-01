export default class SvgAdaptor {
  constructor(ctx) {
    this.ctx = ctx
    this.stack = [
      {
        strokeColor: 'black'
      }
    ]
  }

  current() {
    return this.stack[0]
  }

  save() {
    this.stack.unshift({...this.current()})
  }

  restore() {
    this.stack.shift()
  }
}