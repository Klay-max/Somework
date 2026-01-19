package com.examai.data.repository;

import com.examai.data.local.dao.ReportDao;
import com.examai.data.remote.api.ExamApiService;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;
import okhttp3.OkHttpClient;

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
public final class ExamRepositoryImpl_Factory implements Factory<ExamRepositoryImpl> {
  private final Provider<ExamApiService> apiServiceProvider;

  private final Provider<ReportDao> reportDaoProvider;

  private final Provider<OkHttpClient> okHttpClientProvider;

  public ExamRepositoryImpl_Factory(Provider<ExamApiService> apiServiceProvider,
      Provider<ReportDao> reportDaoProvider, Provider<OkHttpClient> okHttpClientProvider) {
    this.apiServiceProvider = apiServiceProvider;
    this.reportDaoProvider = reportDaoProvider;
    this.okHttpClientProvider = okHttpClientProvider;
  }

  @Override
  public ExamRepositoryImpl get() {
    return newInstance(apiServiceProvider.get(), reportDaoProvider.get(), okHttpClientProvider.get());
  }

  public static ExamRepositoryImpl_Factory create(Provider<ExamApiService> apiServiceProvider,
      Provider<ReportDao> reportDaoProvider, Provider<OkHttpClient> okHttpClientProvider) {
    return new ExamRepositoryImpl_Factory(apiServiceProvider, reportDaoProvider, okHttpClientProvider);
  }

  public static ExamRepositoryImpl newInstance(ExamApiService apiService, ReportDao reportDao,
      OkHttpClient okHttpClient) {
    return new ExamRepositoryImpl(apiService, reportDao, okHttpClient);
  }
}
