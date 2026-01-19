package com.examai.data.worker;

import android.content.Context;
import androidx.work.WorkerParameters;
import dagger.internal.DaggerGenerated;
import dagger.internal.InstanceFactory;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

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
public final class UploadExamWorker_AssistedFactory_Impl implements UploadExamWorker_AssistedFactory {
  private final UploadExamWorker_Factory delegateFactory;

  UploadExamWorker_AssistedFactory_Impl(UploadExamWorker_Factory delegateFactory) {
    this.delegateFactory = delegateFactory;
  }

  @Override
  public UploadExamWorker create(Context p0, WorkerParameters p1) {
    return delegateFactory.get(p0, p1);
  }

  public static Provider<UploadExamWorker_AssistedFactory> create(
      UploadExamWorker_Factory delegateFactory) {
    return InstanceFactory.create(new UploadExamWorker_AssistedFactory_Impl(delegateFactory));
  }
}
