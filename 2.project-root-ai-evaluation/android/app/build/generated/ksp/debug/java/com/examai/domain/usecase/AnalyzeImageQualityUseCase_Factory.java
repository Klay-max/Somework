package com.examai.domain.usecase;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;

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
public final class AnalyzeImageQualityUseCase_Factory implements Factory<AnalyzeImageQualityUseCase> {
  @Override
  public AnalyzeImageQualityUseCase get() {
    return newInstance();
  }

  public static AnalyzeImageQualityUseCase_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static AnalyzeImageQualityUseCase newInstance() {
    return new AnalyzeImageQualityUseCase();
  }

  private static final class InstanceHolder {
    private static final AnalyzeImageQualityUseCase_Factory INSTANCE = new AnalyzeImageQualityUseCase_Factory();
  }
}
