package com.examai.domain.usecase;

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
public final class HandleTokenExpiryUseCase_Factory implements Factory<HandleTokenExpiryUseCase> {
  private final Provider<TokenManager> tokenManagerProvider;

  public HandleTokenExpiryUseCase_Factory(Provider<TokenManager> tokenManagerProvider) {
    this.tokenManagerProvider = tokenManagerProvider;
  }

  @Override
  public HandleTokenExpiryUseCase get() {
    return newInstance(tokenManagerProvider.get());
  }

  public static HandleTokenExpiryUseCase_Factory create(
      Provider<TokenManager> tokenManagerProvider) {
    return new HandleTokenExpiryUseCase_Factory(tokenManagerProvider);
  }

  public static HandleTokenExpiryUseCase newInstance(TokenManager tokenManager) {
    return new HandleTokenExpiryUseCase(tokenManager);
  }
}
