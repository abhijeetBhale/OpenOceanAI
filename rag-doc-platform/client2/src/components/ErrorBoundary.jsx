import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
          <div className="bg-ivory border border-borderCream rounded-generous p-8 shadow-whisper max-w-md w-full text-center">
            <div className="text-terracotta text-5xl mb-4">⚠</div>
            <h2 className="text-xl font-serif text-midnight mb-2">Something went wrong</h2>
            <p className="text-stone text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-terracotta text-ivory rounded-comfortable font-medium hover:bg-terracotta-dark transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-borderWarm text-midnight rounded-comfortable font-medium hover:bg-ivory transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}