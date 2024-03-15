import { BaseArgument } from './BaseArgument'

export class Argument extends BaseArgument {
  toString(_options?: { withShort: boolean } | undefined): string {
    return `[${this.name.toUpperCase()}]`
  }
}
