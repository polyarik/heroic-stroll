class Camera {
	constructor(game_field) {
		this.game_field = game_field;
		this.image_loader = new ImageLoader(this);
		
		this.setPixelated();

		this.images = {};
		this.interpreter = this.game_field.get_map_interpreter;

		this.temp_data = {
			'rendering': {
				'status': {
					'rendering_field': {'ground': false, 'creatures': false, 'objects': false},
					'rendering_gui': false},
				'data': {}
			}
		};
	}

	setPixelated() {
		ctx.imageSmoothingEnabled = false;
		this.game_field.canvas_context['imageSmoothingEnabled'] = false;
		this.game_field.canvas_context['mozImageSmoothingEnabled'] = false;
		this.game_field.canvas_context['oImageSmoothingEnabled'] = false;
		this.game_field.canvas_context['webkitImageSmoothingEnabled'] = false;
		this.game_field.canvas_context['msImageSmoothingEnabled'] = false;
	}

	startRender() {
		this.render();
	}

	render() {
		if (
			!this.temp_data['rendering']['status']['rendering_field']['ground']
			|| !this.temp_data['rendering']['status']['rendering_field']['creatures']
			|| !this.temp_data['rendering']['status']['rendering_field']['objects']
		) {
			this.renderField();
		} else if ( !this.temp_data['rendering']['status']['rendering_gui'] ) {
			this.renderGUI();
		} else {
			this.temp_data['rendering'] = {
				'status': {
					'rendering_field': {'ground': false, 'creatures': false, 'objects': false}, 'rendering_gui': false},
				'data': {}
			};
		}
	}

	renderField() {
		if ( !this.temp_data['rendering']['data']['maps'] ) {
			const big_maps = this.game_field.get_maps;
			const field_size = this.game_field.field_size;
			const coordinates = this.game_field.get_coordinates; // field coords

			// rendering chunk
			let map_zones = [];
			let map_ground = [];
			let map_objects = [];

			for (let y = 0; y < field_size['height']; y++) {
				map_zones[y] = [];
				map_ground[y] = [];
				map_objects[y] = [];

				for (let x = 0; x < field_size['width']; x++) {
					if (big_maps['map_zones'][y + coordinates['y']]?.[x + coordinates['x']]) {
						map_zones[y][x] = big_maps['map_zones'][y + coordinates['y']][x + coordinates['x']];
						map_ground[y][x] = big_maps['map_ground'][y + coordinates['y']][x + coordinates['x']];
						map_objects[y][x] = big_maps['map_objects'][y + coordinates['y']][x + coordinates['x']];
					} else {
						map_zones[y][x] = null;
						map_ground[y][x] = null;
						map_ground[y][x] = null;
					}
				}
			}

			this.temp_data['rendering']['data']['maps'] = {};
			this.temp_data['rendering']['data']['maps']['map_zones'] = map_zones;
			this.temp_data['rendering']['data']['maps']['map_ground'] = map_ground;
			this.temp_data['rendering']['data']['maps']['map_objects'] = map_objects;
		}

		if ( this.temp_data['rendering']['status']['rendering_field']['ground'] )
			this.renderСreatures();
		else
			this.drawImages();
	}

	drawImages() {
		//TODO: rewrite!

		const map_zones = this.temp_data['rendering']['data']['maps']['map_zones'];
		const map_ground = this.temp_data['rendering']['data']['maps']['map_ground'];
		const map_objects = this.temp_data['rendering']['data']['maps']['map_objects'];

		const height = map_zones.length;

		let start_y = 0;
		let start_x = 0;

		// skip already rendered
		if ( this.temp_data['rendering']['data']['position'] ) {
			const position = this.temp_data['rendering']['data']['position'];
			start_y = position['y'];
			start_x = position['x'];
		}

		// what to render
		let rendering_type = this.temp_data['rendering']['status']['rendering_field']['creatures'] ? "objects" : "ground";

		for (let y = start_y; y < height; y++) {
			if (y != start_y) start_x = 0;

			for (let x = start_x, width = map_zones[y].length; x < width; x++) {
				let tile_data;

				if (rendering_type == "objects")
					tile_data = map_objects[y][x];
				else
					tile_data = map_ground[y][x];

				if (tile_data) {
					this.temp_data['rendering']['data']['position'] = {'x': x, 'y': y};
					const zone = this.interpreter['zones'][ map_zones[y][x] ];

					// load images of that zone
					if ( !this.images[zone] ) {
						this.temp_data['rendering']['data']['load_images'] = {};
						this.temp_data['rendering']['data']['load_images']['folder'] = zone;

						this.image_loader.loadImages( this.temp_data['rendering']['data']['load_images']['folder'] );
						return;
					}

					const folder = zone + "/" + rendering_type; // folder with ground/objects images
					const image_name = (rendering_type == "objects") ? tile_data['name'] : this.interpreter['ground'][tile_data];

					this.drawImage(x, y, rendering_type, folder, image_name);
				} else if (rendering_type == "ground") {
					// render void
					const tile_size = this.game_field.get_tile_size;
					this.game_field.canvas_context.clearRect(tile_size * x, tile_size * y, tile_size, tile_size);
				}
			}
		}

		if (rendering_type == "ground") {
			delete this.temp_data['rendering']['data']['position'];

			this.temp_data['rendering']['status']['rendering_field']['ground'] = true;
			this.renderСreatures();
		} else if (rendering_type == "objects") {
			delete this.temp_data['rendering']['data']['position'];

			this.temp_data['rendering']['status']['rendering_field']['objects'] = true;
			this.renderGUI();
		}
	}

	renderСreatures() {
		if ( !this.images['creatures'] ) this.images['creatures'] = {};

		this.temp_data['rendering']['data']['creatures'] = [this.game_field.hero]; // all loaded creatures (only hero by now)

		for (let i = 0, length = this.temp_data['rendering']['data']['creatures'].length; i < length; i++) {
			const creature = this.temp_data['rendering']['data']['creatures'][i];
			const stats = creature.getStats( ['race', 'type', 'x', 'y', 'status', 'direction'] );

			if ( !this.images['creatures'][stats['race']]?.[stats['type']] ) {
				// load this creature type images
				this.temp_data['rendering']['data']['load_images'] = {};
				this.temp_data['rendering']['data']['load_images']['folder'] = `creatures/${stats['race']}/${stats['type']}`;

				this.image_loader.loadImages( this.temp_data['rendering']['data']['load_images']['folder'] );
				return;
			}

			const folder = `creatures/${stats['race']}/${stats['type']}/${stats['direction']}`; // folder with creature images
			const field_coords = this.game_field.get_coordinates;

			this.drawImage(stats['x'] - field_coords['x'], stats['y'] - field_coords['y'], "creature", folder, stats['status']);
		}

		this.temp_data['rendering']['status']['rendering_field']['creatures'] = true;
		this.drawImages(); // render objects
	}

	drawImage(x, y, type, folder, image_name) {
		const path = folder.split('/');
		let section = this.images;

		for (let i = 0, length = path.length; i < length; i++) {
			section = section[ path[i] ]; // to where the image was loaded
		}

		const image = section[image_name + ".png"];

		if (!image) {
			console.error(`Image isn't loaded: ${image}`);
			return false;
		}

		if ( !this.temp_data['rendering']['data']['tile_size'] ) {
			this.temp_data['rendering']['data']['tile_size'] = this.game_field.get_tile_size;
		}

		const tile_size = this.temp_data['rendering']['data']['tile_size'];

		const shift = (image.height - 64) * tile_size/64; // for tall images (> 1 tile)
		const image_height = image.height/64 * tile_size;

		if (type == "objects") {
			let transparency = false;
			const shift_size = Math.floor(shift/tile_size); // shift in tiles

			// if tall image overlaps an object
			if (shift_size > 0) {
				for (let i = 1; i <= shift_size; i++) {
					if (
						this.temp_data['rendering']['data']['maps']['map_objects'][y - i]
						&& this.temp_data['rendering']['data']['maps']['map_objects'][y - i][x]
					)
						transparency = true;
				}
			}

			// if tall image overlaps a creature
			const field_coords = this.game_field.get_coordinates;

			for (let i = 0, count = this.temp_data['rendering']['data']['creatures'].length; i < count; i++) {
				for (var j = 0; j <= shift_size; j++) {
					const creature_y = this.temp_data['rendering']['data']['creatures'][i].getStats('y')['y'] - field_coords['y'];
					const creature_x = this.temp_data['rendering']['data']['creatures'][i].getStats('x')['x'] - field_coords['x'];

					if (creature_y == y - j && creature_x == x)
						transparency = true;
				}
			}

			if (transparency)
				this.game_field.canvas_context.globalAlpha = 0.6;

			//TODO: check&render tall off-screen images
		}

		this.game_field.canvas_context.drawImage(image, x*tile_size, y*tile_size - shift, tile_size, image_height);

		if (type == "ground") {
			// blue stroke
			this.game_field.canvas_context.strokeStyle = "rgba(180, 220, 255, 0.1)";
			this.game_field.canvas_context.lineWidth = tile_size*0.04;
			this.game_field.canvas_context.strokeRect(x * tile_size, y * tile_size, tile_size, tile_size);
		}

		this.game_field.canvas_context.globalAlpha = 1;
	}

	renderGUI() {
		//TODO: move gui to another canvas
		//settings button? inventory?
		//...

		this.renderHeroStats();
		this.renderCoordinates();
		this.renderButtons();

		this.temp_data['rendering']['status']['rendering_gui'] = true;

		this.temp_data['rendering'] = {
			'status': {
				'rendering_field': {'ground': false, 'creatures': false, 'objects': false},
				'rendering_gui': false},
			'data' : {}
		};
	}

	renderHeroStats() {
		let hero_stats = this.game_field.hero.getStats( ['name', 'lvl', 'exp', 'needexp', 'hpMax', 'mpMax', 'spMax', 'hp', 'mp', 'sp'] );

		hero_stats['hp'] = Math.min(hero_stats['hp'], hero_stats['hpMax']);
		hero_stats['mp'] = Math.min(hero_stats['mp'], hero_stats['mpMax']);
		hero_stats['sp'] = Math.min(hero_stats['sp'], hero_stats['spMax']);

		const field_size = this.game_field.field_size;
		const tile_size = this.game_field.get_tile_size;

		// field size in px
		const field_width = field_size['width'] * tile_size;
		const field_height = field_size['height'] * tile_size;
		
		const hero_title = `${hero_stats['name']}, ${hero_stats['lvl']} lvl`;

		// title background
		const coefficient = hero_title.length * 0.0205;
		this.game_field.canvas_context.fillStyle = "rgba(255, 255, 255, 0.4)";
		this.game_field.canvas_context.fillRect(0, 0, field_width*(coefficient + 0.041), field_width*0.05);

		// title
		this.game_field.canvas_context.font = `${field_width*0.04}px px-font-1`;
		this.game_field.canvas_context.fillStyle = "rgb(0, 0, 0)";
		this.game_field.canvas_context.textAlign = "start";
		this.game_field.canvas_context.textBaseline = "middle";
		this.game_field.canvas_context.fillText(hero_title, field_width*0.02, field_width*0.025);

		// ----------------

		// stat circle
		const x = field_width * 0.08;
		const y = field_width * 0.13;
		const radius = field_width * 0.074;
		const max_points = hero_stats['hpMax'] + hero_stats['mpMax'] + hero_stats['spMax'];

		const angles = [
			2*Math.PI * hero_stats['hpMax'] / max_points,
			2*Math.PI * hero_stats['mpMax'] / max_points,
			2*Math.PI * hero_stats['spMax'] / max_points
		];

		const radiuses = [
			radius * hero_stats['hp'] / hero_stats['hpMax'],
			radius * hero_stats['mp'] / hero_stats['mpMax'],
			radius * hero_stats['sp'] / hero_stats['spMax']
		];

		// background
		this.game_field.canvas_context.fillStyle = "rgba(255, 255, 255, 0.2)";
		this.game_field.canvas_context.fillRect(0, field_width * 0.05, field_width * 0.16, field_width * 0.16);

		// dark circle
		this.game_field.canvas_context.beginPath();
			this.game_field.canvas_context.arc(x, y, radius, 0, Math.PI*2, false);
			this.game_field.canvas_context.fillStyle = "rgba(0, 0, 0, 0.6)";
			this.game_field.canvas_context.fill();
		this.game_field.canvas_context.closePath();

		// exp arc
		this.game_field.canvas_context.beginPath();
			this.game_field.canvas_context.arc(x, y, radius*0.95, -Math.PI/2, 2*Math.PI*hero_stats['exp']/hero_stats['needexp'] - Math.PI/2);
			this.game_field.canvas_context.strokeStyle = "rgb(246, 243, 28)";
			this.game_field.canvas_context.lineWidth = radius * 0.03;
			this.game_field.canvas_context.stroke();
		this.game_field.canvas_context.closePath();

		// sectors: hp, mp, sp
		this.drawSector(x, y, radius * 0.9, -Math.PI/2, angles[1] - Math.PI/2, "rgba(130, 130, 160, 0.7)"); // mp
		this.drawSector(x, y, radius * 0.9, angles[1] - Math.PI/2, angles[1] + angles[2] - Math.PI/2, "rgba(130, 160, 130, 0.7)"); // sp
		this.drawSector(x, y, radius * 0.9, angles[1] + angles[2] - Math.PI/2, -Math.PI/2, "rgba(160, 130, 130, 0.7)"); // hp

		// current hp, mp, sp
		this.drawSector(x, y, radiuses[1]*0.9, -Math.PI/2, angles[1] - Math.PI/2, "rgba(80, 80, 200, 0.9)"); // current mp
		this.drawSector(x, y, radiuses[2]*0.9, angles[1] - Math.PI/2, angles[1] + angles[2] - Math.PI/2, "rgba(80, 200, 80, 0.9)"); // current sp
		this.drawSector(x, y, radiuses[0]*0.9, angles[1] + angles[2] - Math.PI/2, -Math.PI/2, "rgba(200, 80, 80, 0.9)"); // current hp

		this.game_field.canvas_context.font = `${field_width * 0.024}px px-font-1`;
		this.game_field.canvas_context.fillStyle = "rgba(0, 0, 0, 0.7)";
		this.game_field.canvas_context.textAlign = "center";
		// mp text
		this.game_field.canvas_context.fillText(
			hero_stats['mp'],
			Math.cos(angles[1]/2 - Math.PI/2)*radius*0.5 + x,
			Math.sin(angles[1]/2 - Math.PI/2)*radius*0.5 + y
		);
		// sp text
		this.game_field.canvas_context.fillText(
			hero_stats['sp'],
			Math.cos(angles[1] + angles[2]/2 - Math.PI/2)*radius*0.5 + x,
			Math.sin(angles[1] + angles[2]/2 - Math.PI/2)*radius*0.5 + y
		);
		//hp text
		this.game_field.canvas_context.fillText(
			hero_stats['hp'],
			Math.cos(angles[1] + angles[2] + angles[0]/2 - Math.PI/2)*radius*0.5 + x,
			Math.sin(angles[1] + angles[2] + angles[0]/2 - Math.PI/2)*radius*0.5 + y
		);

		// separator lines
		this.game_field.canvas_context.beginPath();
			this.game_field.canvas_context.lineWidth = radius * 0.03;
			this.game_field.canvas_context.strokeStyle = "rgba(0, 0, 0, 0.6)";

			this.game_field.canvas_context.moveTo(x, y);
			this.game_field.canvas_context.lineTo(x, y - radius*0.9);
			this.game_field.canvas_context.moveTo(x, y);
			this.game_field.canvas_context.lineTo(Math.cos(angles[1]-Math.PI/2)*radius*0.9 + x, Math.sin(angles[1]-Math.PI/2)*radius*0.9 + y);
			this.game_field.canvas_context.moveTo(x, y);
			this.game_field.canvas_context.lineTo(Math.cos(angles[1] + angles[2] - Math.PI/2)*radius*0.9 + x, Math.sin(angles[1] + angles[2] - Math.PI/2)*radius*0.9 + y);

			this.game_field.canvas_context.stroke();
		this.game_field.canvas_context.closePath();
	}

	drawSector(x, y, radius, startangle, endangle, color) {
		this.game_field.canvas_context.moveTo(x, y);
		this.game_field.canvas_context.beginPath();
			this.game_field.canvas_context.arc(x, y, radius, startangle, endangle, false);
			this.game_field.canvas_context.lineTo(x, y);
			this.game_field.canvas_context.fillStyle = color;
			this.game_field.canvas_context.fill();
		this.game_field.canvas_context.closePath();
	}

	renderCoordinates() {
		const hero_coords = this.game_field.hero.getStats( ['x', 'y'] );

		const field_size = this.game_field.field_size;
		const tile_size = this.game_field.get_tile_size;

		// field size in px
		const field_width = field_size['width'] * tile_size;
		const field_height = field_size['height'] * tile_size;
		
		const text = `x: ${hero_coords['x']}, y: ${hero_coords['y']}`;

		// background
		const coefficient = text.length * 0.015;
		this.game_field.canvas_context.fillStyle = "rgba(255, 255, 255, 0.2)";
		this.game_field.canvas_context.fillRect(0, field_height - field_width*0.05, field_width*(coefficient + 0.03), field_width*0.05);

		this.game_field.canvas_context.font = `${field_width * 0.032}px px-font-1`;
		this.game_field.canvas_context.fillStyle = "rgb(0, 0, 0)";
		this.game_field.canvas_context.textAlign = "start";
		this.game_field.canvas_context.textBaseline = "middle";
		this.game_field.canvas_context.fillText(text, field_width * 0.01, field_height - field_width*0.025);
	}

	renderButtons() {
		const field_size = this.game_field.field_size;
		const tile_size = this.game_field.get_tile_size;

		// field size in px
		const field_width = field_size['width'] * tile_size;
		const field_height = field_size['height'] * tile_size;

		// "new world" button
		const text = "New World";

		// background
		const coefficient = text.length * 0.0205;
		this.game_field.canvas_context.fillStyle = "rgba(190, 190, 255, 0.5)";
		this.game_field.canvas_context.fillRect(field_width - field_width*(coefficient + 0.041), 0, field_width*(coefficient + 0.041), field_width*0.05);

		this.game_field.canvas_context.font = `${field_width*0.04}px px-font-1`;
		this.game_field.canvas_context.fillStyle = "rgb(0, 0, 0)";
		this.game_field.canvas_context.textAlign = "start";
		this.game_field.canvas_context.textBaseline = "middle";
		this.game_field.canvas_context.fillText(text, field_width - field_width*(coefficient + 0.0205), field_width*0.025);
	}
}