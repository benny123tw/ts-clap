import process from 'node:process'
import { Collection } from '@discordjs/collection'
import { version as packageVersion } from '../../package.json'
import { Argument } from '@/core/Argument'
import { Command } from '@/core/Command'
import { Option } from '@/core/Option'
import type { Log } from '@/utils/Logger'
import { LogType, Logger } from '@/utils/Logger'
import { printHelperText } from '@/utils/console-helper'
import { createDefaultCommands, createDefaultOptions } from '@/utils/default-command'
import { executeParse, parseCommandLine } from '@/utils/process-helper'

const logger = Logger.getInstance()

export class Cli {
  public args: Collection<string, Argument>
  public commands: Collection<string, Command>
  public options: Collection<string, Option>

  private ver: string = `v${packageVersion}`

  constructor(public name: string, private desc: string = '') {
    this.setUpExitListener()
    this.args = new Collection()
    this.commands = createDefaultCommands(this)
    this.options = createDefaultOptions(this)
  }

  private setUpExitListener() {
    process.on('exit', () => {
      logger.printLogs()
    })
  }

  help() {
    printHelperText(this)
  }

  description(content: string) {
    this.desc = content
    return this
  }

  version(ver: string) {
    this.ver = ver
    return this
  }

  command(cmd: string | Command, desc?: string) {
    if (!(cmd instanceof Command))
      cmd = new Command(cmd, desc)

    cmd.parent = this

    this.commands.set(cmd.name, cmd)
    return this
  }

  argument(arg: string | Argument, desc?: string) {
    if (!(arg instanceof Argument))
      arg = new Argument(arg, desc)

    arg.parent = this

    this.args.set(arg.name, arg)
    return this
  }

  option(o: string | Option, desc?: string) {
    if (!(o instanceof Option))
      o = new Option(o, desc)

    o.parent = this

    this.options.set(o.name, o)
    return this
  }

  parse() {
    const parsed = parseCommandLine(this)
    return parsed
  }

  exec() {
    return executeParse(this, this.parse())
  }

  getDescription() {
    return this.desc
  }

  getVersion() {
    return this.ver
  }

  getUsageLog(): Log {
    const argsUsage = this.args.size
      ? this.args.map(arg => arg.toString())
        .join(' ')
      : ''
    const hasOptions = this.options.size > 0
    const hasCommands = this.commands.size > 0
    const message = `${this.name} ${hasOptions ? '[OPTIONS]' : ''} ${argsUsage} ${hasCommands ? '[COMMAND]' : ''}`

    return {
      type: LogType.Usage,
      message,
    }
  }

  toString() {
    return this.name
  }
}

export default Cli
