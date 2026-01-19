package com.examai.presentation.auth.register;

import com.examai.domain.usecase.RegisterUseCase;
import com.examai.domain.usecase.SendVerificationCodeUseCase;
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
public final class RegisterViewModel_Factory implements Factory<RegisterViewModel> {
  private final Provider<RegisterUseCase> registerUseCaseProvider;

  private final Provider<SendVerificationCodeUseCase> sendVerificationCodeUseCaseProvider;

  public RegisterViewModel_Factory(Provider<RegisterUseCase> registerUseCaseProvider,
      Provider<SendVerificationCodeUseCase> sendVerificationCodeUseCaseProvider) {
    this.registerUseCaseProvider = registerUseCaseProvider;
    this.sendVerificationCodeUseCaseProvider = sendVerificationCodeUseCaseProvider;
  }

  @Override
  public RegisterViewModel get() {
    return newInstance(registerUseCaseProvider.get(), sendVerificationCodeUseCaseProvider.get());
  }

  public static RegisterViewModel_Factory create(Provider<RegisterUseCase> registerUseCaseProvider,
      Provider<SendVerificationCodeUseCase> sendVerificationCodeUseCaseProvider) {
    return new RegisterViewModel_Factory(registerUseCaseProvider, sendVerificationCodeUseCaseProvider);
  }

  public static RegisterViewModel newInstance(RegisterUseCase registerUseCase,
      SendVerificationCodeUseCase sendVerificationCodeUseCase) {
    return new RegisterViewModel(registerUseCase, sendVerificationCodeUseCase);
  }
}
