package com.examai.data.worker;

import android.content.Context;
import androidx.work.WorkerParameters;
import com.examai.domain.usecase.UploadExamUseCase;
import dagger.internal.DaggerGenerated;
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
public final class UploadExamWorker_Factory {
  private final Provider<UploadExamUseCase> uploadExamUseCaseProvider;

  public UploadExamWorker_Factory(Provider<UploadExamUseCase> uploadExamUseCaseProvider) {
    this.uploadExamUseCaseProvider = uploadExamUseCaseProvider;
  }

  public UploadExamWorker get(Context context, WorkerParameters workerParams) {
    return newInstance(context, workerParams, uploadExamUseCaseProvider.get());
  }

  public static UploadExamWorker_Factory create(
      Provider<UploadExamUseCase> uploadExamUseCaseProvider) {
    return new UploadExamWorker_Factory(uploadExamUseCaseProvider);
  }

  public static UploadExamWorker newInstance(Context context, WorkerParameters workerParams,
      UploadExamUseCase uploadExamUseCase) {
    return new UploadExamWorker(context, workerParams, uploadExamUseCase);
  }
}
