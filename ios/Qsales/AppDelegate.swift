// import UIKit
// import React
// import React_RCTAppDelegate
// import ReactAppDependencyProvider

// @main
// class AppDelegate: UIResponder, UIApplicationDelegate {
//   var window: UIWindow?

//   var reactNativeDelegate: ReactNativeDelegate?
//   var reactNativeFactory: RCTReactNativeFactory?

//   func application(
//     _ application: UIApplication,
//     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
//   ) -> Bool {
//     let delegate = ReactNativeDelegate()
//     let factory = RCTReactNativeFactory(delegate: delegate)
//     delegate.dependencyProvider = RCTAppDependencyProvider()

//     reactNativeDelegate = delegate
//     reactNativeFactory = factory

//     window = UIWindow(frame: UIScreen.main.bounds)

//     factory.startReactNative(
//       withModuleName: "Qsales",
//       in: window,
//       launchOptions: launchOptions
//     )

//     return true
//   }
// }

// class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
//   override func sourceURL(for bridge: RCTBridge) -> URL? {
//     self.bundleURL()
//   }

//   override func bundleURL() -> URL? {
// #if DEBUG
//     RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
// #else
//     Bundle.main.url(forResource: "main", withExtension: "jsbundle")
// #endif
//   }
// }


import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FBSDKCoreKit
import FirebaseCore
import AppTrackingTransparency
import AdSupport


@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

  FirebaseApp.configure()

    // 📱 Configure Facebook SDK with proper data processing options
    ApplicationDelegate.shared.application(application, didFinishLaunchingWithOptions: launchOptions)
    
    // Set data processing options for CCPA compliance
    // This should resolve the setDataProcessingOptions error
    Settings.shared.setDataProcessingOptions([], country: 0, state: 0)
    
    // Optional: Set additional Facebook settings
    Settings.shared.isAutoLogAppEventsEnabled = true
    Settings.shared.isAdvertiserIDCollectionEnabled = true

    // 🚫 Request App Tracking Transparency permission (iOS 14+)
    if #available(iOS 14, *) {
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
        ATTrackingManager.requestTrackingAuthorization { status in
          switch status {
          case .authorized:
            print("App Tracking Authorized")
          case .denied:
            print("App Tracking Denied")
          case .restricted:
            print("App Tracking Restricted")
          case .notDetermined:
            print("App Tracking Not Determined")
          @unknown default:
            print("App Tracking Unknown")
          }
        }
      }
    }

    // ⚛️ Setup React Native
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Qsales",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // 📦 Handle deep links and Facebook Login redirects
  func application(_ app: UIApplication, open url: URL,
                   options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {

    // Handle Facebook URL first
    if ApplicationDelegate.shared.application(app, open: url, options: options) {
      return true
    }

    // Handle React Native deep links
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // 🔗 Continue user activity (e.g. universal links)
  func application(_ application: UIApplication,
                   continue userActivity: NSUserActivity,
                   restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return RCTLinkingManager.application(application,
                                         continue: userActivity,
                                         restorationHandler: restorationHandler)
  }

  // Handle push notifications (optional)
  func application(_ application: UIApplication,
                   didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    // Handle device token if using push notifications
  }

  func application(_ application: UIApplication,
                   didFailToRegisterForRemoteNotificationsWithError error: Error) {
    // Handle registration failure if using push notifications
    print("Failed to register for remote notifications: \(error)")
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge!) -> URL! {
    return self.bundleURL()
  }

  override func bundleURL() -> URL! {
    #if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}