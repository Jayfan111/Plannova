/* ===========================================================================
   store.js — 数据层：数据的形状、读写、持久化
   ===========================================================================

   【这个文件干什么】
   它是整个应用的"唯一真相"（single source of truth）。
   页面上看到的每一个字，最终都来自这里的数据。

   三条铁律：
     1. 只处理数据，绝不碰 DOM（不许出现 document.xxx）
     2. 所有改数据的操作都提供函数，外部不要直接改对象字段
     3. 持久化只在本文件做，别的地方不许调 localStorage

   ===========================================================================
   一、数据的形状
   ===========================================================================

   参照 resources/plan.md 的第 4 节，结构是：

     {
       id:        "p_1732...",      // 唯一标识，建项目时生成
       name:      "Plannova",       // 项目名（对应"项目名称"字段）
       createdAt: 1732000000000,    // 时间戳
       updatedAt: 1732000000000,
       sections: [                  // 9 个章节，顺序固定
         {
           key:  "overview",        // 章节标识，和 data-chapter 对应
           type: "kv",              // kv | table | text | list
           title: "项目概览",
           done: false,             // 本章节是否填过（算进度用）
           data: { ... }            // 具体内容，形状由 type 决定
         },
         ...
       ]
     }

   四种 type 的 data 形状建议（自己定也行，但要统一）：

     type: "kv"      data: { name: "", positioning: "", ... }
     type: "table"   data: [ { id, col1, col2, col3 }, ... ]
     type: "list"    data: [ { id, text, checked } ]
     type: "text"    data: { body: "" }

   ===========================================================================
   二、对外要提供哪些函数（建议的 API）
   ===========================================================================

       init()                       启动时读 localStorage，没有则建空数据
       getState()                   返回当前完整状态（只读用）
       getCurrentProject()          当前打开的项目
       getSections()                当前项目的章节数组

       createProject(name)          新建项目，返回新项目
       renameProject(id, name)
       deleteProject(id)
       setCurrentProject(id)

       updateSection(key, data)     覆盖某章节的 data
       patchSection(key, partial)   只改某章节 data 的部分字段
       addRow(sectionKey, row)      表格/列表加一行
       removeRow(sectionKey, rowId)
       moveSection(key, newIndex)   （P1，先不做）

       save()                       把状态写回 localStorage
       reset()                      清空（调试用）

   函数签名先写出来、函数体留空，跑不通没关系 —— 先把接口定下来，
   这样 main.js 写起来才有方向。

   ===========================================================================
   三、持久化
   ===========================================================================

   localStorage 只能存字符串，所以要 JSON.stringify / JSON.parse：

       localStorage.setItem('plannova:state', JSON.stringify(state))
       JSON.parse(localStorage.getItem('plannova:state'))

   必做三件事：

   1) key 加前缀（如 plannova:state）
      —— 防止和同域下别的练习项目冲突，这个坑踩过的人不少

   2) 读的时候包 try/catch
      —— 数据被手动改坏、JSON 语法错时，不能让整个页面白屏，
         应该回退到空状态并在控制台警告

   3) 写的时候考虑超时/超量
      —— localStorage 一般 5MB，超出会抛 QuotaExceededError，
         捕获到就提示用户，不要静默失败

   关于防抖：
     每次按键都写 localStorage 很浪费（而且同步阻塞主线程）。
     写入应该防抖 300ms —— 但防抖放 main.js 还是放这里？
     建议放本文件，暴露出 save()，让 main.js 调用 save()，
     save 内部自己做防抖。这样职责更内聚。

   ===========================================================================
   四、开发节奏建议
   ===========================================================================

     第一步：先只做 init / getState / save 三个，在控制台手动调用验证
             （浏览器 F12 → Console → 输入 store.getState()）
     第二步：加 createProject，验证能建出第二个项目
     第三步：加 updateSection，验证改完后 save 再刷新数据还在
     第四步：加表格/列表的增删

     每步都在控制台自己调一遍，别等界面做完再一起测。

   【常见坑】
   - 直接改 JSON.parse 出来的对象后忘了存，刷新就没了
   - 存的时候 JSON.stringify 了，读的时候忘了 JSON.parse
   - updatedAt 忘记更新（后面排序会用到）
   - 用 ES Module 时函数要 export，不然 main.js 拿不到

   【和别的文件的关系】
     被 main.js 调用（import * as store from './store.js'）
     被 render.js 读取数据（render 本身不 import store，由 main 传进去）
   =========================================================================== */
