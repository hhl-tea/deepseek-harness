/**
 * Site nav — categorized website bookmarks in the left sidebar.
 *
 * Two surfaces share one store:
 * - a sidebar panel entry that opens a page in the main column, where sites are
 *   listed by category, searchable, and editable;
 * - a `/nav` composer command whose grouped popup lists the same sites.
 *
 * Both open a site in the browser (a new tab) instead of rendering it inside
 * the app. Data lives in this browser under `dsh-sitenav.board.v1`.
 *
 * Visual language: the host's theme tokens for surfaces, text, and hairlines,
 * with an Apple-style accent per category for its dot and monogram.
 */

window.__ModuleLoader__.load({
  id: '@local/site-nav',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useMemo, useRef, useState } = React

    const NS = 'site-nav'
    const PANEL_ID = 'sitenav'
    const STORAGE_KEY = 'dsh-sitenav.board.v1'
    /** Board schema version; version 1 boards gain the Trending category on read. */
    const BOARD_VERSION = 6
    const COLORS = ['blue', 'teal', 'purple', 'orange', 'green', 'pink']
    /** Apple system palette used for category dots and card monograms. */
    const COLOR_HEX = {
      blue: '#0A84FF',
      teal: '#30B0C7',
      purple: '#BF5AF2',
      orange: '#FF9F0A',
      green: '#34C759',
      pink: '#FF375F',
    }

    const EN = {
      panel: 'Site nav',
      subtitle: 'Bookmarks',
      all: 'All sites',
      search: 'Search sites',
      clearSearch: 'Clear search',
      addSite: 'Add site',
      newCategory: 'New category',
      categoryNamePlaceholder: 'Category name',
      create: 'Create',
      emptyTitle: 'No sites here yet',
      emptyHint: 'Add a site to keep it one click away.',
      noMatches: 'No matching sites',
      noMatchesHint: 'Try another word, or add this site.',
      sitesCount: '{n} sites',
      open: 'Open in browser',
      edit: 'Edit',
      remove: 'Delete',
      confirmDelete: 'Click again to delete',
      dialogAdd: 'Add a site',
      dialogEdit: 'Edit site',
      fieldName: 'Name',
      fieldUrl: 'URL',
      fieldNote: 'Note',
      fieldCategory: 'Category',
      namePlaceholder: 'Scientific Spaces',
      urlPlaceholder: 'example.com or https://…',
      notePlaceholder: 'What you come here for',
      cancel: 'Cancel',
      save: 'Save',
      errName: 'Give the site a name.',
      errUrl: 'Enter a valid http(s) address.',
      errIcon: 'Enter a valid icon URL, or leave it empty.',
      fieldIcon: 'Icon URL (optional)',
      iconPlaceholder: 'Site icon by default',
      catHardware: 'PC hardware',
      catTrending: 'Trending',
      defaultCategory: 'Unsorted',
      commandLabel: 'Site nav',
      commandDescription: 'Open a saved site in the browser',
      commandSearch: 'Search saved sites',
      commandEmpty: 'No saved sites yet — add them in the Site nav panel',
      commandNoResults: 'No matching site',
    }

    const ZH = {
      panel: '网站导航',
      subtitle: '分类收藏',
      all: '全部网站',
      search: '搜索网站',
      clearSearch: '清除搜索',
      addSite: '添加网站',
      newCategory: '新建分类',
      categoryNamePlaceholder: '分类名称',
      create: '创建',
      emptyTitle: '这里还没有网站',
      emptyHint: '添加一个网站，之后一点就开。',
      noMatches: '没有匹配的网站',
      noMatchesHint: '换个关键词，或者把这个网站加进来。',
      sitesCount: '{n} 个网站',
      open: '用浏览器打开',
      edit: '编辑',
      remove: '删除',
      confirmDelete: '再次点击删除',
      dialogAdd: '添加网站',
      dialogEdit: '编辑网站',
      fieldName: '名称',
      fieldUrl: '网址',
      fieldNote: '备注',
      fieldCategory: '分类',
      namePlaceholder: '科学空间',
      urlPlaceholder: 'example.com 或 https://…',
      notePlaceholder: '记下你来这里看什么',
      cancel: '取消',
      save: '保存',
      errName: '请填写网站名称。',
      errUrl: '请填写有效的 http(s) 网址。',
      errIcon: '图标地址无效，或留空。',
      fieldIcon: '图标地址（可选）',
      iconPlaceholder: '默认取网站自己的图标',
      catHardware: '硬件与 PC',
      catTrending: 'Trending',
      defaultCategory: '未分类',
      commandLabel: '网站导航',
      commandDescription: '用浏览器打开收藏的网站',
      commandSearch: '搜索已收藏的网站',
      commandEmpty: '还没有收藏网站——先在“网站导航”面板里添加',
      commandNoResults: '没有匹配的网站',
    }

    /** Copy used before the locale service has been bound. */
    let boundT = key => EN[key] ?? key

    // ---------------------------------------------------------------------
    // Data
    // ---------------------------------------------------------------------

    /** A stable local id for a category or site. */
    function uid(prefix) {
      const random = Math.random().toString(36).slice(2, 10)
      return prefix + '-' + Date.now().toString(36) + '-' + random
    }

    /** Built-in categories with their sites, as [title, url, note]. */
    const BUILTIN_CATALOG = [
      {
        id: 'cat-ai',
        key: 'ai',
        name: 'AI',
        color: 'blue',
        sites: [
          ['科学空间', 'https://spaces.ac.cn/archives/11848', '苏剑林的中文博客：机器学习与数学推导'],
          ['ChatGPT', 'https://chat.openai.com', 'OpenAI 对话模型'],
          ['MiniMax', 'https://www.minimaxi.com', 'MiniMax AI 大模型平台'],
          ['Claude', 'https://claude.ai', 'Anthropic AI 助手'],
          ['Gemini', 'https://gemini.google.com', 'Google AI 助手'],
          ['Perplexity', 'https://perplexity.ai', 'AI 搜索引擎'],
          ['Cursor', 'https://cursor.sh', 'AI 代码编辑器'],
          ['Copilot', 'https://github.com/features/copilot', 'GitHub AI 编程助手'],
          ['DeepSeek', 'https://deepseek.com', 'DeepSeek AI'],
          ['Kimi', 'https://kimi.moonshot.cn', '月之暗面 AI 助手'],
          ['智谱AI', 'https://www.zhipuai.cn', '智谱大模型平台'],
          ['阿里云', 'https://www.aliyun.com', '阿里巴巴云计算平台'],
          ['超算互联网', 'https://www.scnet.cn', '国家超算互联网平台'],
        ],
      },
      {
        id: 'cat-design',
        key: 'design',
        name: 'Design',
        color: 'purple',
        sites: [
          ['Figma', 'https://figma.com', '在线设计工具'],
          ['Unsplash', 'https://unsplash.com', '免费高清图片'],
          ['Pexels', 'https://pexels.com', '免费图片素材'],
          ['Pika', 'https://pika.art', 'AI 视频生成'],
          ['Runway', 'https://runwayml.com', 'AI 视频编辑'],
          ['animations.dev', 'https://animations.dev', 'React 动画库'],
          ['Postspark', 'https://postspark.app', '截图分享工具'],
          ['TDesign', 'https://tdesign.tencent.com', '腾讯企业级设计系统'],
          ['Curated Design', 'https://curated.design', '精选网页设计灵感'],
          ['Landing Love', 'https://landing.love', '着陆页设计灵感'],
          ['Saaspo', 'https://saaspo.com', 'SaaS 网站设计灵感'],
          ['Navbar Gallery', 'https://navbar.gallery', '导航栏设计灵感'],
          ['CTA Gallery', 'https://cta.gallery', 'CTA 按钮设计灵感'],
          ['App Motion', 'https://appmotion.design', 'UI 动画设计灵感'],
          ['Mobbin', 'https://mobbin.com', '移动应用设计参考'],
          ['Rebrand Gallery', 'https://rebrand.gallery', '品牌重塑案例展示'],
          ['Huge Icons', 'https://hugeicons.com', '免费图标库'],
          ['Component Gallery', 'https://component.gallery', '设计系统组件展示'],
        ],
      },
      {
        id: 'cat-productivity',
        key: 'productivity',
        name: 'Productivity',
        color: 'teal',
        sites: [
          ['Notion', 'https://notion.so', '笔记与知识管理'],
          ['飞书', 'https://feishu.cn', '字节跳动企业协作平台'],
          ['语雀', 'https://yuque.com', '阿里巴巴知识管理与协作平台'],
          ['安徽省人事考试网', 'http://www.apta.net.cn/Officer/', '安徽省公务员考试、事业单位招聘等人事考试信息'],
          ['Obsidian', 'https://obsidian.md', '本地笔记软件'],
          ['Raycast', 'https://raycast.com', 'Mac 效率工具'],
          ['Arc', 'https://arc.net', '现代浏览器'],
          ['WorkBuddy', 'https://www.workbuddy.cn', '智能工作助手平台'],
        ],
      },
      {
        id: 'cat-learning',
        key: 'learning',
        name: 'Learning',
        color: 'green',
        sites: [
          ['Khan Academy', 'https://khanacademy.org', '免费在线课程'],
          ['Coursera', 'https://coursera.org', '在线学习平台'],
          ['DeepLearning.AI', 'https://deeplearning.ai', 'AI 深度学习课程'],
          ['Fast.ai', 'https://fast.ai', '免费深度学习课程'],
          ['RLHF Book', 'https://rlhfbook.com', 'RLHF（人类反馈强化学习）教程书籍'],
          ['极客时间', 'https://time.geekbang.org', 'IT 知识学习平台'],
          ['American Literature', 'https://americanliterature.com', '经典英语文学阅读，适合初学者'],
          ['English Short Stories', 'https://englishshortstoriesforbeginners.com', '英语简短故事，易读入门'],
          ['Breaking News English', 'https://breakingnewsenglish.com', '英语新闻文章，多难度分级'],
          ['News in Levels', 'https://newsinlevels.com', '新闻三难度分级，适合各级学习者'],
          ['British Council Learn English', 'https://learnenglish.britishcouncil.org', '英国文化协会英语学习，质量高、主题多样'],
          ['TED', 'https://ted.com', '知识性演讲，带多语言字幕'],
          ['Free Magazines', 'https://freemagazines.top', '免费杂志阅读，主题广泛'],
        ],
      },
      {
        id: 'cat-developer',
        key: 'developer',
        name: 'Developer',
        color: 'orange',
        sites: [
          ['GitHub', 'https://github.com', '代码托管平台'],
          ['Gitee', 'https://gitee.com', '代码托管平台'],
          ['Stack Overflow', 'https://stackoverflow.com', '开发者问答社区'],
          ['MDN', 'https://developer.mozilla.org', 'Web 开发文档'],
          ['Vercel', 'https://vercel.com', '前端部署平台'],
          ['shadcn/ui', 'https://www.shadcn.net/zh', '现代化 React UI 组件库'],
          ['DeepWiki', 'https://deepwiki.com', '把 GitHub 仓库生成可提问的 AI Wiki 文档'],
          ['MiMo', 'https://mimo.mi.com/docs/zh-CN/price/pay-as-you-go', '小米 MiMo 按量计费定价'],
        ],
      },
      {
        id: 'cat-research',
        key: 'research',
        name: 'Research',
        color: 'pink',
        sites: [
          ['Google Scholar', 'https://scholar.google.com', '学术搜索引擎'],
          ['arXiv', 'https://arxiv.org', '学术论文预印本'],
          ['Semantic Scholar', 'https://semanticscholar.org', 'AI 学术搜索'],
          ['Z-Library', 'https://z-lib.is', '电子书图书馆'],
          ['一〇一二', 'https://mulu.1012.wiki', '历史学数据库目录网站'],
          ['机器之心', 'https://www.jiqizhixin.com', 'AI 科技媒体与数据服务'],
          ['库问搜索', 'https://koovin.com', '千万级文献免费下载，覆盖各学科领域'],
        ],
      },
      {
        id: 'cat-tools',
        key: 'tools',
        name: 'Tools',
        color: 'blue',
        sites: [
          ['12ft.io', 'https://12ft.io', '一键绕过各种付费墙'],
          ['Archive.ph', 'https://archive.ph', '永久保存任何网页'],
          ['Radio Garden', 'https://radio.garden', '全球实时广播电台'],
          ['FutureMe', 'https://futureme.org', '给未来的自己写邮件'],
          ['Temp Mail', 'https://temp-mail.org', '临时邮箱'],
          ['AlternativeTo', 'https://alternativeto.net', '找各种应用的免费替代品'],
          ['BuiltWith', 'https://builtwith.com', '查任何网站用了什么技术'],
          ['Cleanup.pictures', 'https://cleanup.pictures', '图片一键去掉不想看到的东西'],
          ['TinyWow', 'https://tinywow.com', '免费 PDF/图片/视频全能工具箱'],
          ['Photopea', 'https://photopea.com', '浏览器里直接用 PS'],
          ['PDF24', 'https://pdf24.org', '超级好用的 PDF 工具合集'],
          ['Excalidraw', 'https://excalidraw.com', '手绘风格图表超简单'],
          ['tldraw', 'https://tldraw.com', '无限白板'],
          ['Dictation.io', 'https://dictation.io', '在线语音转文字'],
          ['Otter.ai', 'https://otter.ai', '会议录音自动转文字+摘要'],
          ['Descript', 'https://descript.com', '像改文字一样剪音频'],
          ['Loom', 'https://loom.com', '一键录屏+语音讲解'],
          ['Zapier', 'https://zapier.com', '无代码自动化神器'],
          ['n8n', 'https://n8n.io', '开源版 Zapier'],
          ['Remove.bg', 'https://remove.bg', '一键去图片背景'],
          ['LetsEnhance', 'https://letsenhance.io', '图片放大+清晰化'],
          ['Pixabay', 'https://pixabay.com', '免费商用图片/视频/音乐'],
          ['Mixkit', 'https://mixkit.co', '高质量免费素材视频'],
          ['Untools', 'https://untools.co', '各种思维决策工具'],
          ['roadmap.sh', 'https://roadmap.sh', '开发者学习路线图'],
          ['Learn X in Y Minutes', 'https://learnxinyminutes.com', '30 分钟速学一门语言'],
          ['DevDocs', 'https://devdocs.io', '所有编程文档一站查'],
          ['JSON Crack', 'https://jsoncrack.com', 'JSON 可视化神器'],
          ['Crontab.guru', 'https://crontab.guru', '定时任务表达式秒懂'],
          ['CopyChar', 'https://copychar.cc', '快速复制特殊符号'],
          ['Screenshot Guru', 'https://screenshot.guru', '截取任意网页长图'],
          ['WordCounter', 'https://wordcounter.net', '字数统计+阅读时间'],
          ['JustTheRecipe', 'https://justtherecipe.com', '跳过食谱废话直给步骤'],
          ['CamelCamelCamel', 'https://camelcamelcamel.com', '亚马逊历史价格追踪'],
          ['ManualsLib', 'https://manualslib.com', '查任何产品的说明书'],
          ['Omnifile', 'https://omnifile.co/zh-cn/', '在线文件管理转换工具'],
          ['Medio.cool', 'https://medio.cool', '视频去水印工具'],
          ['Student Frp', 'https://student.frp.gs', '国际学生证生成器'],
          ['Freedium', 'https://freedium.cfd', '突破 Medium 付费墙'],
          ['古人早就说过', 'https://gurensaid.com', '把网络热梗/流行语反查成意思相近的古诗文出处'],
        ],
      },
      {
        id: 'cat-social',
        key: 'social',
        name: 'Social',
        color: 'purple',
        sites: [
          ['Weibo', 'https://weibo.com', '微博'],
          ['X (Twitter)', 'https://x.com', 'Twitter'],
          ['Discord', 'https://discord.com', 'Discord'],
          ['知乎', 'https://zhihu.com', '知乎'],
          ['豆瓣', 'https://douban.com', '豆瓣'],
          ['Quora', 'https://quora.com', '国际问答社区'],
        ],
      },
      {
        id: 'cat-hardware',
        key: 'hardware',
        color: 'orange',
        sites: [
          ["Tom's Hardware", 'https://www.tomshardware.com/pc-components/', 'PC 硬件评测与选购指南'],
          ['dcheck.cn', 'https://dcheck.cn', '电脑检测：麦克风、摄像头、扬声器、键盘、鼠标、屏幕颜色，还能练打字、在线录音'],
        ],
      },
      {
        id: 'cat-trending',
        key: 'trending',
        color: 'teal',
        sites: [
          ['Hugging Face Daily Papers', 'https://huggingface.co/papers', '每天由社区投票推选的 AI 论文'],
          ['GitHub Trending', 'https://github.com/trending', 'GitHub 上今日最受关注的仓库'],
        ],
      },
    ]

    /** Materialize one built-in catalog entry as a board category. */
    function builtinCategory(spec) {
      return {
        id: spec.id,
        key: spec.key,
        name: spec.name ?? '',
        color: spec.color,
        sites: spec.sites.map(([title, url, note], index) => ({
          id: 'site-' + spec.key + '-' + String(index + 1),
          title,
          url,
          note,
          icon: '',
        })),
      }
    }

    /** Seed categories: every built-in category, in catalog order. */
    function seedBoard() {
      return { version: BOARD_VERSION, categories: BUILTIN_CATALOG.map(builtinCategory) }
    }

    /** Coerce stored data into the current board form; unknown values fall back to seeds. */
    function normalizeBoard(raw, t) {
      if (raw === null || typeof raw !== 'object' || !Array.isArray(raw.categories)) return seedBoard()
      const version = typeof raw.version === 'number' ? raw.version : 1
      const categories = []
      for (const entry of raw.categories) {
        if (entry === null || typeof entry !== 'object') continue
        const sites = []
        for (const site of Array.isArray(entry.sites) ? entry.sites : []) {
          if (site === null || typeof site !== 'object') continue
          if (typeof site.title !== 'string' || typeof site.url !== 'string') continue
          sites.push({
            id: typeof site.id === 'string' ? site.id : uid('site'),
            title: site.title,
            url: site.url,
            note: typeof site.note === 'string' ? site.note : '',
            icon: typeof site.icon === 'string' ? site.icon : '',
          })
        }
        categories.push({
          id: typeof entry.id === 'string' ? entry.id : uid('cat'),
          key: typeof entry.key === 'string' ? entry.key : '',
          name: typeof entry.name === 'string' ? entry.name : '',
          color: COLORS.includes(entry.color) ? entry.color : COLORS[categories.length % COLORS.length],
          sites,
        })
      }
      // Older boards gain the built-in categories they predate, once per version bump.
      return { version: BOARD_VERSION, categories: version < BOARD_VERSION ? mergeBuiltins(categories) : categories }
    }

    /**
     * Add built-in categories and sites a stored board predates, keeping user edits.
     * @param categories - normalized categories from the stored board.
     * @returns the merged categories in catalog order, followed by user categories.
     */
    function mergeBuiltins(categories) {
      const merged = categories.slice()
      for (const spec of BUILTIN_CATALOG) {
        const existing = merged.find(entry => entry.key === spec.key)
        if (existing === undefined) {
          merged.push(builtinCategory(spec))
          continue
        }
        if (existing.name === '' && typeof spec.name === 'string') existing.name = spec.name
        for (const site of builtinCategory(spec).sites) {
          if (existing.sites.some(entry => entry.url === site.url)) continue
          existing.sites.push(site)
        }
      }
      const rank = (entry) => {
        const index = BUILTIN_CATALOG.findIndex(spec => spec.key === entry.key)
        return index === -1 ? BUILTIN_CATALOG.length : index
      }
      return merged.sort((left, right) => rank(left) - rank(right))
    }

    /** Read the board from local storage; a missing or unreadable value falls back to the seeds. */
    function readBoard(t) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw === null || raw === '') return seedBoard()
        return normalizeBoard(JSON.parse(raw))
      } catch (error) {
        // Unreadable or blocked local storage: seeds still give a usable pad.
        console.warn('site-nav: ignored unreadable board', error)
        return seedBoard()
      }
    }

    /** Persist the board; quota or privacy-mode failures keep the in-memory copy usable. */
    function writeBoard(board) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
      } catch (error) {
        console.warn('site-nav: could not save the board', error)
      }
    }

    /** Built-in categories follow the interface language; user categories keep their name. */
    function categoryLabel(category, t) {
      if (typeof category.name === 'string' && category.name !== '') return category.name
      if (category.key === 'hardware') return t('catHardware')
      if (category.key === 'trending') return t('catTrending')
      return ''
    }

    /** The low-noise form of a URL shown under a site's title. */
    function hostOf(url) {
      try {
        const parsed = new URL(url)
        return parsed.host + (parsed.pathname !== '/' ? parsed.pathname : '')
      } catch (error) {
        // Not a parseable URL: show the raw text rather than nothing.
        return url
      }
    }

    /**
     * Icon URLs to try for one site, in descending quality: the site's own files
     * first, then favicon.im, which resolves the icon a page declares elsewhere.
     * @param url - the site address the icon belongs to.
     * @param custom - an icon URL the user set for this site, used before the rest.
     * @returns candidate icon URLs; empty when the address is unparseable.
     */
    function iconCandidates(url, custom) {
      const candidates = []
      if (typeof custom === 'string' && custom !== '') candidates.push(custom)
      try {
        const parsed = new URL(url)
        if (parsed.origin === 'null') return candidates
        candidates.push(
          parsed.origin + '/apple-touch-icon.png',
          parsed.origin + '/favicon.svg',
          parsed.origin + '/favicon.ico',
          'https://favicon.im/' + parsed.host + '?larger=true',
        )
      } catch (error) {
        // Unparseable address: keep only a user-set icon, or nothing.
      }
      return candidates
    }

    /** Accept a bare domain and require http(s); null means the text is not a usable address. */
    function normalizeUrl(input) {
      const text = input.trim()
      if (text === '') return null
      const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(text) ? text : 'https://' + text
      try {
        const parsed = new URL(candidate)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
        if (parsed.hostname.includes('.') === false) return null
        return parsed.href
      } catch (error) {
        // The URL constructor rejected the text: report it as invalid.
        return null
      }
    }

    /** One or two initials for a site's monogram. */
    function monogram(title) {
      const text = title.trim()
      if (text === '') return '?'
      const first = Array.from(text)[0]
      if (/^[a-zA-Z]$/.test(first)) {
        const words = text.split(/\s+/).filter(Boolean)
        return (words.length > 1 ? words[0][0] + words[1][0] : first).toUpperCase()
      }
      return first
    }

    /** Open one site in the browser; a blocked popup falls back to a synthetic link click. */
    function openSite(url) {
      const opened = window.open(url, '_blank', 'noopener,noreferrer')
      if (opened !== null) return
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.click()
    }

    // ---------------------------------------------------------------------
    // Glyphs
    // ---------------------------------------------------------------------

    /** Shared 20px stroke frame so every glyph reads at the same weight. */
    function Glyph(props) {
      return h('svg', {
        width: props.size,
        height: props.size,
        viewBox: '0 0 20 20',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: props.strokeWidth ?? 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
      }, props.children)
    }

    /** Compass rose: the plugin's own mark, used for the sidebar row and `/nav`. */
    function CompassGlyph(props) {
      const size = props !== null && typeof props?.size === 'number' ? props.size : 16
      return h(Glyph, { size },
        h('circle', { cx: 10, cy: 10, r: 7.6 }),
        h('path', { d: 'M13.2 6.8l-1.9 4.5-4.5 1.9 1.9-4.5z' }))
    }

    function SearchGlyph(props) {
      return h(Glyph, { size: props.size ?? 14 },
        h('circle', { cx: 8.8, cy: 8.8, r: 5.4 }),
        h('path', { d: 'M12.9 12.9l3.4 3.4' }))
    }

    function PlusGlyph(props) {
      return h(Glyph, { size: props.size ?? 14, strokeWidth: 1.8 },
        h('path', { d: 'M10 4.6v10.8M4.6 10h10.8' }))
    }

    function PencilGlyph(props) {
      return h(Glyph, { size: props.size ?? 14 },
        h('path', { d: 'M13.3 3.9l2.8 2.8-8.5 8.5-3.6.8.8-3.6z' }))
    }

    function TrashGlyph(props) {
      return h(Glyph, { size: props.size ?? 14 },
        h('path', { d: 'M4.4 6.1h11.2M8 6.1V4.4h4v1.7M6 6.1l.7 9.1h6.6l.7-9.1' }))
    }

    function ArrowUpRightGlyph(props) {
      return h(Glyph, { size: props.size ?? 14, strokeWidth: 1.7 },
        h('path', { d: 'M6.2 13.8L13.8 6.2M7.6 6.2h6.2v6.2' }))
    }

    function CloseGlyph(props) {
      return h(Glyph, { size: props.size ?? 12, strokeWidth: 1.7 },
        h('path', { d: 'M5.4 5.4l9.2 9.2M14.6 5.4l-9.2 9.2' }))
    }

    // ---------------------------------------------------------------------
    // Page
    // ---------------------------------------------------------------------

    /**
     * A site's own icon, walking its origin's icon files; the monogram shows until one loads.
     * @param props - the site's URL and title, plus the accent colour of its category.
     */
    function SiteIcon(props) {
      const [attempt, setAttempt] = useState(0)
      const [loaded, setLoaded] = useState(false)
      const candidates = useMemo(() => iconCandidates(props.url, props.icon), [props.url, props.icon])
      const current = attempt < candidates.length ? candidates[attempt] : null

      useEffect(() => {
        setAttempt(0)
        setLoaded(false)
      }, [props.url, props.icon])

      return h('span', {
        className: 'dsh-nav-badge' + (loaded ? ' dsh-nav-badge-icon' : ''),
        style: { '--nav-accent': props.accent },
        'aria-hidden': 'true',
      },
        loaded ? null : monogram(props.title),
        current === null
          ? null
          : h('img', {
              src: current,
              alt: '',
              loading: 'lazy',
              decoding: 'async',
              referrerPolicy: 'no-referrer',
              onLoad: () => setLoaded(true),
              onError: () => setAttempt(value => value + 1),
            }))
    }

    /**
     * One site card: monogram, title, address, note, and hover actions.
     * @param props - the site, its category colour, the translate function, and handlers.
     */
    function SiteCard(props) {
      const t = boundT
      const site = props.site
      const accent = COLOR_HEX[props.color] ?? COLOR_HEX.blue
      const pending = props.confirm
      const stop = event => event.stopPropagation()

      return h('div', {
        className: 'dsh-nav-card',
        role: 'link',
        tabIndex: 0,
        title: t('open'),
        style: { '--nav-accent': accent },
        onClick: () => openSite(site.url),
        onKeyDown: (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          openSite(site.url)
        },
      },
        h(SiteIcon, { url: site.url, icon: site.icon ?? '', title: site.title, accent }),
        h('div', { className: 'dsh-nav-card-main' },
          h('div', { className: 'dsh-nav-card-title' }, site.title),
          h('div', { className: 'dsh-nav-card-host' }, hostOf(site.url)),
          site.note === ''
            ? null
            : h('p', { className: 'dsh-nav-card-note' }, site.note)),
        h('div', { className: 'dsh-nav-card-actions' },
          h('button', {
            type: 'button',
            className: 'dsh-nav-card-action',
            title: t('open'),
            'aria-label': t('open'),
            onClick: (event) => { stop(event); openSite(site.url) },
          }, h(ArrowUpRightGlyph, null)),
          h('button', {
            type: 'button',
            className: 'dsh-nav-card-action',
            title: t('edit'),
            'aria-label': t('edit'),
            onClick: (event) => { stop(event); props.onEdit() },
          }, h(PencilGlyph, null)),
          h('button', {
            type: 'button',
            className: 'dsh-nav-card-action',
            'data-danger': pending ? '' : undefined,
            title: pending ? t('confirmDelete') : t('remove'),
            'aria-label': t('remove'),
            onClick: (event) => { stop(event); props.onDelete() },
          }, h(TrashGlyph, null))))
    }

    /**
     * Add or edit dialog: name, URL, category, and an optional note.
     * @param props - the draft being edited (or undefined when adding), category options, and callbacks.
     */
    function SiteDialog(props) {
      const t = boundT
      const editing = props.site !== undefined
      const [title, setTitle] = useState(editing ? props.site.title : '')
      const [url, setUrl] = useState(editing ? props.site.url : '')
      const [note, setNote] = useState(editing ? props.site.note : '')
      const [icon, setIcon] = useState(editing ? (props.site.icon ?? '') : '')
      const [categoryId, setCategoryId] = useState(props.categoryId)
      const [newCategory, setNewCategory] = useState('')
      const [error, setError] = useState('')
      const nameRef = useRef(null)

      useEffect(() => {
        if (nameRef.current !== null) nameRef.current.focus()
      }, [])

      useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            props.onClose()
          }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [props])

      function submit() {
        const named = title.trim()
        if (named === '') {
          setError(t('errName'))
          return
        }
        const address = normalizeUrl(url)
        if (address === null) {
          setError(t('errUrl'))
          return
        }
        const iconText = icon.trim()
        const iconUrl = iconText === '' ? '' : normalizeUrl(iconText)
        if (iconUrl === null) {
          setError(t('errIcon'))
          return
        }
        props.onSubmit({
          title: named,
          url: address,
          note: note.trim(),
          icon: iconUrl,
          categoryId: categoryId === '__new' ? '' : categoryId,
          newCategory: newCategory.trim(),
        })
      }

      return h('div', {
        className: 'dsh-nav-overlay',
        onMouseDown: (event) => { if (event.target === event.currentTarget) props.onClose() },
      },
        h('div', {
          className: 'dsh-nav-modal',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': editing ? t('dialogEdit') : t('dialogAdd'),
        },
          h('h2', { className: 'dsh-nav-modal-title' }, editing ? t('dialogEdit') : t('dialogAdd')),
          h('label', { className: 'dsh-nav-field' },
            h('span', { className: 'dsh-nav-field-label' }, t('fieldName')),
            h('input', {
              ref: nameRef,
              type: 'text',
              value: title,
              placeholder: t('namePlaceholder'),
              onChange: (event) => { setTitle(event.target.value); setError('') },
              onKeyDown: (event) => { if (event.key === 'Enter') submit() },
            })),
          h('label', { className: 'dsh-nav-field' },
            h('span', { className: 'dsh-nav-field-label' }, t('fieldUrl')),
            h('input', {
              type: 'text',
              value: url,
              placeholder: t('urlPlaceholder'),
              spellCheck: false,
              autoCapitalize: 'off',
              autoCorrect: 'off',
              onChange: (event) => { setUrl(event.target.value); setError('') },
              onKeyDown: (event) => { if (event.key === 'Enter') submit() },
            })),
          h('label', { className: 'dsh-nav-field' },
            h('span', { className: 'dsh-nav-field-label' }, t('fieldIcon')),
            h('input', {
              type: 'text',
              value: icon,
              placeholder: t('iconPlaceholder'),
              spellCheck: false,
              onChange: (event) => { setIcon(event.target.value); setError('') },
            })),
          h('label', { className: 'dsh-nav-field' },
            h('span', { className: 'dsh-nav-field-label' }, t('fieldCategory')),
            h('select', {
              value: categoryId,
              onChange: (event) => setCategoryId(event.target.value),
            },
              props.categories.map(category => h('option', {
                key: category.id,
                value: category.id,
              }, categoryLabel(category, t))),
              h('option', { value: '__new' }, '+ ' + t('newCategory')))),
          categoryId === '__new'
            ? h('label', { className: 'dsh-nav-field' },
                h('span', { className: 'dsh-nav-field-label' }, t('categoryNamePlaceholder')),
                h('input', {
                  type: 'text',
                  value: newCategory,
                  placeholder: t('categoryNamePlaceholder'),
                  onChange: (event) => setNewCategory(event.target.value),
                }))
            : null,
          h('label', { className: 'dsh-nav-field' },
            h('span', { className: 'dsh-nav-field-label' }, t('fieldNote')),
            h('textarea', {
              rows: 2,
              value: note,
              placeholder: t('notePlaceholder'),
              onChange: (event) => setNote(event.target.value),
            })),
          error === '' ? null : h('p', { className: 'dsh-nav-modal-error' }, error),
          h('div', { className: 'dsh-nav-modal-actions' },
            h('button', {
              type: 'button',
              className: 'dsh-nav-btn',
              onClick: props.onClose,
            }, t('cancel')),
            h('button', {
              type: 'button',
              className: 'dsh-nav-btn dsh-nav-btn-primary',
              onClick: submit,
            }, t('save')))))
    }

    /** The main-column panel: category rail, searchable site grid, and the add/edit dialog. */
    function SiteNavPage() {
      const t = boundT
      const [board, setBoard] = useState(() => readBoard(t))
      const [filter, setFilter] = useState('all')
      const [query, setQuery] = useState('')
      const [dialog, setDialog] = useState(null)
      const [confirm, setConfirm] = useState('')
      const [railAdd, setRailAdd] = useState(false)
      const [railDraft, setRailDraft] = useState('')
      const railInputRef = useRef(null)

      useEffect(() => {
        if (confirm === '') return undefined
        const timer = window.setTimeout(() => setConfirm(''), 3000)
        return () => window.clearTimeout(timer)
      }, [confirm])

      useEffect(() => {
        if (railAdd && railInputRef.current !== null) railInputRef.current.focus()
      }, [railAdd])

      function commit(next) {
        setBoard(next)
        writeBoard(next)
      }

      const total = board.categories.reduce((sum, category) => sum + category.sites.length, 0)
      const needle = query.trim().toLowerCase()

      const visible = useMemo(() => {
        return board.categories
          .filter(category => filter === 'all' || category.id === filter)
          .map(category => {
            const sites = needle === ''
              ? category.sites
              : category.sites.filter(site => [site.title, site.url, site.note, categoryLabel(category, t)]
                  .some(value => (value ?? '').toLowerCase().includes(needle)))
            return { category, sites }
          })
      }, [board, filter, needle, t])

      const shown = visible.reduce((sum, entry) => sum + entry.sites.length, 0)

      function createCategory(name) {
        const trimmed = name.trim()
        if (trimmed === '') return null
        const category = {
          id: uid('cat'),
          key: '',
          name: trimmed,
          color: COLORS[board.categories.length % COLORS.length],
          sites: [],
        }
        commit({ version: BOARD_VERSION, categories: [...board.categories, category] })
        return category
      }

      function submitSite(draft) {
        let categories = board.categories
        let targetId = draft.categoryId

        if (draft.newCategory !== '') {
          const created = createCategory(draft.newCategory)
          if (created !== null) {
            categories = [...categories, created]
            targetId = created.id
          }
        }
        if (targetId === '' || categories.every(category => category.id !== targetId)) {
          targetId = categories[0]?.id ?? ''
        }
        if (targetId === '') {
          const fallback = {
            id: uid('cat'),
            key: '',
            name: t('defaultCategory'),
            color: COLORS[0],
            sites: [],
          }
          categories = [...categories, fallback]
          targetId = fallback.id
        }

        if (dialog !== null && dialog.siteId !== '') {
          const moving = categories.map((category) => {
            const held = category.sites.filter(site => site.id === dialog.siteId)
            if (held.length === 0) return category
            const rest = category.sites.filter(site => site.id !== dialog.siteId)
            return { ...category, sites: rest }
          })
          commit({
            version: BOARD_VERSION,
            categories: moving.map(category => category.id === targetId
              ? {
                  ...category,
                  sites: [...category.sites, { id: dialog.siteId, title: draft.title, url: draft.url, note: draft.note, icon: draft.icon }],
                }
              : category),
          })
        } else {
          commit({
            version: BOARD_VERSION,
            categories: categories.map(category => category.id === targetId
              ? {
                  ...category,
                  sites: [...category.sites, { id: uid('site'), title: draft.title, url: draft.url, note: draft.note, icon: draft.icon }],
                }
              : category),
          })
        }
        setDialog(null)
      }

      function deleteSite(siteId) {
        if (confirm !== 'site:' + siteId) {
          setConfirm('site:' + siteId)
          return
        }
        commit({
          version: BOARD_VERSION,
          categories: board.categories.map(category => ({
            ...category,
            sites: category.sites.filter(site => site.id !== siteId),
          })),
        })
        setConfirm('')
      }

      function deleteCategory(categoryId) {
        if (confirm !== 'cat:' + categoryId) {
          setConfirm('cat:' + categoryId)
          return
        }
        commit({
          version: BOARD_VERSION,
          categories: board.categories.filter(category => category.id !== categoryId),
        })
        if (filter === categoryId) setFilter('all')
        setConfirm('')
      }

      function submitRailCategory() {
        const created = createCategory(railDraft)
        setRailDraft('')
        setRailAdd(false)
        if (created !== null) setFilter(created.id)
      }

      const rail = h('nav', { className: 'dsh-nav-rail', 'aria-label': t('panel') },
        h('button', {
          type: 'button',
          className: 'dsh-nav-rail-row',
          'data-active': filter === 'all' ? '' : undefined,
          onClick: () => setFilter('all'),
        },
          h('span', { className: 'dsh-nav-rail-glyph' }, h(CompassGlyph, { size: 15 })),
          h('span', { className: 'dsh-nav-rail-text' }, t('all')),
          h('span', { className: 'dsh-nav-rail-count' }, String(total))),
        h('div', { className: 'dsh-nav-rail-label' }, t('subtitle')),
        board.categories.map(category => h('div', {
          key: category.id,
          className: 'dsh-nav-rail-item',
        },
          h('button', {
            type: 'button',
            className: 'dsh-nav-rail-row',
            'data-active': filter === category.id ? '' : undefined,
            onClick: () => setFilter(category.id),
          },
            h('span', {
              className: 'dsh-nav-dot',
              style: { '--nav-accent': COLOR_HEX[category.color] ?? COLOR_HEX.blue },
            }),
            h('span', { className: 'dsh-nav-rail-text' }, categoryLabel(category, t)),
            h('span', { className: 'dsh-nav-rail-count' }, String(category.sites.length))),
          h('button', {
            type: 'button',
            className: 'dsh-nav-rail-remove',
            'data-danger': confirm === 'cat:' + category.id ? '' : undefined,
            title: confirm === 'cat:' + category.id ? t('confirmDelete') : t('deleteCategory'),
            'aria-label': t('deleteCategory'),
            onClick: () => deleteCategory(category.id),
          }, h(CloseGlyph, { size: 11 })))),
        railAdd
          ? h('div', { className: 'dsh-nav-rail-add' },
              h('input', {
                ref: railInputRef,
                type: 'text',
                value: railDraft,
                placeholder: t('categoryNamePlaceholder'),
                'aria-label': t('newCategory'),
                onChange: event => setRailDraft(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') submitRailCategory()
                  if (event.key === 'Escape') { setRailAdd(false); setRailDraft('') }
                },
              }))
          : h('button', {
              type: 'button',
              className: 'dsh-nav-rail-new',
              onClick: () => setRailAdd(true),
            },
              h(PlusGlyph, { size: 13 }),
              h('span', null, t('newCategory'))))

      const sections = visible.map(entry => entry.sites.length === 0 ? null : h('section', {
        key: entry.category.id,
        className: 'dsh-nav-section',
      },
        h('header', { className: 'dsh-nav-section-head' },
          h('span', {
            className: 'dsh-nav-dot',
            style: { '--nav-accent': COLOR_HEX[entry.category.color] ?? COLOR_HEX.blue },
          }),
          h('h2', { className: 'dsh-nav-section-title' }, categoryLabel(entry.category, t)),
          h('span', { className: 'dsh-nav-section-count' }, t('sitesCount').replace('{n}', String(entry.sites.length)))),
        h('div', { className: 'dsh-nav-grid' },
          entry.sites.map(site => h(SiteCard, {
            key: site.id,
            site,
            color: entry.category.color,
            confirm: confirm === 'site:' + site.id,
            onEdit: () => setDialog({ siteId: site.id, categoryId: entry.category.id }),
            onDelete: () => deleteSite(site.id),
          })))))

      const nothing = shown === 0
      const emptyBlock = nothing
        ? h('div', { className: 'dsh-nav-empty' },
            h('h3', { className: 'dsh-nav-empty-title' }, needle === '' ? t('emptyTitle') : t('noMatches')),
            h('p', { className: 'dsh-nav-empty-hint' }, needle === '' ? t('emptyHint') : t('noMatchesHint')),
            needle === ''
              ? h('button', {
                  type: 'button',
                  className: 'dsh-nav-btn dsh-nav-btn-primary',
                  onClick: () => setDialog({ siteId: '', categoryId: board.categories[0]?.id ?? '__new' }),
                }, t('addSite'))
              : null)
        : null

      const editingSite = dialog === null || dialog.siteId === ''
        ? undefined
        : board.categories.flatMap(category => category.sites).find(site => site.id === dialog.siteId)

      return h('div', { className: 'dsh-nav-root' },
        h('style', null, CSS),
        h('header', { className: 'dsh-nav-toolbar' },
          h('h1', { className: 'dsh-nav-heading' },
            h('span', { className: 'dsh-nav-title' }, t('panel')),
            h('span', { className: 'dsh-nav-subtitle' }, t('subtitle'))),
          h('div', { className: 'dsh-nav-spacer' }),
          h('label', { className: 'dsh-nav-search' },
            h(SearchGlyph, { size: 14 }),
            h('input', {
              type: 'text',
              value: query,
              placeholder: t('search'),
              'aria-label': t('search'),
              onChange: event => setQuery(event.target.value),
              onKeyDown: (event) => {
                if (event.key !== 'Escape') return
                event.stopPropagation()
                setQuery('')
              },
            }),
            query === ''
              ? null
              : h('button', {
                  type: 'button',
                  className: 'dsh-nav-search-clear',
                  title: t('clearSearch'),
                  'aria-label': t('clearSearch'),
                  onClick: () => setQuery(''),
                }, h(CloseGlyph, { size: 11 }))),
          h('button', {
            type: 'button',
            className: 'dsh-nav-btn dsh-nav-btn-primary',
            onClick: () => setDialog({
              siteId: '',
              categoryId: filter === 'all' ? (board.categories[0]?.id ?? '__new') : filter,
            }),
          },
            h(PlusGlyph, { size: 14 }),
            h('span', null, t('addSite')))),
        h('div', { className: 'dsh-nav-body' },
          rail,
          h('main', { className: 'dsh-nav-pane' },
            h('div', { className: 'dsh-nav-pane-scroll' }, sections, emptyBlock))),
        dialog === null
          ? null
          : h(SiteDialog, {
              site: editingSite,
              categoryId: dialog.categoryId,
              categories: board.categories,
              onClose: () => setDialog(null),
              onSubmit: submitSite,
            }))
    }

    // ---------------------------------------------------------------------
    // Styles
    // ---------------------------------------------------------------------

    const CSS = `
.dsh-nav-root {
  position: relative;
  display: flex; flex-direction: column;
  width: 100%; height: 100%;
  min-width: 0; min-height: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 14px; line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.dsh-nav-toolbar {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 12px;
  flex: none; box-sizing: border-box; min-height: 64px;
  padding: calc(var(--dsh-frame-top-clearance, 0px) + 14px) clamp(16px, 3vw, 32px) 14px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent);
  backdrop-filter: blur(18px) saturate(160%);
}
.dsh-nav-heading { display: flex; align-items: baseline; gap: 8px; min-width: 0; margin: 0; flex: none; }
.dsh-nav-title { font-size: 20px; line-height: 28px; font-weight: 600; letter-spacing: -0.015em; }
.dsh-nav-subtitle { font-size: 12px; line-height: 18px; letter-spacing: 0.02em; color: var(--dsw-alias-label-secondary); }
.dsh-nav-spacer { flex: 1; min-width: 8px; }
.dsh-nav-search {
  position: relative;
  display: flex; align-items: center; gap: 6px;
  flex: none; box-sizing: border-box;
  width: clamp(140px, 20vw, 220px); height: 30px; padding: 0 8px;
  border: 0.5px solid var(--dsw-alias-border-l1); border-radius: 9px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
  transition: border-color 140ms ease, background 140ms ease;
}
.dsh-nav-search:focus-within {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 34%, transparent);
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, transparent);
}
.dsh-nav-search svg { flex: none; }
.dsh-nav-search input {
  flex: 1; min-width: 0; height: 100%;
  padding: 0; border: 0; outline: 0; background: transparent;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px;
}
.dsh-nav-search input::placeholder { color: var(--dsw-alias-label-secondary); }
.dsh-nav-search-clear {
  display: grid; place-items: center; flex: none;
  width: 18px; height: 18px; padding: 0; border: 0; border-radius: 5px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.dsh-nav-search-clear:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dsh-nav-btn {
  display: inline-flex; align-items: center; gap: 5px;
  flex: none; box-sizing: border-box; height: 30px; padding: 0 12px;
  border: 0.5px solid var(--dsw-alias-border-l1); border-radius: 9px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 13px; cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}
.dsh-nav-btn:focus-visible { outline: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent); outline-offset: 1px; }
.dsh-nav-btn-primary { border-color: transparent; background: var(--dsw-alias-brand-primary); color: #fff; }
.dsh-nav-btn-primary:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 86%, #000 14%); }
.dsh-nav-body { display: flex; flex: 1; min-height: 0; }
.dsh-nav-rail {
  flex: none; display: flex; flex-direction: column;
  width: 214px; min-height: 0; padding: 10px 8px 18px;
  border-right: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-interactive-bg-hover);
  overflow-y: auto; scrollbar-width: thin;
}
.dsh-nav-rail-label {
  margin: 12px 8px 4px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
  color: var(--dsw-alias-label-secondary);
}
.dsh-nav-rail-item { position: relative; display: flex; align-items: center; margin: 0 0 2px; }
.dsh-nav-rail-row {
  display: flex; align-items: center; gap: 9px;
  flex: 1; min-width: 0; height: 34px; padding: 0 8px;
  border: 0; border-radius: 9px; background: transparent;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; text-align: left; cursor: pointer;
  transition: background 120ms ease;
}
.dsh-nav-rail-row:focus-visible { outline: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent); outline-offset: -2px; }
.dsh-nav-rail-row[data-active] {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent);
  font-weight: 600;
}
@media (hover: hover) {
  .dsh-nav-rail-row:hover { background: var(--dsw-alias-bg-layer-2); }
  .dsh-nav-rail-new:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
  .dsh-nav-card:hover { border-color: color-mix(in srgb, var(--nav-accent, var(--dsw-alias-brand-primary)) 40%, var(--dsw-alias-border-l1)); background: var(--dsw-alias-bg-layer-2); }
  .dsh-nav-btn:hover { background: var(--dsw-alias-bg-layer-2); }
  .dsh-nav-card-action:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
  .dsh-nav-rail-item:hover .dsh-nav-rail-remove { opacity: 1; }
  .dsh-nav-card:hover .dsh-nav-card-actions { opacity: 1; }
}
.dsh-nav-rail-glyph { display: grid; place-items: center; flex: none; width: 16px; color: var(--dsw-alias-label-secondary); }
.dsh-nav-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--nav-accent, var(--dsw-alias-brand-primary)); }
.dsh-nav-rail-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-nav-rail-count { flex: none; font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.dsh-nav-rail-remove {
  display: grid; place-items: center; flex: none;
  width: 20px; height: 20px; margin-left: 2px; padding: 0;
  border: 0; border-radius: 6px; background: transparent;
  color: var(--dsw-alias-label-secondary); cursor: pointer; opacity: 0;
}
.dsh-nav-rail-remove[data-danger] { opacity: 1; color: var(--dsw-alias-state-error-primary); }
.dsh-nav-rail-remove:focus-visible { opacity: 1; outline: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent); outline-offset: -2px; }
.dsh-nav-rail-add { margin-top: 6px; padding: 0 2px; }
.dsh-nav-rail-add input {
  width: 100%; box-sizing: border-box; height: 30px; padding: 0 8px;
  border: 0.5px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 42%, transparent);
  border-radius: 8px; outline: 0; background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px;
}
.dsh-nav-rail-new {
  display: flex; align-items: center; gap: 6px;
  margin-top: 6px; padding: 0 8px; height: 30px; width: 100%; box-sizing: border-box;
  border: 0; border-radius: 9px; background: transparent;
  color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; cursor: pointer;
}
.dsh-nav-pane { display: flex; flex: 1; min-width: 0; min-height: 0; }
.dsh-nav-pane-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 20px clamp(16px, 3vw, 32px) 32px; }
.dsh-nav-section { margin-bottom: 26px; }
.dsh-nav-section:last-of-type { margin-bottom: 0; }
.dsh-nav-section-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.dsh-nav-section-title { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; }
.dsh-nav-section-count { font-size: 11px; color: var(--dsw-alias-label-secondary); }
.dsh-nav-grid { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(248px, 1fr)); }
.dsh-nav-card {
  position: relative; display: flex; align-items: flex-start; gap: 10px;
  min-width: 0; padding: 12px; box-sizing: border-box;
  border: 0.5px solid var(--dsw-alias-border-l1); border-radius: 11px;
  background: var(--dsw-alias-bg-layer-1);
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
.dsh-nav-card:focus-visible { outline: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent); outline-offset: 1px; }
.dsh-nav-badge {
  display: grid; place-items: center; flex: none;
  width: 32px; height: 32px; border-radius: 9px;
  background: color-mix(in srgb, var(--nav-accent) 15%, transparent);
  color: var(--nav-accent);
  font-size: 13px; font-weight: 600; letter-spacing: -0.02em;
}
.dsh-nav-badge { position: relative; overflow: hidden; }
.dsh-nav-badge img { position: absolute; inset: 0; margin: auto; width: 20px; height: 20px; object-fit: contain; border-radius: 4px; opacity: 0; }
.dsh-nav-badge-icon { background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); }
.dsh-nav-badge-icon img { opacity: 1; }
.dsh-nav-card-main { flex: 1; min-width: 0; padding-right: 58px; }
.dsh-nav-card-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 600; }
.dsh-nav-card-host { margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.dsh-nav-card-note {
  margin: 5px 0 0;
  font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.dsh-nav-card-actions { position: absolute; top: 9px; right: 8px; display: flex; gap: 1px; opacity: 0; transition: opacity 120ms ease; }
.dsh-nav-card:focus-within .dsh-nav-card-actions { opacity: 1; }
.dsh-nav-card-action {
  display: grid; place-items: center;
  width: 22px; height: 22px; padding: 0;
  border: 0; border-radius: 6px; background: transparent;
  color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.dsh-nav-card-action[data-danger] { color: var(--dsw-alias-state-error-primary); }
@media (hover: none) {
  .dsh-nav-rail-remove { opacity: 1; }
  .dsh-nav-card-actions { opacity: 1; }
}
.dsh-nav-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 260px; text-align: center; }
.dsh-nav-empty-title { margin: 8px 0 0; font-size: 14px; font-weight: 600; }
.dsh-nav-empty-hint { margin: 0 0 8px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.dsh-nav-overlay {
  position: fixed; inset: 0; z-index: 40;
  display: grid; place-items: center;
  background: color-mix(in srgb, #000 26%, transparent);
  backdrop-filter: blur(2px);
}
.dsh-nav-modal {
  width: min(420px, calc(100vw - 48px));
  max-height: calc(100vh - 96px); overflow-y: auto;
  padding: 18px 18px 14px;
  border: 0.5px solid var(--dsw-alias-border-l1); border-radius: 13px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 18px 48px color-mix(in srgb, #000 22%, transparent);
  color: var(--dsw-alias-label-primary);
}
.dsh-nav-modal-title { margin: 0 0 12px; font-size: 14px; font-weight: 600; }
.dsh-nav-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
.dsh-nav-field-label { font-size: 11px; color: var(--dsw-alias-label-secondary); }
.dsh-nav-field input, .dsh-nav-field select, .dsh-nav-field textarea {
  width: 100%; box-sizing: border-box; padding: 6px 9px;
  border: 0.5px solid var(--dsw-alias-border-l1); border-radius: 8px;
  background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 13px; outline: 0;
}
.dsh-nav-field input, .dsh-nav-field select { height: 30px; }
.dsh-nav-field textarea { resize: vertical; min-height: 54px; }
.dsh-nav-field input:focus, .dsh-nav-field select:focus, .dsh-nav-field textarea:focus {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 42%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent);
}
.dsh-nav-modal-error { margin: 0 0 10px; font-size: 12px; color: var(--dsw-alias-state-error-primary); }
.dsh-nav-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
`

    // ---------------------------------------------------------------------
    // Plugin
    // ---------------------------------------------------------------------

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const locale = ctx.locale
        boundT = locale.bind(NS)
        ctx.effect(() => locale.register(NS, 'en', EN), 'site-nav: english copy')
        ctx.effect(() => locale.register(NS, 'zh', ZH), 'site-nav: chinese copy')

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 16,
          locale: NS,
          label: () => boundT('panel'),
        }, CompassGlyph))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, SiteNavPage))

        // The composer trigger is optional: profiles without the command UI keep
        // the sidebar page and simply have no `/nav` row.
        ctx.inject(['commandUi'], (scope) => {
          scope.effect(() => scope.commandUi.register({
            name: 'nav',
            label: () => boundT('commandLabel'),
            description: () => boundT('commandDescription'),
            icon: CompassGlyph,
            available: () => true,
            ui: {
              kind: 'popupSelect',
              searchMode: 'fuzzy-label',
              searchLabels: () => ({
                placeholder: boundT('commandSearch'),
                empty: boundT('commandEmpty'),
                noResults: boundT('commandNoResults'),
              }),
              options: async () => {
                const board = readBoard(boundT)
                const rows = []
                for (const category of board.categories) {
                  for (const site of category.sites) {
                    rows.push({
                      id: site.id,
                      label: site.title,
                      detail: hostOf(site.url),
                      group: { name: category.id, label: categoryLabel(category, boundT) },
                    })
                  }
                }
                return rows
              },
              onSelect: (option) => {
                const board = readBoard(boundT)
                for (const category of board.categories) {
                  const site = category.sites.find(entry => entry.id === option.id)
                  if (site !== undefined) {
                    openSite(site.url)
                    return
                  }
                }
              },
            },
          }), 'site-nav: /nav command')
        })
      },
    }
  },
})
