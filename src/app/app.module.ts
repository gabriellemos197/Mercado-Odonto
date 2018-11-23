import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';


// Modules and plugins
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, './assets/i18n', '.json');
}
import { IonicStorageModule } from '@ionic/storage';
import { Keyboard } from '@ionic-native/keyboard';
import { Config } from '../service/config.service';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Network } from '@ionic-native/network';
import { OneSignal } from '@ionic-native/onesignal';
import { Camera } from '@ionic-native/camera';
import { Toast } from '@ionic-native/toast';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Device } from '@ionic-native/device';
import { AdMobFree } from '@ionic-native/admob-free';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';

// Custom service and providers
import { Core } from '../service/core.service';
import { ShoppingCartProvider } from '../providers/shopping-cart/shopping-cart';
import { LinkProvider } from '../providers/link/link';

// // Pipes
import { PipesModule } from '../pipes/pipes.module';

//page
import { HomePage } from '../pages/home/home';
import { TermPage } from '../pages/term/term';
import { ForgotPage } from '../pages/forgot/forgot';
import { SignupPage } from '../pages/signup/signup';
import { SigninPage } from '../pages/signin/signin';
import { CheckoutPage } from '../pages/checkout/checkout';
import { ContactusPage } from '../pages/contactus/contactus';
import { PrivacyPage } from '../pages/privacy/privacy';
import { SortpopupPage } from '../pages/sortpopup/sortpopup';
import { DetailPage } from '../pages/detail/detail';
import { GetallNewproductPage } from '../pages/getall-newproduct/getall-newproduct';
import { CommentPage } from '../pages/comment/comment';
import { AboutusPage } from '../pages/aboutus/aboutus';
import { CartPage } from '../pages/cart/cart';
import { ThankPage } from '../pages/thank/thank';
import { AccountPage } from '../pages/account/account';
import { SettingPage } from '../pages/setting/setting';
import { OrdercategoryPage } from '../pages/ordercategory/ordercategory';
import { FavoritePage } from '../pages/favorite/favorite';
import { OrderPage } from '../pages/order/order';
import { OrderdetailPage } from '../pages/orderdetail/orderdetail';
import { SearchPage } from '../pages/search/search';
import { ProfilePage } from '../pages/profile/profile';
import { BrandPage } from '../pages/brand/brand';
import { ChangepasswordPage } from '../pages/changepassword/changepassword';
import { DetailcategoryPage } from '../pages/detailcategory/detailcategory';
import { RatingPage } from '../pages/rating/rating';
import { CurrencyPage } from '../pages/currency/currency';
import { LanguagePage } from '../pages/language/language';

// component
import { Footer } from '../components/footer/footer';
import { Categories } from '../components/categories/categories';
import { ButtonQuantityComponent } from '../components/button-quantity/button-quantity';
import { HideShowComponent } from '../components/hide-show/hide-show';
import { SocialLoginComponent } from '../components/social-login/social-login';
import { SocialLoginProvider } from '../providers/social-login/social-login';
import { CommentProvider } from '../providers/comment/comment';

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        TermPage,
        ForgotPage,
        SignupPage,
        SigninPage,
        ContactusPage,
        PrivacyPage,
        Footer,
        RatingPage,
        Categories,
        CartPage,
        AboutusPage,
        AccountPage,
        DetailPage,
        GetallNewproductPage,
        SettingPage,
        OrderPage,
        FavoritePage,
        SortpopupPage,
        CheckoutPage,
        ThankPage,
        SearchPage,
        CommentPage,
        ProfilePage,
        CurrencyPage,
        BrandPage,
        LanguagePage,
        ChangepasswordPage,
        DetailcategoryPage,
        ButtonQuantityComponent,
        HideShowComponent,
        OrderdetailPage,
        OrdercategoryPage,
        SocialLoginComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        IonicImageViewerModule,
        IonicModule.forRoot(MyApp, {
            menuType: 'push',
            backButtonText: '',
            backButtonIcon: 'icomoon-arrow-back',
            mode: 'ios',
            animate: true,
            scrollAssist: true,
            autoFocusAssist: true,
            // modalEnter: 'modal-slide-in',
            // modalLeave: 'modal-slide-out',
        }),
        HttpModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [Http]
        }),
        PipesModule,
        IonicStorageModule.forRoot({ name: 'woocommerkey_wordpress' })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        TermPage,
        ForgotPage,
        AboutusPage,
        SignupPage,
        SigninPage,
        ContactusPage,
        LanguagePage,
        ThankPage,
        PrivacyPage,
        DetailPage,
        CartPage,
        AccountPage,
        SettingPage,
        BrandPage,
        OrderPage,
        SortpopupPage,
        FavoritePage,
        CommentPage,
        ProfilePage,
        RatingPage,
        CurrencyPage,
        ChangepasswordPage,
        CheckoutPage,
        SearchPage,
        DetailcategoryPage,
        GetallNewproductPage,
        OrdercategoryPage,
        OrderdetailPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Network,
        Config,
        OneSignal,
        Toast,
        Camera,
        Keyboard,
        InAppBrowser,
        SocialSharing,
        ScreenOrientation,
        Core,
        GoogleAnalytics,
        AdMobFree,
        LocationAccuracy,
        Diagnostic,
        Geolocation,
        Device,
        GooglePlus,
        Facebook,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        ShoppingCartProvider, LinkProvider,
        SocialLoginProvider,
        CommentProvider,
    ]
})
export class AppModule { }
