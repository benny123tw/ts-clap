import type { Collection } from '@discordjs/collection'
import type Cli from '@/core/Cli'
import type { Log } from '@/utils/Logger'
import { levenshteinDistance } from '@/utils/levenshtein-distance'
import { getUsageLog } from '@/utils/console-helper'

export class BaseArgument {
  public parent: Cli | BaseArgument | null = null

  constructor(public name: string, private desc: string = '') {
  }

  description(content: string) {
    this.desc = content
    return this
  }

  getDescription() {
    return this.desc
  }

  getUsageLog(): Log {
    return getUsageLog(this)
  }

  toString(_options?: { withShort: boolean }) {
    return this.name
  }

  static findSimilarName<T extends BaseArgument>(name: string, collection: Collection<string, T>) {
    const similarItems = collection.map((c) => {
      const distance = levenshteinDistance(c.name, name)
      return { similarity: 1 - (distance / Math.max(c.name.length, name.length)), argument: c }
    }).sort((a, b) => a.similarity - b.similarity)
    return similarItems.filter(c => c.similarity >= 0.4).at(0)?.argument
  }
}
