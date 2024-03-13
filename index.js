const packageName = 'ts-clap'

function printUsage(context) {
  let commandLine = context.command || ''
  commandLine += context.options.map(o => ` --${o.name}`).join('')
  commandLine += context.arguments.map(a => ` [${a.name}]`).join('')

  console.log(('Usage:'), packageName, commandLine)
}

printUsage({
  command: 'test',
  options: [
    { name: 'hello', value: 'world' },
    { name: 'foo' },
  ],
  arguments: [
    { name: 'arg1' },
  ],
})
