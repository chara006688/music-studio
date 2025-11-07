# 🎵 录音导出格式指南

## 支持的导出格式

### 1. 📦 WebM (推荐)

**格式说明:**
- 容器格式: WebM
- 音频编码: Opus
- 文件扩展名: `.webm`

**优点:**
- ✅ 文件小（压缩率高）
- ✅ 浏览器原生支持
- ✅ 导出速度快
- ✅ 音质好

**缺点:**
- ⚠️ Safari支持有限
- ⚠️ 某些DAW可能不支持

**兼容性:**
- Chrome: ✅ 完全支持
- Firefox: ✅ 完全支持
- Edge: ✅ 完全支持
- Safari: ⚠️ 部分版本支持

**使用场景:**
- 网页播放
- 社交媒体分享
- 快速导出和预览
- 文件大小敏感的场景

**典型文件大小:**
- 10秒录音 ≈ 50-100KB
- 1分钟录音 ≈ 300-600KB

---

### 2. 🎼 WAV (无损)

**格式说明:**
- 容器格式: WAV (RIFF WAVE)
- 音频编码: PCM (未压缩)
- 采样率: 48kHz
- 位深度: 16-bit
- 声道: 立体声 (2通道)
- 文件扩展名: `.wav`

**优点:**
- ✅ 无损音质
- ✅ 通用兼容性
- ✅ 所有DAW支持
- ✅ 专业级音频
- ✅ 无需解码

**缺点:**
- ❌ 文件大
- ❌ 导出稍慢

**兼容性:**
- 所有浏览器: ✅
- 所有播放器: ✅
- 所有DAW: ✅ (Audacity, FL Studio, Ableton等)
- 专业音频软件: ✅

**使用场景:**
- 音乐制作
- 后期处理
- 存档备份
- 专业工作流
- 需要最高音质

**典型文件大小:**
- 10秒录音 ≈ 960KB (1MB)
- 1分钟录音 ≈ 5.76MB (6MB)

**技术规格:**
```
采样率: 48000 Hz
位深度: 16 bit
声道数: 2 (立体声)
比特率: 1536 kbps
```

---

### 3. 🎧 OGG (兼容)

**格式说明:**
- 容器格式: Ogg
- 音频编码: Opus/Vorbis
- 文件扩展名: `.ogg`

**优点:**
- ✅ 开源免费
- ✅ 较好的压缩率
- ✅ Firefox原生支持
- ✅ 游戏引擎常用

**缺点:**
- ⚠️ Chrome可能需要转码
- ⚠️ 某些移动设备支持有限

**兼容性:**
- Chrome: ⚠️ 部分支持
- Firefox: ✅ 完全支持
- Edge: ⚠️ 部分支持
- Safari: ❌ 不支持

**使用场景:**
- 游戏开发
- Firefox用户
- 开源项目
- Linux系统

**典型文件大小:**
- 10秒录音 ≈ 60-120KB
- 1分钟录音 ≈ 360-720KB

---

## 格式对比

| 特性 | WebM | WAV | OGG |
|------|------|-----|-----|
| 文件大小 | ⭐⭐⭐⭐⭐ 小 | ⭐ 大 | ⭐⭐⭐⭐ 小 |
| 音质 | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 完美 | ⭐⭐⭐⭐ 好 |
| 兼容性 | ⭐⭐⭐⭐ 广泛 | ⭐⭐⭐⭐⭐ 通用 | ⭐⭐⭐ 中等 |
| 导出速度 | ⭐⭐⭐⭐⭐ 快 | ⭐⭐⭐ 慢 | ⭐⭐⭐⭐ 快 |
| 专业用途 | ⭐⭐⭐ 可用 | ⭐⭐⭐⭐⭐ 专业 | ⭐⭐⭐ 可用 |

---

## 如何选择导出格式

### 快速决策树

```
需要在DAW中编辑？
├─ 是 → WAV
└─ 否
    └─ 只是分享或预览？
        ├─ 是 → WebM
        └─ 否 → 根据兼容性需求选择
```

### 场景推荐

#### 🎯 音乐制作 / 后期处理
```
推荐: WAV
原因: 无损音质，通用兼容
```

#### 📱 社交媒体分享
```
推荐: WebM
原因: 文件小，上传快
```

#### 🎮 游戏开发
```
推荐: OGG 或 WebM
原因: 文件小，游戏引擎支持
```

#### 🎵 在线播放
```
推荐: WebM
原因: 浏览器原生支持
```

#### 💾 长期存档
```
推荐: WAV
原因: 无损，永久兼容
```

#### ⚡ 快速预览
```
推荐: WebM
原因: 导出快，文件小
```

---

## 导出方法

### 1. 选择格式

在虚拟鼓页面，找到"导出格式"下拉菜单：

```
导出格式: [WebM (推荐) ▼]
```

选项：
- WebM (推荐) - 默认选项
- WAV (无损) - 专业音质
- OGG (兼容) - Firefox友好

### 2. 录制节奏

1. 点击 "⏺ 开始录音"
2. 演奏鼓组
3. 点击 "⏹ 停止录音"

### 3. 导出文件

1. 选择导出格式
2. 点击 "💾 导出录音"
3. 等待导出完成
4. 文件自动下载

### 文件命名

自动生成的文件名格式：
```
drum-recording-{timestamp}.{format}
```

示例：
- `drum-recording-1704614400000.webm`
- `drum-recording-1704614400000.wav`
- `drum-recording-1704614400000.ogg`

---

## 技术实现

### WebM/OGG 导出

使用 MediaRecorder API：
```javascript
const mediaRecorder = new MediaRecorder(
  destination.stream, 
  { mimeType: 'audio/webm;codecs=opus' }
);
```

**特点:**
- 实时录制
- 浏览器原生编码
- 流式处理

### WAV 导出

使用 OfflineAudioContext：
```javascript
const offlineContext = new OfflineAudioContext(
  2,              // 立体声
  sampleRate * duration,
  48000           // 48kHz采样率
);

const audioBuffer = await offlineContext.startRendering();
const wavBlob = audioBufferToWav(audioBuffer);
```

**特点:**
- 离线渲染
- 手动WAV格式编码
- 无损音质

---

## 文件格式详解

### WAV 文件结构

```
RIFF Header (12 bytes)
├─ "RIFF" (4 bytes)
├─ File size (4 bytes)
└─ "WAVE" (4 bytes)

fmt Chunk (24 bytes)
├─ "fmt " (4 bytes)
├─ Chunk size: 16 (4 bytes)
├─ Audio format: 1 (PCM) (2 bytes)
├─ Num channels: 2 (2 bytes)
├─ Sample rate: 48000 (4 bytes)
├─ Byte rate: 192000 (4 bytes)
├─ Block align: 4 (2 bytes)
└─ Bits per sample: 16 (2 bytes)

data Chunk
├─ "data" (4 bytes)
├─ Data size (4 bytes)
└─ Audio samples (N bytes)
```

### WebM 文件结构

```
EBML Header
└─ WebM container metadata

Segment
├─ Segment Info
│   ├─ Duration
│   └─ Muxing App
├─ Tracks
│   └─ Audio Track
│       ├─ Codec: Opus
│       ├─ Sample rate
│       └─ Channels
└─ Cluster
    └─ Compressed audio data
```

---

## 常见问题

### Q: WAV文件为什么这么大？

**A:** WAV是未压缩格式，每秒音频占用约960KB（48kHz × 16bit × 2通道）。这是保证无损音质的代价。

### Q: 能导出为MP3吗？

**A:** 浏览器不支持直接导出MP3（专利限制）。建议：
1. 导出为WAV
2. 使用在线转换器或软件转为MP3

### Q: Safari上导出失败？

**A:** Safari对MediaRecorder支持有限，建议：
1. 使用Chrome或Firefox
2. 或选择WAV格式（通用支持）

### Q: 如何在Audacity中打开？

**A:** 
1. 导出为WAV格式
2. 在Audacity中：File → Open
3. 选择导出的WAV文件

### Q: 导出需要多长时间？

**A:** 
- WebM/OGG: 实时（录音多长就导出多长）
- WAV: 略慢于实时（需要离线渲染）

示例：
- 10秒录音 → WebM: ~10秒, WAV: ~12秒
- 1分钟录音 → WebM: ~60秒, WAV: ~70秒

### Q: 哪种格式音质最好？

**A:** WAV = 最佳（无损）
- WebM/OGG ≈ 320kbps MP3 的音质
- 人耳很难区分压缩和无损

### Q: 能同时导出多种格式吗？

**A:** 目前不支持，但可以：
1. 录制一次
2. 切换格式导出第二次
3. 重复以上步骤

---

## 最佳实践

### 1. 工作流建议

**创作阶段:**
```
录制 → WebM导出 → 快速预览 → 修改 → 重新录制
```

**最终导出:**
```
满意后 → WAV导出 → 存档 → 后期处理
```

### 2. 文件管理

**命名规范:**
```
project-name_take1_20250107.wav
project-name_take2_20250107.wav
project-name_final_20250107.wav
```

**存储建议:**
- WAV: 外置硬盘或云存储
- WebM: 本地快速访问

### 3. 质量控制

**检查清单:**
- [ ] 音量适中（不爆音）
- [ ] 节奏准确
- [ ] 无杂音
- [ ] 时长正确

---

## 格式转换

### 在线转换工具

**免费工具:**
- CloudConvert: https://cloudconvert.com/
- Online Audio Converter: https://online-audio-converter.com/
- Convertio: https://convertio.co/

**转换步骤:**
1. 上传导出的文件
2. 选择目标格式 (如MP3)
3. 调整质量设置
4. 转换并下载

### 本地软件

**推荐软件:**
- Audacity (免费) - 全平台
- FFmpeg (命令行) - 全平台
- Format Factory (免费) - Windows
- Switch (付费) - Mac

**FFmpeg 命令示例:**
```bash
# WebM → MP3
ffmpeg -i input.webm -b:a 320k output.mp3

# WAV → MP3
ffmpeg -i input.wav -b:a 320k output.mp3

# WAV → FLAC (无损压缩)
ffmpeg -i input.wav output.flac
```

---

## 技术参数对比

| 参数 | WebM | WAV | OGG |
|------|------|-----|-----|
| 比特率 | ~128kbps | 1536kbps | ~128kbps |
| 采样率 | 48kHz | 48kHz | 48kHz |
| 位深度 | N/A | 16-bit | N/A |
| 声道 | 立体声 | 立体声 | 立体声 |
| 压缩 | 有损 | 无损 | 有损 |
| 文件/秒 | ~16KB | ~96KB | ~16KB |

---

## 浏览器兼容性

| 浏览器 | WebM | WAV | OGG |
|--------|------|-----|-----|
| Chrome 90+ | ✅ | ✅ | ⚠️ |
| Firefox 88+ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ⚠️ |
| Safari 14+ | ⚠️ | ✅ | ❌ |
| Opera 76+ | ✅ | ✅ | ⚠️ |

**图例:**
- ✅ 完全支持
- ⚠️ 部分支持或需要转码
- ❌ 不支持

---

## 总结建议

### 💡 一句话推荐

- **快速分享**: 用 WebM
- **专业制作**: 用 WAV
- **Firefox用户**: 可选 OGG

### 🎯 80/20 法则

80%的场景选择：
- **WebM (推荐)** - 快速、小巧、兼容性好

20%的专业场景选择：
- **WAV (无损)** - 后期处理、存档、最高音质

---

**享受音乐创作，选择适合你的格式！** 🎵✨
