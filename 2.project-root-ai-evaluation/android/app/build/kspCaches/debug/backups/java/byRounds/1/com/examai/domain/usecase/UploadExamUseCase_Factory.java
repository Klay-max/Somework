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
public final class UploadExamUseCase_Factory implements Factory<UploadExamUseCase> {
  private final Provider<ExamRepository> examRepositoryProvider;

  public UploadExamUseCase_Factory(Provider<ExamRepository> examRepositoryProvider) {
    this.examRepositoryProvider = examRepositoryProvider;
  }

  @Override
  public UploadExamUseCase get() {
    return newInstance(examRepositoryProvider.get());
  }

  public static UploadExamUseCase_Factory create(Provider<ExamRepository> examRepositoryProvider) {
    return new UploadExamUseCase_Factory(examRepositoryProvider);
  }

  public static UploadExamUseCase newInstance(ExamRepository examRepository) {
    return new UploadExamUseCase(examRepository);
  }
}
