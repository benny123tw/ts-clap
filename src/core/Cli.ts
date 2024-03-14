import process from 'node:process'
import { Collection } from '@discordjs/collection'
import { version as packageVersion } from '../../package.json'
import { Arg, Command, Option } from '@/core'
import { printHelperText } from '@/utils/console-helper'
import { executeParse, parseCommandLine } from '@/utils/process-helper'
import { createDefaultCommands, createDefaultOptions } from '@/utils/default-command'
import { Logger } from '@/utils/Logger'

const logger = Logger.getInstance()

export class Cli {
  public args: Collection<string, Arg> = new Collection()
  public commands: Collection<string, Command>
  public options: Collection<string, Option>

  private ver: string = `v${packageVersion}`

  constructor(public name: string, private desc: string = '') {
    this.setUpExitListener()
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

  arg(arg: string | Arg, desc?: string) {
    if (!(arg instanceof Arg))
      arg = new Arg(arg, desc)

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

  printUsage() {

  }

  getDescription() {
    return this.desc
  }

  getVersion() {
    return this.ver
  }
}

export default Cli
