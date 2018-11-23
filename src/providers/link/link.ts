import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

//Page
// import { DetailPage } from '../../pages/detail/detail';
// import { DetailcategoryPage } from '../../pages/detailcategory/detailcategory';
// import { AboutusPage } from '../../pages/aboutus/aboutus';
// import { TermPage } from '../../pages/term/term';
// import { PrivacyPage } from '../../pages/privacy/privacy';

/*
  Generated class for the LinkProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LinkProvider {

  constructor(
  	public http: Http) {
  }

  /* handler internal link and external link
      @return Object
  */
  	openComplexLink(url: string) {
        let result = {};
        console.log(url);
        if(url && url.indexOf('link://') !== -1) {
    		let array = url.split('/');
    		let id = array[array.length - 1];
    		if(url.indexOf('link://product-category') !== -1) {
                result = {'page': 'DetailcategoryPage', 'id': id};
            } else if(url.indexOf('link://product') !== -1) {
                result = {'page': 'DetailPage', 'id': id};
    		} else if(url.indexOf('link://bookmark') !== -1) {
                result = {'page': 'BookmarkPage'};
    		} else if(url.indexOf('link://about-us') !== -1) {
                result = {'page': 'AboutusPage'};
    		} else if(url.indexOf('link://privacy-policy') !== -1) {
                result = {'page': 'PrivacyPage'};
    		} else if(url.indexOf('link://term-and-conditions') !== -1) {
                result = {'page': 'TermPage'};
    		}
        }
        return result;
    }

    openExternal(url: string) {
        let link = url;
        if(link) {
            if(!link.match(/^https?:\/\//i)){
             link = 'http://' + link;
            }
            window.open(link, '_system', 'location=yes');
        }
    }

}
