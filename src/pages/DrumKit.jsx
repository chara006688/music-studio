import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DrumKit.css';

function DrumKit() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBeats, setRecordedBeats] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('webm');
  const recordingStartTime = useRef(null);
  const metronomeInterval = useRef(null);
  const audioContextRef = useRef(null);

  const drums = [
    { id: 'kick', name: 'Kick', key: 'A', color: '#ff6b9d' },
    { id: 'snare', name: 'Snare', key: 'S', color: '#ff9d6b' },
    { id: 'hihat', name: 'Hi-Hat', key: 'D', color: '#ffd700' },
    { id: 'tom1', name: 'Tom 1', key: 'F', color: '#00d4ff' },
    { id: 'tom2', name: 'Tom 2', key: 'G', color: '#9d6bff' },
    { id: 'crash', name: 'Crash', key: 'H', color: '#6bff9d' },
    { id: 'ride', name: 'Ride', key: 'J', color: '#ff6bf0' },
    { id: 'clap', name: 'Clap', key: 'K', color: '#6bd4ff' },
  ];

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playSound = (drumId) => {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    const soundMap = {
      kick: { freq: 150, duration: 0.5, type: 'sine' },
      snare: { freq: 200, duration: 0.2, type: 'triangle' },
      hihat: { freq: 8000, duration: 0.05, type: 'square' },
      tom1: { freq: 220, duration: 0.3, type: 'sine' },
      tom2: { freq: 180, duration: 0.3, type: 'sine' },
      crash: { freq: 5000, duration: 0.8, type: 'sawtooth' },
      ride: { freq: 3000, duration: 0.4, type: 'square' },
      clap: { freq: 1000, duration: 0.1, type: 'white-noise' }
    };

    const sound = soundMap[drumId];
    oscillator.frequency.value = sound.freq;
    oscillator.type = sound.type === 'white-noise' ? 'square' : sound.type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + sound.duration);

    if (isRecording) {
      const timestamp = Date.now() - recordingStartTime.current;
      setRecordedBeats(prev => [...prev, { drumId, timestamp }]);
    }
  };

  const exportRecording = async () => {
    if (recordedBeats.length === 0) return;
    
    setIsExporting(true);
    
    try {
      if (exportFormat === 'wav') {
        await exportAsWAV();
      } else {
        await exportAsWebM();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    }
    
    setIsExporting(false);
  };

  const exportAsWebM = async () => {
    // 创建一个新的AudioContext用于导出
    const exportContext = new (window.AudioContext || window.webkitAudioContext)();
    const destination = exportContext.createMediaStreamDestination();
    
    // 尝试不同的MIME类型
    let mimeType = 'audio/webm';
    if (exportFormat === 'mp3' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (exportFormat === 'ogg' && MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      mimeType = 'audio/ogg;codecs=opus';
    }
    
    // 设置MediaRecorder
    const mediaRecorder = new MediaRecorder(destination.stream, { mimeType });
    const chunks = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    // 创建Promise等待录制完成
    const recordingComplete = new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      }
    });
    
    // 开始录制
    mediaRecorder.start();
    
    // 播放录制的节奏
    for (const beat of recordedBeats) {
      await new Promise(resolve => setTimeout(resolve, beat.timestamp));
      
      // 创建并播放声音
      const oscillator = exportContext.createOscillator();
      const gainNode = exportContext.createGain();
      
      const soundMap = {
        kick: { freq: 150, duration: 0.5, type: 'sine' },
        snare: { freq: 200, duration: 0.2, type: 'triangle' },
        hihat: { freq: 8000, duration: 0.1, type: 'square' },
        tom1: { freq: 220, duration: 0.3, type: 'sine' },
        tom2: { freq: 180, duration: 0.3, type: 'sine' },
        crash: { freq: 5000, duration: 0.5, type: 'square' },
        ride: { freq: 3000, duration: 0.3, type: 'triangle' },
        clap: { freq: 1000, duration: 0.1, type: 'square' },
      };
      
      const sound = soundMap[beat.drumId];
      oscillator.type = sound.type;
      oscillator.frequency.value = sound.freq;
      
      gainNode.gain.setValueAtTime(0.5, exportContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, exportContext.currentTime + sound.duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(destination);
      
      oscillator.start();
      oscillator.stop(exportContext.currentTime + sound.duration);
    }
    
    // 等待最后一个声音结束
    const lastBeat = recordedBeats[recordedBeats.length - 1];
    const soundMap = {
      kick: { duration: 0.5 },
      snare: { duration: 0.2 },
      hihat: { duration: 0.1 },
      tom1: { duration: 0.3 },
      tom2: { duration: 0.3 },
      crash: { duration: 0.5 },
      ride: { duration: 0.3 },
      clap: { duration: 0.1 },
    };
    const lastDuration = soundMap[lastBeat.drumId].duration;
    await new Promise(resolve => setTimeout(resolve, lastDuration * 1000 + 500));
    
    // 停止录制
    mediaRecorder.stop();
    
    // 等待录制完成
    const blob = await recordingComplete;
    
    // 下载文件
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drum-recording-${Date.now()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 关闭导出用的AudioContext
    exportContext.close();
  };

  const exportAsWAV = async () => {
    // 计算总时长
    const lastBeat = recordedBeats[recordedBeats.length - 1];
    const soundMap = {
      kick: { duration: 0.5 },
      snare: { duration: 0.2 },
      hihat: { duration: 0.1 },
      tom1: { duration: 0.3 },
      tom2: { duration: 0.3 },
      crash: { duration: 0.5 },
      ride: { duration: 0.3 },
      clap: { duration: 0.1 },
    };
    const lastDuration = soundMap[lastBeat.drumId].duration;
    const totalDuration = (lastBeat.timestamp + lastDuration * 1000 + 500) / 1000;
    
    // 使用OfflineAudioContext渲染
    const sampleRate = 48000;
    const offlineContext = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);
    
    // 播放所有录制的节拍
    for (const beat of recordedBeats) {
      const startTime = beat.timestamp / 1000;
      
      const oscillator = offlineContext.createOscillator();
      const gainNode = offlineContext.createGain();
      
      const fullSoundMap = {
        kick: { freq: 150, duration: 0.5, type: 'sine' },
        snare: { freq: 200, duration: 0.2, type: 'triangle' },
        hihat: { freq: 8000, duration: 0.1, type: 'square' },
        tom1: { freq: 220, duration: 0.3, type: 'sine' },
        tom2: { freq: 180, duration: 0.3, type: 'sine' },
        crash: { freq: 5000, duration: 0.5, type: 'square' },
        ride: { freq: 3000, duration: 0.3, type: 'triangle' },
        clap: { freq: 1000, duration: 0.1, type: 'square' },
      };
      
      const sound = fullSoundMap[beat.drumId];
      oscillator.type = sound.type;
      oscillator.frequency.value = sound.freq;
      
      gainNode.gain.setValueAtTime(0.5, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + sound.duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(offlineContext.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + sound.duration);
    }
    
    // 渲染音频
    const audioBuffer = await offlineContext.startRendering();
    
    // 转换为WAV
    const wavBlob = audioBufferToWav(audioBuffer);
    
    // 下载文件
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drum-recording-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const audioBufferToWav = (buffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // WAV文件头
    const setUint16 = (data) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // RIFF标识符
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // 文件大小
    setUint32(0x45564157); // "WAVE"

    // fmt子块
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // 子块大小
    setUint16(1); // 音频格式 (PCM)
    setUint16(numOfChan); // 声道数
    setUint32(buffer.sampleRate); // 采样率
    setUint32(buffer.sampleRate * 2 * numOfChan); // 字节率
    setUint16(numOfChan * 2); // 块对齐
    setUint16(16); // 位深度

    // data子块
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // 数据大小

    // 写入音频数据
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([bufferArray], { type: 'audio/wav' });
  };

  const handleDrumClick = (drumId) => {
    playSound(drumId);
    const element = document.getElementById(drumId);
    element.classList.add('active');
    setTimeout(() => element.classList.remove('active'), 100);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setRecordedBeats([]);
      recordingStartTime.current = Date.now();
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (recordedBeats.length === 0 || isPlaying) return;
    
    setIsPlaying(true);
    recordedBeats.forEach(beat => {
      setTimeout(() => {
        playSound(beat.drumId);
        const element = document.getElementById(beat.drumId);
        element.classList.add('active');
        setTimeout(() => element.classList.remove('active'), 100);
      }, beat.timestamp);
    });

    const lastBeat = recordedBeats[recordedBeats.length - 1];
    setTimeout(() => setIsPlaying(false), lastBeat.timestamp + 500);
  };

  const startMetronome = () => {
    const interval = (60 / bpm) * 1000;
    metronomeInterval.current = setInterval(() => {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
    }, interval);
  };

  const toggleMetronome = () => {
    if (!metronomeActive) {
      startMetronome();
      setMetronomeActive(true);
    } else {
      clearInterval(metronomeInterval.current);
      setMetronomeActive(false);
    }
  };

  useEffect(() => {
    if (metronomeActive) {
      clearInterval(metronomeInterval.current);
      startMetronome();
    }
  }, [bpm]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const drum = drums.find(d => d.key.toLowerCase() === e.key.toLowerCase());
      if (drum) {
        handleDrumClick(drum.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (metronomeInterval.current) clearInterval(metronomeInterval.current);
    };
  }, [isRecording]);

  return (
    <div className="drumkit-container">
      <div className="window-96">
        <div className="window-title-bar">
          <span>🥁 Virtual Drum Kit v1.0</span>
          <button className="close-btn" onClick={() => navigate('/')}>×</button>
        </div>

        <div className="window-content">
          <div className="controls-panel">
            <div className="control-group">
              <button 
                className={`control-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
              >
                {isRecording ? '⏹ 停止录音' : '⏺ 开始录音'}
              </button>
              
              <button 
                className="control-btn"
                onClick={playRecording}
                disabled={recordedBeats.length === 0 || isPlaying || isExporting}
              >
                {isPlaying ? '▶ 播放中...' : `▶ 回放 (${recordedBeats.length})`}
              </button>

              <button 
                className={`control-btn ${metronomeActive ? 'active' : ''}`}
                onClick={toggleMetronome}
              >
                {metronomeActive ? '⏸ 节拍器' : '🎵 节拍器'}
              </button>

              <button 
                className="control-btn export-btn"
                onClick={exportRecording}
                disabled={recordedBeats.length === 0 || isExporting || isPlaying}
              >
                {isExporting ? '⏳ 导出中...' : '💾 导出录音'}
              </button>
            </div>

            <div className="control-group">
              <label>BPM: {bpm}</label>
              <input 
                type="range" 
                min="60" 
                max="200" 
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="bpm-slider"
              />
            </div>

            <div className="control-group">
              <label>导出格式:</label>
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value)}
                className="format-select"
                disabled={isExporting}
              >
                <option value="webm">WebM (推荐)</option>
                <option value="wav">WAV (无损)</option>
                <option value="ogg">OGG (兼容)</option>
              </select>
            </div>
          </div>

          <div className="drum-grid">
            {drums.map((drum) => (
              <div
                key={drum.id}
                id={drum.id}
                className="drum-pad"
                style={{ borderColor: drum.color }}
                onClick={() => handleDrumClick(drum.id)}
              >
                <div className="drum-name">{drum.name}</div>
                <div className="drum-key">{drum.key}</div>
              </div>
            ))}
          </div>

          <div className="keyboard-hint">
            按下键盘 A-K 键演奏鼓组
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrumKit;
