export default function Home() {
  return (
    <div className="flex flex-col">
      <header className="p-8">
        <p className="text-foreground text-4xl font-bold">Welcome to Olivero Recall</p>
        <p className="text-muted-foreground text-xl"> Learn smarter, not harder. </p>
      </header>
      <div className="max-w-2xl p-8">
        <p className="text-foreground leading-relaxed">
          This app uses spaced repetition to burn knowledge into your memory with minimal effort.
        </p>
      </div>
    </div>
  )
}
