package com.examai.di;

import com.examai.data.local.dao.ReportDao;
import com.examai.data.local.database.ExamDatabase;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
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
public final class DatabaseModule_ProvideReportDaoFactory implements Factory<ReportDao> {
  private final Provider<ExamDatabase> databaseProvider;

  public DatabaseModule_ProvideReportDaoFactory(Provider<ExamDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public ReportDao get() {
    return provideReportDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideReportDaoFactory create(
      Provider<ExamDatabase> databaseProvider) {
    return new DatabaseModule_ProvideReportDaoFactory(databaseProvider);
  }

  public static ReportDao provideReportDao(ExamDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideReportDao(database));
  }
}
