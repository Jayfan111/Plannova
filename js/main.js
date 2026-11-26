/* ===========================================================================
   main.js — 入口与逻辑层：接事件、调数据、触发渲染
   ===========================================================================

   【这个文件干什么】
   它是唯一"知道所有事情"的文件：既认识 DOM，也认识数据。
   但正因为如此，它自己也必须克制 —— 只做三件事：

       1. 把事件绑到页面上（用事件委托，见下文）
       2. 事件发生时去调 store 改数据
       3. 数据改完调 render 生成 HTML，塞回页面

   除此之外什么都不做。不要在这里写拼接 HTML 的长字符串（那是 render 的活），
   也不要在这里直接操作 localStorage（那是 store 的活）。

   ===========================================================================
   一、启动流程
   ===========================================================================

       import * as store from './store.js';
       import * as render from './render.js';

       function boot() {
         store.init();              // 读本地数据或创建空数据
         paint();                   // 首次渲染
         bindEvents();              // 绑事件
       }
       document.addEventListener('DOMContentLoaded', boot);

   用 DOMContentLoaded 而不是直接把脚本放 body 末尾，
   是为了保证脚本执行时元素一定已经存在。（两种都行，选一种坚持用）

   ===========================================================================
   二、paint —— 全站唯一的"刷新画面"入口
   ===========================================================================

       function paint() {
         // 从 store 拿数据，调 render 生成 HTML，写进对应容器
       }

   好处：任何地方想让界面变新，统一调 paint()。
   不要在事件处理函数里东一句 el.innerHTML = ... 西一句。

   如果后面发现整体重绘太慢（输入时卡顿），再做"局部刷新"版本：

       function paintPreviewOnly() { ... }   // 只更新预览区

   先做整体重绘，够用。过早优化是负担。

   ===========================================================================
   三、事件委托 —— 这个项目必须掌握的写法
   ===========================================================================

   问题：章节是动态生成的，你今天用
       document.querySelectorAll('[data-action]').forEach(el => el.onclick = ...)
   明天重新渲染一次，这些监听就全丢了（新元素没绑上）。

   正确做法：监听器绑在不会变的父容器上，靠事件冒泡统一处理。

       document.querySelector('.app').addEventListener('click', (e) => {
         const trigger = e.target.closest('[data-action]');
         if (!trigger) return;                       // 点的是空白，不管

         const action = trigger.dataset.action;
         const handlers = {
           'toggle-preview': () => app.classList.toggle('is-preview-open'),
           'switch-chapter': () => { ... },
           'new-project':    () => { ... },
           'delete-project': () => { ... }
         };
         if (handlers[action]) handlers[action](trigger);
       });

   要点：
     - e.target.closest(...) 向上找最近的带 data-action 的祖先，
       这样按钮里套了 <span> 图标也能点中
     - handlers 映射表代替 if/else 链，加新动作只加一行
     - 用 dataset.action 读 data-action，这是标准 API

   输入类事件同理，用 'input' + 委托：

       app.addEventListener('input', (e) => {
         const field = e.target.closest('[data-field]');
         if (!field) return;
         const key = field.closest('[data-chapter]').dataset.chapter;
         onFieldInput(key, field.dataset.field, field.value);
       });

   注意用 'input' 而不是 'change'：input 每次按键都触发（配合防抖），
   change 要失去焦点才触发，体验差。

   ===========================================================================
   四、防抖 —— 为什么必须有
   ===========================================================================

   每敲一个字符就重新渲染整个预览 + 写 localStorage，
   敲 50 个字就是 100 次操作，会明显卡。

       function debounce(fn, delay = 300) {
         let timer;
         return (...args) => {
           clearTimeout(timer);
           timer = setTimeout(() => fn(...args), delay);
         };
       }

   用法：把"保存 + 刷新预览"包一层 debounce，用户停手 300ms 后才执行。

   注意两个细节：
     1) 输入框的内容要"立刻"反映到数据里（否则快速切换章节会丢字），
        只是"保存和重绘"要防抖
     2) 防抖函数只创建一次（放模块顶层），不要在事件里每次都新建，
        否则 timer 每次都是新的，防抖完全失效

   ===========================================================================
   五、需要处理的具体交互（逐个实现，一次只做一个）
   ===========================================================================

     ① 抽屉开合        → toggle 'is-preview-open'
     ② 切换章节        → store.setCurrentSection(key) + 重绘编辑区
     ③ 编辑字段        → 改数据（立即）+ 防抖重绘预览
     ④ 新建项目        → 生成 id、初始化 9 个章节
     ⑤ 删除项目        → confirm() 二次确认后删
     ⑥ 表格/列表增删行 → 改数组、重绘
     ⑦ 导出            → 调 export.js
     ⑧ 主题切换        → documentElement.dataset.theme

   建议顺序：①②③ 是 M3 的闭环，先做这三个，做通了整个架构就成立了。

   ===========================================================================
   六、当前选中状态放哪？
   ===========================================================================

   "现在在看哪个章节"这种状态，不属于项目数据（不该被存进 localStorage），
   建议放在 main.js 的模块变量里：

       let currentSectionKey = 'overview';

   判断标准：这个状态关掉浏览器再打开还需要吗？
     - 项目内容 → 需要 → 放 store
     - "当前展开的是哪一节" → 不需要 → 放 main.js

   这条判断标准叫「UI 状态 vs 领域状态」，分清了架构就不会乱。

   【常见坑】
   - 用 ES Module 时记得 type="module"，且 import 路径要带 ./ 和 .js 后缀
   - 事件委托里忘了 closest 直接用 e.target，点到内部元素时失效
   - 防抖函数在事件里重新创建（见上文）
   - 重绘后焦点丢失（输入框被重建），需要额外处理：记住聚焦的元素，
     重绘后 focus 回去。这个问题在"整体重绘 + 输入框"组合下必然出现，
     所以预览区重绘要单独做，不要连编辑区一起重绘

   【和别的文件的关系】
     import store.js、render.js、export.js
     操作 index.html 里的元素，靠 data-action / data-field / data-chapter
   =========================================================================== */
