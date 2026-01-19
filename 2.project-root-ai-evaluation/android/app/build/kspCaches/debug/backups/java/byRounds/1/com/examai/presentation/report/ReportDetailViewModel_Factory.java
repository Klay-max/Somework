package com.examai.presentation.report;

import androidx.lifecycle.SavedStateHandle;
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
public final class ReportDetailViewModel_Factory implements Factory<ReportDetailViewModel> {
  private final Provider<ExamRepository> examRepositoryProvider;

  private final Provider<SavedStateHandle> savedStateHandleProvider;

  public ReportDetailViewModel_Factory(Provider<ExamRepository> examRepositoryProvider,
      Provider<SavedStateHandle> savedStateHandleProvider) {
    this.examRepositoryProvider = examRepositoryProvider;
    this.savedStateHandleProvider = savedStateHandleProvider;
  }

  @Override
  public ReportDetailViewModel get() {
    return newInstance(examRepositoryProvider.get(), savedStateHandleProvider.get());
  }

  public static ReportDetailViewModel_Factory create(
      Provider<ExamRepository> examRepositoryProvider,
      Provider<SavedStateHandle> savedStateHandleProvider) {
    return new ReportDetailViewModel_Factory(examRepositoryProvider, savedStateHandleProvider);
  }

  public static ReportDetailViewModel newInstance(ExamRepository examRepository,
      SavedStateHandle savedStateHandle) {
    return new ReportDetailViewModel(examRepository, savedStateHandle);
  }
}
