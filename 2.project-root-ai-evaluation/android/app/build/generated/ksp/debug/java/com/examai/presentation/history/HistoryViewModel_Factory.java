package com.examai.presentation.history;

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
public final class HistoryViewModel_Factory implements Factory<HistoryViewModel> {
  private final Provider<ExamRepository> examRepositoryProvider;

  public HistoryViewModel_Factory(Provider<ExamRepository> examRepositoryProvider) {
    this.examRepositoryProvider = examRepositoryProvider;
  }

  @Override
  public HistoryViewModel get() {
    return newInstance(examRepositoryProvider.get());
  }

  public static HistoryViewModel_Factory create(Provider<ExamRepository> examRepositoryProvider) {
    return new HistoryViewModel_Factory(examRepositoryProvider);
  }

  public static HistoryViewModel newInstance(ExamRepository examRepository) {
    return new HistoryViewModel(examRepository);
  }
}
