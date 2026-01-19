package com.examai.data.remote.interceptor;

import com.examai.data.local.TokenExpiryManager;
import com.examai.data.local.TokenManager;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
@QualifierMetadata
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava"
})
public final class AuthInterceptor_Factory implements Factory<AuthInterceptor> {
  private final Provider<TokenManager> tokenManagerProvider;

  private final Provider<TokenExpiryManager> tokenExpiryManagerProvider;

  public AuthInterceptor_Factory(Provider<TokenManager> tokenManagerProvider,
      Provider<TokenExpiryManager> tokenExpiryManagerProvider) {
    this.tokenManagerProvider = tokenManagerProvider;
    this.tokenExpiryManagerProvider = tokenExpiryManagerProvider;
  }

  @Override
  public AuthInterceptor get() {
    return newInstance(tokenManagerProvider.get(), tokenExpiryManagerProvider.get());
  }

  public static AuthInterceptor_Factory create(Provider<TokenManager> tokenManagerProvider,
      Provider<TokenExpiryManager> tokenExpiryManagerProvider) {
    return new AuthInterceptor_Factory(tokenManagerProvider, tokenExpiryManagerProvider);
  }

  public static AuthInterceptor newInstance(TokenManager tokenManager,
      TokenExpiryManager tokenExpiryManager) {
    return new AuthInterceptor(tokenManager, tokenExpiryManager);
  }
}
