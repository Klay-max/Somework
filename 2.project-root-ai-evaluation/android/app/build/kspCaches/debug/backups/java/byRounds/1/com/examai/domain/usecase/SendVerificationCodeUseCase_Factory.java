package com.examai.domain.usecase;

import com.examai.domain.repository.AuthRepository;
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
public final class SendVerificationCodeUseCase_Factory implements Factory<SendVerificationCodeUseCase> {
  private final Provider<AuthRepository> authRepositoryProvider;

  public SendVerificationCodeUseCase_Factory(Provider<AuthRepository> authRepositoryProvider) {
    this.authRepositoryProvider = authRepositoryProvider;
  }

  @Override
  public SendVerificationCodeUseCase get() {
    return newInstance(authRepositoryProvider.get());
  }

  public static SendVerificationCodeUseCase_Factory create(
      Provider<AuthRepository> authRepositoryProvider) {
    return new SendVerificationCodeUseCase_Factory(authRepositoryProvider);
  }

  public static SendVerificationCodeUseCase newInstance(AuthRepository authRepository) {
    return new SendVerificationCodeUseCase(authRepository);
  }
}
