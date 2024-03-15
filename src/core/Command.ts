import { Collection } from '@discordjs/collection'
import { BaseArgument } from './BaseArgument'
import { Argument } from '@/core/Argument'
import { Option } from '@/core/Option'
import { printHelperText } from '@/utils/console-helper'
import { createDefaultOptions } from '@/utils/default-command'
import type { ArgValue, OptionValue } from '@/utils/process-helper'

export class Command extends BaseArgument {
  public args: Collection<string, Argument>
  public commands: Collection<string, Command>
  public options: Collection<string, Option>

  private callback: CallableFunction = () => {
    console.log(`Command \`${this.name}\` not implement.`)
  }

  constructor(name: string, desc: string = '') {
    super(name, desc)
    this.args = new Collection()
    this.commands = new Collection()
    this.options = createDefaultOptions(this)
  }

  help() {
    printHelperText(this)
  }

  subCommand(cmd: string | Command, desc: string = '') {
    if (!(cmd instanceof Command))
      cmd = new Command(cmd, desc)

    cmd.parent = this

    this.commands.set(cmd.name, cmd)
    return this
  }

  option(op: string | Option, desc: string = '') {
    if (!(op instanceof Option))
      op = new Option(op, desc)

    op.parent = this

    this.options.set(op.name, op)
    return this
  }

  argument(arg: string | Argument, desc: string = '') {
    if (!(arg instanceof Argument))
      arg = new Argument(arg, desc)

    arg.parent = this

    this.args.set(arg.name, arg)
    return this
  }

  action(callback: (...flags: OptionValue[]) => void) {
    this.callback = callback
    return this
  }

  execute(flags: (OptionValue | ArgValue)[]) {
    const names = flags.map(({ name }) => name)

    if (this.hasDefaultFlags(names)) {
      this.executeDefaultAction(flags)
      return
    }

    this.callback(...flags)
  }

  hasDefaultFlags(flags: string[]) {
    return flags.some(flag => this.options.get('help')?.validate(flag))
  }

  private executeDefaultAction(flags: OptionValue[]) {
    // only run the first default action
    const defaultActions = flags.filter(flag => this.options.get('help')?.validate(flag.name))
    if (defaultActions.length) {
      defaultActions.forEach((option) => {
        this.options.get(Option.extractOption(option.name))?.execute(option.value)
      })
    }
  }
}
