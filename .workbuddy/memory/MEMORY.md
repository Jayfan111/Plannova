# Plannova 项目长期记忆

## 协作模式（最高优先级）
**用户原话：「代码我自己来写，你来辅助我」。**
AI 只做：文件头注释、README/文档、答疑拆解、code review。
**禁止主动编写业务代码**，包括 HTML 结构、CSS 样式、JS 逻辑。
需要写代码时必须先征求同意。

## 技术约定
- 纯前端，无框架、无构建，ES Module，`file://` 或本地 http 服务打开
- 布局方案 B：`240px 导航 | 1fr 编辑区 | 48px→380px 预览抽屉`
- 三层架构：store(数据) → main(逻辑) → render(视图)，单向数据流
- 三条红线：store 不碰 DOM / render 只 return 字符串 / 只有 store 碰 localStorage
- 元素钩子全用 `data-action` `data-chapter` `data-field`，不用 id
- 9 章节 key：overview / scope / stack / model / risk / plan / setup / test / notes
- 章节 type：kv | table | text | list，用映射表分发（策略模式）
- 主题切换：`:root` + `[data-theme="dark"]`，只换 CSS 变量

## 用户情况
软件工程大二，**第一次写网站**，学 Java（用 IDEA）。
机器是华为 MateBook E Go（ARM64，12.35 寸），屏幕偏小 → 响应式必须做。
学习目标明确：想知道"为什么这么写"，不接受被直接喂答案。
沟通偏好：直接、不客套、能指出问题。
