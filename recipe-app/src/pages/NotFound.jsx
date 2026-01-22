import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="grid place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-amber-500">404</p>

        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-stone-300 sm:text-7xl">
          Page not found
        </h1>

        <p className="mt-6 text-lg font-medium text-stone-200 sm:text-xl">
          Sorry, we couldn’t find the page you’re looking for.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/"
            className="rounded-md bg-stone-600 px-4 py-2.5 text-sm font-semibold text-stone-100 shadow hover:bg-stone-700 focus-visible:outline 
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900 hover:outline hover:outline-1 hover:outline-amber-500 hover:outline-offset-1"
          >
            Go back home
          </Link>

          <Link
            to="/recipes"
            className="text-sm font-semibold text-amber-700 hover:text-amber-500 transition"
          >
            Browse recipes →
          </Link>
        </div>
      </div>
    </main>
  )
}
