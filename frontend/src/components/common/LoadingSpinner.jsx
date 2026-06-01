const LoadingSpinner = ({ message = 'Loading...', fullScreen = true }) => {
  return (
    <div className={`loading-container ${fullScreen ? 'loading-fullscreen' : ''}`}>
      <div className="spinner-wrapper">
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
