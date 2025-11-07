# 📦 版本管理指南

## 🎯 版本号说明

项目使用 **语义化版本控制 (SemVer)**：

```
主版本号.次版本号.修订号
MAJOR.MINOR.PATCH
  1  .  2  .  3
```

### 何时升级版本

| 版本类型 | 何时使用 | 示例 |
|---------|---------|------|
| **Patch** (修订号) | 修复bug、小改动 | 1.0.0 → 1.0.1 |
| **Minor** (次版本号) | 新功能、向后兼容 | 1.0.5 → 1.1.0 |
| **Major** (主版本号) | 重大变更、破坏性更新 | 1.9.3 → 2.0.0 |

---

## 🚀 使用自动版本脚本

### 脚本对比

| 脚本 | 版本管理 | 适用场景 |
|------|---------|---------|
| `publish.bat` | 固定版本 (1.0.0) | 第一次上传 |
| `publish-auto.bat` | 自动递增版本 ⭐ | 日常更新 |

### 运行自动版本脚本

```bash
cd C:\Users\23735\Desktop\autogame\something\1\music-studio
publish-auto.bat
```

### 交互示例

```
==========================================
  Docker Hub Auto-Version Upload
==========================================

Current Version: 1.0.0

Select version increment:
  1 - Patch (bug fixes)      : 1.0.0 -> 1.0.1
  2 - Minor (new features)   : 1.0.0 -> 1.1.0
  3 - Major (breaking changes): 1.0.0 -> 2.0.0
  4 - Keep current version    : 1.0.0
  5 - Custom version

Choose (1-5): 1

Version Update: 1.0.0 -> 1.0.1 [Patch]

Enter Docker Hub username: nahida115

==========================================
  Build and Push Summary
==========================================
  Image: nahida115/music-studio
  Old Version: 1.0.0
  New Version: 1.0.1
  Tags: 1.0.1, latest
==========================================

Continue? (y/N) y

[自动构建、标签、推送...]

Version saved to: version.txt
Next upload will increment from: 1.0.1
```

---

## 📝 版本文件 (version.txt)

脚本会自动创建和更新 `version.txt` 文件：

```
1.0.1
```

每次上传后，版本号会自动保存，下次上传时读取这个版本作为基准。

---

## 🔄 典型工作流程

### 场景1: 修复了一个小bug

```bash
# 1. 修改代码
# 2. 运行脚本
publish-auto.bat

# 3. 选择 "1 - Patch"
# 1.0.0 -> 1.0.1
```

### 场景2: 添加了新功能

```bash
# 1. 添加新的可视化模式
# 2. 运行脚本
publish-auto.bat

# 3. 选择 "2 - Minor"
# 1.0.5 -> 1.1.0
```

### 场景3: 重大更新（UI重构）

```bash
# 1. 重构整个UI
# 2. 运行脚本
publish-auto.bat

# 3. 选择 "3 - Major"
# 1.9.3 -> 2.0.0
```

### 场景4: 紧急修复（保持版本）

```bash
# 只想重新构建，不改版本号
publish-auto.bat

# 选择 "4 - Keep current version"
```

### 场景5: 自定义版本号

```bash
publish-auto.bat

# 选择 "5 - Custom version"
# 输入: 2.5.7-beta
```

---

## 📊 版本历史管理

### 查看所有已发布版本

```bash
# 在 Docker Hub 查看
https://hub.docker.com/r/nahida115/music-studio/tags

# 或使用命令
docker search nahida115/music-studio
```

### 拉取特定版本

```bash
# 拉取最新版本
docker pull nahida115/music-studio:latest

# 拉取特定版本
docker pull nahida115/music-studio:1.0.1
docker pull nahida115/music-studio:1.1.0
docker pull nahida115/music-studio:2.0.0
```

---

## 🏷️ 高级：使用额外标签

### 添加更多语义标签

修改脚本，在打标签步骤添加：

```bash
# 除了 1.0.1 和 latest，还可以打：
docker tag music-studio nahida115/music-studio:1.0      # 次版本
docker tag music-studio nahida115/music-studio:1        # 主版本
docker tag music-studio nahida115/music-studio:stable  # 稳定版
docker tag music-studio nahida115/music-studio:beta    # 测试版

# 全部推送
docker push nahida115/music-studio --all-tags
```

---

## 🔧 手动管理版本

### 手动编辑 version.txt

```bash
# 打开文件
notepad version.txt

# 修改为你想要的版本
2.0.0

# 保存后运行脚本
publish-auto.bat
# 选择 "4 - Keep current version"
```

### 查看当前版本

```bash
type version.txt
```

### 重置版本

```bash
echo 1.0.0 > version.txt
```

---

## 📅 版本发布建议

### 开发周期

```
1.0.0 - 初始发布
1.0.1 - 修复进度条bug
1.0.2 - 修复暂停问题
1.1.0 - 添加新的可视化模式
1.1.1 - 优化性能
1.2.0 - 添加音频均衡器
2.0.0 - 全新UI设计
```

### 发布频率

- **Patch**: 发现bug立即修复发布
- **Minor**: 1-2周发布一次新功能
- **Major**: 3-6个月大版本更新

---

## 🎯 快速参考

### 首次上传
```bash
publish.bat          # 使用固定版本 1.0.0
```

### 日常更新
```bash
publish-auto.bat     # 自动递增版本
选择 1 (Patch)       # 小改动
选择 2 (Minor)       # 新功能
选择 3 (Major)       # 重大更新
```

### 检查版本
```bash
type version.txt     # 查看当前版本
```

---

## ⚠️ 注意事项

1. **version.txt 文件很重要**
   - 不要删除这个文件
   - 建议加入 git 版本控制

2. **版本号不能回退**
   - Docker Hub 不允许覆盖已存在的版本号
   - 如果上传错误，只能发布新版本

3. **latest 标签**
   - 每次推送都会更新 latest
   - latest 总是指向最新版本

4. **测试后再发布**
   - 本地测试通过后再推送
   - 避免发布有问题的版本

---

## 🔗 Git 集成（可选）

### 同步 Git 标签

```bash
# 发布后创建 Git 标签
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin v1.0.1

# 或在脚本中添加：
git tag -a v%NEW_VERSION% -m "Release version %NEW_VERSION%"
git push origin v%NEW_VERSION%
```

---

## 📞 需要帮助？

- 查看版本历史: `type version.txt`
- 查看镜像列表: `docker images | findstr music-studio`
- 查看 Docker Hub: https://hub.docker.com/r/nahida115/music-studio

Happy Deploying! 🚀
