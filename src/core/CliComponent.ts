export abstract class CliComponent {
  constructor(public name: string, private desc: string = '') {}

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
