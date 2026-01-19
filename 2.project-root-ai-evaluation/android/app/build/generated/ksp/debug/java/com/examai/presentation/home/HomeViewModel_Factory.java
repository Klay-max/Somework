package com.examai.presentation.home;

import com.examai.data.local.TokenExpiryManager;
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
public final class HomeViewModel_Factory implements Factory<HomeViewModel> {
  private final Provider<TokenExpiryManager> tokenExpiryManagerProvider;

  public HomeViewModel_Factory(Provider<TokenExpiryManager> tokenExpiryManagerProvider) {
    this.tokenExpiryManagerProvider = tokenExpiryManagerProvider;
  }

  @Override
  public HomeViewModel get() {
    return newInstance(tokenExpiryManagerProvider.get());
  }

  public static HomeViewModel_Factory create(
      Provider<TokenExpiryManager> tokenExpiryManagerProvider) {
    return new HomeViewModel_Factory(tokenExpiryManagerProvider);
  }

  public static HomeViewModel newInstance(TokenExpiryManager tokenExpiryManager) {
    return new HomeViewModel(tokenExpiryManager);
  }
}
