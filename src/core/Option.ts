import { CliComponent } from '@/core'

export class Option extends CliComponent {
  private short_name: string = ''
  private value_name: string = ''

  private callback: CallableFunction = () => {
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

  getValue() {
    return this.value_name
  }

  action(callback: (value: string) => void) {
    this.callback = callback
    return this
  }

  execute(value: string | null) {
    return this.callback(value)
  }

  getShort() {
    return this.short_name
  }

  validate(flag: string) {
    const flagName = Option.extractOption(flag)
    return flagName === this.name || flagName === this.short_name
  }

  toString() {
    return `-${this.short_name}, --${this.name} ${this.value_name ? `<${this.value_name}>` : ''}`
  }

  static extractOption(flag: string) {
    return flag.replace(/^-*/, '')
  }
}
