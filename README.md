# 🎵 Retro Music Studio

<div align="center">

![Version](https://img.shields.io/badge/version-1.1.4-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.x-61dafb.svg)
![Docker](https://img.shields.io/badge/docker-ready-2496ed.svg)

**一个复古风格的在线音乐工作站 | A Retro-style Online Music Production Studio**

[✨ 在线演示](http://125.208.21.128:11525/) | [📖 文档](#documentation) | [🐳 Docker](#docker-deployment) | [🤝 贡献](#contributing)

![Screenshot](https://via.placeholder.com/800x400/008080/FFFFFF?text=Music+Studio+Screenshot)

</div>
**⚠️本项目100% AI制作|⚠️100% AI**
---

## 📋 目录

- [特性](#-特性)
- [快速开始](#-快速开始)
- [Docker部署](#-docker部署)
- [功能模块](#-功能模块)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [使用指南](#-使用指南)
- [开发](#-开发)
- [文档](#-文档)
- [更新日志](#-更新日志)
- [贡献](#-贡献)
- [许可证](#-许可证)

---

## ✨ 特性

### 🎹 核心功能

- **🥁 虚拟鼓组** - 8个鼓垫，键盘映射（A-K），节拍器，录音导出（WebM/WAV/OGG）
- **🎵 蒸汽波可视化** - 6种可视化模式，实时音频分析，进度控制
- **🎚️ 音频效果器** - 均衡器、混响、延迟、失真、滤波器
- **🎹 虚拟钢琴** - 4种音色，ADSR包络控制，88键支持

### 🎨 设计特色

- **Windows 96复古风格** - 怀旧的经典界面设计
- **实时音频处理** - Web Audio API原生支持
- **多格式导出** - WebM/WAV/OGG三种格式可选
- **响应式设计** - 支持桌面和平板设备

### 🚀 技术亮点

- ⚡ **零依赖音频引擎** - 纯Web Audio API实现
- 🎨 **Canvas实时渲染** - 60fps流畅可视化
- 💾 **离线PWA支持** - 可安装为本地应用
- 🐳 **Docker一键部署** - 开箱即用

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/yourusername/music-studio.git
cd music-studio

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 🐳 Docker部署

### 使用Docker Hub镜像（推荐）

```bash
# 拉取最新镜像
docker pull nahida115/music-studio:latest

# 运行容器
docker run -d \
  --name music-studio \
  -p 8080:80 \
  --restart unless-stopped \
  nahida115/music-studio:latest

# 访问 http://localhost:8080
```

### 使用Docker Compose

```yaml
version: '3.8'
services:
  music-studio:
    image: nahida115/music-studio:latest
    container_name: music-studio
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
docker-compose up -d
```

### 自行构建镜像

```bash
# 构建镜像
docker build -t music-studio .

# 运行
docker run -d -p 8080:80 music-studio
```

**详细部署文档**: [README-DOCKER.md](README-DOCKER.md)

---

## 🎮 功能模块

### 1. 🥁 虚拟鼓组 (`/drum-kit`)

<details>
<summary>点击展开详情</summary>

**核心功能:**
- 8个鼓垫（Kick, Snare, Hi-Hat, Tom, Crash, Ride, Clap）
- 键盘映射（A-K）快速演奏
- 节拍器（60-200 BPM）
- 录音与回放
- 多格式导出（WebM/WAV/OGG）

**使用方法:**
1. 使用鼠标点击鼓垫或按键盘 A-K
2. 开启节拍器辅助节奏
3. 点击"开始录音"记录演奏
4. 选择格式并导出音频

</details>

### 2. 🎵 蒸汽波可视化 (`/visualizer`)

<details>
<summary>点击展开详情</summary>

**可视化模式:**
- 📊 Bars - 经典频谱柱状图
- 🎨 Dots - 粒子效果
- 🔲 Grid - 3D网格
- 〰️ Wave - 波形图
- ⭕ Circle - 圆环模式
- 🌀 Spiral - 螺旋效果

**控制参数:**
- 速度、密度、色相、亮度
- 实时调节，即时生效

**音频源:**
- 上传本地音频文件
- 生成合成音乐

</details>

### 3. 🎚️ 音频效果器 (`/effects`)

<details>
<summary>点击展开详情</summary>

**效果器链:**
- 🎛️ **3段均衡器** - 低频/中频/高频独立控制
- 🌊 **混响** - 空间感，可调强度和持续时间
- 🔁 **延迟** - 回声效果，可调时间和反馈
- 🔥 **失真** - 过载效果
- 🎚️ **滤波器** - 低通/高通/带通/陷波

**音频输入:**
- 📁 上传音频文件
- 🎤 麦克风实时输入

</details>

### 4. 🎹 虚拟钢琴 (`/piano`)

<details>
<summary>点击展开详情</summary>

**音色选择:**
- 🎹 钢琴 (Piano)
- ⚡ 电钢琴 (Electric Piano)
- 🎺 风琴 (Organ)
- 🎛️ 合成器 (Synth)

**控制功能:**
- ADSR包络调节（Attack/Decay/Sustain/Release）
- 八度选择（2-6）
- 音量控制
- 持续音模式

**键盘映射:**
- A-K: 低八度
- K-B: 高八度

</details>

---

## 🛠️ 技术栈

### 前端框架
- **React 18** - UI组件库
- **Vite** - 快速构建工具
- **React Router 6** - 路由管理

### 音频处理
- **Web Audio API** - 音频合成与处理
- **MediaRecorder API** - 音频录制
- **OfflineAudioContext** - WAV导出

### 可视化
- **Canvas 2D** - 实时音频可视化
- **requestAnimationFrame** - 60fps动画循环

### 部署
- **Docker** - 容器化
- **Nginx** - 静态文件服务
- **Multi-stage Build** - 优化镜像大小

---

## 📁 项目结构

```
music-studio/
├── src/
│   ├── App.jsx              # 主应用，路由配置
│   ├── main.jsx             # 入口文件
│   ├── App.css              # 全局样式
│   └── pages/
│       ├── Home.jsx         # 主页
│       ├── DrumKit.jsx      # 虚拟鼓组
│       ├── Visualizer.jsx   # 可视化器
│       ├── Effects.jsx      # 音频效果器
│       └── Piano.jsx        # 虚拟钢琴
├── public/                  # 静态资源
├── Dockerfile               # Docker镜像配置
├── nginx.conf              # Nginx配置
├── docker-compose.yml      # Docker Compose配置
├── package.json            # 项目依赖
└── 文档/
    ├── FEATURE-IDEAS.md    # 功能创意（40+）
    ├── EXPORT-FORMATS.md   # 导出格式指南
    ├── VERSION-GUIDE.md    # 版本管理
    ├── TEST-CHECKLIST.md   # 测试清单
    └── DOCKER-HUB-GUIDE.md # Docker部署指南
```

---

## 📖 使用指南

### 基本工作流程

```
1. 虚拟鼓组 → 创作节奏 → 录音导出
2. 虚拟钢琴 → 演奏旋律 → 记录灵感
3. 音频效果器 → 处理音频 → 添加效果
4. 可视化器 → 欣赏作品 → 可视化展示
```

### 键盘快捷键

**虚拟鼓组:**
- `A` - Kick (底鼓)
- `S` - Snare (军鼓)
- `D` - Hi-Hat (踩镲)
- `F` - Tom 1
- `G` - Tom 2
- `H` - Crash (镲片)
- `J` - Ride (叮叮镲)
- `K` - Clap (拍手)

**虚拟钢琴:**
- `A-K` - 低八度
- `K-B` - 高八度

### 导出格式选择

| 格式 | 文件大小 | 音质 | 用途 |
|------|---------|------|------|
| **WebM** | 小 (~16KB/s) | 优秀 | 快速分享、网页播放 |
| **WAV** | 大 (~96KB/s) | 完美 | 音乐制作、后期处理 |
| **OGG** | 小 (~16KB/s) | 优秀 | Firefox、游戏开发 |

**推荐:**
- 🎵 创作阶段 → WebM
- 🎼 最终导出 → WAV
- 📱 社交分享 → WebM

---

## 💻 开发

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/yourusername/music-studio.git
cd music-studio

# 安装依赖
npm install

# 启动开发服务器（支持热更新）
npm run dev

# 代码检查
npm run lint
```

### 构建流程

```bash
# 生产构建
npm run build

# 预览构建结果
npm run preview

# Docker构建
docker build -t music-studio .
```

### 贡献代码

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📚 文档

### 完整文档

- 📘 [功能创意清单](FEATURE-IDEAS.md) - 40+功能扩展想法
- 📙 [导出格式指南](EXPORT-FORMATS.md) - WebM/WAV/OGG详解
- 📗 [Docker部署指南](README-DOCKER.md) - 完整部署文档
- 📕 [版本管理指南](VERSION-GUIDE.md) - 语义化版本控制

### Bug修复日志

- [v1.1.1](BUGFIX-v1.1.1.md) - AudioContext生命周期管理
- [v1.1.2](BUGFIX-v1.1.2.md) - 录音导出功能修复
- [v1.1.4](BUGFIX-v1.1.4.md) - 钢琴八度调整修复

---

## 📝 更新日志

### v1.1.4 (2025-01-07)
- 🐛 修复虚拟钢琴八度调整问题
- 🐛 修复按键视觉反馈延迟
- ✨ 优化事件监听器管理

### v1.1.3 (2025-01-07)
- ✨ 新增多格式导出（WebM/WAV/OGG）
- 📝 完整的导出格式文档

### v1.1.0 (2025-01-07)
- ✨ 新增音频效果器模块
- ✨ 新增虚拟钢琴模块
- ✨ 虚拟鼓组录音导出功能

### v1.0.0 (2025-01-06)
- 🎉 初始版本发布
- ✨ 虚拟鼓组
- ✨ 蒸汽波可视化器

**完整更新日志**: [UPDATE-LOG.md](UPDATE-LOG.md)

---

## 🌟 功能路线图

### 短期计划 (1-2周)
- [ ] 🎨 主题系统（多种配色方案）
- [ ] 💾 预设管理（保存/加载配置）
- [ ] 📱 PWA离线支持

### 中期计划 (1-2月)
- [ ] 🎮 节奏游戏模式
- [ ] 🎵 Lo-Fi节拍机
- [ ] 🎚️ 混音器（多轨道）

### 长期愿景 (3-6月)
- [ ] 🎼 音序器（简易DAW）
- [ ] 🤖 AI音乐生成
- [ ] 👥 多人协作功能

**详细计划**: [FEATURE-IDEAS.md](FEATURE-IDEAS.md)

---

## 🌐 浏览器支持

| 浏览器 | 版本 | 支持度 |
|--------|------|--------|
| Chrome | 90+ | ✅ 完全支持 |
| Firefox | 88+ | ✅ 完全支持 |
| Edge | 90+ | ✅ 完全支持 |
| Safari | 14+ | ⚠️ 部分功能受限 |

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

### 贡献方式

1. **报告Bug** - 使用 [Issues](https://github.com/yourusername/music-studio/issues)
2. **功能建议** - 查看 [FEATURE-IDEAS.md](FEATURE-IDEAS.md)
3. **提交代码** - 发起 Pull Request
4. **改进文档** - 完善README和文档

### 贡献者

感谢所有贡献者！

<!-- 这里会自动生成贡献者列表 -->

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

### 技术栈
- [React](https://react.dev/) - UI框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - 音频引擎

### 设计灵感
- Windows 95/98 经典界面
- 蒸汽波（Vaporwave）美学
- Lo-Fi音乐文化

### 社区支持
- MDN Web Docs
- Stack Overflow
- GitHub Community

---

## 📞 联系方式

- **Issues**: [GitHub Issues](https://github.com/yourusername/music-studio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/music-studio/discussions)
- **Email**: 3987263115@qq.com

---

## 📊 项目统计

![GitHub stars](https://img.shields.io/github/stars/yourusername/music-studio?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/music-studio?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/yourusername/music-studio?style=social)

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/music-studio)
![GitHub issues](https://img.shields.io/github/issues/yourusername/music-studio)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/music-studio)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个Star！**

**🎵 享受音乐创作的乐趣！**

Made with ❤️ by [Your Name](https://github.com/yourusername)

[⬆ 回到顶部](#-retro-music-studio)

</div>
