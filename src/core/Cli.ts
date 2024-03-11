import figlet from 'figlet'
import { Arg } from '@/core/Arg'
import { Command } from '@/core/Command'
import { printHelperText } from '@/utils/console-helper'
import { Option } from '@/core/Option'
import { Collection } from '@/utils/Collection'
import { executeParse, parseCommandLine } from '@/utils/process-helper'
import { version as packageVersion } from '../../package.json'

export class Cli {
  public args: Collection<string, Arg> = new Collection()
  public commands: Collection<string, Command> = new Collection([
    [
      'help',
      new Command('help', 'Print this message or the help of the given subcommand(s)').setAction(
        () => {
          this.help()
        },
      ),
    ],
  ])
  public options: Collection<string, Option> = new Collection([
    [
      'help',
      new Option('help', 'Print help').setAction(() => {
        this.help()
      }),
    ],
    [
      'version',
      new Option('version', 'Print the app version').setAction(() => {
        console.log(this.ver)
      }),
    ],
  ])
  public desc: string = ''
  public ver: string = `v${packageVersion}`

  constructor(public name: string) {}

  logo() {
    return new Promise((resolve, reject) => {
      figlet.text(this.name, (err, result) => {
        if (err) {
          return reject(err)
        }

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
    if (!(cmd instanceof Command)) {
      cmd = new Command(cmd, desc)
    }

    this.commands.set(cmd.name, cmd)
    return this
  }

  arg(arg: string | Arg, desc?: string) {
    if (!(arg instanceof Arg)) {
      arg = new Arg(arg, desc)
    }

    this.args.set(arg.name, arg)
    return this
  }

  option(o: string | Option, desc?: string) {
    if (!(o instanceof Option)) {
      o = new Option(o, desc)
    }

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
}

export default Cli
