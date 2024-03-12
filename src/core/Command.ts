import { Collection } from '@discordjs/collection'
import { CliComponent } from '@/core/CliComponent'
import { Option } from '@/core/Option'
import { printHelperText } from '@/utils/console-helper'
import type { OptionValue } from '@/utils/process-helper'
import { createDefaultOptions } from '@/utils/default-command'

export class Command extends CliComponent {
  public commands: Collection<string, Command> = new Collection()
  public options: Collection<string, Option> = createDefaultOptions(this)

  private callback: CallableFunction = () => {
    console.log(`Command \`${this.name}\` not implement.`)
  }

  help() {
    printHelperText(this)
  }

  subCommand(cmd: string | Command, desc: string = '') {
    if (!(cmd instanceof Command))
      cmd = new Command(cmd, desc)

    this.commands.set(cmd.name, cmd)
    return this
  }

  short() {
    return this
  }

  option(op: string | Option, desc: string = '') {
    if (!(op instanceof Option))
      op = new Option(op, desc)

    this.options.set(op.name, op)
    return this
  }

  action(callback: (...flags: OptionValue[]) => void) {
    this.callback = callback
    return this
  }

  execute(...flags: OptionValue[]) {
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
