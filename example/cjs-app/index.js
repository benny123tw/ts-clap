async function main() {
  const { Cli } = await import('ts-clap')

  new Cli('Coolest App').version('1.0.0').description('This is the coolest app ever!').exec()
}

main()
