import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="p-8">
        <text className="text-4xl font-bold text-gray-900">Welcome to SR App</text>
      </header>
      <main className="max-w-2xl flex-1 p-8">
        <p className="leading-relaxed text-gray-700">
          Spaced repetition and flashcards work synergistically because they leverage two powerful
          cognitive mechanisms: active recall and the spacing effect. Flashcards naturally promote
          active recall by forcing you to retrieve information from memory rather than passively
          reviewing it, which strengthens neural pathways and makes memories more durable. When
          combined with spaced repetition—reviewing material at strategically increasing
          intervals—this approach efficiently counters the forgetting curve by timing reviews just
          as you're about to forget information. This pairing moves knowledge from fragile
          short-term memory to robust long-term memory with minimal time investment. The simplicity
          of flashcards reduces cognitive load, allowing you to focus entirely on the content, while
          spaced repetition systems optimize the timing of reviews based on your performance.
          Together, they create a highly efficient learning method that maximizes retention while
          minimizing study time. text or maybe link here specifically how to use this app well in
          practice. topics like fsrs ratings, initial learning phase, etc
        </p>
      </main>
    </div>
  )
}
