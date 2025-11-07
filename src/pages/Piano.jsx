import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Piano.css';

function Piano() {
  const navigate = useNavigate();
  const [selectedOctave, setSelectedOctave] = useState(4);
  const [timbre, setTimbre] = useState('piano');
  const [volume, setVolume] = useState(0.5);
  const [sustain, setSustain] = useState(false);
  const [activeNotes, setActiveNotes] = useState(new Set());
  
  // ADSR parameters
  const [attack, setAttack] = useState(0.01);
  const [decay, setDecay] = useState(0.1);
  const [sustainLevel, setSustainLevel] = useState(0.7);
  const [release, setRelease] = useState(0.3);

  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});
  const gainNodesRef = useRef({});

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Keyboard mapping (2 octaves)
  const keyMap = {
    // Lower octave
    'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
    't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B',
    // Higher octave
    'k': 'C+', 'o': 'C#+', 'l': 'D+', 'p': 'D#+', ';': 'E+', "'": 'F+',
    ']': 'F#+', 'z': 'G+', 'x': 'G#+', 'c': 'A+', 'v': 'A#+', 'b': 'B+'
  };

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const getNoteFrequency = (note, octave) => {
    const noteIndex = notes.indexOf(note);
    if (noteIndex === -1) return 0;
    
    // A4 = 440 Hz
    const A4 = 440;
    const A4Index = 57; // MIDI note number for A4
    const midiNote = octave * 12 + noteIndex;
    const semitonesFromA4 = midiNote - A4Index;
    
    return A4 * Math.pow(2, semitonesFromA4 / 12);
  };

  const getWaveType = (timbre) => {
    const waveTypes = {
      piano: 'triangle',
      electric: 'sawtooth',
      organ: 'sine',
      synth: 'square'
    };
    return waveTypes[timbre] || 'sine';
  };

  const playNote = (note, octave) => {
    const ctx = getAudioContext();
    const noteKey = `${note}-${octave}`;
    
    if (oscillatorsRef.current[noteKey]) {
      return; // Note already playing
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();
    
    oscillator.type = getWaveType(timbre);
    oscillator.frequency.value = getNoteFrequency(note, octave);
    
    // Filter for piano-like sound
    if (timbre === 'piano') {
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 2000;
      filterNode.Q.value = 1;
    } else if (timbre === 'organ') {
      filterNode.type = 'bandpass';
      filterNode.frequency.value = 1000;
      filterNode.Q.value = 2;
    } else {
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 5000;
    }
    
    // ADSR Envelope
    gainNode.gain.value = 0;
    const now = ctx.currentTime;
    
    // Attack
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    // Decay
    gainNode.gain.linearRampToValueAtTime(volume * sustainLevel, now + attack + decay);
    
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    
    oscillatorsRef.current[noteKey] = oscillator;
    gainNodesRef.current[noteKey] = gainNode;
    
    setActiveNotes(prev => new Set(prev).add(noteKey));
  };

  const stopNote = (note, octave) => {
    const noteKey = `${note}-${octave}`;
    const oscillator = oscillatorsRef.current[noteKey];
    const gainNode = gainNodesRef.current[noteKey];
    
    if (!oscillator || !gainNode) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 立即更新视觉状态
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(noteKey);
      return newSet;
    });
    
    // Release
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + release);
    
    // 延迟停止oscillator并清理
    setTimeout(() => {
      try {
        if (oscillatorsRef.current[noteKey]) {
          oscillator.stop();
          delete oscillatorsRef.current[noteKey];
          delete gainNodesRef.current[noteKey];
        }
      } catch (e) {
        // Oscillator可能已经停止
      }
    }, release * 1000 + 100);
  };

  const handleNoteMouseDown = (note, octave) => {
    playNote(note, octave);
  };

  const handleNoteMouseUp = (note, octave) => {
    if (!sustain) {
      stopNote(note, octave);
    }
  };

  const handleNoteMouseLeave = (note, octave) => {
    if (!sustain) {
      stopNote(note, octave);
    }
  };

  const stopAllNotes = () => {
    Object.keys(oscillatorsRef.current).forEach(noteKey => {
      const [note, octave] = noteKey.split('-');
      stopNote(note, parseInt(octave));
    });
  };

  useEffect(() => {
    if (!sustain) {
      stopAllNotes();
    }
  }, [sustain]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        e.preventDefault();
        let note = keyMap[key];
        let oct = selectedOctave;
        
        // Handle higher octave notes
        if (note.endsWith('+')) {
          note = note.slice(0, -1);
          oct = selectedOctave + 1;
        }
        
        playNote(note, oct);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        e.preventDefault();
        let note = keyMap[key];
        let oct = selectedOctave;
        
        if (note.endsWith('+')) {
          note = note.slice(0, -1);
          oct = selectedOctave + 1;
        }
        
        if (!sustain) {
          stopNote(note, oct);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedOctave, sustain]);

  useEffect(() => {
    return () => {
      stopAllNotes();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const isBlackKey = (note) => {
    return note.includes('#');
  };

  const renderKeys = (octave) => {
    return notes.map((note) => {
      const noteKey = `${note}-${octave}`;
      const isActive = activeNotes.has(noteKey);
      const isBlack = isBlackKey(note);
      
      return (
        <div
          key={noteKey}
          className={`piano-key ${isBlack ? 'black-key' : 'white-key'} ${isActive ? 'active' : ''}`}
          onMouseDown={() => handleNoteMouseDown(note, octave)}
          onMouseUp={() => handleNoteMouseUp(note, octave)}
          onMouseLeave={() => handleNoteMouseLeave(note, octave)}
          onTouchStart={(e) => {
            e.preventDefault();
            handleNoteMouseDown(note, octave);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleNoteMouseUp(note, octave);
          }}
        >
          <span className="note-label">{note}{octave}</span>
        </div>
      );
    });
  };

  return (
    <div className="piano-container">
      <div className="window-96 piano-window">
        <div className="window-title-bar">
          <span>🎹 Virtual Piano v1.0</span>
          <button className="close-btn" onClick={() => navigate('/')}>×</button>
        </div>

        <div className="window-content piano-content">
          {/* Control Panel */}
          <div className="piano-controls">
            <div className="control-section">
              <h4>音色</h4>
              <select 
                value={timbre} 
                onChange={(e) => setTimbre(e.target.value)}
                className="timbre-select"
              >
                <option value="piano">🎹 钢琴</option>
                <option value="electric">⚡ 电钢琴</option>
                <option value="organ">🎺 风琴</option>
                <option value="synth">🎛️ 合成器</option>
              </select>
            </div>

            <div className="control-section">
              <h4>八度: {selectedOctave}</h4>
              <div className="octave-buttons">
                <button onClick={() => setSelectedOctave(Math.max(2, selectedOctave - 1))}>-</button>
                <button onClick={() => setSelectedOctave(Math.min(6, selectedOctave + 1))}>+</button>
              </div>
            </div>

            <div className="control-section">
              <h4>音量: {(volume * 100).toFixed(0)}%</h4>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
            </div>

            <div className="control-section">
              <label className="sustain-label">
                <input 
                  type="checkbox" 
                  checked={sustain}
                  onChange={(e) => setSustain(e.target.checked)}
                />
                <span>🎵 持续音</span>
              </label>
            </div>
          </div>

          {/* ADSR Controls */}
          <div className="adsr-controls">
            <h4>ADSR 包络</h4>
            <div className="adsr-sliders">
              <div className="adsr-control">
                <label>Attack: {(attack * 1000).toFixed(0)}ms</label>
                <input 
                  type="range" 
                  min="0.001" 
                  max="1" 
                  step="0.001"
                  value={attack}
                  onChange={(e) => setAttack(parseFloat(e.target.value))}
                />
              </div>
              <div className="adsr-control">
                <label>Decay: {(decay * 1000).toFixed(0)}ms</label>
                <input 
                  type="range" 
                  min="0.001" 
                  max="1" 
                  step="0.001"
                  value={decay}
                  onChange={(e) => setDecay(parseFloat(e.target.value))}
                />
              </div>
              <div className="adsr-control">
                <label>Sustain: {(sustainLevel * 100).toFixed(0)}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={sustainLevel}
                  onChange={(e) => setSustainLevel(parseFloat(e.target.value))}
                />
              </div>
              <div className="adsr-control">
                <label>Release: {(release * 1000).toFixed(0)}ms</label>
                <input 
                  type="range" 
                  min="0.001" 
                  max="2" 
                  step="0.001"
                  value={release}
                  onChange={(e) => setRelease(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Piano Keyboard */}
          <div className="piano-keyboard">
            <div className="keyboard-octave">
              {renderKeys(selectedOctave)}
            </div>
            <div className="keyboard-octave">
              {renderKeys(selectedOctave + 1)}
            </div>
          </div>

          {/* Keyboard Hints */}
          <div className="keyboard-hints">
            <p>💡 键盘快捷键: A-K (低八度) | K-B (高八度)</p>
            <p>🎼 使用鼠标或触摸屏演奏</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Piano;
