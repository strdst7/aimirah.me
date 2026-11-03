import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional label shown in the fallback, e.g. the site name. */
  label?: string;
}

interface State {
  error: Error | null;
}

/**
 * Minimal error boundary.
 *
 * Previously a single render error (malformed localStorage cart, missing
 * catalog item) blanked the whole app with no recovery path. This renders a
 * reload affordance instead and logs the error for diagnostics
 * (CONCERNS.md #32).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>
          Something went wrong{this.props.label ? ` on ${this.props.label}` : ""}.
        </h1>
        <p style={{ opacity: 0.7, margin: 0, maxWidth: "32rem" }}>
          The page hit an unexpected error. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "0.5rem",
            border: "1px solid currentColor",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          Reload page
        </button>
      </div>
    );
  }
}
