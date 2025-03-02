import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const navigate = useNavigate();
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = React.useState<React.ErrorInfo | null>(
    null
  );

  // The error boundary will catch errors when one occurs in any of its children
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    setHasError(true);
    setError(error);
    setErrorInfo(errorInfo);
  };

  // Simulate an error boundary's "componentDidCatch" behavior
  React.useEffect(() => {
    if (hasError) {
      // Navigate to the error page when an error occurs
      navigate("/error");
    }
  }, [hasError, navigate]);

  // Render the fallback UI when an error occurs
  if (hasError) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Something went wrong.</h2>
        <p>We're sorry, but something went wrong with the app.</p>
        <details style={{ whiteSpace: "pre-wrap" }}>
          {error && error.toString()}
          <br />
          {errorInfo && errorInfo.componentStack}
        </details>
      </div>
    );
  }

  // Wrap children with error handling logic
  try {
    return children;
  } catch (error) {
    handleError(error as Error, {
      componentStack: "Component stack not available",
    });
    return null;
  }
};

export default ErrorBoundary;
