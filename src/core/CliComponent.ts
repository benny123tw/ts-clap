import type { Collection } from '@discordjs/collection'
import type { Command } from './Command'
import type { Option } from './Option'
import type { Arg } from './Arg'
import type Cli from './Cli'
import { levenshteinDistance } from '@/utils/levenshtein-distance'

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

  toString(..._args: any[]) {
    return this.name
  }

  static findSimilarName<T extends Command | Option | Arg>(name: string, collection: Collection<string, T>) {
    const similarItems = collection.map((c) => {
      const distance = levenshteinDistance(c.name, name)
      return { similarity: 1 - (distance / Math.max(c.name.length, name.length)), argument: c }
    }).sort((a, b) => a.similarity - b.similarity)
    console.log(similarItems)
    return similarItems.filter(c => c.similarity >= 0.4).at(0)?.argument
  }
}
