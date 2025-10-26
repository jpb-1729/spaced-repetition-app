import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col">
      <header className="p-8">
        <p className="text-4xl font-bold text-gray-900">Welcome to SR App</p>
      </header>
      <div className="max-w-2xl p-8">
        <p className="leading-relaxed text-gray-700">
          Flashcards are a well-known and effective study method. However, reviewing a flashcard
          once is often insufficient to commit a fact to long-term memory, and multiple reviews are
          necessary. The spacing of these reviews is crucial: too long, you forget; too frequent,
          and you waste time. This app handles spacing the reviews for each card to commit facts to
          your long-term memory with minimal time invested in studying.
        </p>
      </div>
    </div>
  )
}
