'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-8 text-center bg-card border border-border rounded-xl max-w-lg mx-auto mt-20">
      <h2 className="text-xl font-bold text-red-600 mb-3">Algo deu errado (Server-Side Error)</h2>
      <p className="text-sm text-foreground/80 mb-6 font-mono bg-muted p-4 rounded text-left overflow-auto max-h-60">
        {error.message || error.toString()}
      </p>
      {error.stack && (
        <pre className="text-xs text-foreground/60 text-left overflow-auto max-h-40 mb-6 bg-muted p-2 rounded">
          {error.stack}
        </pre>
      )}
      {error.digest && (
        <p className="text-xs text-foreground/50 mb-6">
          Digest: {error.digest}
        </p>
      )}
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
      >
        Tentar novamente
      </button>
    </div>
  )
}
