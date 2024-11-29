import { useState, useRef } from "react";
import "../../css/video.css";

export default function Video({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControl, setShowControl] = useState(false);
  const [volumeClicked, setVolumeClicked] = useState(false);

  console.log(videoRef);

  const videoHandler = () => {
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
      setShowControl(true);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    videoRef.current.currentTime = 0;
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleRangeChange = (value) => {
    if (!showControl) setShowControl(true);

    const newTime = (value / 100) * duration;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const onMouseUp = () => {
    if (videoRef && videoRef.current) {
      // videoRef.current.currentTime = currentTime;
      playing ? videoRef.current.play() : videoRef.current.pause();
    }
  };

  const onMouseDown = () => {
    if (videoRef && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVolume = () => {
    if (videoRef.current) {
      videoRef.current.muted = volumeClicked;
      setVolumeClicked(!volumeClicked);
    }
  };

  const progressBarWidth = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="video-container"
      onMouseEnter={() => playing && setShowControl(true)}
      onMouseLeave={() => playing && setShowControl(false)}
    >
      <video
        ref={videoRef}
        className="video"
        src={src}
        onClick={videoHandler}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
      />
      {!playing && (
        <div className="play-icon" onClick={videoHandler}>
          <img src="/play.svg" alt="Play" />
        </div>
      )}
      {playing && showControl && (
        <div className="pause-icon" onClick={videoHandler}>
          <img src="/pause.svg" alt="Pause" />
        </div>
      )}
      {(showControl || !playing) && (
        <div className="timecontrols">
          <span className="controlsTime">{formatTime(currentTime)}</span>
          <div className="time_progressbarContainer">
            <div
              className="time_progressBar"
              style={{ width: `${progressBarWidth}%` }}
            >
              <input
                onChange={(e) => handleRangeChange(parseInt(e.target.value, 10))}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                type="range"
                min="0"
                max="100"
                step="1"
                value={progressBarWidth}
              />
            </div>
          </div>
          <span className="controlsTime">{formatTime(duration)}</span>
          <img
            className="volume-icon"
            src={volumeClicked ? '/volume.png' : '/mute.png'}
            alt="Volume Control"
            onClick={handleVolume}
          />
        </div>
      )}
    </div>
  );
}
