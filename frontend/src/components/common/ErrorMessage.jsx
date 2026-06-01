const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="error-text">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary btn-sm">
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
