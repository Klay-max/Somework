package com.examai.domain.usecase;

import com.examai.domain.repository.ExamRepository;
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
public final class RegisterFcmTokenUseCase_Factory implements Factory<RegisterFcmTokenUseCase> {
  private final Provider<ExamRepository> examRepositoryProvider;

  public RegisterFcmTokenUseCase_Factory(Provider<ExamRepository> examRepositoryProvider) {
    this.examRepositoryProvider = examRepositoryProvider;
  }

  @Override
  public RegisterFcmTokenUseCase get() {
    return newInstance(examRepositoryProvider.get());
  }

  public static RegisterFcmTokenUseCase_Factory create(
      Provider<ExamRepository> examRepositoryProvider) {
    return new RegisterFcmTokenUseCase_Factory(examRepositoryProvider);
  }

  public static RegisterFcmTokenUseCase newInstance(ExamRepository examRepository) {
    return new RegisterFcmTokenUseCase(examRepository);
  }
}
