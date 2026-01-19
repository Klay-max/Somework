package com.examai.presentation.upload;

import androidx.work.WorkManager;
import com.examai.data.service.NotificationService;
import com.examai.domain.usecase.PollExamStatusUseCase;
import com.examai.domain.usecase.UploadExamUseCase;
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
public final class UploadViewModel_Factory implements Factory<UploadViewModel> {
  private final Provider<UploadExamUseCase> uploadExamUseCaseProvider;

  private final Provider<PollExamStatusUseCase> pollExamStatusUseCaseProvider;

  private final Provider<NotificationService> notificationServiceProvider;

  private final Provider<WorkManager> workManagerProvider;

  public UploadViewModel_Factory(Provider<UploadExamUseCase> uploadExamUseCaseProvider,
      Provider<PollExamStatusUseCase> pollExamStatusUseCaseProvider,
      Provider<NotificationService> notificationServiceProvider,
      Provider<WorkManager> workManagerProvider) {
    this.uploadExamUseCaseProvider = uploadExamUseCaseProvider;
    this.pollExamStatusUseCaseProvider = pollExamStatusUseCaseProvider;
    this.notificationServiceProvider = notificationServiceProvider;
    this.workManagerProvider = workManagerProvider;
  }

  @Override
  public UploadViewModel get() {
    return newInstance(uploadExamUseCaseProvider.get(), pollExamStatusUseCaseProvider.get(), notificationServiceProvider.get(), workManagerProvider.get());
  }

  public static UploadViewModel_Factory create(
      Provider<UploadExamUseCase> uploadExamUseCaseProvider,
      Provider<PollExamStatusUseCase> pollExamStatusUseCaseProvider,
      Provider<NotificationService> notificationServiceProvider,
      Provider<WorkManager> workManagerProvider) {
    return new UploadViewModel_Factory(uploadExamUseCaseProvider, pollExamStatusUseCaseProvider, notificationServiceProvider, workManagerProvider);
  }

  public static UploadViewModel newInstance(UploadExamUseCase uploadExamUseCase,
      PollExamStatusUseCase pollExamStatusUseCase, NotificationService notificationService,
      WorkManager workManager) {
    return new UploadViewModel(uploadExamUseCase, pollExamStatusUseCase, notificationService, workManager);
  }
}
