package com.examai.data.local;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;

@ScopeMetadata("javax.inject.Singleton")
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
public final class TokenExpiryManager_Factory implements Factory<TokenExpiryManager> {
  @Override
  public TokenExpiryManager get() {
    return newInstance();
  }

  public static TokenExpiryManager_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static TokenExpiryManager newInstance() {
    return new TokenExpiryManager();
  }

  private static final class InstanceHolder {
    private static final TokenExpiryManager_Factory INSTANCE = new TokenExpiryManager_Factory();
  }
}
