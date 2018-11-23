import { Component, ViewChild} from '@angular/core';
import { NavController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Keyboard } from '@ionic-native/keyboard';

// Custom
import { CartPage } from '../../pages/cart/cart';
import { HomePage } from '../../pages/home/home';
import { AccountPage } from '../../pages/account/account';
import { SettingPage } from '../../pages/setting/setting';
import { ChangepasswordPage } from '../../pages/changepassword/changepassword';
import { ProfilePage } from '../../pages/profile/profile';
import { CheckoutPage } from '../../pages/checkout/checkout';

@Component({
  selector: 'footer',
  templateUrl: 'footer.html'
})
export class Footer {
    CartPage = CartPage;
    AccountPage = AccountPage;
    SettingPage = SettingPage;
    HomePage = HomePage;
    ChangepasswordPage = ChangepasswordPage;
    ProfilePage = ProfilePage;
    CheckoutPage = CheckoutPage;

      active: any;
      @ViewChild('cart') buttonCart;
    cart_total: number;
    keyboard_show = false;

    constructor(public navCtrl: NavController, public storage: Storage, public keyboard: Keyboard) {
        this.update_footer();
    }

    ngOnInit(){
        this.keyboard.onKeyboardShow().subscribe(() => {
            this.keyboard_show = true;
        });
        this.keyboard.onKeyboardHide().subscribe(() => {
            this.keyboard_show = false;
        });
        this.active = this.navCtrl.getActive().component;
    }
    
    goto(page){
        if (this.active != page) {
            if (page == HomePage) {
                this.navCtrl.popToRoot();
            } else {
                let previous = this.navCtrl.getPrevious();
                if (previous && previous.component == page) this.navCtrl.pop();
                else this.navCtrl.push(page);
            }
        }
    }
    
    updateRoot() {
        this.active = HomePage;
    }

    update_footer(){
        this.storage.get('cart').then((val) =>{
            let tmp = 0;
            for(var key in val){
                let product = val[key];
                tmp += product.quantity;
            }
            this.cart_total = tmp;
        });
        
    }
}
