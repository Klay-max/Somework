package com.examai.domain.usecase;

import android.content.Context;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
@QualifierMetadata("dagger.hilt.android.qualifiers.ApplicationContext")
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
public final class CaptureExamPhotoUseCase_Factory implements Factory<CaptureExamPhotoUseCase> {
  private final Provider<Context> contextProvider;

  public CaptureExamPhotoUseCase_Factory(Provider<Context> contextProvider) {
    this.contextProvider = contextProvider;
  }

  @Override
  public CaptureExamPhotoUseCase get() {
    return newInstance(contextProvider.get());
  }

  public static CaptureExamPhotoUseCase_Factory create(Provider<Context> contextProvider) {
    return new CaptureExamPhotoUseCase_Factory(contextProvider);
  }

  public static CaptureExamPhotoUseCase newInstance(Context context) {
    return new CaptureExamPhotoUseCase(context);
  }
}
