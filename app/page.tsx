import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col">
      <header className="p-8">
        <p className="text-4xl font-bold text-gray-900">Welcome to SR App</p>
      </header>
      <div className="max-w-2xl p-8">
        <p className="leading-relaxed text-gray-700">
          Reviewing a flashcard once is often insufficient to commit a fact to long-term memory, and
          multiple reviews are necessary. This app handles spacing reviews for each flashcard to
          commit facts to your long-term memory with minimal time invested in studying.
        </p>
      </div>
    </div>
  )
}
