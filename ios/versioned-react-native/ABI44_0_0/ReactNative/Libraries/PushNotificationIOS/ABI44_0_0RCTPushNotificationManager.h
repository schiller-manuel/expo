/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <ABI44_0_0React/ABI44_0_0RCTEventEmitter.h>

extern NSString *const ABI44_0_0RCTRemoteNotificationReceived;

@interface ABI44_0_0RCTPushNotificationManager : ABI44_0_0RCTEventEmitter

typedef void (^ABI44_0_0RCTRemoteNotificationCallback)(UIBackgroundFetchResult result);

#if !TARGET_OS_UIKITFORMAC
+ (void)didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings;
+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
+ (void)didReceiveRemoteNotification:(NSDictionary *)notification;
+ (void)didReceiveRemoteNotification:(NSDictionary *)notification fetchCompletionHandler:(ABI44_0_0RCTRemoteNotificationCallback)completionHandler;
+ (void)didReceiveLocalNotification:(UILocalNotification *)notification;
+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;
#endif

@end
