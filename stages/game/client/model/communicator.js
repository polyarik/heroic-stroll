class Communicator {
	constructor(game_field) {
		//TEMP
		this.game_field = game_field;
	}

	async request(func, params=null) {
		let data = `func=${func}`;
	
		if (params) {
			for (let param in params) {
				const value = params[param];
				data += `&${param}=${value}`;
			}
		}
	
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': "application/x-www-form-urlencoded;charset=UTF-8"
			},
			body: data
		}
	
		const response = await fetch("stages/game/server/model/server.php", options);
		const result = await response.json();
	
		return result;
	}

	async eraseWorld() {
		const result = await this.request("eraseWorld");
		return result;
	}

	async getFieldSettings() {
		const field_settings = await this.request("getFieldSettings");
		return field_settings;
	}

	async getHeroStats() {
		const hero_stats = await this.request("getHeroStats");
		return hero_stats;
	}

	async getWorldSize() {
		const world_size = await this.request("getWorldSize");
		return world_size;
	}

	async getMaps(fieldWidth, fieldHeight, reserve=0) {
		const width = fieldWidth - 1 + reserve*2;
		const height = fieldHeight - 1 + reserve*2;

		const maps = await this.request("getMaps", {'width': width, 'height': height});
		return maps;
	}

	async getImagesName(folder) {
		const images_name = await this.request("getImagesName", {'folder': folder});
		return images_name;
	}

	async moveHero(x, y) {
		const result = await this.request("moveHero", {'x': x, 'y': y});
		return result;
	}

	async interactionWithHero(x, y) {
		const result = await this.request("interactWithHero", {'x': x, 'y': y});

		if (result !== true) {
			//TEMP
			this.game_field.hero.stats = result;

			const x = result['x'] - (this.game_field.field_size['width'] - 1)/2;
			const y = result['y'] - (this.game_field.field_size['height'] - 1)/2;

			this.game_field.coords = {'x' : x, 'y' : y};
			this.game_field.drawMaps();
		}
	}
}