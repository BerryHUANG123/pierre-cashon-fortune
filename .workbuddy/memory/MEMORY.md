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

## 代码架构（6 模块）
- 加载顺序: data.js → state.js → ui.js → engine.js → features.js → main.js
- **数据驱动模式**：所有静态内容定义集中在 data.js，state.js 通过 init 函数生成运行时对象
  - 新增皮肤：只需在 SKINS_DATA 添加条目（含 price/tier），系统自动注册 ownedSkins 和商店商品
  - 新增成就：只需在 ACHIEVEMENTS_DATA 添加条目（含 target 或 streakTarget），initAchievements 自动处理状态
  - 新增每日任务：只需在 DAILY_TASKS_TEMPLATE 添加条目，createFreshDailyTasks 自动生成实例
  - init 函数：initOwnedSkins/initSkins/initShopItems/initAchievements/createFreshDailyTasks/createFreshDailyChallenges
- 语法检查需用 `NODE_OPTIONS="" node --check`（因环境变量冲突）

## 待清理
- game.js.bak 仍在项目根目录，确认模块化版本稳定后可删除
