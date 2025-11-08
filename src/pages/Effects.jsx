import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Effects.css';

function Effects() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [useMicrophone, setUseMicrophone] = useState(false);
  
  // EQ 参数
  const [eq, setEq] = useState({
    low: 0,      // -12 to +12 dB
    mid: 0,
    high: 0
  });
  
  // Reverb 参数
  const [reverb, setReverb] = useState({
    enabled: false,
    intensity: 0.3,
    duration: 2.0
  });
  
  // Delay 参数
  const [delay, setDelay] = useState({
    enabled: false,
    time: 0.5,
    feedback: 0.3,
    mix: 0.5
  });
  
  // Distortion 参数
  const [distortion, setDistortion] = useState({
    enabled: false,
    amount: 50
  });
  
  // Filter 参数
  const [filter, setFilter] = useState({
    enabled: false,
    type: 'lowpass',
    frequency: 1000,
    q: 1
  });

  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const audioElementRef = useRef(null);
  const micStreamRef = useRef(null);
  
  // Audio nodes
  const eqNodesRef = useRef({ low: null, mid: null, high: null });
  const reverbNodeRef = useRef(null);
  const delayNodeRef = useRef(null);
  const feedbackGainRef = useRef(null);
  const delayMixRef = useRef(null);
  const distortionNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const createAudioNodes = () => {
    const ctx = getAudioContext();
    
    // EQ nodes (3-band parametric EQ)
    eqNodesRef.current.low = ctx.createBiquadFilter();
    eqNodesRef.current.low.type = 'lowshelf';
    eqNodesRef.current.low.frequency.value = 320;
    
    eqNodesRef.current.mid = ctx.createBiquadFilter();
    eqNodesRef.current.mid.type = 'peaking';
    eqNodesRef.current.mid.frequency.value = 1000;
    eqNodesRef.current.mid.Q.value = 0.5;
    
    eqNodesRef.current.high = ctx.createBiquadFilter();
    eqNodesRef.current.high.type = 'highshelf';
    eqNodesRef.current.high.frequency.value = 3200;
    
    // Reverb (using convolver)
    reverbNodeRef.current = ctx.createConvolver();
    createReverbImpulse();
    
    // Delay
    delayNodeRef.current = ctx.createDelay(5.0);
    feedbackGainRef.current = ctx.createGain();
    delayMixRef.current = ctx.createGain();
    
    // Distortion
    distortionNodeRef.current = ctx.createWaveShaper();
    distortionNodeRef.current.curve = makeDistortionCurve(0);
    
    // Filter
    filterNodeRef.current = ctx.createBiquadFilter();
    filterNodeRef.current.type = filter.type;
    filterNodeRef.current.frequency.value = filter.frequency;
    filterNodeRef.current.Q.value = filter.q;
    
    // Master gain
    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.gain.value = 1.0;
  };

  const createReverbImpulse = () => {
    const ctx = getAudioContext();
    const rate = ctx.sampleRate;
    const length = rate * reverb.duration;
    const impulse = ctx.createBuffer(2, length, rate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    reverbNodeRef.current.buffer = impulse;
  };

  const makeDistortionCurve = (amount) => {
    const k = amount;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    
    return curve;
  };

  const connectAudioNodes = (source) => {
    const ctx = getAudioContext();
    let currentNode = source;
    
    // Connect EQ
    currentNode.connect(eqNodesRef.current.low);
    currentNode = eqNodesRef.current.low;
    
    currentNode.connect(eqNodesRef.current.mid);
    currentNode = eqNodesRef.current.mid;
    
    currentNode.connect(eqNodesRef.current.high);
    currentNode = eqNodesRef.current.high;
    
    // Distortion
    if (distortion.enabled) {
      currentNode.connect(distortionNodeRef.current);
      currentNode = distortionNodeRef.current;
    }
    
    // Filter
    if (filter.enabled) {
      currentNode.connect(filterNodeRef.current);
      currentNode = filterNodeRef.current;
    }
    
    // Create wet/dry mix for reverb
    if (reverb.enabled) {
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = reverb.intensity;
      
      const dryGain = ctx.createGain();
      dryGain.gain.value = 1 - reverb.intensity;
      
      currentNode.connect(reverbNodeRef.current);
      reverbNodeRef.current.connect(reverbGain);
      
      currentNode.connect(dryGain);
      
      reverbGain.connect(gainNodeRef.current);
      dryGain.connect(gainNodeRef.current);
    } else {
      // Delay
      if (delay.enabled) {
        delayNodeRef.current.delayTime.value = delay.time;
        feedbackGainRef.current.gain.value = delay.feedback;
        delayMixRef.current.gain.value = delay.mix;
        
        const dryGain = ctx.createGain();
        dryGain.gain.value = 1 - delay.mix;
        
        currentNode.connect(delayNodeRef.current);
        delayNodeRef.current.connect(feedbackGainRef.current);
        feedbackGainRef.current.connect(delayNodeRef.current);
        
        delayNodeRef.current.connect(delayMixRef.current);
        delayMixRef.current.connect(gainNodeRef.current);
        
        currentNode.connect(dryGain);
        dryGain.connect(gainNodeRef.current);
      } else {
        currentNode.connect(gainNodeRef.current);
      }
    }
    
    gainNodeRef.current.connect(ctx.destination);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(URL.createObjectURL(file));
      setUseMicrophone(false);
      stopAudio();
    }
  };

  const handlePlayPause = () => {
    if (!audioFile && !useMicrophone) return;
    
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    const ctx = getAudioContext();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    createAudioNodes();
    
    if (useMicrophone) {
      startMicrophone();
    } else if (audioFile) {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(audioFile);
        audioElementRef.current.loop = true;
      }
      
      sourceNodeRef.current = ctx.createMediaElementSource(audioElementRef.current);
      connectAudioNodes(sourceNodeRef.current);
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    setIsPlaying(false);
  };

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      const ctx = getAudioContext();
      sourceNodeRef.current = ctx.createMediaStreamSource(stream);
      connectAudioNodes(sourceNodeRef.current);
      setIsPlaying(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const toggleMicrophone = () => {
    if (isPlaying) {
      stopAudio();
    }
    setUseMicrophone(!useMicrophone);
    setAudioFile(null);
  };

  // Update effects in real-time
  useEffect(() => {
    if (!eqNodesRef.current.low) return;
    
    eqNodesRef.current.low.gain.value = eq.low;
    eqNodesRef.current.mid.gain.value = eq.mid;
    eqNodesRef.current.high.gain.value = eq.high;
  }, [eq]);

  useEffect(() => {
    if (isPlaying && reverb.enabled) {
      createReverbImpulse();
    }
  }, [reverb.duration, reverb.intensity, isPlaying, reverb.enabled, createReverbImpulse]);

  useEffect(() => {
    if (!delayNodeRef.current) return;
    
    delayNodeRef.current.delayTime.value = delay.time;
    if (feedbackGainRef.current) {
      feedbackGainRef.current.gain.value = delay.feedback;
    }
    if (delayMixRef.current) {
      delayMixRef.current.gain.value = delay.mix;
    }
  }, [delay]);

  useEffect(() => {
    if (!distortionNodeRef.current) return;
    distortionNodeRef.current.curve = makeDistortionCurve(distortion.amount);
  }, [distortion.amount]);

  useEffect(() => {
    if (!filterNodeRef.current) return;
    
    filterNodeRef.current.type = filter.type;
    filterNodeRef.current.frequency.value = filter.frequency;
    filterNodeRef.current.Q.value = filter.q;
  }, [filter]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="effects-container">
      <div className="window-96 effects-window">
        <div className="window-title-bar">
          <span>🎚️ Audio Effects Rack v1.0</span>
          <button className="close-btn" onClick={() => navigate('/')}>×</button>
        </div>

        <div className="window-content effects-content">
          {/* Audio Source Selection */}
          <div className="source-panel">
            <h3>音频源</h3>
            <div className="source-buttons">
              <label className="file-upload-btn">
                📁 选择文件
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              
              <button 
                className={`source-btn ${useMicrophone ? 'active' : ''}`}
                onClick={toggleMicrophone}
              >
                🎤 {useMicrophone ? '关闭麦克风' : '使用麦克风'}
              </button>
              
              <button 
                className={`play-btn ${isPlaying ? 'active' : ''}`}
                onClick={handlePlayPause}
                disabled={!audioFile && !useMicrophone}
              >
                {isPlaying ? '⏸ 暂停' : '▶ 播放'}
              </button>
            </div>
            {audioFile && <p className="file-info">✓ 文件已加载</p>}
          </div>

          {/* EQ Section */}
          <div className="fx-module">
            <h3>🎛️ 均衡器 (EQ)</h3>
            <div className="fx-controls">
              <div className="fx-control">
                <label>低频 ({eq.low}dB)</label>
                <input 
                  type="range" 
                  min="-12" 
                  max="12" 
                  step="0.1"
                  value={eq.low}
                  onChange={(e) => setEq({...eq, low: parseFloat(e.target.value)})}
                />
              </div>
              <div className="fx-control">
                <label>中频 ({eq.mid}dB)</label>
                <input 
                  type="range" 
                  min="-12" 
                  max="12" 
                  step="0.1"
                  value={eq.mid}
                  onChange={(e) => setEq({...eq, mid: parseFloat(e.target.value)})}
                />
              </div>
              <div className="fx-control">
                <label>高频 ({eq.high}dB)</label>
                <input 
                  type="range" 
                  min="-12" 
                  max="12" 
                  step="0.1"
                  value={eq.high}
                  onChange={(e) => setEq({...eq, high: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </div>

          {/* Reverb Section */}
          <div className="fx-module">
            <div className="fx-header">
              <h3>🌊 混响 (Reverb)</h3>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={reverb.enabled}
                  onChange={(e) => setReverb({...reverb, enabled: e.target.checked})}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="fx-controls">
              <div className="fx-control">
                <label>强度 ({(reverb.intensity * 100).toFixed(0)}%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={reverb.intensity}
                  onChange={(e) => setReverb({...reverb, intensity: parseFloat(e.target.value)})}
                  disabled={!reverb.enabled}
                />
              </div>
              <div className="fx-control">
                <label>持续时间 ({reverb.duration.toFixed(1)}s)</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.1"
                  value={reverb.duration}
                  onChange={(e) => setReverb({...reverb, duration: parseFloat(e.target.value)})}
                  disabled={!reverb.enabled}
                />
              </div>
            </div>
          </div>

          {/* Delay Section */}
          <div className="fx-module">
            <div className="fx-header">
              <h3>🔁 延迟 (Delay)</h3>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={delay.enabled}
                  onChange={(e) => setDelay({...delay, enabled: e.target.checked})}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="fx-controls">
              <div className="fx-control">
                <label>延迟时间 ({(delay.time * 1000).toFixed(0)}ms)</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2" 
                  step="0.01"
                  value={delay.time}
                  onChange={(e) => setDelay({...delay, time: parseFloat(e.target.value)})}
                  disabled={!delay.enabled}
                />
              </div>
              <div className="fx-control">
                <label>反馈 ({(delay.feedback * 100).toFixed(0)}%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="0.9" 
                  step="0.01"
                  value={delay.feedback}
                  onChange={(e) => setDelay({...delay, feedback: parseFloat(e.target.value)})}
                  disabled={!delay.enabled}
                />
              </div>
              <div className="fx-control">
                <label>混合 ({(delay.mix * 100).toFixed(0)}%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={delay.mix}
                  onChange={(e) => setDelay({...delay, mix: parseFloat(e.target.value)})}
                  disabled={!delay.enabled}
                />
              </div>
            </div>
          </div>

          {/* Distortion Section */}
          <div className="fx-module">
            <div className="fx-header">
              <h3>🔥 失真 (Distortion)</h3>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={distortion.enabled}
                  onChange={(e) => setDistortion({...distortion, enabled: e.target.checked})}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="fx-controls">
              <div className="fx-control">
                <label>强度 ({distortion.amount})</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  value={distortion.amount}
                  onChange={(e) => setDistortion({...distortion, amount: parseInt(e.target.value)})}
                  disabled={!distortion.enabled}
                />
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="fx-module">
            <div className="fx-header">
              <h3>🎚️ 滤波器 (Filter)</h3>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={filter.enabled}
                  onChange={(e) => setFilter({...filter, enabled: e.target.checked})}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="fx-controls">
              <div className="fx-control">
                <label>类型</label>
                <select 
                  value={filter.type}
                  onChange={(e) => setFilter({...filter, type: e.target.value})}
                  disabled={!filter.enabled}
                  className="filter-select"
                >
                  <option value="lowpass">低通</option>
                  <option value="highpass">高通</option>
                  <option value="bandpass">带通</option>
                  <option value="notch">陷波</option>
                </select>
              </div>
              <div className="fx-control">
                <label>频率 ({filter.frequency}Hz)</label>
                <input 
                  type="range" 
                  min="20" 
                  max="20000" 
                  step="1"
                  value={filter.frequency}
                  onChange={(e) => setFilter({...filter, frequency: parseInt(e.target.value)})}
                  disabled={!filter.enabled}
                />
              </div>
              <div className="fx-control">
                <label>Q值 ({filter.q.toFixed(1)})</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="10" 
                  step="0.1"
                  value={filter.q}
                  onChange={(e) => setFilter({...filter, q: parseFloat(e.target.value)})}
                  disabled={!filter.enabled}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Effects;
