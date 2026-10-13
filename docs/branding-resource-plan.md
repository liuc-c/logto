# liuovo 品牌资源替换调研与规划

调研与实施日期：2026-10-13。状态：用户确认 HTML 方案后，已直接内置个人品牌；未修改租户数据库或生产部署。

调查基线：

- 当前 Logto：`bb091b90edd07179b50f8b966bf9157e4d1cf153`。
- [liuovo-logo](https://github.com/liuc-c/liuovo-logo)：`0500146ccace0275785caa4e13f01c230fc5d410`。
- 资源已浅克隆到 `/tmp/logto-branding-research-FbMJf1/liuovo-logo`。临时目录只用于本次调查；实施时应将选定版本的资源收进 Logto 仓库。
- 证据为本地源码、SVG 内容、PNG/ICO 尺寸及资源仓库说明；实施后的验证范围见下方记录。

## 资源可用性

资源仓库共有 12 个图形文件：7 个 SVG、4 个 PNG、1 个 ICO。文字已转成路径，SVG 未发现脚本、外部图片引用或字体依赖。最大文件为 `icon-512.png`，约 23 KB；现有品牌图片上传允许 SVG，前端图片上限为 500 KB。

| 资源 | 已核对的规格 | 建议用途 |
| --- | --- | --- |
| `logo-intro-light.svg` / `logo-intro-dark.svg` | 173.76×60，约 4.75 KB/份；CSS 开场动画约 1.22 秒、播放一次 | 横版 Logo 首选，分别用于浅色和深色背景；可通过现有 `<img>` Logo 入口接入 |
| `logo-light.svg` / `logo-dark.svg` | 相同画布，约 3.86 KB/份，无动画 | 静态场景、文档和动画不可用时的替代资源 |
| `favicon.svg` | 64×64，437 B；根据系统 `prefers-color-scheme` 切换黑白 | 现代浏览器标签页图标 |
| `favicon.ico` / `favicon-32.png` | ICO 包含 16/32/48；PNG 为 32×32 | 传统 favicon 和现有 PNG fallback |
| `apple-touch-icon.png` | 180×180，白底留边 | iOS 加入主屏幕图标，独立于 favicon 使用 |
| `loading.svg` | 64×64，约 1.64 KB；1.2 秒循环，`currentColor` | 全屏加载、加载遮罩，封装为可复用的内联 SVG 组件 |
| `hover-h7a.svg` | 横版，约 16.35 KB；CSS 悬停效果，`currentColor` | 可选的交互标志；需要内联，普通 `<img>` 不支持其悬停交互 |
| `icon-192.png` / `icon-512.png` | 192×192 / 512×512 | 未来 Android/PWA 图标；当前主要前端未发现 manifest 入口，不列入首期 |

资源规格来源：[dist/README.md](https://github.com/liuc-c/liuovo-logo/blob/0500146ccace0275785caa4e13f01c230fc5d410/dist/README.md)、同提交的 SVG 文件，以及本地 PNG/ICO 元数据读取。intro 的时长和播放方式由 SVG 的 CSS 核对，并已在本地 Chromium 检查显示。

## Logto 替换对照表

下表保留最初调研的建议；最终实施状态见下方记录。现有应用/组织独立品牌的优先级继续生效。

| 页面或场景 | 现有资源或入口 | liuovo 资源 | 接入方式与范围 | 建议 |
| --- | --- | --- | --- | --- |
| 业务登录、注册、找回密码等页头 | `BrandingHeader`，运行时 `branding.logoUrl` / `darkLogoUrl` | 两份 `logo-intro-*` | 更新业务租户品牌配置；现有 Logo 用 `<img>` 显示，通常无需改页头逻辑 | 优先 |
| 管理后台的登录/注册 | `admin` 租户登录体验；seed 仍引用 `logto.io/logo*.svg` | 两份 `logo-intro-*`、favicon | 单独处理 `admin` 的品牌配置；改 seed 仅影响新初始化数据，不能更新已存在的租户 | 优先 |
| 管理控制台顶栏、欢迎页、OSS 初次设置页、切换账户页 | `packages/console/src/assets/images/logo.svg` 被多个组件直接导入 | 两份 `logo-intro-*` | 改成随 Console 主题选择资源的共用 Logo 组件，并保留点击回首页和合适的图片尺寸 | 优先 |
| 管理控制台初始加载画面 | `AppLoading`：硬编码 Logo + `Spinner.Daisy` | `loading.svg` + 简短提示 | 加载区域只显示一个循环徽记，避免横版 Logo 中的徽记重复；intro 用于正常页头 | 优先 |
| 登录体验的加载遮罩、验证码等等待状态 | `shared/components/LoadingLayer/LoadingIcon`、`assets/icons/loading-icon.svg` | `loading.svg` | 替换共享 LoadingIcon 并适配尺寸、颜色、SVG ID；移除这条渲染路径上旧的整图旋转动画 | 优先 |
| 账户中心页头 | `PageHeader`，复用登录体验品牌配置 | 两份 `logo-intro-*` | 可随业务租户品牌配置同步；账户中心已有 Logo `<img>` 入口 | 优先 |
| 账户中心全屏加载 | `GlobalLoading`：配置 Logo + 本地 `loading-icon.svg` | `loading.svg` + 简短提示 | 加载区域只显示一个循环徽记；正常页头 Logo 继续读取品牌配置 | 优先 |
| 控制台浏览器图标 | `console/index.html`、`src/favicon.ico` | `favicon.svg` + `favicon.ico` | 更新 HTML 图标链接、保留 ICO 后备；资源应随构建发布 | 优先 |
| 登录体验及账户中心浏览器图标 | 两处 `AppMeta`；配置 `favicon` / `darkFavicon`，fallback 为共享 `favicon.png` | `favicon.svg` + `favicon-32.png`，并补 ICO 后备 | 更新品牌配置及默认静态资源；图标链接策略需同时检查初始 HTML 与 React Helmet | 优先 |
| 控制台、登录体验、账户中心的 Apple 图标 | Console HTML；Experience/Account 的 `AppMeta` | `apple-touch-icon.png` | Console 可直接替换；Experience/Account 要把 Apple 图标选择与 favicon 分开，才能正确用到 180×180 PNG | 优先 |
| 默认登出完成页 | `core/static/html/post-logout/index.html`：独立 favicon、内联 `Powered By` Logto SVG | favicon；若加入本站品牌，使用 intro Logo | 这是独立静态 HTML，需要单独修改；保留成功状态图标和登出流程 | 建议纳入 |
| 登录页及账户中心 `Powered by Logto` 页脚 | `LogtoSignature` 和 light/dark/shadow 三份 SVG | 推荐使用现有隐藏设置；若要品牌页脚，另设 liuovo 链接 | 该区域表示技术来源。若改成本站品牌，应同时改文案、链接和可访问名称，不能只替换图片 | 使用已有隐藏设置 |
| 按钮、行内、小型加载提示 | Experience 的 `loading-ring.svg` / `RotatingRingIcon`，Console 的 `Spinner.Ring` / `Daisy` | 可选 `loading.svg` | 独立于全屏加载；小尺寸和按钮前景色需要专门检查，建议首期保留通用小转圈 | 可选 |
| 浏览器 Demo 和 Device Flow Demo | 两包的 favicon；普通 Demo 复用 Experience；设备 Demo 有 `logto-icon.svg` 和品牌页脚 | favicon、方形图标；必要时 intro Logo | 两个 Demo 分别处理；已有关闭 Demo 的功能，如果实际部署关闭可延后 | 可选 |
| 控制台网站标题与少量品牌文案 | `mainTitle = 'Logto Console'`，Topbar 的翻译 `title` 等 | 建议 `liuovo Console` 或选定名称 | 文案不是图形资源；需要同步相关 locale，避免只替换 Logo 后标题仍显示旧品牌 | 可选 |
| Cloud 专属标志、Inkeep 标志、文档/仓库展示图 | `cloud-logo.svg`、SCSS 内嵌标志、根目录 `logo.png` / README | 静态 Logo 或 intro，视展示场景选择 | OSS 主路径不依赖 Cloud 标志；文档和 README 可另做展示品牌整理 | 首期延后 |

主要源码入口：

- 登录页头：[BrandingHeader](../packages/experience/src/components/BrandingHeader/index.tsx)；尺寸为高 40px、宽自适应，liuovo 的 2.896:1 比例在此约宽 116px。
- 品牌配置和优先级：[getBrandingLogoUrl](../packages/experience/src/shared/utils/logo.ts)、[登录体验种子](../packages/schemas/src/seeds/sign-in-experience.ts)、[admin 租户种子](../packages/schemas/src/seeds/sign-in-experience.ts)。
- Console 标志：[Topbar](../packages/console/src/components/Topbar/index.tsx)、[Welcome](../packages/console/src/pages/Welcome/index.tsx)、[OssOnboarding](../packages/console/src/pages/OssOnboarding/index.tsx)、[SwitchAccount](../packages/console/src/pages/AcceptInvitation/SwitchAccount/index.tsx)。
- Console 初始加载：[AppLoading](../packages/console/src/components/AppLoading/index.tsx)。
- 登录加载：[LoadingIcon](../packages/experience/src/shared/components/LoadingLayer/LoadingIcon.tsx)、[原有旋转 CSS](../packages/experience/src/shared/components/LoadingLayer/index.module.scss)。
- 账户中心：[PageHeader](../packages/account/src/components/PageHeader/index.tsx)、[GlobalLoading](../packages/account/src/components/GlobalLoading/index.tsx)、[原有旋转 CSS](../packages/account/src/components/GlobalLoading/index.module.scss)。
- 登录元信息：[Experience AppMeta](../packages/experience/src/Providers/AppBoundary/AppMeta.tsx)；账户元信息：[Account AppMeta](../packages/account/src/Providers/AppBoundary/AppMeta.tsx)。
- Console head：[index.html](../packages/console/index.html)；登出 head 和独立页脚：[post-logout/index.html](../packages/core/static/html/post-logout/index.html)。
- 登录来源页脚：[LogtoSignature](../packages/experience/src/shared/components/LogtoSignature/index.tsx)；现有 OSS 隐藏设置说明：[fork-customizations.md](./fork-customizations.md)。
- 账户中心来源页脚：[PageFooter](../packages/account/src/components/PageFooter/index.tsx)；登出模板读取：[oidc/init.ts](../packages/core/src/oidc/init.ts)。
- 设备 Demo：[App.tsx](../packages/device-demo-app/src/App.tsx)、[Footer.tsx](../packages/device-demo-app/src/Footer.tsx)、[index.html](../packages/device-demo-app/index.html)。
- Console 标题：[consts/tenants.ts](../packages/console/src/consts/tenants.ts)；上传类型和大小：[use-image-mime-types.ts](../packages/console/src/hooks/use-image-mime-types.ts)。

## 接入时需要处理的细节

1. **现有品牌配置与默认资源分开。** 当前 default 和 admin 的 Logo URL 已存于租户数据；只替换本地 SVG 或修改 seed 不能更新现有配置。应用级、组织级独立品牌仍需保留自己的优先级。最终选择在显示时映射两个默认 URL，无需改动租户数据库。
2. **intro 优先用于正常页头的横版 Logo。** 图片按比例缩放，浅色背景用 light、深色背景用 dark。动画播放一次，不用它表达持续等待。独立加载区域只显示 `loading.svg` 和简短提示，避免双徽记及两组动效。路由切换或组件重新挂载是否重播，需要页面验收；不应在普通状态变化时强制重建 Logo。
3. **内联加载动画需要实例隔离。** `loading.svg` 包含固定的 mask/clipPath ID、class 和动画名。一个页面可能出现多个 LoadingIcon，需要隔离实例 ID，并让 CSS 不互相影响。现有 SVG importer 不足以替代实例隔离。保留 `currentColor` 和资源自带的 reduced-motion 行为。
4. **停止叠加旧的旋转动画。** Experience、Account 和 Console 原 spinner 的旋转由外部 SCSS 驱动；新的 `loading.svg` 自带内部动画。只换图而保留旧旋转 class 会造成双重动画。
5. **Apple 图标与 favicon 分离。** Experience 和 Account 的 `AppMeta` 当前都使用 `favicon ?? defaultAppleTouchLogo` 生成 Apple 图标。即便替换默认 PNG，只要 favicon 已配置仍会绕过该 PNG。首期可以为 fork 使用独立的本地图标，不必新增公共 API 字段。
6. **favicon 跟随系统主题。** `favicon.svg` 的媒体查询读取系统浅深色，不读取 Logto 的页面主题。标签栏用系统主题通常合理；若要求图标严格跟随应用主题，应派生固定浅/深色 favicon 并分别配置 `favicon` / `darkFavicon`。
7. **内置资源随版本发布。** 推荐将选定资源固定到本次 SHA，随应用构建或自有静态服务发布，记录来源。运行时品牌 URL 应指向稳定的 HTTPS 图片地址，不能填写 GitHub 的 blob 页面地址。首次实施要核对所有入口的资源路径、Content-Type、缓存和安全策略。
8. **页脚按语义处理。** 本次个人构建直接让 `LogtoSignature` 返回空，并删除其强制显示保护；既有设置字段继续保存和返回。若保留技术来源说明，继续准确显示 Logto；若新增 liuovo 品牌页脚，使用独立的品牌文案和链接。
9. **登出页资源路径需要实测。** post-logout HTML 由 OIDC handler 读取后作为响应发送，不是直接访问模板目录。其 `./favicon.ico` 会相对当前请求地址解析，不能假定替换模板目录的 ICO 就会生效。实施时应确认静态文件的实际服务路径和最终图标请求。

Google、GitHub、Apple、QQ 等连接器标志代表真实登录提供方；SDK 教程内的 React/Next.js 等标志代表技术框架。`packages/elements` 中的 `<logto-icon>` 是通用图标容器，并非 Logto 品牌图片。这些不应加入视觉品牌替换清单。邮件模板是独立可选配置面；本次资源没有静态横版 PNG，若后续做邮件品牌建议从静态 Logo 导出 PNG，再检查邮件客户端显示效果。

## 推荐实施顺序与验收

1. 固定资源版本，整理共用的主题 Logo 和 Loading 组件；横版优先 intro。
2. 先处理 Console 的硬编码 Logo、全屏加载、favicon 和 Apple 图标。
3. 处理 Experience/Account 的默认图标、加载动画和 Apple 图标选择，保留现有独立品牌。
4. 默认 Logo 在渲染时映射，覆盖现有与新建的 default/admin 租户；不执行品牌配置或 seed 数据更新。
5. 处理登出页；再按实际需要纳入按钮加载、Demo、页面标题和文档展示。

页面验收覆盖：浅/深色、移动/桌面、首次载入和慢速网络、失败后重试、多个同时加载的组件、正常动画与 reduced-motion、初始 HTML 到 React 渲染的 favicon 变化、Apple 主屏幕图标、独立 admin 登录和登出完成页。实际完成的验收项目和限制见下方记录。


## 已实施的个人内置方案

| 场景 | 实际处理 |
| --- | --- |
| 登录/注册/找回密码、admin 登录、Account Center 页头 | 两个旧默认 URL 映射为本地浅/深色 intro；自定义 Logo 和原有优先级保持 |
| Console 顶栏、欢迎页、OSS 设置页、切换账户页 | 共用主题 BrandLogo；顶栏保留点击首页并使用原生按钮 |
| Console/Account 全屏加载 | 单个 64px BrandLoading 加原有本地化加载提示；无横版 Logo |
| Experience 加载遮罩和共享 LoadingIcon | 同一 BrandLoading；删除旧整图旋转，各实例使用独立 SVG ID |
| 三个前端 favicon | 初始 HTML 与 React 元信息同时处理；默认 SVG 加 ICO 后备，自定义 favicon/darkFavicon 保持 |
| Apple touch icon | 独立 180px PNG，不复用 SVG favicon |
| 登录和账户中心署名 | 不再渲染；原有 hideLogtoBranding 配置与 API 仍接受并保存 |
| OIDC 退出完成页 | 本地 intro、favicon、Apple 图标内嵌为 data URL；保留成功状态和 message 占位；支持浅/深色 |
| OIDC 自动退出表单 | 只改图标与标题；保留 form 占位和自动提交 |
| OSS 控制台标题 | liuovo Console |

选定资源已收进 `packages/experience/src/shared/branding/assets/`。Console 声明了
Experience 的工作区开发依赖及品牌路径 alias，资源随正常 Vite 构建发布，不依赖远程品牌资源。
品牌源文件来源 SHA 保持为上述资源仓库版本。原有紫色、紧凑按钮 spinner、第三方连接器标志、
Demo、文档/SDK 标志未加入此次替换。后续确认中也将两个 Cloud 顶栏标志改为 liuovo，Console 标题统一为 liuovo Console。

### 验证记录

- 使用 Node 22.14.0 / pnpm 10.33.0，依赖安装及 `pnpm prepack` 完成。
- Experience、Account、Console 的生产构建和 TypeScript 检查通过。
- 修改的 TypeScript/TSX 与 SCSS 的 ESLint/Stylelint 通过。
- 7 个相关测试文件、36 项测试通过：品牌回归、Account Center 认证跳转/页头、OSS onboarding 与品牌字段。品牌回归覆盖默认 URL、浅/深色、自定义/空/缺省 Logo、通用连接器图标和多实例 SVG ID。
- Chromium 使用真实 Experience 生产构建加测试 SSR 数据验证浅/深色登录页；使用真实 Console
  品牌/加载组件及其样式验证主题切换、单徽记、多个加载实例和 reduced-motion。
- 检查移动深色登录无水平溢出、Logto 署名不出现、图像加载成功、初始 head 到 Helmet 无重复图标；
  自定义深色 Logo/favicon 生效，Apple 图标仍为独立 PNG。
- 独立退出 HTML 的浅/深色页面已截图检查，成功状态和消息保持；图片均为 data URL。
- 测试截图保留在 `/tmp/logto-branding-validation/`，不是生产页面，也没有连接生产数据库。
- 本次未执行真实 OIDC 登录/登出、数据库持久化或容器集成验收；相应现有集成测试已更新为个人构建的署名行为。


### 后续确认：省去公司 URL 配置与 Cloud 标志

- 公司 Logo/favicon 的浅/深色输入从品牌表单移除；保留配色和深色模式控制。
- 缺省或空字符串的 Logo 自动使用本地主题 intro；只保留一个旧默认 URL 时也能按主题选择两份资源。
- 空 favicon/darkFavicon 回落到内置 SVG/ICO，Apple 图标仍独立使用 PNG。
- 两个曾使用 Cloud SVG 的顶栏统一使用 BrandLogo，Console 标题也不再分 Cloud。
- 应用/组织的自定义品牌以及 API 里的已有品牌字段继续兼容；不更新数据库。
- 深色模式按既有开关控制，开启后跟随系统或认证请求的主题覆盖。Logo 黑白切换与品牌配色独立。

源码默认主色为 `#6139F6`。`generateDarkColor` 将 HSL 值取整后，将 L 增加 10 个百分点，
得到 `#8768F8`；悬停、按下、loading 和聚焦透明层另外派生。背景、文字和边框使用静态深色
样式，并不是从 Logo 或主色生成整套背景色。自定义 `darkPrimaryColor` 优先于算法结果。
未读取实际租户保存的颜色；上述值是代码默认值。独立 HTML 预览的主色已与这组默认色对齐。

本次补充验收：9 项 Logo/loader 回归测试和 19 项 Console 配置/品牌表单测试通过；三个前端重新构建通过。浏览器针对空字符串品牌配置检查默认图标与主色，覆盖系统浅/深色切换和关闭深色开关后的浅色行为。
