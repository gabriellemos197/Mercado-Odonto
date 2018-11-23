import { Injectable } from '@angular/core';

// Custom
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageMulti {
	constructor(private storage: Storage) {}
	get(keys: string[]) {
		const promises = [];
		keys.forEach( key => promises.push(this.storage.get(key)) );
		return Promise.all(promises).then(values => {
			const result = {};
			values.map((value, index) => {
				result[keys[index]] = value; 
			});
			return result;
		});
	}
	remove(keys: string[]) {
		const promises = [];
		keys.forEach( key => promises.push(this.storage.remove(key)) );
		return Promise.all(promises);
	}
}