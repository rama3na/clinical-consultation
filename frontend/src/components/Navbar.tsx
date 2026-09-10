import Link from 'next/link'

export function Navbar() {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm group-hover:bg-blue-700 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                  Clinical Consultation
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Doctor Workspace &middot; Synthetic Data
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{todayFormatted}</span>
            </div>

            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

