package com.examai.di;

import com.examai.data.local.dao.ExamDao;
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
public final class DatabaseModule_ProvideExamDaoFactory implements Factory<ExamDao> {
  private final Provider<ExamDatabase> databaseProvider;

  public DatabaseModule_ProvideExamDaoFactory(Provider<ExamDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public ExamDao get() {
    return provideExamDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideExamDaoFactory create(
      Provider<ExamDatabase> databaseProvider) {
    return new DatabaseModule_ProvideExamDaoFactory(databaseProvider);
  }

  public static ExamDao provideExamDao(ExamDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideExamDao(database));
  }
}
