import type { Collection } from '@discordjs/collection'
import type { Command } from './Command'
import type { Option } from './Option'
import type { Arg } from './Arg'
import Cli from './Cli'
import { levenshteinDistance } from '@/utils/levenshtein-distance'
import type { Log } from '@/utils/Logger'
import { LogType } from '@/utils/Logger'

export abstract class CliComponent {
  public parent: Cli | CliComponent | null = null

  constructor(public name: string, private desc: string = '') {}

  description(content: string) {
    this.desc = content
    return this
  }

  getDescription() {
    return this.desc
  }

  getUsageLog(): Log {
    // eslint-disable-next-line ts/no-this-alias
    let current: Cli | CliComponent = this
    let message = this.toString({ withShort: false })
    while (!(current instanceof Cli) && current.parent !== null) {
      current = current.parent
      message = `${current.toString({ withShort: false })} ${message}`
    }

    return {
      type: LogType.Usage,
      message,
    }
  }

  toString(_options?: { withShort: boolean }) {
    return this.name
  }

  static findSimilarName<T extends Command | Option | Arg>(name: string, collection: Collection<string, T>) {
    const similarItems = collection.map((c) => {
      const distance = levenshteinDistance(c.name, name)
      return { similarity: 1 - (distance / Math.max(c.name.length, name.length)), argument: c }
    }).sort((a, b) => a.similarity - b.similarity)
    return similarItems.filter(c => c.similarity >= 0.4).at(0)?.argument
  }
}
