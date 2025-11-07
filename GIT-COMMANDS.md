# 🚀 Git命令速查卡

## 📋 首次上传到GitHub

### 完整命令序列

```bash
# 1. 进入项目目录
cd C:\Users\23735\Desktop\autogame\something\1\music-studio

# 2. 查看状态（已完成提交）
git status

# 3. 在GitHub创建仓库后，添加远程地址（替换yourusername）
git remote add origin https://github.com/yourusername/music-studio.git

# 4. 确认分支名称
git branch -M main

# 5. 推送到GitHub
git push -u origin main

# 6. 添加版本标签（可选）
git tag -a v1.1.4 -m "Release v1.1.4"
git push origin v1.1.4
```

---

## 🔄 日常Git操作

### 查看状态
```bash
git status                    # 查看工作区状态
git log --oneline -10         # 查看最近10次提交
git diff                      # 查看未暂存的更改
git diff --staged             # 查看已暂存的更改
```

### 添加和提交
```bash
git add .                     # 添加所有更改
git add file.js               # 添加特定文件
git commit -m "feat: 新功能"  # 提交更改
git commit --amend            # 修改最后一次提交
```

### 推送和拉取
```bash
git push                      # 推送到远程
git push origin main          # 推送到指定分支
git pull                      # 拉取远程更新
git pull origin main          # 拉取指定分支
```

### 分支操作
```bash
git branch                    # 查看本地分支
git branch -a                 # 查看所有分支
git checkout -b feature/new   # 创建并切换分支
git checkout main             # 切换回主分支
git merge feature/new         # 合并分支
git branch -d feature/new     # 删除分支
```

### 标签管理
```bash
git tag                       # 查看所有标签
git tag v1.2.0                # 创建轻量标签
git tag -a v1.2.0 -m "msg"    # 创建附注标签
git push origin v1.2.0        # 推送标签
git push --tags               # 推送所有标签
```

---

## 🛠️ 常用场景

### 场景1: 修复Bug后更新

```bash
# 1. 修改代码
# 2. 查看更改
git status
git diff

# 3. 提交
git add .
git commit -m "fix: 修复钢琴八度调整问题"

# 4. 推送
git push
```

### 场景2: 添加新功能

```bash
# 1. 创建特性分支
git checkout -b feature/new-theme

# 2. 开发功能
# ... 编写代码 ...

# 3. 提交
git add .
git commit -m "feat: 添加主题系统"

# 4. 推送分支
git push origin feature/new-theme

# 5. 在GitHub创建Pull Request
```

### 场景3: 发布新版本

```bash
# 1. 更新版本号
echo 1.2.0 > version.txt

# 2. 更新CHANGELOG
# ... 编辑文档 ...

# 3. 提交
git add .
git commit -m "chore: release v1.2.0"

# 4. 创建标签
git tag -a v1.2.0 -m "Release v1.2.0

- New theme system
- Performance improvements
- Bug fixes"

# 5. 推送
git push origin main
git push origin v1.2.0
```

### 场景4: 同步远程更新

```bash
# 其他人提交了代码，你需要更新

# 1. 拉取更新
git pull origin main

# 2. 如果有冲突，解决后
git add .
git commit -m "merge: 解决冲突"
git push
```

### 场景5: 撤销更改

```bash
# 撤销工作区更改（未暂存）
git checkout -- file.js

# 撤销暂存（已git add）
git reset HEAD file.js

# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~1
```

---

## 📝 提交信息规范

### 格式

```
<type>(<scope>): <subject>

[body]

[footer]
```

### Type类型

- **feat**: 新功能
- **fix**: Bug修复
- **docs**: 文档更新
- **style**: 代码格式
- **refactor**: 重构
- **perf**: 性能优化
- **test**: 测试
- **chore**: 构建/工具

### 示例

```bash
# 简单提交
git commit -m "feat: add theme system"

# 详细提交
git commit -m "feat(piano): add octave shift feature

- Add octave up/down buttons
- Update keyboard mapping
- Fix audio context lifecycle

Closes #123"
```

---

## 🐳 结合Docker发布

### 完整发布流程

```bash
# 1. 开发和测试
npm run dev

# 2. 提交代码
git add .
git commit -m "feat: new feature"
git push

# 3. 更新版本
# 编辑 version.txt: 1.2.0

# 4. 发布Docker镜像
publish-auto.bat
# 选择版本类型: 2 - Minor

# 5. 创建Git标签
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

---

## ⚠️ 常见错误

### 错误1: 权限被拒绝

```
error: Permission denied
```

**解决:**
```bash
# 使用Personal Access Token
# GitHub → Settings → Developer settings → Tokens
# 使用token作为密码
```

### 错误2: 远程仓库不存在

```
error: remote origin already exists
```

**解决:**
```bash
git remote remove origin
git remote add origin https://github.com/yourusername/music-studio.git
```

### 错误3: 推送被拒绝

```
error: failed to push some refs
```

**解决:**
```bash
# 先拉取远程更新
git pull origin main --rebase
git push origin main
```

### 错误4: 文件过大

```
error: file too large
```

**解决:**
```bash
# 检查.gitignore是否正确
# 确保node_modules/和dist/被忽略
```

---

## 🔐 GitHub认证

### 使用Personal Access Token

1. **创建Token**
   ```
   GitHub → Settings → Developer settings → 
   Personal access tokens → Tokens (classic) → 
   Generate new token
   ```

2. **选择权限**
   - [x] repo (全部)
   - [x] workflow
   - [x] write:packages

3. **保存Token**
   ```
   ghp_xxxxxxxxxxxxxxxxxxxx
   ```

4. **使用Token**
   ```bash
   # 推送时用token作为密码
   Username: yourusername
   Password: ghp_xxxxxxxxxxxxxxxxxxxx
   ```

### 配置Git Credential

```bash
# Windows
git config --global credential.helper wincred

# Mac
git config --global credential.helper osxkeychain

# Linux
git config --global credential.helper cache
```

---

## 📊 Git最佳实践

### 提交频率
- ✅ 经常提交（功能完成就提交）
- ✅ 每次提交一个逻辑单元
- ❌ 不要积累太多更改

### 提交信息
- ✅ 清晰描述做了什么
- ✅ 使用规范的type
- ❌ 不要用"update"或"fix"这样的模糊描述

### 分支策略
- **main** - 稳定版本
- **develop** - 开发版本
- **feature/xxx** - 新功能
- **fix/xxx** - Bug修复

---

## 🎯 快速参考

### 初次上传
```bash
git remote add origin https://github.com/yourusername/music-studio.git
git push -u origin main
```

### 日常更新
```bash
git add .
git commit -m "feat: 更新说明"
git push
```

### 版本发布
```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### 查看历史
```bash
git log --oneline --graph --all
```

---

## 📞 需要帮助？

- Git官方文档: https://git-scm.com/doc
- GitHub指南: https://docs.github.com/
- 常见问题: 搜索Stack Overflow

---

✅ 所有准备工作已完成！

现在执行推送命令即可！🚀

================================================================
