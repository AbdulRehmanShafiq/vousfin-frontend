import { Component } from 'react'
import Button from '@/components/ui/Button'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-screen flex-col items-center justify-center bg-navy p-6 text-center"
        >
          <h1 className="text-xl font-bold text-text-primary">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            {this.state.error.message}
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
