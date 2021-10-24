class ImageLoader {
	constructor(camera) {
		this.camera = camera;
		this.temp_data = {};
	}

	async loadImages(folder) {
		if (this.temp_data['folder'] == folder)
			return false;

		this.temp_data['folder'] = folder;
		const image_names = await this.camera.game_field.communicator.getImagesName(folder);

		if (!image_names) return;

		this.temp_data['count_images'] = image_names[1];
		this.temp_data['uploaded_images'] = []; // loading result (promises)
		this.temp_data['current_folder'] = folder;
		this.scanDir(image_names[0]);

		await Promise.all( this.temp_data['uploaded_images'] );

		console.log(`Images have been uploaded from folder: \"${folder}\"`);
		this.temp_data = {};

		return true;
	}

	async scanDir(array) {
		for (let index in array) {
			const item = array[index];

			if (this.temp_data['current_folder'] == "")
				this.temp_data['current_folder'] = this.temp_data['folder'];

			if (Object.prototype.toString.call(item) === '[object Array]') {
				this.temp_data['current_folder'] += '/' + index; // subfolder
				this.scanDir(item);
			} else {
				const folder = this.temp_data['current_folder'];
				this.temp_data['uploaded_images'].push( this.loadImage(folder, item) );
			}
		};

		const folders = this.temp_data['current_folder'].split('/');
		const last_folder = folders[folders.length - 1];

		this.temp_data['current_folder'] = this.temp_data['current_folder'].replace('/' + last_folder, ""); // exit folder
	}

	async loadImage(folder, image_name) {
		const image_folder = "stages/game/client/view/images/" + folder;

		const path = folder.split('/');
		let section = this.camera.images;

		for (let i = 0, length = path.length; i < length; i++) {
			if (!section[path[i]])
				section[path[i]] = {};
			
			section = section[path[i]];
		}

		section[image_name] = new Image();
		section[image_name].src = image_folder + '/' + image_name;

		return new Promise(resolve => {
			section[image_name].onload = () => {
				//console.log(image_folder + '/' + image_name);
				resolve(true);
			};
		});
	}
}