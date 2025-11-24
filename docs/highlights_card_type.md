# Highlights 卡片类型

**日期:** 2025-11-24
**状态:** ✅ 已完成

## 概述

新增了 "highlights" 卡片类型，专门用于展示重点内容、引用、座右铭等需要突出显示的文字信息。

## 特点

### 1. 居中布局
- 标题和副标题完全居中显示（水平和垂直）
- 适合展示简短但重要的信息
- 视觉焦点集中

### 2. 极简设计
- **不显示图标** - 保持内容纯粹
- **不显示按钮** - 避免干扰
- **不显示拖拽/编辑按钮** - 悬停时才显示（与其他卡片一致）

### 3. 灵活的背景
- **支持纯色背景** - 使用自定义颜色
- **支持背景图片** - 可设置背景图像
- **文字自适应** - 有背景图时文字自动变白色并添加阴影

## 使用场景

1. **座右铭/格言**
   ```
   标题: "Stay Hungry, Stay Foolish"
   副标题: "- Steve Jobs"
   ```

2. **重要公告**
   ```
   标题: "网站维护通知"
   副标题: "2025年1月1日 00:00-06:00"
   ```

3. **个人宣言**
   ```
   标题: "Designer & Developer"
   副标题: "Creating beautiful digital experiences"
   ```

4. **统计数据**
   ```
   标题: "10K+"
   副标题: "Happy Customers Worldwide"
   ```

## 技术实现

### 文件修改

1. **lib/types.ts**
   - 在 `CardType` 中添加 `'highlights'` 类型

2. **components/bento/BentoCard.tsx**
   - 添加 `isHighlightsCard` 判断
   - 排除 highlights 卡片显示图标
   - 排除 highlights 卡片显示按钮
   - 添加专门的居中布局

3. **components/editor/UnifiedTypeSelector.tsx**
   - 在基础类别中添加 highlights 选项
   - 默认尺寸为 Medium (2×1)

4. **翻译文件**
   - `messages/en.json`: "Highlights"
   - `messages/zh.json`: "重点展示"
   - `messages/ja.json`: "ハイライト"

### 样式特性

```tsx
// Highlights 卡片布局
<div className="flex flex-col items-center justify-center h-full text-center px-4">
  {title && (
    <h3 className={`font-bold text-2xl leading-tight tracking-tight ${
      imageUrl ? 'text-white text-shadow-md' : ''
    }`}>
      {title}
    </h3>
  )}
  {subtitle && (
    <p className={`text-base font-medium mt-3 leading-relaxed ${
      imageUrl ? 'text-white/95 text-shadow-sm' : 'opacity-80'
    }`}>
      {subtitle}
    </p>
  )}
</div>
```

### 样式说明

- **标题:** 2xl 字号，粗体，紧凑行距
- **副标题:** base 字号，中等字重，上边距 3
- **内边距:** 左右各 4 单位，防止文字贴边
- **对齐:** 完全居中（flex items-center justify-center）
- **文字阴影:** 有背景图时自动添加，提高可读性

## 配置选项

### 必填字段
- **标题** - 主要展示内容

### 可选字段
- **副标题** - 补充说明或署名
- **背景图片** - 增强视觉效果
- **自定义颜色** - 背景色和文字色

### 不支持的字段
- ❌ 图标 - 不显示
- ❌ 按钮文字 - 不显示
- ❌ URL - 不可点击（保持纯展示）

## 推荐尺寸

- **默认:** Medium (2×1) - 适合大多数场景
- **可选:** Large (2×2) - 适合长文本或需要更大视觉冲击
- **不推荐:** Small (1×1) - 空间太小，文字可能拥挤

## 设计建议

### 文字内容
- 标题保持简短（1-10 个字）
- 副标题可稍长但不超过 2 行
- 使用有力的、引人注目的词语

### 颜色搭配
- **纯色背景:** 选择与整体风格协调的颜色
- **背景图片:** 选择对比度高的图片，确保文字清晰
- **文字颜色:** 有背景图时自动为白色，纯色背景时根据背景色自动调整

### 视觉层次
- 将 highlights 卡片放在显眼位置
- 与其他卡片形成对比
- 不要在一个页面放置过多 highlights 卡片（建议 1-3 个）

## 示例配置

### 示例 1: 简约风格
```json
{
  "type": "highlights",
  "title": "Less is More",
  "subtitle": "Minimalist Design Philosophy",
  "size": "medium",
  "customBgColor": "rgba(59, 130, 246, 0.1)",
  "customTextColor": "rgba(59, 130, 246, 1)"
}
```

### 示例 2: 背景图片
```json
{
  "type": "highlights",
  "title": "Adventure Awaits",
  "subtitle": "Explore the Unknown",
  "size": "large",
  "imageUrl": "https://example.com/mountain.jpg"
}
```

### 示例 3: 数据展示
```json
{
  "type": "highlights",
  "title": "99.9%",
  "subtitle": "Uptime Guarantee",
  "size": "medium",
  "customBgColor": "rgba(16, 185, 129, 0.1)",
  "customTextColor": "rgba(16, 185, 129, 1)"
}
```

## 与其他卡片类型的对比

| 特性 | Highlights | Universal | Text |
|------|-----------|-----------|------|
| 图标 | ❌ | ✅ | ✅ |
| 按钮 | ❌ | ✅ | ✅ |
| 链接 | ❌ | ✅ | ✅ |
| 居中 | ✅ | ❌ | ❌ |
| 背景图 | ✅ | ✅ | ❌ |
| 用途 | 重点展示 | 通用链接 | 纯文本 |

---
**实现者:** Kiro AI Assistant
