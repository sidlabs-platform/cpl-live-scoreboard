import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  resetKey: string
  onReset: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Scoreboard rendering failed', error, info)
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (
      this.state.error &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ error: null })
    }
  }

  private reset = () => {
    this.setState({ error: null })
    this.props.onReset()
  }

  render() {
    if (this.state.error) {
      return (
        <main className="state-page">
          <section className="state-sheet" aria-labelledby="render-error-title">
            <span className="state-mark" aria-hidden="true">
              ×
            </span>
            <h1 id="render-error-title">The scorebook lost its place.</h1>
            <p>
              The room feed arrived, but this view could not draw it. Return to
              the room desk and try again.
            </p>
            <button className="button button--primary" onClick={this.reset}>
              Return to room desk
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
