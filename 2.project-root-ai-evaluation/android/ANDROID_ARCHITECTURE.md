# Android 应用架构设计

## 项目概述

AI 试卷拍照测评工具 Android 客户端，采用 Kotlin + Jetpack Compose 现代化架构。

## 技术栈

### 核心框架
- **语言**: Kotlin 1.9+
- **UI**: Jetpack Compose
- **架构**: MVVM + Clean Architecture
- **依赖注入**: Hilt

### 网络层
- **HTTP 客户端**: Retrofit 2.9+ + OkHttp 4.11+
- **序列化**: Kotlinx Serialization
- **图片加载**: Coil (Compose 原生)

### 本地存储
- **数据库**: Room 2.5+
- **偏好存储**: DataStore (替代 SharedPreferences)
- **安全存储**: Android Keystore (JWT token)

### 相机和图像
- **相机**: CameraX 1.3+
- **图像处理**: Android Bitmap API
- **图片选择**: Activity Result API

### 异步处理
- **协程**: Kotlin Coroutines + Flow
- **生命周期**: Lifecycle-aware components

## 项目结构

```
android/
├── app/
│   ├── build.gradle.kts
│   └── src/
│       └── main/
│           ├── java/com/examai/
│           │   ├── ExamAiApplication.kt
│           │   ├── MainActivity.kt
│           │   ├── di/              # 依赖注入模块
│           │   ├── data/            # 数据层
│           │   │   ├── local/       # 本地数据源
│           │   │   ├── remote/      # 远程数据源
│           │   │   └── repository/  # 仓库实现
│           │   ├── domain/          # 领域层
│           │   │   ├── model/       # 领域模型
│           │   │   ├── repository/  # 仓库接口
│           │   │   └── usecase/     # 用例
│           │   ├── presentation/    # 表现层
│           │   │   ├── auth/        # 认证界面
│           │   │   ├── camera/      # 拍照界面
│           │   │   ├── history/     # 历史记录
│           │   │   ├── report/      # 报告查看
│           │   │   └── common/      # 通用组件
│           │   └── util/            # 工具类
│           ├── res/                 # 资源文件
│           └── AndroidManifest.xml
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```


## 架构分层

### 1. 表现层 (Presentation Layer)
- **职责**: UI 渲染、用户交互、状态管理
- **组件**: Composable 函数、ViewModel、UIState
- **特点**: 单向数据流、状态提升

### 2. 领域层 (Domain Layer)
- **职责**: 业务逻辑、用例编排
- **组件**: UseCase、Repository 接口、Domain Model
- **特点**: 纯 Kotlin、无 Android 依赖

### 3. 数据层 (Data Layer)
- **职责**: 数据获取、缓存、持久化
- **组件**: Repository 实现、DataSource、DTO
- **特点**: 单一数据源原则

## 核心模块设计

### 网络层 (Network Module)

#### API 接口定义
```kotlin
interface ExamApiService {
    // 认证
    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): RegisterResponse
    
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
    
    @POST("api/v1/auth/send-code")
    suspend fun sendCode(@Body request: SendCodeRequest): SendCodeResponse
    
    // 试卷
    @Multipart
    @POST("api/v1/exams/upload")
    suspend fun uploadExam(@Part image: MultipartBody.Part): UploadResponse
    
    @GET("api/v1/exams/{exam_id}/status")
    suspend fun getExamStatus(@Path("exam_id") examId: String): ExamStatusResponse
    
    @GET("api/v1/exams/history")
    suspend fun getHistory(
        @Query("page") page: Int,
        @Query("page_size") pageSize: Int
    ): HistoryResponse
    
    @GET("api/v1/exams/{exam_id}")
    suspend fun getExamDetail(@Path("exam_id") examId: String): ExamDetailResponse
    
    @DELETE("api/v1/exams/{exam_id}")
    suspend fun deleteExam(@Path("exam_id") examId: String): DeleteResponse
    
    // 报告
    @GET("api/v1/reports/{exam_id}")
    suspend fun getReport(@Path("exam_id") examId: String): ReportResponse
}
```


#### JWT Token 拦截器
```kotlin
class AuthInterceptor(
    private val tokenManager: TokenManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val token = tokenManager.getToken()
        
        val authenticatedRequest = if (token != null) {
            request.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            request
        }
        
        return chain.proceed(authenticatedRequest)
    }
}
```

#### 网络配置
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.examai.com/")
            .client(okHttpClient)
            .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
            .build()
    }
    
    @Provides
    @Singleton
    fun provideExamApiService(retrofit: Retrofit): ExamApiService {
        return retrofit.create(ExamApiService::class.java)
    }
}
```


### 本地数据库 (Room Database)

#### 数据库实体
```kotlin
@Entity(tableName = "exams")
data class ExamEntity(
    @PrimaryKey val examId: String,
    val userId: String,
    val subject: String,
    val grade: String,
    val score: Int?,
    val totalScore: Int?,
    val status: String,
    val imageUrl: String?,
    val reportUrl: String?,
    val createdAt: Long,
    val updatedAt: Long
)

@Entity(tableName = "cached_reports")
data class CachedReportEntity(
    @PrimaryKey val examId: String,
    val htmlContent: String,
    val cachedAt: Long
)
```

#### DAO 接口
```kotlin
@Dao
interface ExamDao {
    @Query("SELECT * FROM exams WHERE userId = :userId ORDER BY createdAt DESC")
    fun getExamsByUser(userId: String): Flow<List<ExamEntity>>
    
    @Query("SELECT * FROM exams WHERE examId = :examId")
    suspend fun getExamById(examId: String): ExamEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExam(exam: ExamEntity)
    
    @Delete
    suspend fun deleteExam(exam: ExamEntity)
    
    @Query("DELETE FROM exams WHERE examId = :examId")
    suspend fun deleteExamById(examId: String)
}

@Dao
interface ReportDao {
    @Query("SELECT * FROM cached_reports WHERE examId = :examId")
    suspend fun getCachedReport(examId: String): CachedReportEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun cacheReport(report: CachedReportEntity)
    
    @Query("DELETE FROM cached_reports WHERE cachedAt < :expiryTime")
    suspend fun deleteExpiredReports(expiryTime: Long)
}
```

#### 数据库配置
```kotlin
@Database(
    entities = [ExamEntity::class, CachedReportEntity::class],
    version = 1,
    exportSchema = false
)
abstract class ExamDatabase : RoomDatabase() {
    abstract fun examDao(): ExamDao
    abstract fun reportDao(): ReportDao
}

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): ExamDatabase {
        return Room.databaseBuilder(
            context,
            ExamDatabase::class.java,
            "exam_database"
        ).build()
    }
    
    @Provides
    fun provideExamDao(database: ExamDatabase): ExamDao {
        return database.examDao()
    }
    
    @Provides
    fun provideReportDao(database: ExamDatabase): ReportDao {
        return database.reportDao()
    }
}
```


### Token 管理 (Secure Storage)

```kotlin
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val dataStore = context.dataStore
    
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("jwt_token")
        private val TOKEN_EXPIRY_KEY = longPreferencesKey("token_expiry")
    }
    
    suspend fun saveToken(token: String, expiryTime: Long) {
        dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = token
            preferences[TOKEN_EXPIRY_KEY] = expiryTime
        }
    }
    
    fun getToken(): String? = runBlocking {
        val preferences = dataStore.data.first()
        val token = preferences[TOKEN_KEY]
        val expiry = preferences[TOKEN_EXPIRY_KEY] ?: 0L
        
        if (System.currentTimeMillis() > expiry) {
            clearToken()
            null
        } else {
            token
        }
    }
    
    suspend fun clearToken() {
        dataStore.edit { preferences ->
            preferences.remove(TOKEN_KEY)
            preferences.remove(TOKEN_EXPIRY_KEY)
        }
    }
    
    fun isTokenValid(): Boolean {
        val preferences = runBlocking { dataStore.data.first() }
        val expiry = preferences[TOKEN_EXPIRY_KEY] ?: 0L
        return System.currentTimeMillis() < expiry
    }
}

private val Context.dataStore by preferencesDataStore(name = "auth_prefs")
```

## 数据模型

### Domain Models
```kotlin
data class User(
    val userId: String,
    val phone: String,
    val role: String
)

data class Exam(
    val examId: String,
    val userId: String,
    val subject: String,
    val grade: String,
    val score: Int?,
    val totalScore: Int?,
    val status: ExamStatus,
    val imageUrl: String?,
    val reportUrl: String?,
    val createdAt: Long,
    val updatedAt: Long
)

enum class ExamStatus {
    UPLOADED,
    OCR_PROCESSING,
    OCR_COMPLETED,
    PARSING,
    PARSED,
    ANALYZING,
    ANALYZED,
    DIAGNOSING,
    DIAGNOSED,
    REPORT_GENERATING,
    REPORT_GENERATED,
    COMPLETED,
    FAILED
}

data class ExamStatusInfo(
    val status: ExamStatus,
    val progress: Int,
    val estimatedTime: Int?,
    val errorMessage: String?
)

data class Report(
    val examId: String,
    val htmlUrl: String,
    val pdfUrl: String?,
    val generatedAt: Long
)
```


## 依赖配置

### build.gradle.kts (Project)
```kotlin
plugins {
    id("com.android.application") version "8.2.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.20" apply false
    id("com.google.dagger.hilt.android") version "2.48" apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.20" apply false
}
```

### build.gradle.kts (App)
```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.dagger.hilt.android")
    id("org.jetbrains.kotlin.plugin.serialization")
    kotlin("kapt")
}

android {
    namespace = "com.examai"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.examai"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }
    
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = "17"
    }
    
    buildFeatures {
        compose = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }
    
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Compose BOM
    val composeBom = platform("androidx.compose:compose-bom:2023.10.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)
    
    // Compose
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.1")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.6.2")
    implementation("androidx.navigation:navigation-compose:2.7.5")
    
    // Hilt
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Retrofit + OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter:1.0.0")
    
    // Kotlinx Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    
    // Room
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")
    
    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // CameraX
    val cameraxVersion = "1.3.0"
    implementation("androidx.camera:camera-core:$cameraxVersion")
    implementation("androidx.camera:camera-camera2:$cameraxVersion")
    implementation("androidx.camera:camera-lifecycle:$cameraxVersion")
    implementation("androidx.camera:camera-view:$cameraxVersion")
    
    // Coil (Image Loading)
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```


## 导航架构

### Navigation Graph
```kotlin
sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object Camera : Screen("camera")
    object History : Screen("history")
    object ExamDetail : Screen("exam_detail/{examId}") {
        fun createRoute(examId: String) = "exam_detail/$examId"
    }
    object Report : Screen("report/{examId}") {
        fun createRoute(examId: String) = "report/$examId"
    }
}

@Composable
fun ExamAiNavHost(
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Splash.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(navController)
        }
        composable(Screen.Login.route) {
            LoginScreen(navController)
        }
        composable(Screen.Register.route) {
            RegisterScreen(navController)
        }
        composable(Screen.Home.route) {
            HomeScreen(navController)
        }
        composable(Screen.Camera.route) {
            CameraScreen(navController)
        }
        composable(Screen.History.route) {
            HistoryScreen(navController)
        }
        composable(
            route = Screen.ExamDetail.route,
            arguments = listOf(navArgument("examId") { type = NavType.StringType })
        ) { backStackEntry ->
            val examId = backStackEntry.arguments?.getString("examId") ?: return@composable
            ExamDetailScreen(navController, examId)
        }
        composable(
            route = Screen.Report.route,
            arguments = listOf(navArgument("examId") { type = NavType.StringType })
        ) { backStackEntry ->
            val examId = backStackEntry.arguments?.getString("examId") ?: return@composable
            ReportScreen(navController, examId)
        }
    }
}
```

## 状态管理

### UI State 模式
```kotlin
// 通用 UI 状态
sealed interface UiState<out T> {
    object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}

// 示例：登录状态
data class LoginUiState(
    val phone: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isLoginSuccessful: Boolean = false
)

// 示例：历史记录状态
data class HistoryUiState(
    val exams: List<Exam> = emptyList(),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val errorMessage: String? = null,
    val hasMore: Boolean = true
)
```


## 权限管理

### AndroidManifest.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- 网络权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- 相机权限 -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="true" />
    
    <!-- 存储权限 -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" 
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    
    <application
        android:name=".ExamAiApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ExamAi"
        android:usesCleartextTraffic="false">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.ExamAi">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <!-- FileProvider for camera -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
```

## 错误处理

### Result 封装
```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

// 扩展函数
suspend fun <T> safeApiCall(
    apiCall: suspend () -> T
): Result<T> {
    return try {
        Result.Success(apiCall())
    } catch (e: Exception) {
        Result.Error(e)
    }
}
```

## 测试策略

### 单元测试
- Repository 测试（使用 MockK）
- ViewModel 测试（使用 Turbine 测试 Flow）
- UseCase 测试

### UI 测试
- Compose UI 测试（使用 ComposeTestRule）
- 导航测试
- 端到端流程测试

## 性能优化

### 图片加载优化
- 使用 Coil 的内存缓存和磁盘缓存
- 图片压缩后上传
- 缩略图预加载

### 网络优化
- 请求合并
- 响应缓存
- 离线队列

### 内存优化
- 及时释放大对象
- 使用 LazyColumn 进行列表渲染
- 图片内存管理

## 安全考虑

### Token 安全
- 使用 DataStore 加密存储
- Token 过期自动刷新
- 敏感信息不记录日志

### 网络安全
- 强制 HTTPS
- Certificate Pinning（可选）
- 请求签名验证

### 数据安全
- 本地数据库加密（SQLCipher）
- 敏感数据不缓存
- 用户退出清除数据

## 下一步实现

### Task 17.1: 创建 Android 项目 ✅
- 项目结构设计完成
- 依赖配置定义完成

### Task 17.2: 实现网络层
- 创建 API 接口
- 实现 JWT 拦截器
- 配置 Retrofit

### Task 17.3: 实现本地数据库
- 创建 Room 实体
- 实现 DAO
- 配置数据库

### Task 17.4: 编写网络层单元测试
- 测试 API 调用
- 测试 Token 拦截器
- 测试错误处理

