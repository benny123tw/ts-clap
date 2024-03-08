export abstract class CliComponent {
  constructor(public name: string, public desc: string = '') {}

  description(content: string) {
    this.desc = content
    return this
  }

  getDescription() {
    return this.desc
  }

  toString() {
    return this.name
  }
}
