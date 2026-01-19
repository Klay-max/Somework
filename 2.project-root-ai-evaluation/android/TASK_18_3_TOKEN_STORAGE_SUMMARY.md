# Task 18.3 实现总结：Token 安全存储

## 任务概述
实现使用 Android Keystore 的安全 token 存储机制，确保 JWT token 在设备上加密保存。

## 实现内容

### 1. EncryptionManager.kt - 加密管理器
**文件**: `android/app/src/main/java/com/examai/data/local/EncryptionManager.kt`

**功能**:
- 使用 Android Keystore 系统进行加密/解密
- AES-256-GCM 加密算法
- 自动生成和管理加密密钥
- 密钥存储在硬件安全模块（如果设备支持）

**核心方法**:
- `encrypt(plaintext: String): String` - 加密明文，返回 Base64 编码的密文
- `decrypt(ciphertext: String): String?` - 解密密文，返回明文或 null（失败时）
- `deleteKey()` - 删除加密密钥（用于登出）

**安全特性**:
- 密钥存储在 Android Keystore（硬件支持时存储在 TEE/SE）
- 使用 GCM 模式提供认证加密（AEAD）
- 每次加密使用新的 IV（初始化向量）
- 256 位密钥长度
- 不需要用户认证（无生物识别/PIN 要求）

**加密流程**:
```
明文 → AES-GCM 加密 → IV + 密文 → Base64 编码 → 存储
```

**解密流程**:
```
存储 → Base64 解码 → 提取 IV + 密文 → AES-GCM 解密 → 明文
```

### 2. TokenManager.kt - 更新为加密存储
**文件**: `android/app/src/main/java/com/examai/data/local/TokenManager.kt`

**更新内容**:
- 集成 `EncryptionManager` 进行 token 加密
- 更新 `saveToken()` - 加密后再存储
- 更新 `getToken()` - 读取后解密
- 更新 `clearToken()` - 同时删除加密密钥

**存储键更新**:
- `TOKEN_KEY` → `ENCRYPTED_TOKEN_KEY` - 明确标识存储的是加密数据

**安全改进**:
- JWT token 不再以明文形式存储
- 即使设备被 root，token 也难以提取
- 登出时删除加密密钥，确保旧数据无法解密

### 3. EncryptionManagerTest.kt - 单元测试
**文件**: `android/app/src/test/java/com/examai/data/local/EncryptionManagerTest.kt`

**测试用例**（9个）:
1. `encrypt returns non-empty string` - 加密返回非空字符串
2. `decrypt returns original plaintext` - 解密返回原始明文
3. `encrypt produces different ciphertext each time` - 每次加密产生不同密文（IV 随机）
4. `decrypt returns null for invalid ciphertext` - 无效密文返回 null
5. `decrypt returns null for empty string` - 空字符串返回 null
6. `encrypt and decrypt handles special characters` - 处理特殊字符（JWT 格式）
7. `encrypt and decrypt handles long strings` - 处理长字符串（1000 字符）
8. `encrypt and decrypt handles unicode characters` - 处理 Unicode 字符（中文、emoji）
9. `deleteKey allows new key generation` - 删除密钥后可生成新密钥

**测试框架**:
- 使用 Robolectric 模拟 Android Keystore
- API Level 28（Android 9.0）用于 Keystore 支持

### 4. build.gradle.kts - 添加依赖
**文件**: `android/app/build.gradle.kts`

**新增依赖**:
- `org.robolectric:robolectric:4.11.1` - Android 单元测试框架

## 技术实现

### Android Keystore 系统
Android Keystore 是 Android 提供的安全密钥存储系统：
- **硬件支持**: 在支持的设备上，密钥存储在 TEE（Trusted Execution Environment）或 SE（Secure Element）
- **密钥隔离**: 密钥永不离开安全硬件，加密/解密在硬件内完成
- **应用隔离**: 每个应用的密钥相互隔离，其他应用无法访问
- **系统保护**: 即使设备被 root，密钥也难以提取

### AES-GCM 加密
- **算法**: AES（Advanced Encryption Standard）
- **模式**: GCM（Galois/Counter Mode）
- **密钥长度**: 256 位
- **认证标签**: 128 位
- **优势**: 
  - 提供加密和认证（AEAD - Authenticated Encryption with Associated Data）
  - 防止密文被篡改
  - 高性能（硬件加速）

### IV（初始化向量）管理
- 每次加密生成新的随机 IV（12 字节）
- IV 与密文一起存储（IV + 密文）
- 确保相同明文产生不同密文（语义安全）

## 安全性分析

### 威胁模型
1. **设备丢失/被盗**: ✅ Token 加密存储，无法直接读取
2. **恶意应用**: ✅ Keystore 应用隔离，其他应用无法访问密钥
3. **Root 设备**: ✅ 硬件支持时密钥在 TEE/SE 中，难以提取
4. **内存转储**: ⚠️ 明文 token 在内存中短暂存在（使用时）
5. **调试器**: ⚠️ 调试模式下可能被拦截（生产环境禁用调试）

### 安全最佳实践
- ✅ 使用 Android Keystore 存储密钥
- ✅ 使用 AEAD 加密模式（GCM）
- ✅ 每次加密使用新 IV
- ✅ 登出时删除密钥
- ✅ 解密失败时返回 null（不抛出异常泄露信息）
- ✅ 不在日志中记录敏感信息

## 文件清单

### 新增文件（2个）
1. `android/app/src/main/java/com/examai/data/local/EncryptionManager.kt` (~120 行)
2. `android/app/src/test/java/com/examai/data/local/EncryptionManagerTest.kt` (~140 行)

### 修改文件（2个）
1. `android/app/src/main/java/com/examai/data/local/TokenManager.kt` - 集成加密
2. `android/app/build.gradle.kts` - 添加 Robolectric 依赖

## 代码统计
- **新增代码**: ~260 行（EncryptionManager + 测试）
- **修改代码**: ~30 行（TokenManager 更新）
- **总计**: ~290 行

## 依赖关系
- **Android Keystore**: 系统级密钥存储
- **javax.crypto**: Java 加密 API
- **DataStore**: 持久化存储（加密后的数据）
- **Robolectric**: 单元测试框架（模拟 Android 环境）

## 测试覆盖
- ✅ 9 个单元测试用例
- ✅ 加密/解密功能测试
- ✅ 边界条件测试（空字符串、无效数据）
- ✅ 特殊字符测试（JWT、Unicode）
- ✅ 密钥管理测试（删除和重新生成）

## 性能考虑
- **加密开销**: ~1-2ms（硬件加速）
- **解密开销**: ~1-2ms（硬件加速）
- **密钥生成**: ~10-50ms（首次，之后复用）
- **影响**: 对用户体验影响极小

## 符合需求
- ✅ **Requirement 1.6**: 使用 Android Keystore 安全存储 token
- ✅ **Security Best Practice**: 敏感数据加密存储
- ✅ **OWASP Mobile Top 10**: 防止不安全的数据存储

## 向后兼容性
- **迁移策略**: 首次使用加密存储时，旧的明文 token 会被清除
- **影响**: 用户需要重新登录（一次性）
- **建议**: 在应用更新说明中提醒用户

## 已知限制
1. **API Level**: 需要 Android 6.0+（API 23+）用于 Keystore
2. **硬件支持**: 不是所有设备都有 TEE/SE，但软件实现仍比明文安全
3. **备份**: 加密密钥不会被备份，恢复设备后需要重新登录

## 下一步
Task 18.4: 实现 token 过期处理

## 完成时间
2024-12-25

## 状态
✅ 已完成
