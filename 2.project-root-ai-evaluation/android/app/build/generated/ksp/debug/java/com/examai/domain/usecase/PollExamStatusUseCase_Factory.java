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
public final class PollExamStatusUseCase_Factory implements Factory<PollExamStatusUseCase> {
  private final Provider<ExamRepository> examRepositoryProvider;

  public PollExamStatusUseCase_Factory(Provider<ExamRepository> examRepositoryProvider) {
    this.examRepositoryProvider = examRepositoryProvider;
  }

  @Override
  public PollExamStatusUseCase get() {
    return newInstance(examRepositoryProvider.get());
  }

  public static PollExamStatusUseCase_Factory create(
      Provider<ExamRepository> examRepositoryProvider) {
    return new PollExamStatusUseCase_Factory(examRepositoryProvider);
  }

  public static PollExamStatusUseCase newInstance(ExamRepository examRepository) {
    return new PollExamStatusUseCase(examRepository);
  }
}
