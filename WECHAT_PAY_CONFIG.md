# 微信支付配置指南

## 概述

本文档详细说明如何配置微信支付功能，包括所需参数、获取方式、配置步骤和测试方法。

## 一、所需参数

会员中心的微信支付功能需要以下5个参数：

### 1. WECHAT_APPID（微信支付应用ID）
- **说明**：微信支付应用的唯一标识符
- **获取方式**：
  1. 登录[微信商户平台](https://pay.weixin.qq.com/)
  2. 进入"产品中心" → "开发配置"
  3. 在"公众号支付"或"APP支付"配置中查看AppID
- **格式示例**：`wx1234567890abcdef`

### 2. WECHAT_MCHID（微信支付商户号）
- **说明**：微信支付商户的唯一标识符
- **获取方式**：
  1. 登录[微信商户平台](https://pay.weixin.qq.com/)
  2. 进入"账户中心" → "商户信息"
  3. 查看"商户号"字段
- **格式示例**：`1234567890`（10位数字）

### 3. WECHAT_API_V3_KEY（微信支付APIv3密钥）
- **说明**：用于加密和解密微信支付API请求的密钥
- **获取方式**：
  1. 登录[微信商户平台](https://pay.weixin.qq.com/)
  2. 进入"账户中心" → "API安全"
  3. 点击"设置APIv3密钥"
  4. 按照提示设置32位字符串（建议使用随机生成器）
- **格式要求**：32位字符串（数字+字母）
- **格式示例**：`abcdef1234567890abcdef1234567890`

### 4. WECHAT_SERIAL_NO（API证书序列号）
- **说明**：API证书的序列号，用于验证请求签名
- **获取方式**：
  1. 登录[微信商户平台](https://pay.weixin.qq.com/)
  2. 进入"账户中心" → "API安全" → "API证书"
  3. 下载或查看证书信息
  4. 在证书详情中找到"证书序列号"
- **格式示例**：`1234567890ABCDEF1234567890ABCDEF12345678`（40位十六进制字符串）

### 5. WECHAT_PRIVATE_KEY（API私钥）
- **说明**：用于签名API请求的RSA私钥
- **获取方式**：
  1. 登录[微信商户平台](https://pay.weixin.qq.com/)
  2. 进入"账户中心" → "API安全" → "API证书"
  3. 下载API证书压缩包
  4. 解压后找到`apiclient_key.pem`文件
  5. 复制文件的完整内容（包括`-----BEGIN PRIVATE KEY-----`和`-----END PRIVATE KEY-----`）
- **格式示例**：
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
（中间省略多行）
...xYZ123
-----END PRIVATE KEY-----
```

## 二、配置步骤

### 方式一：通过秒哒平台配置（推荐）

1. 在秒哒平台中，系统会自动提示配置微信支付参数
2. 按照提示依次填入上述5个参数
3. 点击"保存"完成配置

### 方式二：手动配置Supabase Secrets

如果需要手动配置，可以通过Supabase CLI或平台界面：

```bash
# 使用Supabase CLI配置
supabase secrets set WECHAT_APPID=wx1234567890abcdef
supabase secrets set WECHAT_MCHID=1234567890
supabase secrets set WECHAT_API_V3_KEY=abcdef1234567890abcdef1234567890
supabase secrets set WECHAT_SERIAL_NO=1234567890ABCDEF1234567890ABCDEF12345678
supabase secrets set WECHAT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

## 三、功能说明

### 当前实现的功能

1. **订单创建**：用户点击"立即购买"后，系统会创建会员订单
2. **支付二维码生成**：
   - 如果配置了微信支付参数，会调用微信支付API生成真实的支付二维码
   - 如果未配置，会生成模拟二维码供测试使用
3. **支付状态轮询**：前端每3秒自动查询订单状态，支付成功后自动更新会员权益
4. **支付回调处理**：微信支付成功后，会回调Edge Function更新订单和用户会员信息

### 测试模式 vs 生产模式

#### 测试模式（未配置微信支付参数）
- 系统会生成模拟支付二维码
- 显示提示："当前为测试模式，可使用模拟支付功能"
- 可以点击"模拟支付成功"按钮完成测试支付
- 适用于开发和测试环境

#### 生产模式（已配置微信支付参数）
- 系统会调用微信支付API生成真实支付二维码
- 用户扫码后跳转到微信支付页面
- 支付成功后自动更新订单状态和会员权益
- 适用于正式上线环境

## 四、测试方法

### 1. 测试模式测试

1. 不配置微信支付参数
2. 登录学生端，进入"会员中心"
3. 选择会员套餐，点击"立即购买"
4. 查看是否显示"当前为测试模式"提示
5. 点击"模拟支付成功"按钮
6. 验证会员权益是否生效

### 2. 生产模式测试

1. 配置所有微信支付参数
2. 登录学生端，进入"会员中心"
3. 选择会员套餐，点击"立即购买"
4. 使用微信扫描二维码
5. 完成支付
6. 验证会员权益是否自动生效

### 3. 错误排查

如果遇到"创建订单失败"错误，请检查：

1. **数据库连接**：确保Supabase数据库正常运行
2. **Edge Function部署**：确认`wechat-pay-create`和`wechat-pay-callback`已部署
3. **参数配置**：检查微信支付参数是否正确配置
4. **日志查看**：
   ```bash
   # 查看Edge Function日志
   supabase functions logs wechat-pay-create
   supabase functions logs wechat-pay-callback
   ```
5. **网络连接**：确保服务器可以访问微信支付API（api.mch.weixin.qq.com）

## 五、常见问题

### Q1: 如何获取微信支付商户号？
A: 需要先在微信支付官网申请商户号，审核通过后才能获得。申请地址：https://pay.weixin.qq.com/

### Q2: APIv3密钥可以随意设置吗？
A: 是的，但必须是32位字符串，建议使用强随机密码生成器生成，并妥善保管。

### Q3: 私钥文件丢失了怎么办？
A: 可以在微信商户平台重新申请API证书，但会导致旧证书失效。

### Q4: 支付成功但会员权益未生效？
A: 检查以下几点：
- 确认支付回调URL是否正确配置
- 查看`wechat-pay-callback` Edge Function日志
- 检查数据库中订单状态是否更新为`paid`
- 确认用户的`vip_level`和`vip_expire_at`字段是否更新

### Q5: 可以同时支持测试模式和生产模式吗？
A: 可以。系统会自动检测是否配置了微信支付参数：
- 未配置：自动使用测试模式
- 已配置：使用生产模式调用真实微信支付API

## 六、安全建议

1. **密钥保护**：
   - 不要将密钥提交到代码仓库
   - 使用环境变量或密钥管理服务存储
   - 定期更换APIv3密钥

2. **证书管理**：
   - 妥善保管API证书文件
   - 不要在公开场合分享证书
   - 证书到期前及时更新

3. **回调验证**：
   - 生产环境建议启用微信支付签名验证
   - 验证回调请求的来源IP
   - 记录所有支付回调日志

4. **金额校验**：
   - 回调时验证订单金额是否匹配
   - 防止订单被篡改

## 七、技术支持

如有问题，请联系：
- 微信支付官方文档：https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml
- 微信支付技术支持：https://kf.qq.com/product/wechatpaymentmerchant.html

---

**最后更新时间**：2026-04-01
