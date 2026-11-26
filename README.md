# Plannova

把「项目开始前的想法」变成「结构化规划文档」的纯前端小工具。

无后端、无构建、无框架。打开 `index.html` 就能跑。

---

## 一、这是什么，做到什么程度算完

**做**：新建一个项目 → 按 9 个固定章节填写 → 右侧实时预览 → 导出 Markdown 文件。
**不做**：登录、云同步、协作、富文本编辑器。

完整需求与验收标准见 [`resources/plan.md`](./resources/plan.md)。

**完成标准**：能在 3 分钟内，向一个不了解它的人演示完整流程，并回答"为什么这么设计"。

---

## 二、当前状态

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| M0 | 规划文档 + 文件骨架 + 各文件头部注释 | ✅ 已完成 |
| M1 | index.html 静态结构 + 三个 CSS | ⬜ 待做 |
| M2 | store.js 数据层可用 | ⬜ 待做 |
| M3 | 单章节编辑 → 刷新不丢 | ⬜ 待做 |
| M4 | P0 五条需求走通 | ⬜ 待做 |
| M5 | Markdown 导出 | ⬜ 待做 |
| M6 | P1 挑一两条 | ⬜ 待做 |

> 每个文件开头都有一大段注释，说明这个文件干什么、大概怎么写、坑在哪。
> **先读注释再动手**，比边写边猜快得多。

---

## 三、目录结构

```
Plannova/
├── index.html          页面骨架（只写结构，不写样式和逻辑）
├── LICENSE             MIT
├── css/
│   ├── tokens.css      设计变量：颜色/间距/字号。换肤只改这一个文件
│   ├── base.css        重置 + 基础排版（盒模型、字体、表单继承）
│   └── layout.css      三栏 Grid + 预览抽屉 + 响应式  ← 最难的一块
├── js/
│   ├── store.js        数据层：数据结构、增删改查、localStorage
│   ├── render.js       视图层：数据 → HTML 字符串（纯函数）
│   ├── main.js         逻辑层：绑事件、调数据、触发渲染
│   └── export.js       导出 Markdown 文件
└── resources/
    └── plan.md         项目规划文档（同时可作为内置模板来源）
```

---

## 四、架构：三层 + 单向数据流

```
   store.js          main.js           render.js
   数据层      ←→    逻辑层      →     视图层
  只存不改          接事件改数据        数据变 HTML
```

**一句话记住**：界面是数据的影子。你只操作数据，不去操作 DOM。

一次输入的过程：

```
敲键盘 → 防抖 300ms → 改 store 里的数据 → 重新生成 HTML → 塞回页面
                            ↓
                     写 localStorage
```

三条红线（守住这三条，代码就不会乱）：

1. **`store.js` 里不许出现 `document`** —— 数据层只认数据
2. **`render.js` 只 `return` 字符串，不许 `innerHTML=`** —— 塞进页面是 main 的事
3. **其他地方不许直接调 `localStorage`** —— 持久化只在 store 里做

---

## 五、`data-*` 钩子（全项目的约定）

JS 抓元素**全靠这三个属性**，不靠 id。改 HTML 和写 JS 时都要认这套。

| 属性 | 用在哪 | 值 |
| --- | --- | --- |
| `data-action="xxx"` | 可点击元素 | 动作名，如 `toggle-preview` / `switch-chapter` |
| `data-chapter="xxx"` | 章节容器 | 章节 key，如 `overview` / `scope` / `stack` |
| `data-field="xxx"` | 输入控件 | 字段名，如 `title` / `positioning` |

为什么用 `data-*` 而不是 id：
- 同样的章节会重复渲染，id 会重复（HTML 规定 id 必须唯一）
- `data-*` 天然支持 `querySelectorAll` 批量选取
- 事件委托靠 `closest('[data-action]')` 一句话搞定

---

## 六、9 个章节的 key 和类型

对应 `resources/plan.md` 的 9 节。`type` 决定编辑区用什么控件。

| # | key | 章节 | type | 说明 |
| --- | --- | --- | --- | --- |
| 1 | `overview` | 项目概览 | `kv` | 键值对：名称、定位、完成标准 |
| 2 | `scope` | 需求边界 | `table` | P0 / P1 / 不做 三张表 |
| 3 | `stack` | 技术选型 | `table` | 项 / 选择 / 理由 |
| 4 | `model` | 数据结构 | `text` | 放代码块，用 textarea |
| 5 | `risk` | 难点与风险 | `table` | 难点 / 方案 / 备选 |
| 6 | `plan` | 迭代计划 | `table` | 阶段 / 目标 / 完成标志 |
| 7 | `setup` | 工程准备 | `list` | 清单项 |
| 8 | `test` | 测试清单 | `list` | 分正常/边界/异常三组 |
| 9 | `notes` | 备忘 | `text` | 自由文本 |

---

## 七、开发顺序（别跳步）

每一步都要**在浏览器里验证过再往下走**。

```
□ 第 1 步：index.html 静态骨架
   写完直接双击打开 —— 没有任何 JS，也应该能看见完整的三栏布局。
   这一步的目标是"调样式"，先把好看的东西摆出来，有成就感。

□ 第 2 步：tokens.css
   只写变量，页面看起来没变化是正常的。按 F12 在 Console 里试：
     getComputedStyle(document.documentElement).getPropertyValue('--color-bg')

□ 第 3 步：base.css → layout.css
   这步完成，三栏应该各滚各的，抽屉能收缩。
   卡住的话看"九、常见卡点"里的高度链。

□ 第 4 步：store.js 只做 init / getState / save
   Console 里敲 store.init() 然后 store.getState()，能看到对象就对了。

□ 第 5 步：main.js 的 boot + paint，render.js 的 renderChapterNav
   侧栏能显示 9 个章节标题，就算打通了。

□ 第 6 步：单个章节的编辑闭环（M3）
   填内容 → 刷新 → 内容还在。这一步通了，整套架构就成立了。

□ 第 7 步：剩下 8 个章节
□ 第 8 步：预览区实时更新（带防抖）
□ 第 9 步：Markdown 导出
```

**每一步都能单独跑通，别攒着一起测。**

---

## 八、术语小抄

写代码时会在注释和文档里反复看到，先混个脸熟。

| 词 | 意思 |
| --- | --- |
| **Design Token** | 把颜色、间距抽成 CSS 变量，一处改、全站生效 |
| **高度链** | `html → body → .app → 三栏` 每层都要 `height: 100%`，断一层就不滚 |
| **单向数据流** | 改数据 → 重渲染，单向走，不反向改 DOM |
| **纯函数** | 同样输入必定同样输出，不依赖外部状态 |
| **事件委托** | 监听器绑在父容器上，靠冒泡处理子元素事件 |
| **事件冒泡** | 子元素的事件会向上通知父元素，一直传到 document |
| **防抖 debounce** | 连续触发时，只在最后一次之后 N 毫秒执行一次 |
| **策略模式** | 用映射表 `{ key: fn }` 代替长长的 if/else |
| **XSS** | 用户在输入里塞 `<script>`，被浏览器当代码执行 |
| **UI 状态 vs 领域状态** | 要不要存盘。要存 → store；不用 → main.js 的变量 |

---

## 九、常见卡点

**① 侧栏不自己滚，滚动条跑到整个页面上**
高度链断了。检查 `html, body, .app, .sidebar` 是不是都设了 `height: 100%`。
用 DevTools 选中 `.sidebar`，看 Computed 里的 height 是不是预期值。

**② 设了 `width: 100%` 还是溢出**
`box-sizing: border-box` 没生效。检查 base.css 里是不是漏了 `*::before, *::after`。

**③ CSS 变量不生效**
大概率是名字打错（CSS 变量区分大小写），或者 `tokens.css` 没被 `@import`。
在 DevTools 的 Styles 面板里，失效的变量会显示成细红色波浪线。

**④ 输入框里的字特别奇怪（宋体、很小）**
base.css 里少了 `input, textarea, button { font: inherit; }`。

**⑤ 输入一个字就丢焦点**
说明你在整体重绘（把编辑区也一起重画了）。
正确做法：输入时只重绘预览区，编辑区不动。

**⑥ 事件绑不上**
要么元素是动态渲染出来的（必须用事件委托），
要么 `data-action` 的值和 handlers 表里的 key 对不上（大小写、连字符）。

**⑦ 抽屉展开没动画**
`transition` 加错地方了。对 grid 列宽做过渡要加在 `.app` 上；
如果用的是 `width` 方案，才加在 `.preview` 上。

**⑧ 刷新后数据没了**
三种可能：改完没调 `save()`、`save()` 里忘了 `JSON.stringify`、
读的时候忘了 `JSON.parse`。在 DevTools → Application → Local Storage 里直接看存了什么。

---

## 十、调试技巧

**直接打开**
双击 `index.html` 即可。如果用了 `type="module"`（会用到），
部分浏览器在 `file://` 下会拦截模块加载，那就起个本地服务：

```bash
# 任选一个
python -m http.server 8000
npx serve .
```

然后访问 `http://localhost:8000`。

**Console 是主战场**
写完 store 的任何函数，先在 Console 里手动调一遍再接到界面上。
不要"写完一整条链路再一起跑"，出错时你分不清是哪一层的问题。

**看数据不看界面**
界面显示不对时，先 Console 里 `store.getState()` 看数据对不对。
数据对 → 问题在 render；数据错 → 问题在 store 或 main。

这个排查顺序能省掉大量时间：**先确认数据，再看画面。**

---

## 十一、提交规范

单人项目，直接提交到 main，不用分支。

```
feat: 新增章节切换
fix: 修复刷新后内容丢失
style: 调整侧栏间距
refactor: 提取防抖函数
docs: 补充 store 注释
```

半年后看 `git log` 能读懂自己当时在干嘛，比任何代码规范都实在。

---

## 十二、给未来的自己

- 做着做着觉得某个需求"没必要" → **先改 plan.md，再改代码**
- 时间不够就砍 P1 保 P0，能跑完的 60% 比跑不完的 100% 值钱
- 每完成一个里程碑，回来更新本文件第二节的状态表

---

MIT License · 2026 Jayfan111
