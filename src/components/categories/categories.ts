import { Component } from '@angular/core';
import { Http } from '@angular/http';

// Custom
import { Core } from '../../service/core.service';

// Page
import { DetailcategoryPage } from '../../pages/detailcategory/detailcategory';
// import { SearchPage } from '../search/search';

declare var wordpress_woo:string;

@Component({
  selector: 'categories',
  templateUrl: 'categories.html',
  providers: [Core]
})
export class Categories {
	DetailcategoryPage = DetailcategoryPage;
	parents:Object[] = [];
	childs:Object[]=[];
	id:Number;
	check_id:number[] = [];
	check:boolean = false;
constructor(
	public http: Http,
	public core: Core
) {
	let params = {parent:'0', per_page:100, page:1};
	let signCategories = core.getSignature('get', wordpress_woo+'/products/categories', params);
	let loadCategories = () => {
			this.http.get(wordpress_woo+'/products/categories', {
				search:core.objectToURLParams(signCategories)
			}).subscribe(res => {
				this.parents = this.parents.concat(res.json());
				this.parents.forEach((item, index) => {
					let params1 = {page:1, per_page:100, parent: item['id']};
				  	let signChildCategories = core.getSignature('get', wordpress_woo+'/products/categories', params1);
					this.http.get(wordpress_woo+'/products/categories', {
						search:core.objectToURLParams(signChildCategories)
					}).subscribe(res => {
						this.childs = this.childs.concat(res.json());
					});
				});
				if(res.json().length == 100){
					params.page++;
					signCategories = core.getSignature('get', wordpress_woo+'/products/categories', params);
					loadCategories();
				}
			});
		};
		loadCategories();
  }


	checkOpen(id:number){
		if(this.check == false) {
			this.check_id[id] = id;
			if (this.check_id[id] == id){
				this.check = true;
			} else {
				this.check =false;
			}
		} else {
			if(this.check_id[id] == id){
				delete this.check_id[id];
				this.check = false;
			} else {
				this.check_id[id] = id;
				this.check =true;
			}
		}
	}
}
