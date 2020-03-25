package com.fitchat;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.github.wuxudong.rncharts.MPAndroidChartPackage;
import com.rtmalone.volumecontrol.RNVolumeControlPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.firestore.RNFirebaseFirestorePackage;
import net.no_mad.tts.TextToSpeechPackage;
import com.wenkesj.voice.VoicePackage;
import de.innfactory.apiai.RNApiAiPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnative.googlefit.GoogleFitPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.devfd.RNGeocoder.RNGeocoderPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new MPAndroidChartPackage(),
            new RNVolumeControlPackage(),
          new RNFirebaseFirestorePackage(),
          new RNGoogleSigninPackage(),
          new RNFirebaseAuthPackage(),
          new RNFirebasePackage(),
          new RNGeocoderPackage(),
          new MPAndroidChartPackage(),
          new TextToSpeechPackage(),
          new VoicePackage(),
          new RNApiAiPackage(),
          new VectorIconsPackage(),
          new GoogleFitPackage(BuildConfig.APPLICATION_ID),
          new RNGestureHandlerPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
