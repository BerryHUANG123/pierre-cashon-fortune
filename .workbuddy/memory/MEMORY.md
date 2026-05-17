# 项目长期记忆

## 用户工作偏好
- **自动推送**：每次代码改完后直接 `git add -A && git commit && git push`，不需要等用户说"推送"
- **每次改完代码后自测**：
  1. `node --check game.js` — JS 语法检查
  2. 检查 HTML 中 `onclick` 调用的函数是否都在 JS 中定义
  3. 检查 CSS/JS 文件路径引用是否正确
  4. 看浏览器 Console 有无报错
- **输出风格**：方案实施前需提供多选项对比表；交付内容详尽完整而非摘要
- **代码规范**：JS/CSS文件分离，清晰的模块化项目结构

## 项目信息
- 项目：pierre-cashon-fortune (GitHub Pages)
- 地址：https://berryhuang123.github.io/pierre-cashon-fortune/
- 技术栈：原生 HTML/CSS/JS + Supabase
- Supabase 项目：celufcywdbgoblmfdxgk

## GameState v4 架构
- inventory 使用独立字段存储堆叠型消耗品
- 数据通过 localStorage 持久化
- 正在基于 Supabase 构建实时云端同步能力
