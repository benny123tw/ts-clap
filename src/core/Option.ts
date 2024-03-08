import { CliComponent } from '@/core/CliComponent'

export class Option extends CliComponent {
  private short_name: string = ''
  private value_name: string = ''

  private action: CallableFunction = () => {
    console.log(`Option ${this.name} is not implement.`)
  }

  constructor(name: string, desc: string = '') {
    super(name, desc)
    this.short_name = name.charAt(0)
  }

  short(s: string) {
    this.short_name = s
    return this
  }

  value(v: string) {
    this.value_name = v
    return this
  }

  setAction(callback: CallableFunction) {
    this.action = callback
    return this
  }

  doAction() {
    return this.action()
  }

  getShort() {
    return this.short_name
  }

  validate(flag: string) {
    return flag.includes(this.name) || flag.includes(this.short_name)
  }

  toString() {
    return `-${this.short_name}, --${this.name} ${this.value_name ? `<${this.value_name}>` : ''}`
  }

  static extractOption(flag: string) {
    return flag.replace(/^-*/, '')
  }
}
