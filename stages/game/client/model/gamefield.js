class GameField {
	constructor(parent_elem_id, width, height, name) {
		this.name = name;
		this.parent_elem = $("#" + parent_elem_id);

		this.parent_elem.append(`
			<div class="game-field" id="game-field-${this.name}">
				<canvas class="game-canvas pixelated" id="game-canvas-${this.name}"></canvas>
			</div>
		`);

		$("#game-field-" + this.name).css("background-color", "rgb(15, 15, 15)");

		this.width = width;
		this.height = height;

		this.coords = {'x': 0, 'y': 0}; // of the upper left corner

		this.canvas = document.getElementById("game-canvas-" + this.name);
		this.canvas_context = this.canvas.getContext('2d');
  	}

	async init() {
		this.communicator = new Communicator(this);

		const field_settings = await this.communicator.getFieldSettings();
		this.map_interpreter = field_settings['mapInterpreter'];
		this.stamina_consumption = field_settings['staminaConsumption'];
		this.obj_presets = field_settings['objPresets'];

		this.camera = new Camera(this);
		this.hero = new Hero(this);

		this.setField();

		await this.setWorldSize();
		await this.hero.updateStats();
		await this.updateMaps();

		this.initEvents();
	}

  	setField() {
		this.tile_size = this.setTileSize();

		$("#game-field-" + this.name).css("width", this.tile_size * this.width);
		$("#game-field-" + this.name).css("height", this.tile_size * this.height);

		$("#game-field-" + this.name).css("left", (+this.parent_elem.css("width").replace("px", "") - +$("#game-field-" + this.name).css("width").replace("px", "")) / 2);
		$("#game-field-" + this.name).css("top", (+this.parent_elem.css("height").replace("px", "") - +$("#game-field-" + this.name).css("height").replace("px", "")) / 2);

		this.setCanvas();
	}

	setCanvas() {
		this.canvas.width = +$("#game-field-" + this.name).css("width").replace("px", "");
		this.canvas.height = +$("#game-field-" + this.name).css("height").replace("px", "");

		this.canvas_context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	setTileSize() {
		const w_size = +this.parent_elem.css("width").replace("px", "") / this.width;
		const h_size = +this.parent_elem.css("height").replace("px", "") / this.height;

		return Math.max(Math.min(w_size, h_size), 40);
	}

	async updateMaps() {
		const hero_coords = this.hero.getStats(['x', 'y']);

		// field coords
		const x = +hero_coords['x'] - (this.width - 1)/2;
		const y = +hero_coords['y'] - (this.height - 1)/2;
		this.coords = {'x': x, 'y': y};

		let maps_load = false;

		if (!this.maps)
			maps_load = 'sync';
		else {
			const reserve = 4;

			const field_x = this.coordinates['x'];
			const field_y = this.coordinates['y'];

			let map_height = 0;
			let map_y = null;

			for (let i in this.maps['map_zones']) {
				if (!map_y)
					map_y = +i;
				else if (+i < map_y)
					map_y = +i;

				map_height++;
			}

			let map_width = 0;
			let map_x = null;

			for (let i in this.maps['map_zones'][map_y]) {
				if (!map_x)
					map_x = +i;
				else if (+i < map_x)
					map_x = +i;

				map_width++;
			}

			if (
				(field_x - map_x) < 0
				|| (map_x + map_width - field_x - this.width) < 0
				|| (field_y - map_y) < 0
				|| (map_y + map_height - field_y - this.height) < 0
			)
				maps_load = 'sync';
			else if (
				((field_x - map_x) < reserve
				|| (map_x + map_width - field_x - this.width) < reserve
				|| (field_y - map_y) < reserve
				|| (map_y + map_height - field_y - this.height) < reserve)
			)
				maps_load = true;
		}

		if (maps_load) {
			if (maps_load == 'sync') {
				const reserve = 1;

				let maps = await this.communicator.getMaps(this.width, this.height, reserve);

				if (maps) {
					maps['map_objects'] = this.interpretObjects( maps['map_objects'] );
					this.maps = maps;

					this.drawMaps();
				}
			} else {
				const reserve = 10;

				this.communicator.getMaps(this.width, this.height, reserve).then((maps) => {
					if (maps) {
						maps['map_objects'] = this.interpretObjects( maps['map_objects'] );
						this.maps = maps;

						this.drawMaps();
					}
				});
			}
		}
	}

	interpretObjects(map_objects) {
		for (let y in map_objects) {
			for (let x in map_objects[y]) {
				if (map_objects[y]?.[x]) {
					const num = map_objects[y][x];
					const obj_name = this.map_interpreter['objects'][num];
					const obj_preset = this.obj_presets[obj_name];
					const obj = new Obj(obj_preset);

					map_objects[y][x] = obj;
				}
			}
		}

		return map_objects;
	}

	drawMaps() {
		this.camera.startRender();
	}

	resizeWindow() {
		this.setField();
		this.drawMaps();
	}

	initEvents() {
		const game_field = $("#game-field-" + this.name);

		game_field.click((event) => {
			const margin_x = +game_field.css("left").replace("px", "");
			const margin_y = +game_field.css("top").replace("px", "");

			const x = event.pageX - margin_x;
			const y = event.pageY - margin_y;

			this.click(x, y);
		});
	}

	click(x, y) {
		// new world button
		if (x >= this.width*this.tile_size - this.tile_size*1.53 && x <= this.width*this.tile_size && y >= 0 && y <= this.tile_size*0.4) {
			this.generateNewWorld();
			return true;
		}

		const coords = this.get_coordinates;

		const tile_x = Math.floor(x / this.tile_size) + coords['x'];
		const tile_y = Math.floor(y / this.tile_size) + coords['y'];

		const result = this.hero.interactionWithTile(tile_x, tile_y);

		if (result) {
			this.drawMaps();
			this.updateMaps();
		}
	}

	async generateNewWorld() {
		const result = await this.communicator.eraseWorld();
		
		if (result) {
			this.maps = undefined;
			await this.hero.updateStats();

			await this.updateMaps();

			this.setWorldSize();
			alert(`A new world has been created: ${this.get_world_size['width']}x${this.get_world_size['height']} tiles`);
		} 
	}

	set set_maps(maps) {
		this.maps = maps;
	}

	set coords(coords) {
		this.coordinates = coords;
	}

	async setWorldSize() {
		this.world_size = await this.communicator.getWorldSize();
	}

	get get_map_interpreter() {
		return this.map_interpreter;
	}

	get get_stamina_consumption() {
		return this.stamina_consumption;
	}

	get get_world_size() {
		return this.world_size;
	}

	get field_size() {
		return {'width': this.width, 'height': this.height};
	}

	get get_maps() {
		return this.maps;
	}

	get get_tile_size() {
		return this.tile_size;
	}

	get get_coordinates() {
		return this.coordinates;
	}
}