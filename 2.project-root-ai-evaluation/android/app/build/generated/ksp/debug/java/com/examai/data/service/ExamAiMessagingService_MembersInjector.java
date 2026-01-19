package com.examai.data.service;

import dagger.MembersInjector;
import dagger.internal.DaggerGenerated;
import dagger.internal.InjectedFieldSignature;
import dagger.internal.QualifierMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

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
public final class ExamAiMessagingService_MembersInjector implements MembersInjector<ExamAiMessagingService> {
  private final Provider<NotificationService> notificationServiceProvider;

  public ExamAiMessagingService_MembersInjector(
      Provider<NotificationService> notificationServiceProvider) {
    this.notificationServiceProvider = notificationServiceProvider;
  }

  public static MembersInjector<ExamAiMessagingService> create(
      Provider<NotificationService> notificationServiceProvider) {
    return new ExamAiMessagingService_MembersInjector(notificationServiceProvider);
  }

  @Override
  public void injectMembers(ExamAiMessagingService instance) {
    injectNotificationService(instance, notificationServiceProvider.get());
  }

  @InjectedFieldSignature("com.examai.data.service.ExamAiMessagingService.notificationService")
  public static void injectNotificationService(ExamAiMessagingService instance,
      NotificationService notificationService) {
    instance.notificationService = notificationService;
  }
}
