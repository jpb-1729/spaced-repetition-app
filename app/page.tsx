export default function Home() {
  return (
    <div className="flex flex-col">
      <header className="p-8">
        <p className="text-4xl font-bold text-gray-900">Welcome to Olivero Recall</p>
        <p className="text-xl text-gray-700"> Learn smarter, not harder. </p>
      </header>
      <div className="max-w-2xl p-8">
        <p className="leading-relaxed text-gray-700">
          This app uses spaced repetition to burn knowledge into your memory with minimal effort.
        </p>
      </div>
    </div>
  )
}
