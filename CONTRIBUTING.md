# 🤝 贡献指南

感谢你对音乐工作站项目感兴趣！

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [测试要求](#测试要求)

---

## 🌟 行为准则

### 我们的承诺

为了营造开放和友好的环境，我们承诺：

- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不可接受的行为

- 使用性别化语言或意象，以及不受欢迎的性关注
- 恶意评论、侮辱/贬损性评论、人身或政治攻击
- 公开或私下骚扰
- 未经明确许可，发布他人的私人信息

---

## 💡 如何贡献

### 报告Bug

在提交Bug之前，请：

1. **检查已有Issues** - 避免重复报告
2. **使用Bug模板** - 提供完整信息
3. **详细描述** - 包含复现步骤

**Bug报告应包含：**
- 浏览器和版本
- 操作步骤
- 预期行为
- 实际行为
- 截图或录屏（如果可能）
- 控制台错误信息

### 功能建议

在提交功能建议前：

1. **查看[FEATURE-IDEAS.md](FEATURE-IDEAS.md)** - 可能已经在计划中
2. **说明用例** - 为什么需要这个功能
3. **考虑实现** - 简单描述实现思路

### 提交代码

1. **Fork仓库**
2. **创建分支**: `git checkout -b feature/amazing-feature`
3. **编写代码**: 遵循代码规范
4. **编写测试**: 确保功能正常
5. **提交更改**: 使用规范的提交信息
6. **推送分支**: `git push origin feature/amazing-feature`
7. **开启PR**: 使用PR模板

---

## 🔧 开发流程

### 设置开发环境

```bash
# 1. Fork并克隆
git clone https://github.com/YOUR_USERNAME/music-studio.git
cd music-studio

# 2. 添加上游仓库
git remote add upstream https://github.com/ORIGINAL_OWNER/music-studio.git

# 3. 安装依赖
npm install

# 4. 创建特性分支
git checkout -b feature/my-feature

# 5. 启动开发服务器
npm run dev
```

### 保持同步

```bash
# 获取上游更新
git fetch upstream

# 合并到本地main分支
git checkout main
git merge upstream/main

# 推送到你的fork
git push origin main
```

---

## 📝 代码规范

### JavaScript/React

- 使用**函数组件**和**Hooks**
- 使用**const**声明变量（优先）
- 组件命名使用**PascalCase**
- 函数命名使用**camelCase**
- 适当添加注释（复杂逻辑）

**好的例子:**
```javascript
const MyComponent = () => {
  const [state, setState] = useState(0);
  
  const handleClick = () => {
    setState(prev => prev + 1);
  };
  
  return (
    <button onClick={handleClick}>
      Count: {state}
    </button>
  );
};
```

### CSS

- 使用**BEM命名规范**（可选）
- 保持Windows 96风格一致
- 使用有意义的类名
- 适当分组和注释

**好的例子:**
```css
.piano-container {
  /* 主容器样式 */
}

.piano-key {
  /* 钢琴键样式 */
}

.piano-key.active {
  /* 激活状态 */
}
```

---

## 📤 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type类型

- **feat**: 新功能
- **fix**: Bug修复
- **docs**: 文档更新
- **style**: 代码格式（不影响功能）
- **refactor**: 重构
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建或工具

### 示例

```
feat(piano): add ADSR envelope control

- Add Attack/Decay/Sustain/Release sliders
- Implement envelope calculation
- Update UI to show current values

Closes #123
```

```
fix(drumkit): resolve export format issue

The export function now correctly handles WAV format.
Previous implementation caused AudioNode connection error.

Fixes #456
```

---

## 🧪 测试要求

### 在提交PR前

- [ ] 代码在本地运行无错误
- [ ] 所有功能正常工作
- [ ] 无控制台警告或错误
- [ ] 遵循代码规范
- [ ] 更新相关文档
- [ ] 浏览器兼容性测试（Chrome, Firefox）

### 测试清单

使用 [TEST-CHECKLIST.md](TEST-CHECKLIST.md) 进行完整测试。

### 自动化测试（未来）

```bash
# 运行测试
npm run test

# 运行测试覆盖率
npm run test:coverage
```

---

## 🎨 UI/UX指南

### 设计原则

1. **保持Windows 96风格**
   - 3D按钮效果
   - 银灰色背景
   - 蓝色标题栏

2. **即时反馈**
   - 点击要有视觉反馈
   - 参数调整实时生效

3. **清晰的状态指示**
   - 使用颜色和图标
   - 禁用状态要明显

### 颜色规范

```css
--primary: #008080;      /* Teal */
--background: #c0c0c0;   /* Silver */
--titlebar: #000080;     /* Navy */
--accent-1: #ff6b9d;     /* Pink */
--accent-2: #00d4ff;     /* Cyan */
--accent-3: #00ff9d;     /* Green */
--accent-4: #ffd700;     /* Gold */
```

---

## 🏗️ 项目架构

### 组件结构

```
Pages (路由级组件)
├─ Home.jsx
├─ DrumKit.jsx
├─ Visualizer.jsx
├─ Effects.jsx
└─ Piano.jsx
```

### 状态管理

- 使用 React Hooks（useState, useRef, useEffect）
- 每个页面独立管理状态
- 使用ref管理Web Audio节点

### 音频架构

```
AudioContext
├─ Source Node (音频源)
├─ Effect Nodes (效果链)
│   ├─ EQ
│   ├─ Distortion
│   ├─ Filter
│   └─ Reverb/Delay
└─ Destination (输出)
```

---

## 📦 发布流程

### 版本号规则

遵循[语义化版本控制](https://semver.org/)：

- **MAJOR** - 重大变更，不向后兼容
- **MINOR** - 新功能，向后兼容
- **PATCH** - Bug修复

### 发布步骤

1. 更新版本号（version.txt）
2. 更新 CHANGELOG
3. 提交代码
4. 创建Git标签
5. 推送到GitHub
6. 构建Docker镜像
7. 推送到Docker Hub

---

## 🎓 学习资源

### Web Audio API
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Book](https://webaudioapi.com/book/)

### React
- [React官方文档](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)

### 音频处理
- [DSP Guide](http://www.dspguide.com/)
- [音频编程入门](https://www.coursera.org/learn/audio-signal-processing)

---

## 💬 社区

### 讨论

- 使用 [GitHub Discussions](https://github.com/yourusername/music-studio/discussions)
- 提问、分享想法、展示作品

### 展示你的作品

使用本项目创作了音乐？
- 在Discussions分享
- 添加 `#RetroMusicStudio` 标签

---

## 🎯 开发优先级

### P0 - 关键功能
- 核心音频功能正常
- 无阻塞性Bug
- 基本可用性

### P1 - 重要功能
- 新增乐器或效果器
- 性能优化
- 兼容性改进

### P2 - 增强功能
- UI美化
- 辅助功能
- 文档完善

### P3 - 未来计划
- 实验性功能
- 大型重构
- 生态系统集成

---

## 📧 问题和帮助

遇到问题？

1. 查看 [文档](FEATURE-IDEAS.md)
2. 搜索 [Issues](https://github.com/yourusername/music-studio/issues)
3. 提问 [Discussions](https://github.com/yourusername/music-studio/discussions)

---

**感谢你的贡献！让我们一起打造更好的音乐工作站！** 🎵✨
