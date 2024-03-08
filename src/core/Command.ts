import { Collection } from '@/utils/Collection'
import { CliComponent } from '@/core/CliComponent'
import { Option } from '@/core/Option'
import { printHelperText } from '@/utils/console-helper'

export class Command extends CliComponent {
  public commands: Collection<string, Command> = new Collection()
  public options: Collection<string, Option> = new Collection([
    ['help', new Option('help', 'Print help').setAction(() => this.help())],
  ])
  private action: CallableFunction = () => {
    console.log(`Command \`${this.name}\` not implement.`)
  }
  private helpDescription: string = `No description in Command ${this.name}`

  help() {
    printHelperText(this)
  }

  subCommand(cmd: string | Command, desc: string = '') {
    if (!(cmd instanceof Command)) {
      cmd = new Command(cmd, desc)
    }

    this.commands.set(cmd.name, cmd)
    return this
  }

  short() {
    return this
  }

  option(op: string | Option, desc: string = '') {
    if (!(op instanceof Option)) {
      op = new Option(op, desc)
    }

    this.options.set(op.name, op)
    return this
  }

  setAction(callback: CallableFunction) {
    this.action = callback
    return this
  }

  doAction(...flags: string[]) {
    if (this.hasDefaultFlags(flags)) {
      this.doDefaultAction(flags)
      return
    }

    this.action(...flags)
  }

  hasDefaultFlags(flags: string[]) {
    return flags.some((flag) => this.options.get('help')?.validate(flag))
  }

  doDefaultAction(flags: string[]) {
    // only run the first default action
    const keys = flags.filter((flag) => this.options.get('help')?.validate(flag))
    if (keys.length) {
      this.options.get(Option.extractOption(keys[0]))?.doAction()
    }
  }
}
