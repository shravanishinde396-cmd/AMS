const LoadingSpinner = ({ message = 'Loading...', fullScreen = true }) => (
  <div className={`loading-container${fullScreen ? ' loading-fullscreen' : ''}`}>
    <div className="spinner-wrapper">
      <div className="spinner">
        <div className="spinner-ring" />
        <div className="spinner-ring" />
        <div className="spinner-ring" />
      </div>
      <p className="loading-message">{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;
