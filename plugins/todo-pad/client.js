/**
 * Todo — a Microsoft-To-Do-style task pad in the left sidebar.
 *
 * Structure: a rail of smart views (My day / Important / Planned / All tasks)
 * and color-coded lists (Work, Personal, Long-term, plus user lists created
 * through a name-and-color dialog); a task pane with date groups, checkable
 * rows, inline add; and a right-hand detail pane for the due date, list,
 * five-star importance, My day membership, note, reminder, and deletion.
 *
 * Reminders are local: every half minute the page looks for tasks due within
 * the lead window (default 3 days) or already overdue, shows an in-app banner,
 * and — when system notifications are permitted — posts one browser
 * notification per task per day.
 *
 * Visual language: the host's theme tokens plus Apple-style typography, spacing,
 * hairlines, and frosted surfaces.
 */

window.__ModuleLoader__.load({
  id: '@local/todo-pad',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useMemo, useRef, useState } = React

    const NS = 'todo'
    const PANEL_ID = 'todo'
    const STORAGE_KEY = 'dsh-todo.board.v2'
    const LEGACY_KEY = 'dsh-todo.memos.v1'
    /** The eight preset list colors offered by the new-list dialog. */
    const COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink']
    /** Apple system palette used for list tiles, accents, and check fills. */
    const COLOR_HEX = {
      red: '#FF3B30',
      orange: '#FF9F0A',
      yellow: '#FFCC00',
      green: '#34C759',
      teal: '#30B0C7',
      blue: '#0A84FF',
      purple: '#BF5AF2',
      pink: '#FF375F',
      gray: '#8E8E93',
    }
    /** Colors whose tile needs dark ink to stay legible. */
    const DARK_INK_COLORS = new Set(['yellow'])
    /** Star color for the five-level importance marker. */
    const STAR_COLOR = '#FF9F0A'

    const EN = {
      panel: 'Todo',
      subtitle: 'Tasks',
      myDay: 'My day',
      important: 'Important',
      planned: 'Planned',
      all: 'All tasks',
      lists: 'Lists',
      newList: 'New list',
      createList: 'Create list',
      listNamePlaceholder: 'List name',
      listColor: 'Color',
      addTask: 'Add a task',
      addTo: 'to {name}',
      search: 'Search tasks',
      clearSearch: 'Clear search',
      listWork: 'Work',
      listPersonal: 'Personal',
      listLongTerm: 'Long-term',
      seedWork: "Plan this week's work",
      seedPersonal: 'Book a check-up',
      seedPlan: 'Finish a long-form book',
      untitled: 'Untitled task',
      openCount: '{n} open',
      completedCount: '{n} completed',
      clearCompleted: 'Clear completed',
      deleteList: 'Delete list',
      confirmDeleteList: 'Click again to delete',
      dueToday: 'Due today',
      dueTomorrow: 'Due tomorrow',
      dueInDays: 'Due in {n} days',
      overdueBy: 'Overdue by {n} days',
      noDue: 'No due date',
      group_overdue: 'Overdue',
      group_today: 'Today',
      group_tomorrow: 'Tomorrow',
      group_week: 'This week',
      group_later: 'Later',
      group_none: 'No date',
      emptyTitle: 'Nothing here yet',
      emptyHint: 'Add a task below, or pick another list.',
      emptyMyDay: 'Nothing planned for today',
      emptyMyDayHint: 'Open All tasks and add what you want to get done today.',
      emptyImportant: 'No starred tasks',
      emptyImportantHint: 'Star a task up to five times to show how much it matters.',
      emptyPlanned: 'No dated tasks',
      emptyPlannedHint: 'Give a task a due date and it shows up here.',
      importance: 'Importance',
      noStars: 'No stars',
      starLevel: '{n} of 5 stars',
      addToMyDay: 'Add to My day',
      removeFromMyDay: 'Remove from My day',
      detailTitle: 'Details',
      titlePlaceholder: 'Task title',
      notePlaceholder: 'Add a note',
      dueLabel: 'Due date',
      listLabel: 'List',
      remindLabel: 'Remind me before it is due',
      deleteTask: 'Delete task',
      toggleTask: 'Mark complete',
      today: 'Today',
      tomorrow: 'Tomorrow',
      nextWeek: 'Next week',
      clearDue: 'Clear',
      reminders: 'Reminders',
      remindMaster: 'Due-date reminders',
      leadLabel: 'Remind ahead',
      daysUnit: '{n} days',
      permissionGranted: 'System notifications are on',
      permissionDenied: 'Notifications are blocked in this browser',
      permissionAsk: 'Enable system notifications',
      permissionUnsupported: 'System notifications are unavailable here',
      remindHint: 'Notifications are sent only while this page is open.',
      notifyDueTitle: 'Due soon',
      notifyOverdueTitle: 'Overdue',
      notifyDueBody: '“{title}” is due {when}',
      notifyOverdueBody: '“{title}” is {n} days overdue',
      bannerTitle: '{n} tasks need attention',
      whenToday: 'today',
      whenTomorrow: 'tomorrow',
      whenInDays: 'in {n} days',
      dismiss: 'Dismiss',
      editedAt: 'Edited {time}',
      listEmptyWarning: 'At least one list is required',
      collapse: 'Collapse',
      expand: 'Expand',
      pickDate: 'Pick a date',
      timeLabel: 'Time',
      lockList: 'Lock list',
      unlockList: 'Unlock list',
      lockedTitle: '“{name}” is locked',
      lockedHint: 'Enter the password to see this list’s tasks.',
      unlockAction: 'Unlock',
      setPasswordTitle: 'Protect “{name}”',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm password',
      passwordHint: 'The password is stored in this browser as a hash. It hides the list; it does not encrypt the tasks.',
      savePassword: 'Protect list',
      wrongPassword: 'Wrong password',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Use at least 4 characters',
      managePasswordTitle: '“{name}” is protected',
      lockNow: 'Lock now',
      removePassword: 'Remove password',
      locked: 'Locked',
      cancel: 'Cancel',
      confirmDeleteTask: 'Click again to delete',
      confirmClear: 'Confirm clear?',
      calendarOpen: 'Open calendar',
      color_red: 'Red',
      color_orange: 'Orange',
      color_yellow: 'Yellow',
      color_green: 'Green',
      color_teal: 'Teal',
      color_blue: 'Blue',
      color_purple: 'Purple',
      color_pink: 'Pink',
    }

    const ZH = {
      panel: 'Todo',
      subtitle: '待办',
      all: '所有任务',
      myDay: '我的一天',
      important: '重要',
      planned: '计划中',
      lists: '清单',
      newList: '新建清单',
      createList: '创建清单',
      listNamePlaceholder: '清单名称',
      listColor: '颜色',
      addTask: '添加任务',
      addTo: '添加到 {name}',
      search: '搜索任务',
      clearSearch: '清除搜索',
      listWork: '工作',
      listPersonal: '私人',
      listLongTerm: '长期计划',
      seedWork: '整理这周的工作清单',
      seedPersonal: '预约一次体检',
      seedPlan: '读完一本专业书',
      untitled: '未命名任务',
      openCount: '{n} 项待完成',
      completedCount: '{n} 项已完成',
      clearCompleted: '清除已完成',
      deleteList: '删除列表',
      confirmDeleteList: '再次点击删除',
      dueToday: '今天到期',
      dueTomorrow: '明天到期',
      dueInDays: '{n} 天后到期',
      overdueBy: '逾期 {n} 天',
      noDue: '无截止日期',
      group_overdue: '逾期',
      group_today: '今天',
      group_tomorrow: '明天',
      group_week: '本周内',
      group_later: '以后',
      group_none: '无日期',
      emptyTitle: '这里还没有任务',
      emptyHint: '在下方添加任务，或切换到别的清单。',
      emptyMyDay: '今天还没有安排',
      emptyMyDayHint: '打开「所有任务」，把今天想完成的任务加进来。',
      emptyImportant: '还没有标星任务',
      emptyImportantHint: '给任务标 1 到 5 星，表示它的重要程度。',
      emptyPlanned: '还没有带日期的任务',
      emptyPlannedHint: '给任务设置截止日期，就会出现在这里。',
      importance: '重要性',
      noStars: '未标星',
      starLevel: '5 星中的 {n} 星',
      addToMyDay: '添加到我的一天',
      removeFromMyDay: '从我的一天移除',
      detailTitle: '详情',
      titlePlaceholder: '任务标题',
      notePlaceholder: '添加备注',
      dueLabel: '截止日期',
      listLabel: '所属列表',
      remindLabel: '截止前提醒我',
      deleteTask: '删除任务',
      toggleTask: '标记完成',
      today: '今天',
      tomorrow: '明天',
      nextWeek: '下周',
      clearDue: '清除',
      reminders: '提醒',
      remindMaster: '截止日期提醒',
      leadLabel: '提前提醒',
      daysUnit: '{n} 天',
      permissionGranted: '系统通知已开启',
      permissionDenied: '浏览器已阻止通知',
      permissionAsk: '开启系统通知',
      permissionUnsupported: '当前环境不支持系统通知',
      remindHint: '通知只在页面打开时发送。',
      notifyDueTitle: '临近截止',
      notifyOverdueTitle: '任务已逾期',
      notifyDueBody: '「{title}」{when}到期',
      notifyOverdueBody: '「{title}」已逾期 {n} 天',
      bannerTitle: '{n} 项任务需要处理',
      whenToday: '今天',
      whenTomorrow: '明天',
      whenInDays: '{n} 天后',
      dismiss: '关闭',
      editedAt: '更新于 {time}',
      listEmptyWarning: '至少保留一个列表',
      collapse: '收起',
      expand: '展开',
      pickDate: '选择日期',
      timeLabel: '时间',
      lockList: '锁定列表',
      unlockList: '解锁列表',
      lockedTitle: '「{name}」已锁定',
      lockedHint: '输入密码后查看该列表的任务。',
      unlockAction: '解锁',
      setPasswordTitle: '为「{name}」设置密码',
      passwordLabel: '密码',
      confirmPasswordLabel: '确认密码',
      passwordHint: '密码只以哈希形式保存在本机浏览器，用来遮挡列表，不加密任务内容。',
      savePassword: '保护列表',
      wrongPassword: '密码不正确',
      passwordMismatch: '两次输入不一致',
      passwordTooShort: '至少 4 位字符',
      managePasswordTitle: '「{name}」已受保护',
      lockNow: '立即锁定',
      removePassword: '移除密码',
      locked: '已锁定',
      cancel: '取消',
      confirmDeleteTask: '再次点击删除',
      confirmClear: '确认清除？',
      calendarOpen: '打开日历',
      color_red: '红色',
      color_orange: '橙色',
      color_yellow: '黄色',
      color_green: '绿色',
      color_teal: '青色',
      color_blue: '蓝色',
      color_purple: '紫色',
      color_pink: '粉色',
    }

    const CSS = `
.dsh-todo-root {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  background:
    radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, transparent) 0%, transparent 58%),
    var(--dsw-alias-bg-base);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.dsh-todo-toolbar {
  position: relative;
  z-index: 2;
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  min-height: 64px;
  padding: calc(var(--dsh-frame-top-clearance, 0px) + 14px) clamp(16px, 3vw, 32px) 14px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent);
  backdrop-filter: blur(18px) saturate(160%);
}

.dsh-todo-heading {
  flex: none;
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  margin: 0;
}

.dsh-todo-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  letter-spacing: -0.015em;
}

.dsh-todo-subtitle {
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
  letter-spacing: 0.02em;
}

.dsh-todo-spacer { flex: 1; min-width: 8px; }

.dsh-todo-search {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  width: clamp(140px, 20vw, 220px);
  height: 30px;
  padding: 0 8px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
  transition: border-color 140ms ease, background 140ms ease;
}

.dsh-todo-search:focus-within {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 34%, transparent);
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, transparent);
}

.dsh-todo-search svg { flex: none; }

.dsh-todo-search input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12.5px;
  line-height: 18px;
  appearance: none;
}

.dsh-todo-search input::placeholder { color: var(--dsw-alias-label-secondary); }

.dsh-todo-search-clear {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}

.dsh-todo-search-clear:hover { color: var(--dsw-alias-label-primary); }

.dsh-todo-icon-btn {
  flex: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.dsh-todo-icon-btn:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dsh-todo-icon-btn:focus-visible,
.dsh-todo-new:focus-visible,
.dsh-todo-chip:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent);
  outline-offset: 1px;
}

.dsh-todo-icon-btn[data-on] { color: var(--dsw-alias-brand-primary); }

.dsh-todo-icon-btn[data-on]::after {
  content: '';
  position: absolute;
  top: 5px;
  right: 5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--dsw-alias-state-success-primary);
}

.dsh-todo-body {
  flex: 1;
  display: flex;
  min-width: 0;
  min-height: 0;
}

.dsh-todo-rail {
  flex: none;
  display: flex;
  flex-direction: column;
  width: 214px;
  min-height: 0;
  border-right: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-interactive-bg-hover);
}

.dsh-todo-rail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 8px 18px;
  scrollbar-width: thin;
}

.dsh-todo-nav-row {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 0 2px;
}

.dsh-todo-nav {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  height: 34px;
  padding: 0 8px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 120ms ease;
}

@media (hover: hover) {
  .dsh-todo-nav:hover { background: var(--dsw-alias-interactive-bg-hover); }
}

.dsh-todo-nav[data-active] {
  background: color-mix(in srgb, var(--todo-item-accent, var(--dsw-alias-brand-primary)) 13%, transparent);
  font-weight: 600;
}

.dsh-todo-nav:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent);
  outline-offset: -2px;
}

.dsh-todo-nav svg { flex: none; color: var(--dsw-alias-label-secondary); }

.dsh-todo-nav-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-todo-nav-count {
  flex: none;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 400;
}

.dsh-todo-dot {
  flex: none;
  width: 9px;
  height: 9px;
  margin: 0 2px;
  border-radius: 50%;
  background: var(--dsw-alias-label-secondary);
}

.dsh-todo-dot[data-color='blue'] { background: #0A84FF; }
.dsh-todo-dot[data-color='green'] { background: #34C759; }
.dsh-todo-dot[data-color='purple'] { background: #BF5AF2; }
.dsh-todo-dot[data-color='orange'] { background: #FF9F0A; }
.dsh-todo-dot[data-color='teal'] { background: #30B0C7; }
.dsh-todo-dot[data-color='pink'] { background: #FF375F; }
.dsh-todo-dot[data-color='red'] { background: #FF3B30; }
.dsh-todo-dot[data-color='yellow'] { background: #FFCC00; }

.dsh-todo-tile {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: linear-gradient(155deg, color-mix(in srgb, var(--todo-item-accent, var(--dsw-alias-brand-primary)) 70%, #ffffff 30%), var(--todo-item-accent, var(--dsw-alias-brand-primary)));
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--todo-item-accent, var(--dsw-alias-brand-primary)) 38%, transparent);
}

.dsh-todo-tile[data-size='lg'] {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 15px;
}

.dsh-todo-tile[data-soft] {
  background: color-mix(in srgb, var(--todo-item-accent, var(--dsw-alias-brand-primary)) 13%, transparent);
  color: var(--todo-item-accent, var(--dsw-alias-brand-primary));
  box-shadow: none;
}

.dsh-todo-tile[data-ink='dark'] { color: #4a3b00; }

.dsh-todo-tile[data-soft][data-ink='dark'] { color: #7a5c00; }

.dsh-todo-tile[data-dashed] {
  border: 1px dashed color-mix(in srgb, var(--dsw-alias-label-secondary) 55%, transparent);
  background: transparent;
  box-shadow: none;
}

.dsh-todo-nav-remove {
  flex: none;
  display: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 4px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}

.dsh-todo-nav-row:hover .dsh-todo-nav-remove { display: inline-flex; }
.dsh-todo-nav-remove:hover { color: var(--dsw-alias-state-error-primary); }
.dsh-todo-nav-remove[data-confirm] { color: var(--dsw-alias-state-error-primary); }

.dsh-todo-rail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 14px 8px 6px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dsh-todo-nav-new { margin-top: 4px; color: var(--dsw-alias-label-secondary); }

.dsh-todo-nav-new .dsh-todo-nav-label { color: var(--dsw-alias-label-secondary); }

.dsh-todo-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.dsh-todo-main-head {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px clamp(20px, 3vw, 34px) 10px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--todo-accent, var(--dsw-alias-brand-primary)) 9%, transparent) 0%, transparent 100%);
}

.dsh-todo-main-title { display: flex; align-items: center; gap: 10px; min-width: 0; }

.dsh-todo-main-title-text { display: flex; flex-direction: column; min-width: 0; }

.dsh-todo-progress {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}

.dsh-todo-main-title h2 {
  margin: 0;
  font-size: 19px;
  line-height: 26px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.dsh-todo-main-count {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.dsh-todo-main-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 clamp(12px, 2.4vw, 26px) 32px;
  scrollbar-width: thin;
}

.dsh-todo-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px clamp(20px, 3vw, 34px) 6px;
  padding: 8px 10px 8px 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-state-warn-primary) 28%, transparent);
  color: var(--dsw-alias-label-primary);
  font-size: 12.5px;
}

.dsh-todo-banner svg { flex: none; color: var(--dsw-alias-state-warn-primary); }

.dsh-todo-banner-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-todo-add {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 6px 8px 10px;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--dsw-alias-interactive-bg-hover);
  box-shadow: inset 0 0 0 0.5px var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
  transition: box-shadow 140ms ease, background 140ms ease;
}

.dsh-todo-add:focus-within {
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-brand-primary) 34%, transparent);
}

.dsh-todo-add input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13.5px;
}

.dsh-todo-add input::placeholder { color: var(--dsw-alias-label-secondary); }

.dsh-todo-add-target {
  flex: none;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  white-space: nowrap;
}

.dsh-todo-group { margin: 0 0 6px; }

.dsh-todo-group-head {
  margin: 14px 10px 4px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dsh-todo-group-head[data-tone='overdue'] { color: var(--dsw-alias-state-error-primary); }

.dsh-todo-task {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 120ms ease;
}

.dsh-todo-task:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--todo-check, var(--dsw-alias-brand-primary)) 40%, transparent);
  outline-offset: -2px;
}

@media (hover: hover) {
  .dsh-todo-task:hover { background: var(--dsw-alias-interactive-bg-hover); }
}

.dsh-todo-task[data-selected] {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
}

.dsh-todo-check {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin: 1px 0 0;
  padding: 0;
  border: 1.5px solid color-mix(in srgb, var(--dsw-alias-label-secondary) 70%, transparent);
  border-radius: 50%;
  background: transparent;
  color: transparent;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
}

.dsh-todo-check:hover {
  border-color: var(--todo-check, var(--dsw-alias-brand-primary));
  color: color-mix(in srgb, var(--todo-check, var(--dsw-alias-brand-primary)) 60%, transparent);
}

.dsh-todo-check[data-checked] {
  border-color: var(--todo-check, var(--dsw-alias-brand-primary));
  background: var(--todo-check, var(--dsw-alias-brand-primary));
  color: #fff;
}

.dsh-todo-task-main { flex: 1; min-width: 0; }

.dsh-todo-task-title {
  display: block;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  font-size: 13.5px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-todo-task[data-done] .dsh-todo-task-title {
  color: var(--dsw-alias-label-secondary);
  text-decoration: line-through;
}

.dsh-todo-task-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
}

.dsh-todo-task-due[data-tone='overdue'] {
  color: var(--dsw-alias-state-error-primary);
  font-weight: 600;
}
.dsh-todo-task-due[data-tone='soon'] { color: var(--dsw-alias-state-warn-label); }

.dsh-todo-stars {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 1px;
  color: ${STAR_COLOR};
  line-height: 1;
}

.dsh-todo-stars svg { flex: none; }
.dsh-todo-stars svg:not([data-filled]) { opacity: 0.3; }

.dsh-todo-meta-list {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.dsh-todo-meta-list .dsh-todo-dot { width: 7px; height: 7px; margin: 0; }

.dsh-todo-list-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dsh-todo-list-row .dsh-todo-dot { width: 8px; height: 8px; margin: 0; }
.dsh-todo-list-row .dsh-todo-select { flex: 1; }

.dsh-todo-task-note {
  flex: none;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.85;
}

.dsh-todo-done-section {
  margin: 18px 10px 0;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  padding-top: 8px;
}

.dsh-todo-done-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 -2px 2px;
}

.dsh-todo-done-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dsh-todo-done-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); }

.dsh-todo-done-clear {
  padding: 4px 8px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dsh-todo-done-clear[data-confirm] {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);
  color: var(--dsw-alias-state-error-primary);
}

.dsh-todo-done-clear:hover {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent);
  color: var(--dsw-alias-state-error-primary);
}

.dsh-todo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 24px;
  text-align: center;
}

.dsh-todo-empty-glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  color: var(--todo-item-accent, var(--dsw-alias-brand-primary));
  background: radial-gradient(120% 120% at 28% 18%, color-mix(in srgb, var(--todo-item-accent, var(--dsw-alias-brand-primary)) 24%, transparent), color-mix(in srgb, var(--todo-item-accent, var(--dsw-alias-brand-primary)) 8%, transparent));
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--todo-item-accent, var(--dsw-alias-brand-primary)) 26%, transparent);
}

.dsh-todo-empty-title { margin: 0; font-size: 14px; font-weight: 600; }
.dsh-todo-empty-hint { margin: 0; max-width: 300px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; }

.dsh-todo-detail-accent {
  flex: none;
  height: 3px;
  border-radius: 0 0 3px 0;
  background: var(--todo-accent, var(--dsw-alias-brand-primary));
  opacity: 0.9;
}

.dsh-todo-detail {
  flex: none;
  display: flex;
  flex-direction: column;
  width: 312px;
  min-height: 0;
  border-left: 0.5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent);
  animation: dsh-todo-detail-in 180ms cubic-bezier(0.32, 0.72, 0, 1) both;
}

@keyframes dsh-todo-detail-in {
  from { opacity: 0; transform: translateX(8px); }
}

.dsh-todo-detail-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 16px 6px;
}

.dsh-todo-detail-head .dsh-todo-check { width: 22px; height: 22px; }

.dsh-todo-detail-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 16px 20px;
  scrollbar-width: thin;
}

.dsh-todo-detail-title {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 0 10px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 18px;
  line-height: 26px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.dsh-todo-field { margin: 0 0 16px; }

.dsh-todo-field-label {
  display: block;
  margin: 0 0 6px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dsh-todo-date-row { display: flex; align-items: center; gap: 8px; }

.dsh-todo-date-trigger {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
}

.dsh-todo-date-trigger:hover {
  border-color: color-mix(in srgb, var(--todo-accent, var(--dsw-alias-brand-primary)) 32%, transparent);
}

.dsh-todo-date-trigger svg { flex: none; color: var(--dsw-alias-label-secondary); }

.dsh-todo-date-trigger[data-overdue] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 38%, transparent);
}

.dsh-todo-date-trigger[data-overdue] svg { color: var(--dsw-alias-state-error-primary); }

.dsh-todo-date-trigger[data-overdue] .dsh-todo-date-value {
  color: var(--dsw-alias-state-error-primary);
  font-weight: 600;
}

.dsh-todo-date-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-todo-date-time {
  flex: none;
  color: var(--dsw-alias-label-secondary);
  font-variant-numeric: tabular-nums;
}

.dsh-todo-time {
  flex: none;
  width: 84px;
  height: 32px;
  padding: 0 6px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  outline: none;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  color-scheme: light dark;
}

.dsh-todo-calendar {
  margin-top: 8px;
  padding: 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 10px 28px var(--dsw-alias-bg-mask-2);
}

.dsh-todo-calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
}

.dsh-todo-calendar-title { font-size: 12.5px; font-weight: 600; }

.dsh-todo-calendar-nav { display: flex; gap: 2px; }

.dsh-todo-calendar-nav button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}

.dsh-todo-calendar-nav button:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dsh-todo-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.dsh-todo-calendar-weekday {
  padding: 2px 0 4px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  text-align: center;
}

.dsh-todo-calendar-day {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.dsh-todo-calendar-day:hover { background: var(--dsw-alias-interactive-bg-hover); }

.dsh-todo-calendar-day[data-out] {
  color: color-mix(in srgb, var(--dsw-alias-label-secondary) 55%, transparent);
}

.dsh-todo-calendar-day[data-today] {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--todo-accent, var(--dsw-alias-brand-primary)) 45%, transparent);
}

.dsh-todo-calendar-day[data-selected] {
  background: var(--todo-accent, var(--dsw-alias-brand-primary));
  color: #fff;
  font-weight: 600;
}

.dsh-todo-calendar-day[data-marked]::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}

.dsh-todo-calendar-foot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.dsh-todo-gate {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
}

.dsh-todo-gate-glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  color: var(--todo-item-accent, var(--dsw-alias-brand-primary));
  background: color-mix(in srgb, var(--todo-item-accent, var(--dsw-alias-brand-primary)) 12%, transparent);
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--todo-item-accent, var(--dsw-alias-brand-primary)) 26%, transparent);
}

.dsh-todo-gate-title { margin: 0; font-size: 15px; font-weight: 600; }

.dsh-todo-gate-hint {
  max-width: 280px;
  margin: 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12.5px;
  line-height: 1.5;
}

.dsh-todo-gate .dsh-todo-new { height: 30px; padding: 0 14px; font-size: 12.5px; border-radius: 9px; }

.dsh-todo-nav-lock {
  flex: none;
  display: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}

.dsh-todo-nav-row:hover .dsh-todo-nav-lock { display: inline-flex; }

.dsh-todo-nav-lock:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dsh-todo-nav[data-locked] .dsh-todo-nav-label { color: var(--dsw-alias-label-secondary); }

.dsh-todo-task-action {
  flex: none;
  display: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: -1px -2px 0 0;
  padding: 0;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}

.dsh-todo-task:hover .dsh-todo-task-action { display: inline-flex; }

.dsh-todo-task-action:hover {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);
  color: var(--dsw-alias-state-error-primary);
}

.dsh-todo-task-action[data-confirm] {
  display: inline-flex;
  color: var(--dsw-alias-state-error-primary);
}

.dsh-todo-task-day:hover {
  background: color-mix(in srgb, ${COLOR_HEX.blue} 12%, transparent);
  color: ${COLOR_HEX.blue};
}

.dsh-todo-task-day[data-on] {
  display: inline-flex;
  color: ${COLOR_HEX.blue};
}

.dsh-todo-task[data-done] .dsh-todo-task-action {
  display: inline-flex;
  opacity: 0.7;
}

.dsh-todo-task[data-done]:hover .dsh-todo-task-action { opacity: 1; }

.dsh-todo-scrim {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--dsw-alias-bg-mask-1);
  backdrop-filter: blur(4px);
}

.dsh-todo-modal {
  width: min(360px, 100%);
  box-sizing: border-box;
  padding: 18px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 16px;
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 24px 64px var(--dsw-alias-bg-mask-2);
}

.dsh-todo-modal h3 { margin: 0 0 6px; font-size: 15px; font-weight: 600; }

.dsh-todo-modal p {
  margin: 0 0 12px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.dsh-todo-modal-field { margin: 0 0 10px; }

.dsh-todo-modal-field input {
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  padding: 0 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  outline: none;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
}

.dsh-todo-modal-field input:focus {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent);
}

.dsh-todo-modal-error {
  margin: 0 0 10px;
  color: var(--dsw-alias-state-error-primary);
  font-size: 12px;
}

.dsh-todo-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

.dsh-todo-modal-actions button {
  height: 30px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
}

.dsh-todo-modal-cancel { background: transparent; color: var(--dsw-alias-label-secondary); }

.dsh-todo-modal-cancel:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dsh-todo-modal-confirm {
  background: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary-foreground, #fff);
}

.dsh-todo-modal-actions button[disabled] { opacity: 0.45; cursor: default; }

.dsh-todo-newlist-row { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; }

.dsh-todo-newlist-row .dsh-todo-modal-field { flex: 1; margin: 0; }

.dsh-todo-swatch-label { display: block; margin: 0 0 8px; }

.dsh-todo-swatches { display: flex; flex-wrap: wrap; gap: 10px; }

.dsh-todo-swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: transform 120ms ease;
}

.dsh-todo-swatch:hover { transform: scale(1.08); }

.dsh-todo-swatch[data-selected] {
  box-shadow: 0 0 0 2px var(--dsw-alias-bg-layer-1), 0 0 0 4px currentColor;
}

.dsh-todo-swatch svg { color: #fff; }

.dsh-todo-swatch[data-ink='dark'] svg { color: #4a3b00; }

.dsh-todo-stars-edit { display: flex; align-items: center; gap: 2px; }

.dsh-todo-star-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: ${STAR_COLOR};
  cursor: pointer;
}

.dsh-todo-star-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }

.dsh-todo-star-btn:not([data-on]) { color: var(--dsw-alias-label-secondary); opacity: 0.55; }

.dsh-todo-star-hint { margin-left: 6px; color: var(--dsw-alias-label-secondary); font-size: 11px; }

.dsh-todo-date {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  height: 32px;
  padding: 0 8px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  outline: none;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12.5px;
  color-scheme: light dark;
}

.dsh-todo-date:focus {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 34%, transparent);
}

.dsh-todo-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }

.dsh-todo-chip {
  height: 26px;
  padding: 0 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.dsh-todo-chip:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dsh-todo-select {
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  padding: 0 8px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  outline: none;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12.5px;
  color-scheme: light dark;
}

.dsh-todo-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
}

.dsh-todo-switch {
  flex: none;
  position: relative;
  width: 38px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-secondary) 35%, transparent);
  cursor: pointer;
  transition: background 140ms ease;
}

.dsh-todo-switch[data-on] { background: var(--dsw-alias-brand-primary); }

.dsh-todo-switch span {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dsw-alias-bg-base);
  box-shadow: 0 1px 2px var(--dsw-alias-bg-mask-2);
  transition: transform 140ms ease;
}

.dsh-todo-switch[data-on] span { transform: translateX(16px); }

.dsh-todo-note {
  width: 100%;
  box-sizing: border-box;
  min-height: 96px;
  padding: 8px 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  outline: none;
  resize: vertical;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 1.55;
}

.dsh-todo-note::placeholder { color: var(--dsw-alias-label-secondary); }

.dsh-todo-detail-foot {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 16px 14px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
}

.dsh-todo-detail-meta { color: var(--dsw-alias-label-secondary); font-size: 11px; }

.dsh-todo-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 9px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dsh-todo-danger:hover {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);
  color: var(--dsw-alias-state-error-primary);
}

.dsh-todo-menu {
  position: absolute;
  top: calc(var(--dsh-frame-top-clearance, 0px) + 52px);
  right: clamp(16px, 3vw, 32px);
  z-index: 20;
  width: 268px;
  box-sizing: border-box;
  padding: 12px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 12px 32px var(--dsw-alias-bg-mask-2);
}

.dsh-todo-menu-title {
  margin: 0 0 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dsh-todo-menu-row { margin: 0 0 12px; }

.dsh-todo-segment {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 9px;
  background: var(--dsw-alias-interactive-bg-hover);
}

.dsh-todo-segment button {
  flex: 1;
  height: 26px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dsh-todo-segment button[data-active] {
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 2px var(--dsw-alias-bg-mask-2);
}

.dsh-todo-menu-hint {
  margin: 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  line-height: 1.5;
}

.dsh-todo-menu-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}

.dsh-todo-new {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: none;
  border-radius: 8px;
  background: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary-foreground, #fff);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.dsh-todo-new:active { transform: scale(0.97); }

@media (max-width: 980px) {
  .dsh-todo-rail { width: 186px; }
  .dsh-todo-detail { width: 280px; }
}

@media (max-width: 760px) {
  .dsh-todo-rail { display: none; }
  .dsh-todo-detail { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .dsh-todo-detail, .dsh-todo-menu { animation: none; }
  .dsh-todo-switch span { transition: none; }
}
`

    let sequence = 0

    /** @returns a unique local id for one board record. */
    function nextId(prefix) {
      sequence += 1
      return prefix + '-' + Date.now().toString(36) + '-' + sequence.toString(36)
    }

    const pad = value => String(value).padStart(2, '0')

    /** @returns the local calendar day key, `YYYY-MM-DD`. */
    function dayKey(date) {
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
    }

    /** @returns midnight of a day key. */
    function parseDayKey(key) {
      const [year, month, day] = key.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    /** @returns the day key shifted by whole days. */
    function addDays(key, days) {
      const date = parseDayKey(key)
      date.setDate(date.getDate() + days)
      return dayKey(date)
    }

    /** @returns whole days from one day key to another. */
    function diffDays(fromKey, toKey) {
      return Math.round((parseDayKey(toKey).getTime() - parseDayKey(fromKey).getTime()) / 86400000)
    }

    const todayKey = () => dayKey(new Date())

    /** @returns a random salt for a list password. */
    function makeSalt() {
      const bytes = new Uint8Array(16)
      if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') crypto.getRandomValues(bytes)
      else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256)
      return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
    }

    /**
     * Hash `salt:password` with SHA-256 when the Web Crypto API is available.
     * @returns the hex digest.
     */
    async function digestPassword(password, salt) {
      const text = salt + ':' + password
      if (typeof crypto !== 'undefined' && crypto.subtle !== undefined) {
        const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
        return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('')
      }
      let hash = 2166136261
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index)
        hash = Math.imul(hash, 16777619)
      }
      return (hash >>> 0).toString(16)
    }

    /** @returns whether a list carries a password. */
    function listHasPassword(list) {
      return typeof list.hash === 'string' && list.hash !== ''
    }

    /** @returns the date label used inside the picker trigger. */
    function formatPickerDate(key) {
      return new Intl.DateTimeFormat(languageTag(), {
        weekday: 'short', month: 'short', day: 'numeric',
      }).format(parseDayKey(key))
    }

    /** @returns a stored due value, or null. */
    function normalizeDue(value) {
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
    }

    /** @returns a stored task with every field coerced. */
    function normalizeTask(task) {
      const updated = Number.isFinite(task?.updatedAt) ? task.updatedAt : Date.now()
      return {
        id: typeof task?.id === 'string' ? task.id : nextId('task'),
        listId: typeof task?.listId === 'string' ? task.listId : 'list-work',
        title: typeof task?.title === 'string' ? task.title : '',
        note: typeof task?.note === 'string' ? task.note : '',
        due: normalizeDue(task?.due),
        dueTime: typeof task?.dueTime === 'string' && /^\d{2}:\d{2}$/.test(task.dueTime) ? task.dueTime : null,
        myDay: normalizeDue(task?.myDay),
        important: Number.isFinite(task?.important) ? Math.min(5, Math.max(0, Math.round(task.important))) : 0,
        done: task?.done === true,
        doneAt: Number.isFinite(task?.doneAt) ? task.doneAt : null,
        remind: task?.remind !== false,
        remindedOn: typeof task?.remindedOn === 'string' ? task.remindedOn : null,
        createdAt: Number.isFinite(task?.createdAt) ? task.createdAt : updated,
        updatedAt: updated,
      }
    }

    /** @returns the board with valid lists, tasks, and settings. */
    function normalizeBoard(raw) {
      const lists = Array.isArray(raw?.lists)
        ? raw.lists
          .filter(list => list !== null && typeof list === 'object' && typeof list.id === 'string')
          .map((list, index) => {
            const normalized = {
              id: list.id,
              name: typeof list.name === 'string' && list.name.trim() !== '' ? list.name : 'List ' + String(index + 1),
              color: COLORS.includes(list.color) ? list.color : COLORS[index % COLORS.length],
            }
            if (typeof list.salt === 'string' && list.salt !== '') normalized.salt = list.salt
            if (typeof list.hash === 'string' && list.hash !== '') normalized.hash = list.hash
            return normalized
          })
        : []
      const tasks = Array.isArray(raw?.tasks) ? raw.tasks.filter(task => task !== null && typeof task === 'object').map(normalizeTask) : []
      const leadDays = Number.isFinite(raw?.settings?.leadDays) ? Math.min(30, Math.max(0, raw.settings.leadDays)) : 3
      return {
        version: 2,
        lists,
        tasks: tasks.map(task => lists.some(list => list.id === task.listId) ? task : { ...task, listId: lists[0]?.id ?? task.listId }),
        settings: { leadDays, notifications: raw?.settings?.notifications !== false },
      }
    }

    /** @returns the stored board, or null when nothing is readable. */
    function readBoard() {
      if (typeof localStorage === 'undefined') return null
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw === null) return null
        const parsed = JSON.parse(raw)
        if (parsed === null || typeof parsed !== 'object') return null
        return normalizeBoard(parsed)
      } catch (error) {
        console.warn('[todo] reading tasks failed:', error)
        return null
      }
    }

    /** @returns a fresh board with localized default lists. */
    function createBoard(t) {
      return {
        version: 2,
        lists: [
          { id: 'list-work', name: t('listWork'), color: 'blue' },
          { id: 'list-personal', name: t('listPersonal'), color: 'green' },
          { id: 'list-long-term', name: t('listLongTerm'), color: 'purple' },
        ],
        tasks: [],
        settings: { leadDays: 3, notifications: true },
      }
    }

    /** @returns one demo task per default list so the pad starts explainable. */
    function seedTasks(t) {
      const today = todayKey()
      const now = Date.now()
      const seeds = [
        { listId: 'list-work', title: t('seedWork'), due: addDays(today, 2), myDay: today, important: 3 },
        { listId: 'list-personal', title: t('seedPersonal'), due: addDays(today, 9), myDay: null, important: 1 },
        { listId: 'list-long-term', title: t('seedPlan'), due: addDays(today, 40), myDay: null, important: 5 },
      ]
      return seeds.map((seed, index) => ({
        id: nextId('task'),
        listId: seed.listId,
        title: seed.title,
        note: '',
        due: seed.due,
        dueTime: null,
        myDay: seed.myDay,
        important: seed.important,
        done: false,
        doneAt: null,
        remind: true,
        remindedOn: null,
        createdAt: now - index * 1000,
        updatedAt: now - index * 1000,
      }))
    }

    /** Import the earlier memo pad's notes as tasks on a first upgrade. */
    function migrateNotes(t, board) {
      if (typeof localStorage === 'undefined') return board
      try {
        const raw = localStorage.getItem(LEGACY_KEY)
        if (raw === null) return board
        const parsed = JSON.parse(raw)
        const notes = Array.isArray(parsed?.notes) ? parsed.notes : []
        if (notes.length === 0) return board
        const now = Date.now()
        const tasks = notes.map((note, index) => normalizeTask({
          id: nextId('task'),
          listId: 'list-personal',
          title: typeof note?.title === 'string' && note.title.trim() !== '' ? note.title.trim() : t('untitled'),
          note: typeof note?.body === 'string' ? note.body : '',
          due: null,
          done: false,
          remind: false,
          createdAt: Number.isFinite(note?.createdAt) ? note.createdAt : now - index * 1000,
          updatedAt: Number.isFinite(note?.updatedAt) ? note.updatedAt : now - index * 1000,
        }))
        return { ...board, tasks }
      } catch (error) {
        console.warn('[todo] migrating notes failed:', error)
        return board
      }
    }

    /**
     * The board store shared by every component of the page.
     * @param t - the bound translate function, used for first-run defaults.
     */
    function createStore(t) {
      let board = readBoard()
      if (board === null) {
        let fresh = migrateNotes(t, createBoard(t))
        if (fresh.tasks.length === 0) fresh = { ...fresh, tasks: seedTasks(t) }
        board = fresh
      }
      if (board.lists.length === 0) board = { ...board, lists: createBoard(t).lists }
      const listeners = new Set()
      let saveTimer = null

      /** Write the board now. */
      function persist() {
        saveTimer = null
        if (typeof localStorage === 'undefined') return
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
        } catch (error) {
          console.warn('[todo] saving tasks failed:', error)
        }
      }

      /** Coalesce writes while a note is being typed. */
      function scheduleSave() {
        if (saveTimer !== null) clearTimeout(saveTimer)
        saveTimer = setTimeout(persist, 200)
      }

      /** Publish a new board. */
      function commit(next) {
        board = next
        scheduleSave()
        for (const listener of Array.from(listeners)) listener()
      }

      return {
        get: () => board,
        subscribe(listener) {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
        addTask(listId, title, patch = {}) {
          const text = title.trim()
          if (text === '') return null
          const now = Date.now()
          const task = normalizeTask({
            id: nextId('task'), listId, title: text, due: null,
            createdAt: now, updatedAt: now, ...patch,
          })
          commit({ ...board, tasks: [task, ...board.tasks] })
          return task.id
        },
        toggleTask(id) {
          const now = Date.now()
          commit({
            ...board,
            tasks: board.tasks.map((task) => {
              if (task.id !== id) return task
              const done = !task.done
              return { ...task, done, doneAt: done ? now : null, updatedAt: now }
            }),
          })
        },
        updateTask(id, patch) {
          const now = Date.now()
          commit({
            ...board,
            tasks: board.tasks.map(task => task.id === id
              ? normalizeTask({ ...task, ...patch, id: task.id, updatedAt: now })
              : task),
          })
        },
        removeTask(id) {
          commit({ ...board, tasks: board.tasks.filter(task => task.id !== id) })
        },
        addList(name, color) {
          const text = name.trim()
          if (text === '') return null
          const list = {
            id: nextId('list'),
            name: text,
            color: COLORS.includes(color) ? color : COLORS[board.lists.length % COLORS.length],
          }
          commit({ ...board, lists: [...board.lists, list] })
          return list.id
        },
        setListSecret(id, salt, hash) {
          commit({
            ...board,
            lists: board.lists.map(list => list.id === id ? { ...list, salt, hash } : list),
          })
        },
        clearListSecret(id) {
          commit({
            ...board,
            lists: board.lists.map((list) => {
              if (list.id !== id) return list
              const next = { ...list }
              delete next.salt
              delete next.hash
              return next
            }),
          })
        },
        removeList(id) {
          const lists = board.lists.filter(list => list.id !== id)
          if (lists.length === 0) return false
          const fallback = lists[0].id
          commit({
            ...board,
            lists,
            tasks: board.tasks.map(task => task.listId === id ? { ...task, listId: fallback } : task),
          })
          return true
        },
        clearCompleted() {
          commit({ ...board, tasks: board.tasks.filter(task => !task.done) })
        },
        updateSettings(patch) {
          commit({ ...board, settings: { ...board.settings, ...patch } })
        },
        markReminded(ids, day) {
          const wanted = new Set(ids)
          commit({
            ...board,
            tasks: board.tasks.map(task => wanted.has(task.id) ? { ...task, remindedOn: day } : task),
          })
        },
        /** Write any pending change, e.g. when the plugin unloads. */
        flush() {
          if (saveTimer === null) return
          clearTimeout(saveTimer)
          persist()
        },
      }
    }

    let locale = null
    let boundT = null
    let store = null

    /** Re-render on locale changes and return the bound translate function. */
    function useStrings() {
      const [, bump] = useState(0)
      useEffect(() => locale.subscribe(() => bump(value => value + 1)), [])
      return boundT
    }

    /** Subscribe to the board. @returns the current board snapshot. */
    function useBoard() {
      const [board, setBoard] = useState(() => store.get())
      useEffect(() => {
        setBoard(store.get())
        return store.subscribe(() => setBoard(store.get()))
      }, [])
      return board
    }

    /** Re-render every half minute so due states and reminders stay honest. */
    function useClock() {
      const [now, setNow] = useState(() => Date.now())
      useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 30000)
        return () => clearInterval(timer)
      }, [])
      return now
    }

    /** @returns the active locale id, e.g. `zh-CN`. */
    function languageTag() {
      const snapshot = locale.getLocale()
      return snapshot !== null && typeof snapshot?.active === 'string' ? snapshot.active : 'en'
    }

    /** @returns which reminder window a task currently sits in. */
    function alertOf(task, nowKey, leadDays) {
      if (task.done || task.remind === false || task.due === null) return null
      const days = diffDays(nowKey, task.due)
      return days <= leadDays ? { task, days, overdue: days < 0 } : null
    }

    /** @returns the tasks that need attention, soonest first. */
    function dueAlerts(board, nowKey, leadDays) {
      const alerts = []
      for (const task of board.tasks) {
        const alert = alertOf(task, nowKey, leadDays)
        if (alert !== null) alerts.push(alert)
      }
      return alerts.sort((left, right) => left.days - right.days)
    }

    /** @returns whether this environment can post system notifications. */
    function notificationsSupported() {
      return typeof Notification !== 'undefined'
    }

    /** @returns the browser's current notification permission. */
    function notificationPermission() {
      return notificationsSupported() ? Notification.permission : 'unsupported'
    }

    /** @returns the copy for "today", "tomorrow", or "in N days". */
    function whenText(days, t) {
      if (days <= 0) return t('whenToday')
      if (days === 1) return t('whenTomorrow')
      return t('whenInDays', { n: days })
    }

    /** Post one browser notification for an alert. */
    function notifySystem(alert, t) {
      if (!notificationsSupported() || Notification.permission !== 'granted') return
      const title = alert.task.title.trim() === '' ? t('untitled') : alert.task.title.trim()
      const heading = alert.overdue ? t('notifyOverdueTitle') : t('notifyDueTitle')
      const body = alert.overdue
        ? t('notifyOverdueBody', { title, n: -alert.days })
        : t('notifyDueBody', { title, when: whenText(alert.days, t) })
      try {
        new Notification(heading, { body, tag: 'dsh-todo-' + alert.task.id })
      } catch (error) {
        console.warn('[todo] system notification failed:', error)
      }
    }

    /** @returns the due-date text and the tone the row should use. */
    function dueText(task, nowKey, t, leadDays) {
      if (task.due === null) return null
      const days = diffDays(nowKey, task.due)
      if (days < 0) return { text: t('overdueBy', { n: -days }), tone: 'overdue' }
      if (days === 0) return { text: t('dueToday'), tone: 'soon' }
      if (days === 1) return { text: t('dueTomorrow'), tone: 'soon' }
      if (days < 7) return { text: t('dueInDays', { n: days }), tone: days <= leadDays ? 'soon' : 'normal' }
      return {
        text: new Intl.DateTimeFormat(languageTag(), { month: 'short', day: 'numeric' }).format(parseDayKey(task.due)),
        tone: days <= leadDays ? 'soon' : 'normal',
      }
    }

    /** @returns the date group a task belongs to. */
    function groupKeyFor(task, nowKey) {
      if (task.due === null) return 'none'
      const days = diffDays(nowKey, task.due)
      if (days < 0) return 'overdue'
      if (days === 0) return 'today'
      if (days === 1) return 'tomorrow'
      if (days <= 7) return 'week'
      return 'later'
    }

    const GROUP_ORDER = ['overdue', 'today', 'tomorrow', 'week', 'later', 'none']

    /** @returns a task list sorted by due date, then by creation. */
    function compareTasks(left, right) {
      const leftDue = left.due === null ? '9999-99-99' : left.due
      const rightDue = right.due === null ? '9999-99-99' : right.due
      if (leftDue !== rightDue) return leftDue < rightDue ? -1 : 1
      return left.createdAt - right.createdAt
    }

    /** @returns a task list sorted by star level, then by due date. */
    function compareByImportance(left, right) {
      if (left.important !== right.important) return right.important - left.important
      return compareTasks(left, right)
    }

    /** One stroke-consistent glyph frame at the requested edge. */
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

    /** Check mark for completed rows. */
    function CheckGlyph(props) {
      return h(Glyph, { size: props.size ?? 12, strokeWidth: 2 }, h('path', { d: 'M4.5 10.4l3.4 3.4L15.5 6' }))
    }

    /** Plus marks creation. */
    function PlusGlyph(props) {
      return h(Glyph, { size: props.size ?? 14 }, h('path', { d: 'M10 4.6v10.8M4.6 10h10.8' }))
    }

    /** Magnifier for the search field. */
    function SearchGlyph(props) {
      return h(Glyph, { size: props.size ?? 15 },
        h('circle', { cx: 8.7, cy: 8.7, r: 4.6 }),
        h('path', { d: 'M12.2 12.2 16 16' }))
    }

    /** Close mark. */
    function CloseGlyph(props) {
      return h(Glyph, { size: props.size ?? 13 }, h('path', { d: 'M5.6 5.6l8.8 8.8M14.4 5.6l-8.8 8.8' }))
    }

    /** Bell for the reminder menu. */
    function BellGlyph(props) {
      return h(Glyph, { size: props.size ?? 16 },
        h('path', { d: 'M5.6 8.4a4.4 4.4 0 0 1 8.8 0c0 2.4.6 3.8 1.3 4.7H4.3c.7-.9 1.3-2.3 1.3-4.7Z' }),
        h('path', { d: 'M8.3 15.2a1.9 1.9 0 0 0 3.4 0' }))
    }

    /** Bin for deleting a task. */
    function TrashGlyph(props) {
      return h(Glyph, { size: props.size ?? 14 },
        h('path', { d: 'M4.4 6.1h11.2' }),
        h('path', { d: 'M8.1 6.1V4.4h3.8v1.7' }),
        h('path', { d: 'M6.2 6.1l.6 9.5h6.4l.6-9.5' }))
    }

    /** Calendar frame for the date picker trigger. */
    function CalendarGlyph(props) {
      return h(Glyph, { size: props.size ?? 14 },
        h('rect', { x: 3.4, y: 4.6, width: 13.2, height: 12, rx: 2.2 }),
        h('path', { d: 'M3.4 8.2h13.2M7.1 3.2v2.6M12.9 3.2v2.6' }))
    }

    /** Left chevron for month navigation. */
    function ChevronLeftGlyph(props) {
      return h(Glyph, { size: props.size ?? 12 }, h('path', { d: 'M12.2 6.4 8.6 10l3.6 3.6' }))
    }

    /** Right chevron for month navigation. */
    function ChevronRightGlyph(props) {
      return h(Glyph, { size: props.size ?? 12 }, h('path', { d: 'M7.8 6.4 11.4 10l-3.6 3.6' }))
    }

    /** Closed padlock for protected lists. */
    function LockGlyph(props) {
      return h(Glyph, { size: props.size ?? 12 },
        h('rect', { x: 4.4, y: 8.6, width: 11.2, height: 8, rx: 2 }),
        h('path', { d: 'M6.8 8.6V6.8a3.2 3.2 0 0 1 6.4 0v1.8' }))
    }

    /** Open padlock for an unlocked protected list. */
    function UnlockGlyph(props) {
      return h(Glyph, { size: props.size ?? 12 },
        h('rect', { x: 4.4, y: 8.6, width: 11.2, height: 8, rx: 2 }),
        h('path', { d: 'M6.8 8.6V6.8a3.2 3.2 0 0 1 6.2-1.1' }))
    }

    /** Chevron for the completed section. */
    function ChevronGlyph(props) {
      return h(Glyph, { size: props.size ?? 12 }, h('path', { d: props.open ? 'M5.5 7.8 10 12.3l4.5-4.5' : 'M7.8 5.5 12.3 10l-4.5 4.5' }))
    }

    /** Layers glyph for the all-task view. */
    function AllGlyph(props) {
      return h(Glyph, { size: props.size ?? 15 },
        h('path', { d: 'M3.4 6.4h13.2M3.4 10h13.2M3.4 13.6h8.4' }))
    }

    /** Five-point star for the importance rating. */
    function StarGlyph(props) {
      const filled = props.filled === true
      const size = props.size ?? 12
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 20 20',
        fill: filled ? 'currentColor' : 'none',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'data-filled': filled ? '' : undefined,
        'aria-hidden': 'true',
        focusable: 'false',
      }, h('path', { d: 'M10 3.3l2.05 4.16 4.6.67-3.33 3.24.79 4.58L10 13.8l-4.11 2.15.79-4.58L3.35 8.13l4.6-.67z' }))
    }

    /** Sun for the My day view. */
    function SunGlyph(props) {
      return h(Glyph, { size: props.size ?? 15 },
        h('circle', { cx: 10, cy: 10, r: 3.4 }),
        h('path', { d: 'M10 2.4v1.7M10 15.9v1.7M2.4 10h1.7M15.9 10h1.7M4.6 4.6l1.2 1.2M14.2 14.2l1.2 1.2M15.4 4.6l-1.2 1.2M5.8 14.2l-1.2 1.2' }))
    }

    /** A pad with a check, standing in for an empty task list. */
    function EmptyGlyph() {
      return h('svg', {
        width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true', focusable: 'false',
      },
        h('rect', { x: 4.5, y: 3.2, width: 15, height: 17.6, rx: 3.2 }),
        h('path', { d: 'M8.2 9.1l1.4 1.4 2.6-2.7M8.2 15l1.4 1.4 2.6-2.7M14 9.4h2.6M14 15.3h2.6' }))
    }

    /** A small completion ring: the current view's finished share. */
    function ProgressRing(props) {
      const size = props.size ?? 30
      const stroke = 3
      const radius = (size - stroke) / 2
      const circumference = 2 * Math.PI * radius
      const ratio = Math.min(1, Math.max(0, props.ratio ?? 0))
      return h('svg', {
        width: size, height: size, viewBox: '0 0 ' + size + ' ' + size,
        'aria-hidden': 'true', focusable: 'false',
      },
        h('circle', {
          cx: size / 2, cy: size / 2, r: radius, fill: 'none',
          stroke: 'currentColor', strokeWidth: stroke, opacity: 0.18,
        }),
        h('circle', {
          cx: size / 2, cy: size / 2, r: radius, fill: 'none',
          stroke: props.color, strokeWidth: stroke, strokeLinecap: 'round',
          strokeDasharray: String(circumference * ratio) + ' ' + String(circumference),
          transform: 'rotate(-90 ' + String(size / 2) + ' ' + String(size / 2) + ')',
        }))
    }

    /** Sidebar entry: the glyph only; the sidebar owns the row and its label. */
    function TodoPanelIcon(props) {
      const size = props !== null && typeof props?.size === 'number' ? props.size : 16
      return h(Glyph, { size },
        h('path', { d: 'M3.1 5.6l1.4 1.4 2.6-2.7' }),
        h('path', { d: 'M3.1 14l1.4 1.4 2.6-2.7' }),
        h('path', { d: 'M10.3 5.1h6.6M10.3 13.6h6.6' }))
    }

    /**
     * The built-in month calendar used to pick a due date.
     * @param props - the current value, marked days, translate, and select handler.
     */
    function Calendar(props) {
      const t = props.t
      const lang = languageTag()
      const weekStart = lang.toLowerCase().startsWith('zh') ? 1 : 0
      const today = todayKey()
      const initial = typeof props.value === 'string' ? parseDayKey(props.value) : new Date()
      const [cursor, setCursor] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1))
      const marked = props.marked ?? new Set()

      const weekdayLabels = useMemo(() => {
        const base = new Date(2024, 0, 7)
        return Array.from({ length: 7 }, (_, index) => {
          const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + ((weekStart + index) % 7))
          return new Intl.DateTimeFormat(lang, { weekday: 'narrow' }).format(date)
        })
      }, [lang, weekStart])

      const cells = useMemo(() => {
        const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
        const offset = (first.getDay() - weekStart + 7) % 7
        const start = new Date(first.getFullYear(), first.getMonth(), first.getDate() - offset)
        return Array.from({ length: 42 }, (_, index) => (
          new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
        ))
      }, [cursor, weekStart])

      const monthLabel = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long' }).format(cursor)

      return h('div', { class: 'dsh-todo-calendar', role: 'dialog', 'aria-label': t('pickDate') },
        h('div', { class: 'dsh-todo-calendar-head' },
          h('span', { class: 'dsh-todo-calendar-title' }, monthLabel),
          h('div', { class: 'dsh-todo-calendar-nav' },
            h('button', {
              type: 'button',
              'aria-label': t('collapse'),
              onClick: () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)),
            }, h(ChevronLeftGlyph, null)),
            h('button', {
              type: 'button',
              'aria-label': t('expand'),
              onClick: () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)),
            }, h(ChevronRightGlyph, null)))),
        h('div', { class: 'dsh-todo-calendar-grid' },
          weekdayLabels.map((label, index) => h('span', {
            key: 'weekday-' + String(index), class: 'dsh-todo-calendar-weekday',
          }, label)),
          cells.map((cell) => {
            const key = dayKey(cell)
            return h('button', {
              key,
              type: 'button',
              class: 'dsh-todo-calendar-day',
              'data-out': cell.getMonth() !== cursor.getMonth() ? '' : undefined,
              'data-today': key === today ? '' : undefined,
              'data-selected': key === props.value ? '' : undefined,
              'data-marked': marked.has(key) ? '' : undefined,
              onClick: () => props.onSelect(key),
            }, String(cell.getDate()))
          })),
        h('div', { class: 'dsh-todo-calendar-foot' },
          h('button', { type: 'button', class: 'dsh-todo-chip', onClick: () => props.onSelect(today) }, t('today')),
          h('button', { type: 'button', class: 'dsh-todo-chip', onClick: () => props.onSelect(null) }, t('clearDue'))))
    }

    /**
     * A small centered modal used by the per-list password flow.
     * @param props - title, body, actions, and the close handler.
     */
    function Modal(props) {
      useEffect(() => {
        const onKey = (event) => { if (event.key === 'Escape') props.onClose() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [props.onClose])
      return h('div', {
        class: 'dsh-todo-scrim',
        onMouseDown: (event) => { if (event.target === event.currentTarget) props.onClose() },
      },
        h('div', { class: 'dsh-todo-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': props.title },
          h('h3', null, props.title),
          props.body,
          h('div', { class: 'dsh-todo-modal-actions' }, props.actions)))
    }

    /** The task pad page. */
    function TodoPage() {
      const t = useStrings()
      const board = useBoard()
      const now = useClock()
      const nowKey = dayKey(new Date(now))

      const [view, setView] = useState('myday')
      const [search, setSearch] = useState('')
      const [selectedTaskId, setSelectedTaskId] = useState(null)
      const [draft, setDraft] = useState('')
      const [lastListId, setLastListId] = useState(null)
      const [newListOpen, setNewListOpen] = useState(false)
      const [newListName, setNewListName] = useState('')
      const [newListColor, setNewListColor] = useState(COLORS[0])
      const [confirmListId, setConfirmListId] = useState(null)
      const [showCompleted, setShowCompleted] = useState(false)
      const [menuOpen, setMenuOpen] = useState(false)
      const [permission, setPermission] = useState(notificationPermission)
      const [reminder, setReminder] = useState(null)
      const [calendarOpen, setCalendarOpen] = useState(false)
      const [unlockedIds, setUnlockedIds] = useState(() => new Set())
      const [lockDialog, setLockDialog] = useState(null)
      const [passwordDraft, setPasswordDraft] = useState('')
      const [passwordConfirm, setPasswordConfirm] = useState('')
      const [passwordError, setPasswordError] = useState('')
      const [deleteConfirmId, setDeleteConfirmId] = useState(null)
      const [clearConfirm, setClearConfirm] = useState(false)

      const addRef = useRef(null)
      const menuRef = useRef(null)
      const bellRef = useRef(null)
      const confirmTimer = useRef(null)
      const deleteTimer = useRef(null)
      const clearTimer = useRef(null)

      const lists = board.lists
      const lockedIds = useMemo(() => new Set(lists
        .filter(list => listHasPassword(list) && !unlockedIds.has(list.id))
        .map(list => list.id)), [lists, unlockedIds])
      const activeList = view.startsWith('list:')
        ? lists.find(list => list.id === view.slice(5))
        : undefined
      const activeLocked = activeList !== undefined && lockedIds.has(activeList.id)
      const availableLists = lists.filter(list => !lockedIds.has(list.id))
      const targetListId = activeList !== undefined && !activeLocked
        ? activeList.id
        : (lastListId !== null && availableLists.some(list => list.id === lastListId)
            ? lastListId
            : availableLists[0]?.id)
      const targetList = lists.find(list => list.id === targetListId)

      const scoped = useMemo(() => {
        const unlocked = board.tasks.filter(task => !lockedIds.has(task.listId))
        if (view === 'myday') return unlocked.filter(task => !task.done && task.myDay === nowKey)
        if (view === 'important') return unlocked.filter(task => !task.done && task.important > 0)
        if (view === 'planned') return unlocked.filter(task => !task.done && task.due !== null)
        if (view.startsWith('list:')) {
          const listId = view.slice(5)
          if (lockedIds.has(listId)) return []
          return unlocked.filter(task => task.listId === listId)
        }
        return unlocked
      }, [board.tasks, view, nowKey, lockedIds])

      const visible = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (query === '') return scoped
        return scoped.filter(task => (task.title + ' ' + task.note).toLowerCase().includes(query))
      }, [scoped, search])

      const openTasks = visible.filter(task => !task.done)
      const doneTasks = visible.filter(task => task.done)

      const groups = useMemo(() => {
        const buckets = new Map()
        for (const task of openTasks) {
          const key = groupKeyFor(task, nowKey)
          const bucket = buckets.get(key)
          if (bucket === undefined) buckets.set(key, [task])
          else bucket.push(task)
        }
        const compare = view === 'important' ? compareByImportance : compareTasks
        return GROUP_ORDER
          .filter(key => buckets.has(key))
          .map(key => ({ key, tasks: buckets.get(key).slice().sort(compare) }))
      }, [openTasks, nowKey, view])

      const alerts = useMemo(
        () => dueAlerts(board, nowKey, board.settings.leadDays)
          .filter(alert => !lockedIds.has(alert.task.listId)),
        [board, nowKey, lockedIds],
      )

      const selectedTask = selectedTaskId === null
        ? undefined
        : board.tasks.find(task => task.id === selectedTaskId)

      // Reminder sweep: banner every run, system notification once per task per day.
      useEffect(() => {
        if (!board.settings.notifications) return
        const pending = alerts.filter(alert => alert.task.remindedOn !== nowKey)
        if (pending.length === 0) return
        setReminder(pending)
        for (const alert of pending) notifySystem(alert, t)
        store.markReminded(pending.map(alert => alert.task.id), nowKey)
      }, [alerts, board.settings.notifications, nowKey, t])

      // Dismiss the reminder popover on an outside pointer.
      useEffect(() => {
        if (!menuOpen) return undefined
        const onPointer = (event) => {
          if (menuRef.current !== null && menuRef.current.contains(event.target)) return
          if (bellRef.current !== null && bellRef.current.contains(event.target)) return
          setMenuOpen(false)
        }
        document.addEventListener('mousedown', onPointer)
        return () => document.removeEventListener('mousedown', onPointer)
      }, [menuOpen])

      useEffect(() => () => {
        if (confirmTimer.current !== null) clearTimeout(confirmTimer.current)
        if (deleteTimer.current !== null) clearTimeout(deleteTimer.current)
        if (clearTimer.current !== null) clearTimeout(clearTimer.current)
      }, [])

      useEffect(() => { setCalendarOpen(false) }, [selectedTaskId])

      // A task selected before its list was locked must not stay readable.
      useEffect(() => {
        if (selectedTaskId === null) return
        const task = board.tasks.find(candidate => candidate.id === selectedTaskId)
        if (task !== undefined && lockedIds.has(task.listId)) setSelectedTaskId(null)
      }, [lockedIds, board.tasks, selectedTaskId])

      const submitTask = () => {
        const title = draft.trim()
        if (title === '' || targetListId === undefined) return
        store.addTask(targetListId, title, view === 'myday' ? { myDay: nowKey } : {})
        setDraft('')
        setLastListId(targetListId)
      }

      const selectView = (next) => {
        setView(next)
        setSelectedTaskId(null)
        setShowCompleted(false)
      }

      const openNewList = () => {
        setNewListName('')
        setNewListColor(COLORS[lists.length % COLORS.length])
        setNewListOpen(true)
      }

      const closeNewList = () => {
        setNewListOpen(false)
        setNewListName('')
      }

      const submitNewList = () => {
        const name = newListName.trim()
        if (name === '') return
        const id = store.addList(name, newListColor)
        closeNewList()
        if (id !== null) selectView('list:' + id)
      }

      const askConfirm = (listId) => {
        if (confirmListId === listId) {
          store.removeList(listId)
          setConfirmListId(null)
          if (view === 'list:' + listId) selectView('all')
          return
        }
        setConfirmListId(listId)
        if (confirmTimer.current !== null) clearTimeout(confirmTimer.current)
        confirmTimer.current = setTimeout(() => setConfirmListId(null), 3200)
      }

      const requestNotifications = () => {
        if (!notificationsSupported()) return
        Notification.requestPermission().then((result) => {
          setPermission(result)
          if (result === 'granted' && board.settings.notifications === false) {
            store.updateSettings({ notifications: true })
          }
        }).catch((error) => {
          console.warn('[todo] notification permission failed:', error)
        })
      }

      const viewLabel = activeList !== undefined
        ? activeList.name
        : view === 'myday' ? t('myDay')
          : view === 'important' ? t('important')
            : view === 'planned' ? t('planned') : t('all')

      const openCount = openTasks.length
      const totalInView = visible.length
      const doneInView = doneTasks.length
      const ratio = totalInView === 0 ? 0 : doneInView / totalInView
      const viewAccent = activeList !== undefined
        ? (COLOR_HEX[activeList.color] ?? COLOR_HEX.gray)
        : view === 'myday' ? COLOR_HEX.blue
          : view === 'important' ? COLOR_HEX.orange
            : view === 'planned' ? COLOR_HEX.teal : COLOR_HEX.gray

      const openLockDialog = (list) => {
        setPasswordDraft('')
        setPasswordConfirm('')
        setPasswordError('')
        setLockDialog({
          listId: list.id,
          mode: !listHasPassword(list) ? 'set' : (lockedIds.has(list.id) ? 'unlock' : 'manage'),
        })
      }

      const closeLockDialog = () => {
        setLockDialog(null)
        setPasswordDraft('')
        setPasswordConfirm('')
        setPasswordError('')
      }

      const submitPassword = async () => {
        if (lockDialog === null) return
        const list = lists.find(candidate => candidate.id === lockDialog.listId)
        if (list === undefined) { closeLockDialog(); return }
        if (lockDialog.mode === 'set') {
          if (passwordDraft.length < 4) { setPasswordError(t('passwordTooShort')); return }
          if (passwordDraft !== passwordConfirm) { setPasswordError(t('passwordMismatch')); return }
          const salt = makeSalt()
          const hash = await digestPassword(passwordDraft, salt)
          store.setListSecret(list.id, salt, hash)
          setUnlockedIds((previous) => {
            const next = new Set(previous)
            next.delete(list.id)
            return next
          })
          setSelectedTaskId(null)
          setReminder(null)
          closeLockDialog()
          return
        }
        if (passwordDraft === '') { setPasswordError(t('wrongPassword')); return }
        const hash = await digestPassword(passwordDraft, list.salt ?? '')
        if (hash !== list.hash) { setPasswordError(t('wrongPassword')); return }
        setUnlockedIds(previous => new Set(previous).add(list.id))
        closeLockDialog()
      }

      const lockListNow = () => {
        if (lockDialog !== null) {
          setUnlockedIds((previous) => {
            const next = new Set(previous)
            next.delete(lockDialog.listId)
            return next
          })
          setSelectedTaskId(null)
          setReminder(null)
        }
        closeLockDialog()
      }

      const removeListPassword = () => {
        if (lockDialog !== null) {
          store.clearListSecret(lockDialog.listId)
          setUnlockedIds(previous => new Set(previous).add(lockDialog.listId))
        }
        closeLockDialog()
      }

      const askClearCompleted = () => {
        if (clearConfirm) {
          store.clearCompleted()
          setClearConfirm(false)
          if (clearTimer.current !== null) clearTimeout(clearTimer.current)
          return
        }
        setClearConfirm(true)
        if (clearTimer.current !== null) clearTimeout(clearTimer.current)
        clearTimer.current = setTimeout(() => setClearConfirm(false), 3200)
      }

      const removeTaskWithConfirm = (task) => {
        if (deleteConfirmId === task.id) {
          store.removeTask(task.id)
          if (selectedTaskId === task.id) setSelectedTaskId(null)
          setDeleteConfirmId(null)
          if (deleteTimer.current !== null) clearTimeout(deleteTimer.current)
          return
        }
        setDeleteConfirmId(task.id)
        if (deleteTimer.current !== null) clearTimeout(deleteTimer.current)
        deleteTimer.current = setTimeout(() => setDeleteConfirmId(null), 3200)
      }

      const taskRow = (task) => {
        const due = dueText(task, nowKey, t, board.settings.leadDays)
        const list = lists.find(candidate => candidate.id === task.listId)
        const note = task.note.replace(/\s+/g, ' ').trim()
        const showList = !view.startsWith('list:') && list !== undefined
        const onMyDay = task.myDay === nowKey
        const hasMeta = due !== null || showList || note !== '' || task.important > 0
        return h('div', {
          key: task.id,
          class: 'dsh-todo-task',
          role: 'button',
          tabIndex: 0,
          'data-done': task.done ? '' : undefined,
          'data-selected': task.id === selectedTaskId ? '' : undefined,
          onClick: () => setSelectedTaskId(task.id),
          onKeyDown: (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            setSelectedTaskId(task.id)
          },
        },
          h('button', {
            type: 'button',
            class: 'dsh-todo-check',
            style: { '--todo-check': list === undefined ? COLOR_HEX.gray : (COLOR_HEX[list.color] ?? COLOR_HEX.gray) },
            role: 'checkbox',
            'aria-checked': task.done ? 'true' : 'false',
            'aria-label': t('toggleTask'),
            'data-checked': task.done ? '' : undefined,
            onClick: (event) => {
              event.stopPropagation()
              store.toggleTask(task.id)
            },
          }, task.done ? h(CheckGlyph, { size: 12 }) : null),
          h('div', { class: 'dsh-todo-task-main' },
            h('span', { class: 'dsh-todo-task-title' }, task.title.trim() === '' ? t('untitled') : task.title),
            hasMeta
              ? h('div', { class: 'dsh-todo-task-meta' },
                  due === null ? null : h('span', {
                    class: 'dsh-todo-task-due',
                    'data-tone': due.tone,
                  }, task.dueTime === null ? due.text : due.text + ' · ' + task.dueTime),
                  showList
                    ? h('span', { class: 'dsh-todo-meta-list' },
                        h('span', { class: 'dsh-todo-dot', 'data-color': list.color, 'aria-hidden': 'true' }),
                        h('span', null, list.name))
                    : null,
                  note === '' ? null : h('span', { class: 'dsh-todo-task-note' }, note),
                  task.important > 0
                    ? h('span', {
                        class: 'dsh-todo-stars',
                        title: t('starLevel', { n: task.important }),
                        'aria-label': t('starLevel', { n: task.important }),
                      }, [1, 2, 3, 4, 5].map(level => h(StarGlyph, {
                        key: level,
                        size: 8,
                        filled: level <= task.important,
                      })))
                    : null,
                )
              : null,
          ),
          h('button', {
            type: 'button',
            class: 'dsh-todo-task-action dsh-todo-task-day',
            title: onMyDay ? t('removeFromMyDay') : t('addToMyDay'),
            'aria-label': onMyDay ? t('removeFromMyDay') : t('addToMyDay'),
            'data-on': onMyDay ? '' : undefined,
            onClick: (event) => {
              event.stopPropagation()
              store.updateTask(task.id, { myDay: onMyDay ? null : nowKey })
            },
          }, h(SunGlyph, { size: 13 })),
          h('button', {
            type: 'button',
            class: 'dsh-todo-task-action',
            title: deleteConfirmId === task.id ? t('confirmDeleteTask') : t('deleteTask'),
            'aria-label': t('deleteTask'),
            'data-confirm': deleteConfirmId === task.id ? '' : undefined,
            onClick: (event) => {
              event.stopPropagation()
              removeTaskWithConfirm(task)
            },
          }, h(TrashGlyph, { size: 13 })),
        )
      }

      const unlockedTasks = board.tasks.filter(task => !lockedIds.has(task.listId))
      const smartViews = [
        {
          id: 'myday',
          label: t('myDay'),
          glyph: SunGlyph,
          accent: COLOR_HEX.blue,
          count: unlockedTasks.filter(task => !task.done && task.myDay === nowKey).length,
        },
        {
          id: 'important',
          label: t('important'),
          glyph: StarGlyph,
          filled: true,
          accent: COLOR_HEX.orange,
          count: unlockedTasks.filter(task => !task.done && task.important > 0).length,
        },
        {
          id: 'planned',
          label: t('planned'),
          glyph: CalendarGlyph,
          accent: COLOR_HEX.teal,
          count: unlockedTasks.filter(task => !task.done && task.due !== null).length,
        },
        {
          id: 'all',
          label: t('all'),
          glyph: AllGlyph,
          accent: COLOR_HEX.gray,
          count: unlockedTasks.filter(task => !task.done).length,
        },
      ]

      const rail = h('aside', { class: 'dsh-todo-rail', 'aria-label': t('lists') },
        h('div', { class: 'dsh-todo-rail-scroll' },
          smartViews.map(item => h('button', {
            key: item.id,
            class: 'dsh-todo-nav',
            style: { '--todo-item-accent': item.accent },
            'data-active': view === item.id ? '' : undefined,
            onClick: () => selectView(item.id),
          },
            h('span', { class: 'dsh-todo-tile', 'data-soft': '', 'aria-hidden': 'true' },
              h(item.glyph, { size: 13, filled: item.filled === true })),
            h('span', { class: 'dsh-todo-nav-label' }, item.label),
            h('span', { class: 'dsh-todo-nav-count' }, String(item.count)))),
          h('div', { class: 'dsh-todo-rail-head' },
            h('span', null, t('lists'))),
          lists.map((list) => {
            const locked = lockedIds.has(list.id)
            const protectedList = listHasPassword(list)
            return h('div', { key: list.id, class: 'dsh-todo-nav-row' },
              h('button', {
                class: 'dsh-todo-nav',
                style: { '--todo-item-accent': COLOR_HEX[list.color] ?? COLOR_HEX.gray },
                'data-active': view === 'list:' + list.id ? '' : undefined,
                'data-locked': locked ? '' : undefined,
                onClick: () => selectView('list:' + list.id),
              },
                h('span', {
                  class: 'dsh-todo-tile',
                  'data-ink': DARK_INK_COLORS.has(list.color) ? 'dark' : undefined,
                  'aria-hidden': 'true',
                }, locked ? h(LockGlyph, { size: 12 }) : list.name.trim().slice(0, 1)),
                h('span', { class: 'dsh-todo-nav-label' }, list.name),
                h('span', { class: 'dsh-todo-nav-count' },
                  locked
                    ? h(LockGlyph, { size: 11 })
                    : String(board.tasks.filter(task => task.listId === list.id && !task.done).length))),
              h('button', {
                type: 'button',
                class: 'dsh-todo-nav-lock',
                title: locked ? t('unlockList') : (protectedList ? t('lockNow') : t('lockList')),
                'aria-label': locked ? t('unlockList') : t('lockList'),
                onClick: (event) => { event.stopPropagation(); openLockDialog(list) },
              }, protectedList && !locked ? h(UnlockGlyph, { size: 11 }) : h(LockGlyph, { size: 11 })),
              h('button', {
                type: 'button',
                class: 'dsh-todo-nav-remove',
                title: confirmListId === list.id ? t('confirmDeleteList') : t('deleteList'),
                'aria-label': t('deleteList'),
                'data-confirm': confirmListId === list.id ? '' : undefined,
                onClick: (event) => { event.stopPropagation(); askConfirm(list.id) },
              }, h(CloseGlyph, { size: 11 })))
          }),
          h('button', {
            type: 'button',
            class: 'dsh-todo-nav dsh-todo-nav-new',
            style: { '--todo-item-accent': COLOR_HEX.gray },
            onClick: openNewList,
          },
            h('span', { class: 'dsh-todo-tile', 'data-soft': '', 'data-dashed': '', 'aria-hidden': 'true' },
              h(PlusGlyph, { size: 13 })),
            h('span', { class: 'dsh-todo-nav-label' }, t('newList'))),
        ),
      )

      const headTile = activeList !== undefined
        ? activeList.name.trim().slice(0, 1)
        : view === 'myday' ? h(SunGlyph, { size: 16 })
          : view === 'important' ? h(StarGlyph, { size: 16, filled: true })
            : view === 'planned' ? h(CalendarGlyph, { size: 16 }) : h(AllGlyph, { size: 16 })

      const mainHead = h('div', { class: 'dsh-todo-main-head', style: { '--todo-accent': viewAccent } },
        h('div', { class: 'dsh-todo-main-title' },
          h('span', {
            class: 'dsh-todo-tile',
            'data-size': 'lg',
            'data-soft': activeList === undefined ? '' : undefined,
            'data-ink': activeList !== undefined && DARK_INK_COLORS.has(activeList.color) ? 'dark' : undefined,
            style: { '--todo-item-accent': viewAccent },
            'aria-hidden': 'true',
          }, headTile),
          h('div', { class: 'dsh-todo-main-title-text' },
            h('h2', null, viewLabel),
            h('span', { class: 'dsh-todo-main-count' },
              t('openCount', { n: openCount }))),
        ),
        h('div', { class: 'dsh-todo-progress' },
          h(ProgressRing, { ratio, color: viewAccent }),
          h('span', null, String(doneInView) + '/' + String(totalInView))),
      )

      const banner = reminder === null
        ? null
        : h('div', { class: 'dsh-todo-banner', role: 'status' },
            h(BellGlyph, { size: 14 }),
            h('span', { class: 'dsh-todo-banner-text' },
              t('bannerTitle', { n: reminder.length }) + ' · '
              + reminder.slice(0, 2).map(alert => alert.task.title.trim() === '' ? t('untitled') : alert.task.title.trim()).join('、')),
            h('button', {
              type: 'button',
              class: 'dsh-todo-icon-btn',
              style: { width: '22px', height: '22px' },
              title: t('dismiss'),
              'aria-label': t('dismiss'),
              onClick: () => setReminder(null),
            }, h(CloseGlyph, { size: 12 })))

      const addRow = view === 'important' || view === 'planned'
        ? null
        : h('div', { class: 'dsh-todo-add' },
            h(PlusGlyph, { size: 14 }),
            h('input', {
              ref: addRef,
              value: draft,
              placeholder: t('addTask'),
              'aria-label': t('addTask'),
              onChange: event => setDraft(event.target.value),
              onKeyDown: (event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                submitTask()
              },
            }),
            targetList === undefined ? null : h('span', { class: 'dsh-todo-add-target' },
              t('addTo', { name: targetList.name })))

      const emptyCopy = view === 'myday' ? { title: t('emptyMyDay'), hint: t('emptyMyDayHint') }
        : view === 'important' ? { title: t('emptyImportant'), hint: t('emptyImportantHint') }
          : view === 'planned' ? { title: t('emptyPlanned'), hint: t('emptyPlannedHint') }
            : { title: t('emptyTitle'), hint: t('emptyHint') }

      const emptyState = openTasks.length === 0 && doneTasks.length === 0
        ? h('div', { class: 'dsh-todo-empty' },
            h('div', { class: 'dsh-todo-empty-glyph', style: { '--todo-item-accent': viewAccent } }, h(EmptyGlyph, null)),
            h('p', { class: 'dsh-todo-empty-title' }, emptyCopy.title),
            h('p', { class: 'dsh-todo-empty-hint' }, emptyCopy.hint))
        : null

      const gate = h('div', { class: 'dsh-todo-gate', style: { '--todo-item-accent': viewAccent } },
        h('div', { class: 'dsh-todo-gate-glyph' }, h(LockGlyph, { size: 26 })),
        h('p', { class: 'dsh-todo-gate-title' },
          t('lockedTitle', { name: activeList === undefined ? '' : activeList.name })),
        h('p', { class: 'dsh-todo-gate-hint' }, t('lockedHint')),
        h('button', {
          type: 'button',
          class: 'dsh-todo-new',
          onClick: () => { if (activeList !== undefined) openLockDialog(activeList) },
        }, h(UnlockGlyph, { size: 13 }), h('span', null, t('unlockAction'))))

      const listPane = h('section', { class: 'dsh-todo-main' },
        mainHead,
        activeLocked ? gate : null,
        activeLocked ? null : banner,
        activeLocked ? null : h('div', { class: 'dsh-todo-main-scroll' },
          addRow,
          emptyState,
          view === 'important'
            ? h('section', { class: 'dsh-todo-group' },
                openTasks.slice().sort(compareByImportance).map(taskRow))
            : groups.map(group => h('section', { key: group.key, class: 'dsh-todo-group' },
                h('h3', {
                  class: 'dsh-todo-group-head',
                  'data-tone': group.key === 'overdue' ? 'overdue' : undefined,
                }, t('group_' + group.key)),
                group.tasks.map(taskRow))),
          doneTasks.length === 0
            ? null
            : h('div', { class: 'dsh-todo-done-section' },
                  h('div', { class: 'dsh-todo-done-head' },
                    h('button', {
                      type: 'button',
                      class: 'dsh-todo-done-toggle',
                      'aria-expanded': showCompleted ? 'true' : 'false',
                      title: showCompleted ? t('collapse') : t('expand'),
                      onClick: () => setShowCompleted(value => !value),
                    }, h(ChevronGlyph, { open: showCompleted, size: 12 }),
                      t('completedCount', { n: doneTasks.length })),
                    showCompleted
                      ? h('button', {
                          type: 'button',
                          class: 'dsh-todo-done-clear',
                          'data-confirm': clearConfirm ? '' : undefined,
                          onClick: askClearCompleted,
                        }, clearConfirm ? t('confirmClear') : t('clearCompleted'))
                      : null),
                  showCompleted
                    ? doneTasks.slice().sort((left, right) => (right.doneAt ?? 0) - (left.doneAt ?? 0)).map(taskRow)
                    : null),
        ),
      )

      const selectedList = selectedTask === undefined
        ? undefined
        : lists.find(list => list.id === selectedTask.listId)
      const selectedAccent = selectedList === undefined ? COLOR_HEX.gray : (COLOR_HEX[selectedList.color] ?? COLOR_HEX.gray)
      const selectedOverdue = selectedTask !== undefined
        && selectedTask.due !== null
        && diffDays(nowKey, selectedTask.due) < 0

      const detail = selectedTask === undefined
        ? null
        : h('aside', { class: 'dsh-todo-detail', style: { '--todo-accent': selectedAccent }, 'aria-label': t('detailTitle') },
            h('div', { class: 'dsh-todo-detail-accent' }),
            h('div', { class: 'dsh-todo-detail-head' },
              h('button', {
                type: 'button',
                class: 'dsh-todo-check',
                style: { '--todo-check': selectedAccent },
                role: 'checkbox',
                'aria-checked': selectedTask.done ? 'true' : 'false',
                'aria-label': t('toggleTask'),
                'data-checked': selectedTask.done ? '' : undefined,
                onClick: () => store.toggleTask(selectedTask.id),
              }, selectedTask.done ? h(CheckGlyph, { size: 13 }) : null),
              h('div', { class: 'dsh-todo-spacer' }),
              h('button', {
                type: 'button',
                class: 'dsh-todo-icon-btn',
                title: t('dismiss'),
                'aria-label': t('dismiss'),
                onClick: () => setSelectedTaskId(null),
              }, h(CloseGlyph, null))),
            h('div', { class: 'dsh-todo-detail-body' },
              h('input', {
                class: 'dsh-todo-detail-title',
                value: selectedTask.title,
                placeholder: t('titlePlaceholder'),
                'aria-label': t('titlePlaceholder'),
                spellCheck: false,
                onChange: event => store.updateTask(selectedTask.id, { title: event.target.value }),
              }),
              h('div', { class: 'dsh-todo-field' },
                h('label', { class: 'dsh-todo-field-label' }, t('dueLabel')),
                h('div', { class: 'dsh-todo-date-row' },
                  h('button', {
                    type: 'button',
                    class: 'dsh-todo-date-trigger',
                    'data-overdue': selectedOverdue ? '' : undefined,
                    'aria-expanded': calendarOpen ? 'true' : 'false',
                    'aria-label': t('calendarOpen'),
                    onClick: () => setCalendarOpen(open => !open),
                  },
                    h(CalendarGlyph, { size: 14 }),
                    h('span', { class: 'dsh-todo-date-value' },
                      selectedTask.due === null ? t('noDue') : formatPickerDate(selectedTask.due)),
                    selectedTask.dueTime === null
                      ? null
                      : h('span', { class: 'dsh-todo-date-time' }, selectedTask.dueTime)),
                  h('input', {
                    type: 'time',
                    class: 'dsh-todo-time',
                    value: selectedTask.dueTime ?? '',
                    'aria-label': t('timeLabel'),
                    onChange: (event) => {
                      store.updateTask(selectedTask.id, { dueTime: event.target.value === '' ? null : event.target.value })
                    },
                  })),
                calendarOpen
                  ? h(Calendar, {
                      t,
                      value: selectedTask.due,
                      marked: new Set(board.tasks
                        .filter(task => task.listId === selectedTask.listId && task.due !== null)
                        .map(task => task.due)),
                      onSelect: (key) => {
                        store.updateTask(selectedTask.id, { due: key })
                        setCalendarOpen(false)
                      },
                    })
                  : null,
                h('div', { class: 'dsh-todo-chips' },
                  h('button', { type: 'button', class: 'dsh-todo-chip', onClick: () => store.updateTask(selectedTask.id, { due: nowKey }) }, t('today')),
                  h('button', { type: 'button', class: 'dsh-todo-chip', onClick: () => store.updateTask(selectedTask.id, { due: addDays(nowKey, 1) }) }, t('tomorrow')),
                  h('button', { type: 'button', class: 'dsh-todo-chip', onClick: () => store.updateTask(selectedTask.id, { due: addDays(nowKey, 7) }) }, t('nextWeek')),
                  h('button', { type: 'button', class: 'dsh-todo-chip', onClick: () => store.updateTask(selectedTask.id, { due: null }) }, t('clearDue')))),
              h('div', { class: 'dsh-todo-field' },
                h('label', { class: 'dsh-todo-field-label' }, t('importance')),
                h('div', { class: 'dsh-todo-stars-edit' },
                  [1, 2, 3, 4, 5].map(level => h('button', {
                    key: level,
                    type: 'button',
                    class: 'dsh-todo-star-btn',
                    'data-on': level <= selectedTask.important ? '' : undefined,
                    title: t('starLevel', { n: level }),
                    'aria-label': t('starLevel', { n: level }),
                    onClick: () => store.updateTask(selectedTask.id, {
                      important: selectedTask.important === level ? 0 : level,
                    }),
                  }, h(StarGlyph, { size: 16, filled: level <= selectedTask.important }))),
                  h('span', { class: 'dsh-todo-star-hint' },
                    selectedTask.important === 0
                      ? t('noStars')
                      : t('starLevel', { n: selectedTask.important })))),
              h('div', { class: 'dsh-todo-field' },
                h('div', { class: 'dsh-todo-switch-row' },
                  h('span', null, t('myDay')),
                  h('button', {
                    type: 'button',
                    class: 'dsh-todo-switch',
                    role: 'switch',
                    'aria-checked': selectedTask.myDay === nowKey ? 'true' : 'false',
                    'aria-label': t('myDay'),
                    'data-on': selectedTask.myDay === nowKey ? '' : undefined,
                    onClick: () => store.updateTask(selectedTask.id, {
                      myDay: selectedTask.myDay === nowKey ? null : nowKey,
                    }),
                  }, h('span', null)))),
              h('div', { class: 'dsh-todo-field' },
                h('label', { class: 'dsh-todo-field-label' }, t('listLabel')),
                h('div', { class: 'dsh-todo-list-row' },
                  h('span', {
                    class: 'dsh-todo-dot',
                    'data-color': selectedList === undefined ? 'gray' : selectedList.color,
                    'aria-hidden': 'true',
                  }),
                  h('select', {
                    class: 'dsh-todo-select',
                    value: selectedTask.listId,
                    'aria-label': t('listLabel'),
                    onChange: (event) => {
                      store.updateTask(selectedTask.id, { listId: event.target.value })
                      setLastListId(event.target.value)
                    },
                  }, lists.map(list => h('option', { key: list.id, value: list.id }, list.name))))),
              h('div', { class: 'dsh-todo-field' },
                h('div', { class: 'dsh-todo-switch-row' },
                  h('span', null, t('remindLabel')),
                  h('button', {
                    type: 'button',
                    class: 'dsh-todo-switch',
                    role: 'switch',
                    'aria-checked': selectedTask.remind === false ? 'false' : 'true',
                    'aria-label': t('remindLabel'),
                    'data-on': selectedTask.remind === false ? undefined : '',
                    onClick: () => store.updateTask(selectedTask.id, { remind: selectedTask.remind === false }),
                  }, h('span', null)))),
              h('div', { class: 'dsh-todo-field' },
                h('label', { class: 'dsh-todo-field-label' }, t('notePlaceholder')),
                h('textarea', {
                  class: 'dsh-todo-note',
                  value: selectedTask.note,
                  placeholder: t('notePlaceholder'),
                  'aria-label': t('notePlaceholder'),
                  onChange: event => store.updateTask(selectedTask.id, { note: event.target.value }),
                })),
            ),
            h('div', { class: 'dsh-todo-detail-foot' },
              h('span', { class: 'dsh-todo-detail-meta' },
                t('editedAt', {
                  time: new Intl.DateTimeFormat(languageTag(), {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
                  }).format(new Date(selectedTask.updatedAt)),
                })),
              h('button', {
                type: 'button',
                class: 'dsh-todo-danger',
                onClick: () => {
                  store.removeTask(selectedTask.id)
                  setSelectedTaskId(null)
                },
              }, h(TrashGlyph, { size: 13 }), h('span', null, t('deleteTask')))),
          )

      const menu = menuOpen
        ? h('div', { class: 'dsh-todo-menu', ref: menuRef, role: 'dialog', 'aria-label': t('reminders') },
            h('p', { class: 'dsh-todo-menu-title' }, t('reminders')),
            h('div', { class: 'dsh-todo-menu-row dsh-todo-switch-row' },
              h('span', null, t('remindMaster')),
              h('button', {
                type: 'button',
                class: 'dsh-todo-switch',
                role: 'switch',
                'aria-checked': board.settings.notifications ? 'true' : 'false',
                'aria-label': t('remindMaster'),
                'data-on': board.settings.notifications ? '' : undefined,
                onClick: () => store.updateSettings({ notifications: !board.settings.notifications }),
              }, h('span', null))),
            h('div', { class: 'dsh-todo-menu-row' },
              h('span', { class: 'dsh-todo-field-label' }, t('leadLabel')),
              h('div', { class: 'dsh-todo-segment' },
                [1, 3, 7].map(days => h('button', {
                  key: days,
                  type: 'button',
                  'data-active': board.settings.leadDays === days ? '' : undefined,
                  onClick: () => store.updateSettings({ leadDays: days }),
                }, t('daysUnit', { n: days }))))),
            h('div', { class: 'dsh-todo-menu-row' },
              h('div', { class: 'dsh-todo-menu-status' },
                h('span', null,
                  permission === 'granted'
                    ? t('permissionGranted')
                    : permission === 'denied'
                      ? t('permissionDenied')
                      : permission === 'unsupported' ? t('permissionUnsupported') : t('permissionAsk'))),
              permission === 'default'
                ? h('button', { type: 'button', class: 'dsh-todo-new', onClick: requestNotifications },
                    h(BellGlyph, { size: 13 }), h('span', null, t('permissionAsk')))
                : null),
            h('p', { class: 'dsh-todo-menu-hint' }, t('remindHint')))
        : null

      const lockTarget = lockDialog === null
        ? undefined
        : lists.find(list => list.id === lockDialog.listId)

      const lockModal = lockDialog === null || lockTarget === undefined
        ? null
        : h(Modal, {
            title: lockDialog.mode === 'set'
              ? t('setPasswordTitle', { name: lockTarget.name })
              : lockDialog.mode === 'unlock'
                ? t('lockedTitle', { name: lockTarget.name })
                : t('managePasswordTitle', { name: lockTarget.name }),
            onClose: closeLockDialog,
            body: h(React.Fragment, null,
              h('p', null,
                lockDialog.mode === 'unlock' ? t('lockedHint') : t('passwordHint')),
              lockDialog.mode === 'manage'
                ? null
                : h('div', { class: 'dsh-todo-modal-field' },
                    h('input', {
                      autoFocus: true,
                      type: 'password',
                      value: passwordDraft,
                      placeholder: t('passwordLabel'),
                      'aria-label': t('passwordLabel'),
                      autoComplete: lockDialog.mode === 'set' ? 'new-password' : 'current-password',
                      onChange: (event) => {
                        setPasswordDraft(event.target.value)
                        if (passwordError !== '') setPasswordError('')
                      },
                      onKeyDown: (event) => { if (event.key === 'Enter') void submitPassword() },
                    })),
              lockDialog.mode === 'set'
                ? h('div', { class: 'dsh-todo-modal-field' },
                    h('input', {
                      type: 'password',
                      value: passwordConfirm,
                      placeholder: t('confirmPasswordLabel'),
                      'aria-label': t('confirmPasswordLabel'),
                      autoComplete: 'new-password',
                      onChange: (event) => {
                        setPasswordConfirm(event.target.value)
                        if (passwordError !== '') setPasswordError('')
                      },
                      onKeyDown: (event) => { if (event.key === 'Enter') void submitPassword() },
                    }))
                : null,
              passwordError === ''
                ? null
                : h('p', { class: 'dsh-todo-modal-error' }, passwordError)),
            actions: [
              h('button', {
                key: 'cancel',
                type: 'button',
                class: 'dsh-todo-modal-cancel',
                onClick: closeLockDialog,
              }, t('cancel')),
              lockDialog.mode === 'manage'
                ? h('button', {
                    key: 'remove',
                    type: 'button',
                    class: 'dsh-todo-modal-cancel',
                    onClick: removeListPassword,
                  }, t('removePassword'))
                : null,
              lockDialog.mode === 'manage'
                ? h('button', {
                    key: 'lock',
                    type: 'button',
                    class: 'dsh-todo-modal-confirm',
                    onClick: lockListNow,
                  }, t('lockNow'))
                : h('button', {
                    key: 'submit',
                    type: 'button',
                    class: 'dsh-todo-modal-confirm',
                    onClick: () => { void submitPassword() },
                  }, lockDialog.mode === 'set' ? t('savePassword') : t('unlockAction')),
            ],
          })

      const newListModal = !newListOpen
        ? null
        : h(Modal, {
            title: t('newList'),
            onClose: closeNewList,
            body: h(React.Fragment, null,
              h('div', { class: 'dsh-todo-newlist-row' },
                h('span', {
                  class: 'dsh-todo-tile',
                  style: { '--todo-item-accent': COLOR_HEX[newListColor] },
                  'data-ink': DARK_INK_COLORS.has(newListColor) ? 'dark' : undefined,
                  'aria-hidden': 'true',
                }, newListName.trim() === '' ? h(PlusGlyph, { size: 12 }) : newListName.trim().slice(0, 1)),
                h('div', { class: 'dsh-todo-modal-field' },
                  h('input', {
                    autoFocus: true,
                    value: newListName,
                    placeholder: t('listNamePlaceholder'),
                    'aria-label': t('listNamePlaceholder'),
                    onChange: event => setNewListName(event.target.value),
                    onKeyDown: (event) => { if (event.key === 'Enter') submitNewList() },
                  }))),
              h('div', { class: 'dsh-todo-field-label dsh-todo-swatch-label' }, t('listColor')),
              h('div', {
                class: 'dsh-todo-swatches',
                role: 'radiogroup',
                'aria-label': t('listColor'),
              }, COLORS.map(color => h('button', {
                key: color,
                type: 'button',
                class: 'dsh-todo-swatch',
                role: 'radio',
                'aria-checked': newListColor === color ? 'true' : 'false',
                'aria-label': t('color_' + color),
                title: t('color_' + color),
                'data-ink': DARK_INK_COLORS.has(color) ? 'dark' : undefined,
                style: { background: COLOR_HEX[color], color: COLOR_HEX[color] },
                'data-selected': newListColor === color ? '' : undefined,
                onClick: () => setNewListColor(color),
              }, newListColor === color ? h(CheckGlyph, { size: 11 }) : null)))),
            actions: [
              h('button', {
                key: 'cancel',
                type: 'button',
                class: 'dsh-todo-modal-cancel',
                onClick: closeNewList,
              }, t('cancel')),
              h('button', {
                key: 'create',
                type: 'button',
                class: 'dsh-todo-modal-confirm',
                disabled: newListName.trim() === '',
                onClick: submitNewList,
              }, t('createList')),
            ],
          })

      return h('div', { class: 'dsh-todo-root' },
        h('style', null, CSS),
        h('header', { class: 'dsh-todo-toolbar' },
          h('h1', { class: 'dsh-todo-heading' },
            h('span', { class: 'dsh-todo-title' }, t('panel')),
            h('span', { class: 'dsh-todo-subtitle' }, t('subtitle'))),
          h('div', { class: 'dsh-todo-spacer' }),
          h('label', { class: 'dsh-todo-search' },
            h(SearchGlyph, { size: 14 }),
            h('input', {
              type: 'text',
              value: search,
              placeholder: t('search'),
              'aria-label': t('search'),
              onChange: event => setSearch(event.target.value),
              onKeyDown: (event) => {
                if (event.key !== 'Escape') return
                event.stopPropagation()
                setSearch('')
              },
            }),
            search === ''
              ? null
              : h('button', {
                  type: 'button',
                  class: 'dsh-todo-search-clear',
                  title: t('clearSearch'),
                  'aria-label': t('clearSearch'),
                  onClick: () => setSearch(''),
                }, h(CloseGlyph, { size: 12 }))),
          h('button', {
            ref: bellRef,
            type: 'button',
            class: 'dsh-todo-icon-btn',
            title: t('reminders'),
            'aria-label': t('reminders'),
            'data-on': permission === 'granted' && board.settings.notifications ? '' : undefined,
            'aria-expanded': menuOpen ? 'true' : 'false',
            onClick: () => {
              setPermission(notificationPermission())
              setMenuOpen(open => !open)
            },
          }, h(BellGlyph, null))),
        h('div', { class: 'dsh-todo-body' },
          rail,
          listPane,
          detail,
        ),
        menu,
        lockModal,
        newListModal,
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        locale = ctx.locale
        boundT = locale.bind(NS)
        ctx.effect(() => locale.register(NS, 'en', EN), 'todo: english copy')
        ctx.effect(() => locale.register(NS, 'zh', ZH), 'todo: chinese copy')

        store = createStore(boundT)
        ctx.effect(() => () => { store.flush() }, 'todo: flush tasks on unload')

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 15,
          locale: NS,
          label: () => boundT('panel'),
        }, TodoPanelIcon))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, TodoPage))
      },
    }
  },
})
