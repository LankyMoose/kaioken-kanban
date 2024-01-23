import { Router, Route, Link, useState } from "kaioken"

export function App() {
  return (
    <div className="text-center">
      <nav className="flex gap-2 justify-center">
        <Link className="p-2 text-blue-500" to="/">
          Home
        </Link>
        <Link className="p-2 text-blue-500" to="/counter">
          Counter
        </Link>
      </nav>
      <main className="p-2">
        <Router>
          <Route
            path="/"
            element={() => (
              <div className="text-xl font-bold">Hello world!</div>
            )}
          />
          <Route path="/counter" element={Counter} />
        </Router>
      </main>
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col gap-2">
      <p>Count: {count}</p>
      <button
        className="p-2 bg-blue-500 text-white"
        onclick={() => setCount((prev) => prev + 1)}
      >
        Increment
      </button>
    </div>
  )
}
