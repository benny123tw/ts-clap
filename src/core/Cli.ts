import { Collection } from '@discordjs/collection'
import figlet from 'figlet'
import { version as packageVersion } from '../../package.json'
import { Arg, Command, Option } from '@/core'
import { printHelperText } from '@/utils/console-helper'
import { executeParse, parseCommandLine } from '@/utils/process-helper'
import { createDefaultCommands, createDefaultOptions } from '@/utils/default-command'

export class Cli {
  public args: Collection<string, Arg> = new Collection()
  public commands: Collection<string, Command>
  public options: Collection<string, Option>

  private ver: string = `v${packageVersion}`

  constructor(public name: string, private desc: string = '') {
    this.commands = createDefaultCommands(this)
    this.options = createDefaultOptions(this)
  }

  logo() {
    return new Promise((resolve, reject) => {
      figlet.text(this.name, (err, result) => {
        if (err)
          return reject(err)

        console.log(result)
        resolve(result)
      })
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

    this.commands.set(cmd.name, cmd)
    return this
  }

  arg(arg: string | Arg, desc?: string) {
    if (!(arg instanceof Arg))
      arg = new Arg(arg, desc)

    this.args.set(arg.name, arg)
    return this
  }

  option(o: string | Option, desc?: string) {
    if (!(o instanceof Option))
      o = new Option(o, desc)

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
