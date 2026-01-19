package com.examai.presentation.camera;

import com.examai.domain.usecase.AnalyzeImageQualityUseCase;
import com.examai.domain.usecase.CaptureExamPhotoUseCase;
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
public final class CameraPreviewViewModel_Factory implements Factory<CameraPreviewViewModel> {
  private final Provider<AnalyzeImageQualityUseCase> analyzeImageQualityUseCaseProvider;

  private final Provider<CaptureExamPhotoUseCase> captureExamPhotoUseCaseProvider;

  public CameraPreviewViewModel_Factory(
      Provider<AnalyzeImageQualityUseCase> analyzeImageQualityUseCaseProvider,
      Provider<CaptureExamPhotoUseCase> captureExamPhotoUseCaseProvider) {
    this.analyzeImageQualityUseCaseProvider = analyzeImageQualityUseCaseProvider;
    this.captureExamPhotoUseCaseProvider = captureExamPhotoUseCaseProvider;
  }

  @Override
  public CameraPreviewViewModel get() {
    return newInstance(analyzeImageQualityUseCaseProvider.get(), captureExamPhotoUseCaseProvider.get());
  }

  public static CameraPreviewViewModel_Factory create(
      Provider<AnalyzeImageQualityUseCase> analyzeImageQualityUseCaseProvider,
      Provider<CaptureExamPhotoUseCase> captureExamPhotoUseCaseProvider) {
    return new CameraPreviewViewModel_Factory(analyzeImageQualityUseCaseProvider, captureExamPhotoUseCaseProvider);
  }

  public static CameraPreviewViewModel newInstance(
      AnalyzeImageQualityUseCase analyzeImageQualityUseCase,
      CaptureExamPhotoUseCase captureExamPhotoUseCase) {
    return new CameraPreviewViewModel(analyzeImageQualityUseCase, captureExamPhotoUseCase);
  }
}
