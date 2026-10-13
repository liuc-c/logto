# 个人自托管功能

本 Fork 在 `IS_CLOUD` 未启用时，内置开放已有的本地能力。不需要购买或安装许可证；不自动开启具体登录策略，不修改已有租户配置。Console 与 Core 共用 `@logto/schemas` 的 `personalSelfHostedQuota`。已安装许可证仍可作为元数据读取，但其缺失、过期或刷新失败不影响这些本地能力。

## 功能清单

| 功能 | 当前个人构建 | 使用条件 / 范围 |
| --- | --- | --- |
| 自定义登录 UI ZIP 上传 | 已开放 | 在登录体验 → 品牌 → 自定义 UI 上传；需要配置 `experienceBlobsProvider`，Core 本地解压 |
| 自定义 UI CSP | 已开放 | 可配置允许的脚本与连接来源；仍验证来源格式与协议 |
| 隐藏 Logto 品牌 | 已开放 | liuovo 内置品牌和无署名方案继续生效 |
| Console 成员协作 | 已开放 | 管理员可邀请、移除成员；邀请邮件需要业务租户的邮件连接器；现有自托管实现中成员均为管理员，不提供 Cloud 的角色编辑 |
| Console 强制 MFA | 已开放 | 租户设置 → 设置；仅管理员可修改，需显式启用策略 |
| SAML IdP 发起的 SSO | 已开放 | SAML 企业 SSO 的 IdP 发起认证页签；本地配置 API、断言回调和会话消费均可在生产模式使用；来自上游开发功能，部署前需用实际 IdP 联调 |
| SAML 应用数量 | 已解除数量上限 | 不再限制为 3 个；已有 SAML 协议、应用类型及 URI 验证保留 |
| 普通 / 自适应 MFA、组织、RBAC、企业 SSO、第三方应用 | OSS 已有 | 原有本地接口可用，无需解除 Cloud 配额 |
| Actions、自定义 JWT、Subject Token、Passkey、用户资料收集 | OSS 已有 | Actions / JWT 在自托管环境使用原有本地运行器；外部连接器仍需自行配置 |
| CAPTCHA、邮箱自定义黑白名单及子地址限制、其他本地安全策略 | OSS 已有 | CAPTCHA 需要自行配置提供商；一次性邮箱识别见下表 |

Console 的有效配额同时反映本地能力，避免继续使用 Cloud Free 的占位配额。首页 Cloud 推广和租户许可证购买页签不再显示。许可证 API 和签名校验保留；没有伪造许可证或 Cloud 套餐。

## 外部服务

| 功能 | 保持不可用的原因 | 自托管替代方式 |
| --- | --- | --- |
| Logto 托管邮件、邮件用量及投递日志 | 依赖 Logto 托管邮件服务与 Cloud API；`hostedEmail` 保持关闭 | 自行配置 SMTP / 邮件服务连接器 |
| 自动自定义域名、证书与域名选择 UI | 依赖 Cloud 管理与域名基础设施 | 使用 `ENDPOINT`、`ADMIN_ENDPOINT` 和现有反向代理配置域名 / TLS |
| Protected App（免 SDK 接入） | 需要 Cloudflare KV、边缘代理与自定义主机服务；本仓库没有可直接运行的生产边缘代理 | 使用现有 OIDC/SAML 应用接入；不打开仅用于本地开发的模拟模式 |
| 一次性邮箱自动识别 | 调用带密钥的 Azure Function，未提供本地识别实现 | 现有邮箱域名黑白名单可直接使用 |
| Cloud 账单、套餐、区域、多租户托管和 Console SSO 配额 | 依赖 Cloud 控制面 | 保持自托管单业务租户和本地控制台 |

未全局修改 `IS_CLOUD` 或 `DEV_FEATURES_ENABLED`。仅 IdP 发起的 SSO 在本地解除开发开关；Cloud 的原有开关与套餐检查保留。

## 配置自定义 UI 存储

上传与登录页读取使用系统配置 `experienceBlobsProvider`，支持 S3（包括兼容 S3 的 MinIO / R2）、Azure Storage 和 Google Storage。它与普通图片资源的 `storageProvider` 是两个配置项。无需 `experienceZipsProvider` 或 Azure 解压函数。

例如 S3 配置（以下值均为占位符）：

```json
{
  "provider": "S3Storage",
  "endpoint": "https://s3.example.com",
  "region": "us-east-1",
  "bucket": "logto-custom-ui",
  "forcePathStyle": true,
  "accessKeyId": "YOUR_ACCESS_KEY",
  "accessSecretKey": "YOUR_SECRET_KEY"
}
```

通过现有 `logto db system set experienceBlobsProvider '<JSON>'` 命令写入，使用部署的数据库连接。修改后重启 Logto，让 `SystemContext` 重新加载配置。不要把生产密钥提交到仓库。S3 自定义 UI 上传使用 `isPublic: false`；浏览器通过 Logto 读取对象，无需公开 bucket，也不需要 `publicUrl`。

ZIP 内容需要在根目录（或单个包裹目录内）包含 `index.html`。保留原有文件总大小、200 个条目、单文件大小、路径穿越及压缩数据校验。上传后需在登录体验设置中保存返回的资源 ID，才会切换到自定义 UI；删除配置可恢复内置页面。上传 UI 应由现有 Logto Experience API 完成登录流程，普通静态页面本身不会自动具有登录功能。

## 验证范围

针对无许可证和已过期许可证的 ZIP 上传、CSP 保存、Console 强制 MFA、成员邀请与接受，运行本地测试。保留成员权限、最后一个管理员、错误邀请、非法 ZIP、非法 CSP、SAML 应用及 URI 验证；覆盖生产模式下 IdP SSO 入口与会话匹配 / 过期 / 消费。

本轮通过 366 项后端测试（其中 54 项认证与 SAML 回归）及 48 项 Console 测试，共 414 项；Core 与 Console 的生产构建、类型检查和修改文件的 lint 通过。Core lint 有原有警告，无错误。

本轮未连接生产数据库、配置生产存储或部署服务。对象存储读写通过现有提供商测试和模拟验证；实际存储凭据与企业 IdP 需要在部署环境验收。
