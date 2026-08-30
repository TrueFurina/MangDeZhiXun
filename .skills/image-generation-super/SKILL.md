---
name: image-generation-super
description: 图片生成与编辑（超级版），调用 Miaoda-ImageGen-Super 模型生成和编辑图片。需要 AI 画图、生成图片、编辑图片、多图融合、背景替换、风格转换、电商商品图合成、海报设计、插画创作时优先使用该工具。

license: MIT
---

## 能力概述

调用 Miaoda-ImageGen-Super 模型进行 AI 图像生成与编辑，支持通过自然语言描述生成高质量图片，以及上传多张图片进行 AI 编辑融合。


| 属性 | 值 |
|------|-----|
| Plugin ID | `e480d4b6-835c-45f8-a494-d38da962b394` |
| 认证模式 | `platform_managed`（密钥由平台注入） |
| 密钥来源 | `process.env["INTEGRATIONS_API_KEY"]` |
| Auth Header | `X-Gateway-Authorization: Bearer <key>` |
| 支持平台 | Web、MiniProgram |
| 响应格式 | JSON，图片以 Base64 编码内嵌于 `data[].b64_json` |

**接口列表：**

| 接口 | 方法 | Endpoint | 说明 |
|------|------|----------|------|
| 创建图片 | POST | `https://app-a7lm1eejtypt-api-wLNdpny6ZpVa-gateway.appmiaoda.com/image2` | 根据文本描述生成图片 |
| 编辑图片 | POST | `https://app-a7lm1eejtypt-api-wLNdpny6ZpVa-gateway.appmiaoda.com/image2` | JSON Base64 图片编辑融合 |

**核心能力：**

- **文生图**：通过 `prompt` 描述生成全新图片，支持多种尺寸；每次调用只生成 1 张图片
- **多图编辑**：上传 1–3 张图片，通过文本描述控制融合、背景替换、风格统一、局部重绘等效果
- **局部擦除（mask 擦除）**：提供原图 + 擦除区域 mask（白色=擦除，黑色=保留），先在本地把白区填成哨兵色再交给模型填补，消除白区内的物体/人物/文字/水印
- **提示词优化**：接口返回 `revised_prompt`，展示模型自动优化后的提示词


**平台差异概览：**

| 平台 | Edge Function 返回 | 前端获取图片方式 |
|------|-------------------|----------------|
| Web | JSON（含 Base64） | 解析 JSON，构造 `data:image/png;base64,...` URI 或用 Blob 渲染 |
| MiniProgram | JSON（含 Base64） | 解析 JSON，写临时文件后用 `<image>` 组件展示 |

详细参数说明、代码示例及两平台完整实现见：
- `references/image-generations-api.md` — 创建图片接口
- `references/image-edits-api.md` — 编辑图片接口

---

## 使用前决策

调用本工具前，先判断场景是否真的需要 AI 生成：

| 场景 | 推荐方案 |
|------|---------|
| 根据文字描述生成全新图片 | ✅ 本工具（文生图） |
| 上传图片 + 提示词做风格转换或内容编辑 | ✅ 本工具（图生图） |
| 多张图片融合 / 背景替换 / 海报合成 | ✅ 本工具（多图编辑） |
| 擦除 / 去除图中的物体、人物、文字、水印（**已提供 mask 图**） | ✅ 本工具（mask 擦除两步流程：`erase_prepare.py` → `generate_image.py`） |
| 图片内容审核 / 质量评分 | ❌ 改用视觉模型直接分析，无需生成 |


**图生图优先原则（重要）：**

满足以下任一条件时，**必须使用 `editImage`（图生图）接口，禁止使用 `createImage`（文生图）**：
1. 用户在对话中上传了图片
2. 本次对话中已通过本工具生成过图片

用户提出的修改意见（如"换个背景"、"改成卡通风格"、"让颜色更鲜艳"）均属于对已有图片的编辑，必须走图生图流程。

**mask 擦除优先原则（重要）：** 如果用户同时提供了**原图和一张擦除区域 mask 图**（或明确说明"白色区域的内容要擦掉/去掉"），
**必须走"局部擦除用法"里的两步流程**（`erase_prepare.py` 预处理 → `generate_image.py` 生成），
禁止跳过预处理、只用 `generate_image.py` 加自然语言描述来做擦除——后者模型识别不准，常常把目标物体重新画出来。

**禁止覆盖原图：** 编辑后的图片必须保存为新文件（如在原文件名后加 `_v2`、`_edited`、`_erased` 或序号），原始图片文件不得修改或删除。


---

## Prompt 编写规范

底层模型（Miaoda-ImageGen-Super）对英文提示词的理解和图像质量通常优于中文，请优先将用户需求改写为英文后再提交 API。

**写作原则：**
- 使用描述句，直接描述目标画面，而非告诉模型"帮我生成……"
- 具体优于抽象：`"a ginger cat sitting in a sunlit garden"` 好于 `"可爱的猫"`
- 避免否定词：不写 `"no background"`，改写 `"isolated on pure white background"`
- 末尾加质量修饰词提升细节：`high quality`, `detailed`, `8k`, `photorealistic`

**文生图模板：**

```
[Subject], [Action/Pose/State], [Scene/Environment], [Lighting], [Style], [Quality]
```

示例：
```
A golden retriever puppy, sitting and looking up curiously, in a cozy living room with warm afternoon lighting, watercolor illustration style, high quality, detailed
```

**图生图 / 多图编辑额外建议：**
- 先描述希望**保留**的内容，再描述希望**改变**的内容
- 风格迁移时明确目标风格，例如 `"convert to anime style"` 或 `"oil painting style"`
- 多图融合时说明图片之间的关系，例如 `"use image 1 as background, place the product from image 2 in the center"`

---

## 生成期用法（Agent 直接调用）

> **在调用 API 之前，先将用户需求翻译/改写为英文提示词**，Miaoda-ImageGen-Super 模型对英文输入的图像质量明显优于中文。

两个接口均为同步调用，直接返回 Base64 编码图片，不含 URL。

**核心原则：Base64 数据绝不进入模型上下文。** 图片 Base64 通常达 1–3 MB，折合 25 万–75 万 token。应直接调用 `scripts/generate_image.py`，脚本内完成请求、解码、写文件全部操作，模型只接收最终元数据。

**单条命令限制：每次 Bash 工具执行的 `command` 中只能包含 1 个 `python3 scripts/generate_image.py` 调用。** 如果用户需要生成多张图片，必须拆成多次 Bash 工具调用，每次单独执行一条 `python3 scripts/generate_image.py ... --output <不同文件>` 命令；禁止在同一条命令里用 `&&`、`;` 或换行串联多个 `generate_image.py`，避免单次执行耗时过长导致 Bash 工具超时。

**完整生成期工作流：**

1. 判断接口：对话中有已有图片（用户上传或之前已生成）→ 加 `--images`；纯文字描述 → 不加
2. 确定保存路径（图生图**不得覆盖原文件**，追加 `_v2` / `_edited` 后缀）
3. 用 Bash 工具执行脚本（参见下方命令），**必须将 Bash 工具的超时时间设置为 600000ms（600 秒）**，否则默认 120 秒会导致请求中断
4. 脚本 stdout 输出一行 JSON，读取 `file` 和 `revised_prompt` 告知用户

**文生图：**

```bash
python3 <skill-path>/scripts/generate_image.py \
  --prompt "ENGLISH_PROMPT_HERE" \
  --output image.png \
  --size 1024x1024
```

**图生图 / 多图编辑：**

```bash
python3 <skill-path>/scripts/generate_image.py \
  --prompt "ENGLISH_PROMPT_HERE" \
  --output image_v2.png \
  --size 1024x1024 \
  --images /path/to/img1.png [/path/to/img2.png]
```

脚本成功时 stdout 输出：`{"file": "image.png", "revised_prompt": "...", "size": "1024x1024"}`

**Prompt 空间位置增强（可选）：**

加入空间位置词可提高构图准确性：`centered`、`in the top-left corner`、`in the foreground / background`、`on the left side / right side`、`filling the entire frame`。

**脚本使用约束（生成图片时严格遵守）：**
- **禁止新增脚本**：只能执行 `scripts/` 目录中已有的脚本（`generate_image.py`、`erase_prepare.py`），不得为本次任务创建任何新的 Python/Shell/Node 脚本或临时封装。
- **禁止改名**：脚本文件名是固定的，不得重命名，也不得复制成其他文件名后再调用。
- **非必要不修改**：除非用户明确要求修复脚本 Bug，否则不得修改脚本源码；所有行为差异通过命令行参数控制。

---

## 局部擦除用法（mask 擦除，Agent 直接调用）

当用户提供**原图 + 擦除区域 mask 图**（mask 中**白色=要擦除的区域，黑色=必须保留的区域**），
要求消除白区内的物体 / 人物 / 文字 / 水印时，走下面的**两步串行流程**，
图片生成仍然由 `generate_image.py` 完成，其输出即为最终交付结果。

**为什么必须先预处理，不能直接调 `generate_image.py`：** 直接用自然语言描述"把某个东西删掉"，
模型往往识别不准，或者把目标物体重新画一遍。第一步把白区物理填成品红哨兵色，
目标物体在模型看到图片之前就已经不存在了，模型的任务被简化成"填补这块空缺"，
擦除成功率显著更高。

### 第一步 · 预处理（本地，不调 API）

```bash
python3 <skill-path>/scripts/erase_prepare.py \
  --image /path/to/original.png \
  --mask /path/to/mask.png
```

**不要传 `--workdir`。** 默认中间产物写到系统临时目录，用户工作目录里不会出现 `*_prepared.png`。
只有用户明确要求查看中间图时才传 `--workdir`。

stdout 输出一行 JSON，字段直接用于第二步：

```json
{"prepared_image":"/var/folders/xx/erase_ab12/original_prepared.png","prompt":"This is an inpainting task ...","size":"1024x1536","erase_pixels":18432,"original_size":"1024x1536"}
```

可选参数：

| 参数 | 默认 | 说明 |
|------|------|------|
| `--extra-prompt` | 空 | 英文描述白区里原本是什么（如 `"the red trash bin"`），提高填补准确度 |
| `--grow` | `2` | 白区向外扩张的像素数，覆盖物体边缘残留的描边/阴影；有残影时增大到 4–8 |
| `--threshold` | `128` | mask 二值化阈值，灰度 > 阈值视为白色擦除区 |
| `--size` | 自动 | 指定上游输出尺寸，默认按原图宽高比自动选最接近的受支持尺寸 |
| `--workdir` | 系统临时目录 | 中间产物目录；**默认不要指定**，避免中间图污染用户目录 |

### 第二步 · 调用 `generate_image.py` 生成最终结果

**必须把第一步 JSON 里的 `prompt` 原样传给 `--prompt`，`prepared_image` 传给 `--images`，`size` 传给 `--size`。**
不要自己重写 prompt，不要把原图或原始 mask 传进去。`--output` 就是最终交付的文件。

```bash
python3 <skill-path>/scripts/generate_image.py \
  --prompt "<第一步 JSON 中的 prompt 原文>" \
  --images "<第一步 JSON 中的 prepared_image>" \
  --size <第一步 JSON 中的 size> \
  --output /path/to/original_erased.png
```

**Bash 工具超时必须设为 600000ms（600 秒）**，默认 120 秒会中断请求。

脚本 stdout 输出 `{"file": "...", "revised_prompt": "...", "size": "..."}`，把 `file` 作为擦除结果告知用户。

### 交付时只提供最终结果

`*_prepared.png` 是给模型看的中间输入，**不是交付物**：

- 不要把它写进用户工作目录（即不要传 `--workdir`），不要在回复中展示、附上或引用它的路径。
- 回复里只提最终的 `_erased` 文件；如需说明做了什么，用文字描述（"已按你圈选的区域擦除并填补背景"），不要贴中间图。
- 如果历史流程已经在用户目录留下了 `*_prepared.png`，可以在交付后顺手删掉它——但只删这个中间文件，原图和结果图不能动。

### 必须遵守

1. **两步必须串行执行，禁止拼接**：第二步依赖第一步 JSON 里的 `prompt` / `prepared_image` / `size`，必须等第一条 Bash 调用返回并读到 JSON 后再发起第二条；禁止用 `&&`、`;` 或换行把它们串在同一条命令里。
2. **单条命令限制：每次 Bash 工具执行只能包含 1 个脚本调用。** 需要擦除多张图片时，按图片逐轮跑完两步，禁止在一条命令里串联多次调用。
3. **不得覆盖原图**：第二步 `--output` 必须是新文件名（如 `_erased` 后缀），不能指向用户提供的原图或第一步的 `prepared_image`。
4. **不要自己写擦除逻辑**：禁止生成任何 Python/Node 代码做填充、mask 处理或 Base64 解码，禁止新增脚本，全部由这两个脚本完成。
5. **上游会重绘整张画布**：模型输出的像素与原图不会逐像素一致，白区外可能出现轻微重绘、甚至丢掉圈选区附近的表格/小字（见下方"擦多了"）。交付前必须自己对比原图与结果，确认圈选区外的文字/表格/图案都还在；如果用户要求"白区外一个像素都不能变"，需先如实告知这个限制做不到。

### 擦多了 / 圈选区外的内容被删掉

这是本流程最常见的失败模式：模型把圈选区周围的表格、小字、装饰一起"清理"了，
因为它倾向于把画面整体理解为"要变干净"，而不是只补一个洞。处理顺序：

1. **先用 `--extra-prompt` 锚定保留内容**，明确点名不能动的东西，例如
   `--extra-prompt "the removed content was a text banner; keep the ingredients table below it, the NET WT line, and all side illustrations unchanged"`。
   点名越具体，模型越不会顺手删掉它们。
2. **确认 mask 没有超出目标**：`erase_pixels` 占原图比例过大，或 mask 白区贴到了相邻元素上，都会让模型顺势多改。必要时让用户重新圈选更贴合目标的区域，或把 `--grow` 调小到 `0`–`1`。
3. **重试**：同样的输入多跑一次往往结果不同，挑保留得最完整的那次交付。
4. 仍然删得多 → 如实告知用户这是上游模型重绘整图导致的，本流程无法逐像素锁定圈选区外的内容，建议改用支持 mask 的专业修图工具。

### 常见问题处理

- 报错 `Mask has no white region` / `Mask is fully white` → mask 极性反了（白黑颠倒）或阈值不合适，确认"白色=擦除区"后重试。
- 擦除位置边缘仍有物体残影 → 第一步增大 `--grow`（如 `--grow 6`），重跑两步。
- 白区内没填干净、或结果里残留品红色块 → 第一步加 `--extra-prompt "英文描述该物体"`，重跑两步。
- 输出尺寸与原图不一致 → 第一步用 `--size` 指定更接近原图宽高比的受支持尺寸。

**依赖：** `erase_prepare.py` 需要 Pillow（`pip install Pillow`）。缺失时脚本会直接报错退出，此时先安装 Pillow，不要绕过脚本自行实现。


---

## 生成后用法（应用内通过 Edge Function 调用）

应用内通过 Edge Function 安全调用上游 API，密钥不暴露给前端。

**安全合约：**
- 前端只发送业务参数到 Edge Function，不接触 API Key
- Edge Function 从 `Deno.env.get("INTEGRATIONS_API_KEY")` 读取密钥
- 请求上游时注入 `X-Gateway-Authorization: Bearer ${apiKey}`
- `429`（配额超限）和 `402`（余额不足）错误体原样透传给前端
- 返回的 Base64 数据由前端接收并解码渲染

**Edge Function 实现：**
- `image-generations`：代理创建图片接口，处理 JSON 请求
- `image-edits`：代理编辑图片接口，接收 JSON Base64 图片，服务端再转发为 multipart/form-data

完整 Edge Function 代码和前端调用代码详见：
- `references/image-generations-api.md`（创建图片的 Edge Function + 前端代码）
- `references/image-edits-api.md`（编辑图片的 Edge Function + 前端代码）

---

## 参数说明

### 创建图片核心参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | `string` | 是 | 固定值：`gpt-image-2` |
| `prompt` | `string` | 是 | 图片生成描述词 |
| `size` | `string` | 否 | 输出尺寸：`1024x1024`、`1536x1024`、`1024x1536`、`2848x1152` |
| `n` | `integer` | 否 | 生成数量，默认 1 |

### 编辑图片核心参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | `string` | 是 | 固定值：`gpt-image-2` |
| `prompt` | `string` | 是 | 图片编辑描述词 |
| `size` | `string` | 否 | 输出尺寸 |
| `n` | `integer` | 否 | 输出数量，默认 1 |
| `images[0].b64_json` | `string` | 是 | 主图片 Base64 数据 |
| `images[1].b64_json` | `string` | 否 | 附加图片 Base64 数据 |
| `images[2].b64_json` | `string` | 否 | 附加图片 Base64 数据 |

### 返回核心字段

| 字段路径 | 类型 | 说明 |
|----------|------|------|
| `created` | `number` | 创建时间戳 |
| `data` | `array` | 生成结果列表 |
| `data[].b64_json` | `string` | Base64 编码图片内容 |
| `data[].revised_prompt` | `string` | 模型自动优化后的提示词 |
| `usage` | `object` | Token 消耗统计（仅编辑接口返回） |

---

## 注意事项

- **Base64 不进上下文**：生成期图片数据通过脚本直接写到磁盘，禁止让模型接收 Base64 再输出保存命令，否则每次生成消耗 25–75 万 token。
- **禁止覆盖原图**：图生图保存路径必须是新文件名（追加 `_v2` / `_edited` / `_erased` / 序号），原始文件不得修改或删除。
- **mask 擦除必须先预处理**：`erase_prepare.py`（本地把白区填成品红哨兵色）→ `generate_image.py --images <prepared_image>`（调 API 填补，输出即交付结果）。跳过预处理直接描述"删掉某物"会导致模型识别不准。两条命令必须串行、每次 Bash 只跑一条。

- **密钥安全**：生成期密钥由 `process.env["INTEGRATIONS_API_KEY"]` 注入；Edge Function 用 `Deno.env.get("INTEGRATIONS_API_KEY")`，严禁暴露到前端。
- **文件上传限制**：编辑接口最多支持 3 张图片（`images[0].b64_json` 必填），需确保图片格式和大小符合上游要求。
- **错误处理**：`429` 配额耗尽 / `402` 余额不足 / `400` 参数错误 / `401` 认证失败。
- **计费**：本插件未启用计费（`enable_billing: false`），但仍需确保 API Key 有效且配额充足。
