package com.examai.presentation.camera;

import com.examai.domain.usecase.CaptureExamPhotoUseCase;
import com.examai.domain.usecase.SelectPhotoFromGalleryUseCase;
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
public final class CameraViewModel_Factory implements Factory<CameraViewModel> {
  private final Provider<CaptureExamPhotoUseCase> captureExamPhotoUseCaseProvider;

  private final Provider<SelectPhotoFromGalleryUseCase> selectPhotoFromGalleryUseCaseProvider;

  public CameraViewModel_Factory(Provider<CaptureExamPhotoUseCase> captureExamPhotoUseCaseProvider,
      Provider<SelectPhotoFromGalleryUseCase> selectPhotoFromGalleryUseCaseProvider) {
    this.captureExamPhotoUseCaseProvider = captureExamPhotoUseCaseProvider;
    this.selectPhotoFromGalleryUseCaseProvider = selectPhotoFromGalleryUseCaseProvider;
  }

  @Override
  public CameraViewModel get() {
    return newInstance(captureExamPhotoUseCaseProvider.get(), selectPhotoFromGalleryUseCaseProvider.get());
  }

  public static CameraViewModel_Factory create(
      Provider<CaptureExamPhotoUseCase> captureExamPhotoUseCaseProvider,
      Provider<SelectPhotoFromGalleryUseCase> selectPhotoFromGalleryUseCaseProvider) {
    return new CameraViewModel_Factory(captureExamPhotoUseCaseProvider, selectPhotoFromGalleryUseCaseProvider);
  }

  public static CameraViewModel newInstance(CaptureExamPhotoUseCase captureExamPhotoUseCase,
      SelectPhotoFromGalleryUseCase selectPhotoFromGalleryUseCase) {
    return new CameraViewModel(captureExamPhotoUseCase, selectPhotoFromGalleryUseCase);
  }
}
