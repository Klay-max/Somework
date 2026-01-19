package com.examai.data.worker;

import androidx.hilt.work.WorkerAssistedFactory;
import androidx.work.ListenableWorker;
import dagger.Binds;
import dagger.Module;
import dagger.hilt.InstallIn;
import dagger.hilt.codegen.OriginatingElement;
import dagger.hilt.components.SingletonComponent;
import dagger.multibindings.IntoMap;
import dagger.multibindings.StringKey;
import javax.annotation.processing.Generated;

@Generated("androidx.hilt.AndroidXHiltProcessor")
@Module
@InstallIn(SingletonComponent.class)
@OriginatingElement(
    topLevelClass = UploadExamWorker.class
)
public interface UploadExamWorker_HiltModule {
  @Binds
  @IntoMap
  @StringKey("com.examai.data.worker.UploadExamWorker")
  WorkerAssistedFactory<? extends ListenableWorker> bind(UploadExamWorker_AssistedFactory factory);
}
