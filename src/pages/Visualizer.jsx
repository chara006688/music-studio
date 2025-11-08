import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Visualizer.css';

function Visualizer() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [visualMode, setVisualMode] = useState('bars');
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(128);
  const [hue, setHue] = useState(280);
  const [brightness, setBrightness] = useState(1);
  const [audioFile, setAudioFile] = useState(null);
  const [songName, setSongName] = useState('内置合成音乐');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [exportFormat, setExportFormat] = useState('auto');
  const [showProgressDuringExport, setShowProgressDuringExport] = useState(true);
  const audioElementRef = useRef(null);
  const renderParamsRef = useRef({ speed: 1, density: 128, hue: 280, brightness: 1 });
  const visualModeRef = useRef('bars');
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      console.log('Canvas resized:', canvas.width, 'x', canvas.height);
    };
    
    setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', resizeCanvas);

    // 不在这里初始化 AudioContext，等用户交互时再创建

    return () => {
      // 清理动画循环
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // 清理音频上下文
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 先停止所有正在播放的音频
      if (isPlaying || isPaused) {
        stopAudio();
      }
      
      // 清理旧的音频源
      if (sourceRef.current) {
        if (sourceRef.current.type === 'synth') {
          try {
            sourceRef.current.oscillator1.stop();
            sourceRef.current.oscillator2.stop();
            sourceRef.current.lfo.stop();
          } catch {
            // 忽略已经停止的错误
          }
        } else if (sourceRef.current.type === 'file') {
          sourceRef.current.element.pause();
        }
        sourceRef.current = null;
      }
      
      const url = URL.createObjectURL(file);
      setSongName(file.name.replace(/\.[^/.]+$/, ''));
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setIsPaused(false);
      
      // 先设置 audioFile，确保 audio 元素被渲染
      setAudioFile(url);
      
      // 使用 setTimeout 确保 audio 元素已经渲染到 DOM
      setTimeout(() => {
        if (audioElementRef.current) {
          audioElementRef.current.src = url;
          
          // 添加多个事件监听器以确保获取时长
          const handleLoadedMetadata = () => {
            if (audioElementRef.current && audioElementRef.current.duration && isFinite(audioElementRef.current.duration)) {
              setDuration(audioElementRef.current.duration);
              console.log('Duration loaded:', audioElementRef.current.duration);
            }
          };
          
          const handleCanPlay = () => {
            if (audioElementRef.current && audioElementRef.current.duration && isFinite(audioElementRef.current.duration)) {
              setDuration(audioElementRef.current.duration);
              console.log('Duration from canplay:', audioElementRef.current.duration);
            }
          };
          
          const handleError = (e) => {
            console.error('Audio loading error:', e);
            console.error('File format may not be supported by browser');
          };
          
          audioElementRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          audioElementRef.current.addEventListener('canplay', handleCanPlay, { once: true });
          audioElementRef.current.addEventListener('error', handleError, { once: true });
          
          // 强制加载音频元数据
          audioElementRef.current.load();
        }
      }, 0);
    }
  };

  const playAudioFile = (resume = false) => {
    // 初始化 AudioContext（如果还没有）
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
    }
    
    const audioContext = audioContextRef.current;
    const analyser = analyserRef.current;
    const audioElement = audioElementRef.current;

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // 清理旧的合成音频源
    if (sourceRef.current && sourceRef.current.type === 'synth') {
      try {
        sourceRef.current.oscillator1.stop();
        sourceRef.current.oscillator2.stop();
        sourceRef.current.lfo.stop();
      } catch {
        // 忽略已停止的错误
      }
      sourceRef.current = null;
    }

    // 创建新的文件音频源
    if (!sourceRef.current || sourceRef.current.type !== 'file') {
      // 断开旧的连接
      try {
        analyser.disconnect();
      } catch {
        // 忽略断开连接错误
      }
      
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      sourceRef.current = { type: 'file', source, element: audioElement };
      
      // 移除旧的事件监听器，添加新的（使用once选项避免重复）
      audioElement.removeEventListener('loadedmetadata', null);
      audioElement.removeEventListener('timeupdate', null);
      audioElement.removeEventListener('ended', null);
      
      audioElement.addEventListener('loadedmetadata', () => {
        setDuration(audioElement.duration);
      }, { once: true });
      
      audioElement.addEventListener('timeupdate', () => {
        setCurrentTime(audioElement.currentTime);
      });
      
      audioElement.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTime(0);
      }, { once: true });
    }

    if (!resume) {
      audioElement.currentTime = 0;
    }
    audioElement.play();
    
    // 只在没有动画循环时启动
    if (!animationRef.current) {
      visualize();
    }
  };

  const generateSynth = () => {
    // 初始化 AudioContext（如果还没有）
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
    }
    
    const audioContext = audioContextRef.current;
    const analyser = analyserRef.current;

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // 清理旧的音频源（如果是文件）
    if (sourceRef.current && sourceRef.current.type === 'file') {
      sourceRef.current.element.pause();
      sourceRef.current = null;
    }

    // 清理旧的合成音频
    if (sourceRef.current && sourceRef.current.type === 'synth') {
      try {
        sourceRef.current.oscillator1.stop();
        sourceRef.current.oscillator2.stop();
        sourceRef.current.lfo.stop();
      } catch {
        // 忽略已经停止的错误
      }
      sourceRef.current = null;
    }

    // 断开旧的连接
    try {
      analyser.disconnect();
    } catch {
      // 忽略断开连接错误
    }

    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sawtooth';
    oscillator1.frequency.value = 220;
    oscillator2.frequency.value = 220.5;

    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.5;
    lfoGain.gain.value = 20;

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator1.frequency);

    gainNode.gain.value = 0.3;

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    sourceRef.current = { type: 'synth', oscillator1, oscillator2, lfo };
    
    setSongName('内置合成音乐');
    setDuration(0);
    setCurrentTime(0);

    oscillator1.start();
    oscillator2.start();
    lfo.start();

    // 只在没有动画循环时启动
    if (!animationRef.current) {
      visualize();
    }
  };

  const pauseAudio = () => {
    if (sourceRef.current) {
      if (sourceRef.current.type === 'synth') {
        if (audioContextRef.current.state === 'running') {
          audioContextRef.current.suspend();
        }
      } else if (sourceRef.current.type === 'file') {
        sourceRef.current.element.pause();
      }
    }
    // 暂停时不取消动画循环，保持视觉更新
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      if (sourceRef.current.type === 'synth') {
        sourceRef.current.oscillator1.stop();
        sourceRef.current.oscillator2.stop();
        sourceRef.current.lfo.stop();
        sourceRef.current = null;
      } else if (sourceRef.current.type === 'file') {
        sourceRef.current.element.pause();
        sourceRef.current.element.currentTime = 0;
      }
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setCurrentTime(0);
    
    // 停止时清空canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (audioFile && audioElementRef.current) {
      audioElementRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const visualize = () => {
    // 防止重复启动动画循环
    if (animationRef.current) {
      console.log('Animation already running, skipping visualize()');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const params = renderParamsRef.current;
      const currentMode = visualModeRef.current;
      
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = `rgba(0, 0, 0, ${0.2 / params.speed})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (currentMode === 'bars') {
        drawBars(ctx, dataArray, canvas.width, canvas.height);
      } else if (currentMode === 'dots') {
        drawDots(ctx, dataArray, canvas.width, canvas.height);
      } else if (currentMode === 'grid') {
        drawGrid(ctx, dataArray, canvas.width, canvas.height);
      } else if (currentMode === 'wave') {
        drawWave(ctx, dataArray, canvas.width, canvas.height);
      } else if (currentMode === 'circle') {
        drawCircle(ctx, dataArray, canvas.width, canvas.height);
      } else if (currentMode === 'spiral') {
        drawSpiral(ctx, dataArray, canvas.width, canvas.height);
      }
    };

    console.log('Starting new animation loop');
    draw();
  };

  useEffect(() => {
    renderParamsRef.current = { speed, density, hue, brightness };
  }, [speed, density, hue, brightness]);

  useEffect(() => {
    visualModeRef.current = visualMode;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      console.log('Visual mode changed to:', visualMode, 'canvas:', canvas.width, 'x', canvas.height);
    }
  }, [visualMode]);

  const drawBars = (ctx, dataArray, width, height) => {
    const params = renderParamsRef.current;
    const barCount = Math.floor(params.density / 2);
    const barWidth = width / barCount;
    const centerY = height / 2;

    ctx.shadowBlur = 20 * params.brightness;

    for (let i = 0; i < barCount; i++) {
      const barHeight = (dataArray[i] / 255) * (height / 2) * 0.9;
      const x = i * barWidth;

      const gradientTop = ctx.createLinearGradient(x, centerY - barHeight, x, centerY);
      gradientTop.addColorStop(0, `hsla(${params.hue + i * 2}, 100%, ${50 * params.brightness}%, 0.8)`);
      gradientTop.addColorStop(1, `hsla(${params.hue + i * 2 + 60}, 80%, ${30 * params.brightness}%, 0.6)`);

      ctx.fillStyle = gradientTop;
      ctx.shadowColor = `hsl(${params.hue + i * 2}, 100%, 50%)`;
      ctx.fillRect(x, centerY - barHeight, barWidth - 2, barHeight);

      const gradientBottom = ctx.createLinearGradient(x, centerY, x, centerY + barHeight);
      gradientBottom.addColorStop(0, `hsla(${params.hue + i * 2 + 60}, 80%, ${30 * params.brightness}%, 0.6)`);
      gradientBottom.addColorStop(1, `hsla(${params.hue + i * 2}, 100%, ${50 * params.brightness}%, 0.8)`);

      ctx.fillStyle = gradientBottom;
      ctx.fillRect(x, centerY, barWidth - 2, barHeight);
    }
  };

  const drawDots = (ctx, dataArray, width, height) => {
    const params = renderParamsRef.current;
    const dotCount = Math.floor(params.density);
    const spacing = width / dotCount;
    const centerY = height / 2;

    ctx.shadowBlur = 30 * params.brightness;

    for (let i = 0; i < dotCount; i++) {
      const value = dataArray[i] / 255;
      const x = i * spacing;
      const radius = value * 30 * params.brightness;
      const offset = Math.sin(Date.now() * 0.001 * params.speed + i) * 50;

      const yTop = centerY - 80 - offset;
      const gradientTop = ctx.createRadialGradient(x, yTop, 0, x, yTop, radius);
      gradientTop.addColorStop(0, `hsla(${params.hue + i * 2}, 100%, ${70 * params.brightness}%, 1)`);
      gradientTop.addColorStop(1, `hsla(${params.hue + i * 2}, 100%, ${30 * params.brightness}%, 0)`);

      ctx.fillStyle = gradientTop;
      ctx.shadowColor = `hsl(${params.hue + i * 2}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(x, yTop, radius, 0, Math.PI * 2);
      ctx.fill();

      const yBottom = centerY + 80 + offset;
      const gradientBottom = ctx.createRadialGradient(x, yBottom, 0, x, yBottom, radius);
      gradientBottom.addColorStop(0, `hsla(${params.hue + i * 2 + 30}, 100%, ${70 * params.brightness}%, 1)`);
      gradientBottom.addColorStop(1, `hsla(${params.hue + i * 2 + 30}, 100%, ${30 * params.brightness}%, 0)`);

      ctx.fillStyle = gradientBottom;
      ctx.shadowColor = `hsl(${params.hue + i * 2 + 30}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(x, yBottom, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawGrid = (ctx, dataArray, width, height) => {
    const params = renderParamsRef.current;
    const gridSize = Math.floor(20 * (params.density / 128));
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);
    const centerRow = Math.floor(rows / 2);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const distFromCenter = Math.abs(j - centerRow);
        const index = Math.floor((i + distFromCenter * cols) % dataArray.length);
        const value = dataArray[index] / 255;
        
        const x = i * gridSize;
        const y = j * gridSize;
        const size = value * gridSize * 0.9;

        const colorShift = i * 2 + distFromCenter * 3;
        
        if (value > 0.5) {
          ctx.shadowBlur = 15 * params.brightness;
          ctx.shadowColor = `hsl(${params.hue + colorShift}, 100%, 50%)`;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = `hsla(${params.hue + colorShift}, ${70 + value * 30}%, ${40 + value * 20 * params.brightness}%, ${value * 0.8})`;
        ctx.fillRect(x + (gridSize - size) / 2, y + (gridSize - size) / 2, size, size);
      }
    }
  };

  const drawWave = (ctx, dataArray, width, height) => {
    const params = renderParamsRef.current;
    const centerY = height / 2;
    const sliceWidth = width / dataArray.length;
    
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20 * params.brightness;

    ctx.beginPath();
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255;
      const y = centerY - (v * (height / 2) * 0.8);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.strokeStyle = `hsla(${params.hue}, 100%, ${50 * params.brightness}%, 0.8)`;
    ctx.shadowColor = `hsl(${params.hue}, 100%, 50%)`;
    ctx.stroke();

    ctx.beginPath();
    x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255;
      const y = centerY + (v * (height / 2) * 0.8);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.strokeStyle = `hsla(${params.hue + 60}, 100%, ${50 * params.brightness}%, 0.8)`;
    ctx.shadowColor = `hsl(${params.hue + 60}, 100%, 50%)`;
    ctx.stroke();
  };

  const drawCircle = (ctx, dataArray, width, height) => {
    const params = renderParamsRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    const barCount = Math.floor(params.density / 2);

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const value = dataArray[i] / 255;
      const barLength = value * radius * 0.8;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${params.hue + i * 3}, 100%, ${50 * params.brightness}%, 0.8)`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15 * params.brightness;
      ctx.shadowColor = `hsl(${params.hue + i * 3}, 100%, 50%)`;
      ctx.stroke();
    }
  };

  const drawSpiral = (ctx, dataArray, width, height) => {
    const params = renderParamsRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    const points = Math.floor(params.density);

    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 4 * params.speed;
      const value = dataArray[i % dataArray.length] / 255;
      const radius = (i / points) * maxRadius + value * 30;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      const dotRadius = value * 5 * params.brightness;
      ctx.fillStyle = `hsla(${params.hue + i}, 100%, ${50 * params.brightness}%, ${value})`;
      ctx.shadowBlur = 10 * params.brightness;
      ctx.shadowColor = `hsl(${params.hue + i}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const togglePlay = () => {
    if (!isPlaying) {
      if (isPaused) {
        // 从暂停状态继续播放
        if (audioFile) {
          if (audioElementRef.current) {
            audioElementRef.current.play();
          }
        } else {
          if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
        }
        // 确保动画循环在运行
        if (!animationRef.current) {
          visualize();
        }
        setIsPaused(false);
      } else {
        // 从停止状态开始播放
        if (audioFile) {
          playAudioFile();
        } else {
          generateSynth();
        }
      }
      setIsPlaying(true);
    } else {
      pauseAudio();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    stopAudio();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const exportVideo = async () => {
    if (!audioFile || !duration) {
      alert('请先上传音频文件');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const canvas = canvasRef.current;
      const stream = canvas.captureStream(30); // 30 FPS
      
      // 创建新的音频元素和分析器用于导出
      const exportAudio = new Audio(audioFile);
      const exportAudioContext = new AudioContext();
      const exportSource = exportAudioContext.createMediaElementSource(exportAudio);
      const exportAnalyser = exportAudioContext.createAnalyser();
      exportAnalyser.fftSize = 2048;
      const dest = exportAudioContext.createMediaStreamDestination();
      
      // 连接音频节点：source -> analyser -> destination 和 dest
      exportSource.connect(exportAnalyser);
      exportAnalyser.connect(exportAudioContext.destination);
      exportAnalyser.connect(dest);
      
      // 合并视频和音频流
      const audioTrack = dest.stream.getAudioTracks()[0];
      stream.addTrack(audioTrack);
      
      // 临时保存原有的分析器，使用导出专用的分析器
      const originalAnalyser = analyserRef.current;
      analyserRef.current = exportAnalyser;
      
      // 启动可视化动画
      if (!animationRef.current) {
        visualize();
      }
      
      // 定义所有可能的视频编码格式（包含音频编码）
      const allFormats = [
        { id: 'vp9', mimeType: 'video/webm;codecs=vp9,opus', ext: 'webm', name: 'WebM (VP9+Opus)' },
        { id: 'vp8', mimeType: 'video/webm;codecs=vp8,opus', ext: 'webm', name: 'WebM (VP8+Opus)' },
        { id: 'vp9-vorbis', mimeType: 'video/webm;codecs=vp9,vorbis', ext: 'webm', name: 'WebM (VP9+Vorbis)' },
        { id: 'vp8-vorbis', mimeType: 'video/webm;codecs=vp8,vorbis', ext: 'webm', name: 'WebM (VP8+Vorbis)' },
        { id: 'webm', mimeType: 'video/webm', ext: 'webm', name: 'WebM' },
        { id: 'mp4', mimeType: 'video/mp4', ext: 'mp4', name: 'MP4' }
      ];
      
      let selectedFormat = null;
      
      if (exportFormat === 'auto') {
        // 自动选择第一个支持的格式
        for (const format of allFormats) {
          if (MediaRecorder.isTypeSupported(format.mimeType)) {
            selectedFormat = format;
            console.log('自动选择编码格式:', format.mimeType);
            break;
          }
        }
      } else {
        // 使用用户选择的格式
        const userFormat = allFormats.find(f => f.id === exportFormat);
        if (userFormat && MediaRecorder.isTypeSupported(userFormat.mimeType)) {
          selectedFormat = userFormat;
          console.log('使用用户选择的编码格式:', userFormat.mimeType);
        } else {
          throw new Error(`浏览器不支持所选格式: ${userFormat?.name || exportFormat}`);
        }
      }
      
      if (!selectedFormat) {
        throw new Error('浏览器不支持视频录制功能');
      }
      
      const chunks = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedFormat.mimeType,
        videoBitsPerSecond: 5000000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedFormat.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${songName}_visualization.${selectedFormat.ext}`;
        a.click();
        
        // 延迟清理，避免浏览器崩溃
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        
        // 恢复原有的分析器
        analyserRef.current = originalAnalyser;
        
        // 停止动画循环
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        
        setIsExporting(false);
        setExportProgress(0);
        
        // 延迟清理音频资源
        setTimeout(() => {
          try {
            exportAudio.pause();
            exportAudio.src = '';
            exportAudioContext.close();
          } catch (err) {
            console.error('清理资源时出错:', err);
          }
        }, 100);
      };
      
      // 开始录制
      mediaRecorder.start();
      
      // 播放音频并更新进度
      exportAudio.currentTime = 0;
      exportAudio.play();
      
      // 监听播放进度（同时更新导出进度和界面进度条）
      const progressInterval = setInterval(() => {
        const progress = (exportAudio.currentTime / duration) * 100;
        setExportProgress(progress);
        
        // 如果启用了进度条显示，同步更新界面进度条
        if (showProgressDuringExport) {
          setCurrentTime(exportAudio.currentTime);
        }
        
        if (exportAudio.ended || exportAudio.currentTime >= duration) {
          clearInterval(progressInterval);
          mediaRecorder.stop();
        }
      }, 100);
      
      // 确保音频播放完成后停止录制
      exportAudio.onended = () => {
        clearInterval(progressInterval);
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 500);
      };
      
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + error.message);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const cancelExport = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsExporting(false);
    setExportProgress(0);
  };

  return (
    <div className="visualizer-container">
      <div className="window-96 visualizer-window">
        <div className="window-title-bar">
          <span>🎵 Vaporwave Visualizer v1.0 - [{visualMode.toUpperCase()}]</span>
          <button className="close-btn" onClick={() => navigate('/')}>×</button>
        </div>

        <div className="window-toolbar">
          <div className="toolbar-left">
            <button 
              className={`toolbar-btn ${isPlaying ? 'playing' : ''}`}
              onClick={togglePlay}
            >
              {isPlaying ? '⏸ 暂停' : (isPaused ? '▶ 继续' : '▶ 播放')}
            </button>

            <button 
              className="toolbar-btn"
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
            >
              ⏹ 停止
            </button>

            <label className="toolbar-btn file-upload-btn">
              📁 打开文件
              <input 
                type="file" 
                accept="audio/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>

            <select 
              className="toolbar-btn format-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              disabled={isExporting}
            >
              <option value="auto">自动选择格式</option>
              <option value="vp9">WebM (VP9)</option>
              <option value="vp8">WebM (VP8)</option>
              <option value="webm">WebM</option>
              <option value="mp4">MP4</option>
            </select>

            <button 
              className="toolbar-btn"
              onClick={exportVideo}
              disabled={!audioFile || isExporting}
            >
              {isExporting ? `⏳ 导出中 ${exportProgress.toFixed(0)}%` : '🎬 导出视频'}
            </button>

            {isExporting && (
              <button 
                className="toolbar-btn"
                onClick={cancelExport}
              >
                ❌ 取消
              </button>
            )}
          </div>

          <div className="mode-selector">
            <button 
              className={`mode-btn ${visualMode === 'bars' ? 'active' : ''}`}
              onClick={() => setVisualMode('bars')}
            >
              📊 条形
            </button>
            <button 
              className={`mode-btn ${visualMode === 'dots' ? 'active' : ''}`}
              onClick={() => setVisualMode('dots')}
            >
              ⚫ 点阵
            </button>
            <button 
              className={`mode-btn ${visualMode === 'grid' ? 'active' : ''}`}
              onClick={() => setVisualMode('grid')}
            >
              ⊞ 网格
            </button>
            <button 
              className={`mode-btn ${visualMode === 'wave' ? 'active' : ''}`}
              onClick={() => setVisualMode('wave')}
            >
              〰️ 波形
            </button>
            <button 
              className={`mode-btn ${visualMode === 'circle' ? 'active' : ''}`}
              onClick={() => setVisualMode('circle')}
            >
              ⭕ 圆形
            </button>
            <button 
              className={`mode-btn ${visualMode === 'spiral' ? 'active' : ''}`}
              onClick={() => setVisualMode('spiral')}
            >
              🌀 螺旋
            </button>
          </div>
        </div>

        <div className="canvas-wrapper">
          <canvas ref={canvasRef} className="visualizer-canvas"></canvas>
          {audioFile && (
            <audio ref={audioElementRef} src={audioFile} loop={isLooping} />
          )}
        </div>

        <div className="audio-info-panel">
          <div className="song-name">🎵 {songName}</div>
          <div className="progress-container">
            <span className="time-display">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max={duration || 1}
              value={currentTime}
              onChange={handleProgressChange}
              disabled={!audioFile || (isExporting && !showProgressDuringExport)}
            />
            <span className="time-display">
              {audioFile ? formatTime(duration) : '∞'}
            </span>
          </div>
          <div className="loop-control">
            <label className="loop-checkbox">
              <input
                type="checkbox"
                checked={isLooping}
                onChange={(e) => setIsLooping(e.target.checked)}
              />
              <span>🔁 循环播放</span>
            </label>
            <label className="loop-checkbox">
              <input
                type="checkbox"
                checked={!showProgressDuringExport}
                onChange={(e) => setShowProgressDuringExport(!e.target.checked)}
              />
              <span>🚫 导出时禁用进度条</span>
            </label>
          </div>
        </div>

        <div className="controls-panel">
          <div className="control-row">
            <label>速度: {speed.toFixed(1)}x</label>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-row">
            <label>密度: {density}</label>
            <input 
              type="range" 
              min="32" 
              max="256" 
              step="16"
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-row">
            <label>光效: {brightness.toFixed(1)}x</label>
            <input 
              type="range" 
              min="0.3" 
              max="2" 
              step="0.1"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-row">
            <label>色相: {hue}°</label>
            <div className="hue-wheel" style={{ background: `hsl(${hue}, 100%, 50%)` }}>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="slider hue-slider"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Visualizer;
