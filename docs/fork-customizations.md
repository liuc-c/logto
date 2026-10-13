# Logto OSS 定制版

基线：公开 Fork `liuc-c/logto`，`@logto/core 1.44.0`，上游提交
`9449b0224`（完整 SHA 可从 `git rev-parse 9449b0224` 查询）。这是该版本之后的上游开发提交，**不是一个未经修改的 1.44.0 release tag**。
保留 MPL-2.0、版权声明、包名、认证标识与上游 Dockerfile。两个定制是本 Fork 的正式 OSS 功能，可直接用于生产，不依赖 Cloud、许可证或开发功能开关。

## 设置

| 功能 | 控制台入口 | 未配置时 | 存储和作用域 |
| --- | --- | --- | --- |
| 演示应用 | 设置 → 演示应用 | 启用，保持上游行为 | 当前业务租户的 `logto_configs`，键 `demoApps`，值 `{ "enabled": true/false }` |
| 隐藏 Logto 品牌 | 登录体验 → 品牌 → 隐藏 Logto 品牌 | 不隐藏，保持上游行为 | 当前业务租户既有 `sign_in_experiences.hide_logto_branding` |

控制台使用 `admin` tenant 登录；它管理的 OSS 业务租户是 `default`。
演示设置通过控制台现有 `useApi` 请求业务租户 Management API，**不是**修改管理后台登录租户的配置。
Management API 沿用现有 JWT、目标资源与 `all` scope 校验；没有权限的成员不能通过 UI 或 API 保存。
API：`GET /api/configs/demo-apps`、`PATCH /api/configs/demo-apps`，PATCH 接受 `{ "enabled": false }`。
OpenAPI 中包含这两个操作。不要把此请求发送到管理后台域名的 admin tenant API。

保存后立即影响后续请求。每次访问两个 Demo 路径，以及解析两个精确的内置客户端 ID
`demo-app`、`device-demo-app` 时，都从租户数据库读取配置；不缓存这个策略值。
OIDC 的 `Client.find` 在读取内部客户端缓存前检查策略，因此已使用过的 Demo 也不能绕过开关。
不依赖单进程内存刷新、Redis 广播或服务重启，多副本读取同一数据库也能看到已提交的值。
普通应用不会增加这次配置查询。保留代码、构建和路由保留前缀；关闭的 Demo 页面、静态资源及子路径返回登录体验前端的 404 页面（HTTP 200），不提供 Demo 应用资源。
控制台在线预览、设备流预览及入门预览随设置禁用或隐藏，并显示说明。

关闭不会清空用户会话，也不是 token 吊销接口。关闭后新的 Demo 授权、设备授权和依赖客户端解析的 token 请求会被拒绝；已在处理中的请求可能完成。
已签发、由外部资源服务器独立验证的 JWT 仍可在有效期内使用，除非资源服务器另行撤销；重新启用不会重置既有会话或令牌。
普通应用 OIDC、正常设备授权、Account Center 和管理后台登录不受影响。

品牌设置仅放开已有登录页页脚品牌开关的 OSS 授权限制。保存、公开登录体验 API、页面渲染都使用真实数据库值；关闭“隐藏”后品牌恢复。
Cloud 套餐规则、Custom UI CSP、其他许可证能力保持原有逻辑。

**首次部署验收操作**：进入业务租户，将“演示应用”关闭，并将“隐藏 Logto 品牌”开启后保存。
不要用启动 SQL、启动脚本或每次升级重置默认值。本仓库的容器验收在临时数据库完成这两项设置，并重启检查持久化；不会接触生产数据库。

## 镜像与发布

镜像：`ghcr.io/liuc-c/logto`。Workflow 根据 Fork 所有者生成 `ghcr.io/<owner>/logto`（转小写）。

- `latest`：默认分支最近通过验证的构建。
- `sha-<完整 Git SHA>`：定位某次源码提交，保留用于回滚。
- `1.44.0-fork.<前 12 位 SHA>`：包含 core 上游基线版本的定制标签。
- 部署推荐使用 `@sha256:<digest>`；tag 本身在注册表中不是写保护的，digest 才是内容地址。
- OCI 元数据包含 Fork 源码地址、revision、version、MPL-2.0 许可证；同时生成 provenance 和 SBOM。

Actions → **Fork OSS image** → **Run workflow**，选择默认分支。
默认分支 push 自动检查、构建、生产容器验收，再使用 `GITHUB_TOKEN` 发布；PR 只检查和构建。
非默认分支手动运行不会发布。检查任务仅 `contents: read`，发布任务额外获得 `packages: write`。
继承的 workflows 保留原文件，但 job 仅在 `logto-io/logto` 执行，防止重复发布及误用 Docker Hub、Depot、NPM 或组织密钥。

第一次创建 GHCR package 通常为 Private。发布后访问 GitHub 个人主页 → Packages → `logto` →
Package settings → Danger Zone → Change visibility → **Public**，按 GitHub 提示确认。
公开后无需登录即可拉取。重新运行 workflow 会在退出 GHCR 登录后验证拉取；也可在没有凭据的环境验证：

```sh
mkdir -p /tmp/logto-anonymous-docker
DOCKER_CONFIG=/tmp/logto-anonymous-docker docker pull ghcr.io/liuc-c/logto@sha256:<digest>
```

发布成功不代表包已公开。检查 Actions 摘要中的 digest 和 `Anonymous pull verified`；若提示
`Public access NOT verified`，先完成可见性设置。公开源码与构建产物不得放生产 `.env`、密码、私钥。
`.dockerignore` 排除 `.env*`、私钥文件、Git 元数据和本地工作树；验收日志只含一次性测试环境信息。

## 现有 Compose 的最小修改

不新增 PostgreSQL 服务。保留现有网络、数据卷和反向代理配置；只替换业务服务的镜像，继续使用已有外部 PostgreSQL 18。
以下域名仅为部署示例，不编译进程序：

```yaml
services:
  logto:
    image: ghcr.io/liuc-c/logto@sha256:<verified-digest>
    restart: unless-stopped
    environment:
      DB_URL: ${LOGTO_DB_URL:?set the existing external PostgreSQL URL}
      ENDPOINT: https://auth.liuovo.com
      ADMIN_ENDPOINT: https://auth-admin.liuovo.com
      TRUST_PROXY_HEADER: "1" # 仅在服务置于受信任的反向代理之后时使用
    # 复用现有端口或代理网络：登录/API -> 3001，管理后台 -> 3002
```

生产切换另行执行：先备份数据库并记录当前镜像 digest；检查上游数据库 alteration，再 pull 并更新单个服务。
此定制**没有数据库 schema 迁移**；新配置使用现有 JSONB 表，不自动修改任何现存选择。
同步上游 release 可能带有自己的迁移，应先在数据库副本测试上游 `db alteration` 流程。
定制代码回滚无需删配置；回到原版上游会忽略 `demoApps` 并恢复 Demo，原版 OSS 也可能重新要求品牌许可证。
涉及上游 schema 变更时，只有确认旧镜像兼容当前 schema 才能仅回退镜像，否则恢复数据库备份。

## 验证和同步上游

工具链遵循仓库：Node `^22.14.0`，pnpm 10（上游也接受 pnpm 9）。

```sh
pnpm install --frozen-lockfile
pnpm prepack
pnpm --filter @logto/core test --runInBand demo-apps logto-config sign-in-experience koa-auth
pnpm --filter @logto/console test --runInBand use-branding-entitlements parser DemoApps
pnpm --filter @logto/integration-tests build
pnpm --filter @logto/integration-tests exec puppeteer browsers install chrome
docker build -t logto:acceptance .
.scripts/fork/validate-container.sh logto:acceptance
# 本地也支持 CONTAINER_ENGINE=podman
```

浏览器所需系统库需预先安装；GitHub Ubuntu runner 使用 `sudo` 调用 Puppeteer 的 `--install-deps` 安装它们，并把浏览器缓存留在 runner 用户目录。

容器脚本创建独立临时网络和 PostgreSQL 18，正常 seed，然后用受限测试 M2M 凭据走真实认证；
不启用 `INTEGRATION_TEST` 或开发用户跳过认证。它覆盖默认值、动态关闭/恢复、缓存、页面子路径、
未认证及权限不足、普通应用和内置非 Demo 客户端、浏览器页脚、刷新、重启持久化。
完成后清理测试容器与网络，保留 `logs/fork-container` 诊断日志。

同步流程：

1. `git fetch` 上游并选择明确的正式 release tag，在维护分支合并；不要盲目跟随上游开发分支。
2. 分别复核 Demo 补丁、品牌补丁、发布补丁；重点检查 OIDC provider 的 `Client.find` 调用链、租户权限与缓存、登录品牌读取链和 Dockerfile 变化。
3. 按上游要求处理数据库 alteration，在数据库副本上运行上述验证及相关 lint/类型检查；检查新增上游 workflows 是否需隔离。
4. 更新本文件基线信息，合入 Fork 默认分支。Actions 验证后构建发布，确认 digest 和匿名拉取。
5. 在测试部署验证两个已有设置未变化；随后再安排生产镜像切换，保留旧 digest 和数据库备份。
