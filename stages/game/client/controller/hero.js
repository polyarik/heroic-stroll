class Hero {
	constructor(game_field) {
		this.game_field = game_field;
		//this.updateStats();
	}

	set stats(arr) {
		// race, type, name, x, y, status, direction, lvl, exp, needexp, hpMax, mpMax, spMax, hp, mp, sp
		for (let stat in arr) {
			this[stat] = arr[stat];
		}
	}

	interactionWithTile(x, y) {
		const world_size = this.game_field.get_world_size;

		// out of bounds
		if (x < 0 || y < 0 || x > (world_size['width'] - 1) || y > (world_size['height'] - 1))
			return false;

		// nearest tile
		if ((Math.abs(this.x - x) == 1 && Math.abs(this.y - y) == 0) || (Math.abs(this.x - x) == 0 && Math.abs(this.y - y) == 1)) {
			const map_interpreter = this.game_field.get_map_interpreter;
			let maps = this.game_field.get_maps;

			const zone = map_interpreter['zones'][maps['map_zones'][y][x]];
			const ground = map_interpreter['ground'][maps['map_ground'][y][x]];
			const object = maps['map_objects'][y][x];

			if (object?.solid) return false;

			const stamina_consumption = this.game_field.get_stamina_consumption;
			const stamina_change = -stamina_consumption[zone][ground];

			if (this.sp + stamina_change < 0) return false; // not enough energy

			if (this.moveHero(x, y)) {
				this.changeStat('sp', stamina_change);
				this.changeStat('exp', 1); //TEST

				// pick up an item
				if (object) {
					if (object['collectability']) {
						maps['map_objects'][y][x] = null;
						this.game_field.set_maps = maps;

						this.changeStat(object['collectability']['stat'], object['collectability']['value']);
					}
				}

				this.game_field.communicator.moveHero(x, y).then((result) => {
					if (result !== true) {
						console.warn('movement failed');

						this.stats = result;
			
						const field_x = result['x'] - (this.game_field.field_size['width'] - 1)/2;
						const field_y = result['y'] - (this.game_field.field_size['height'] - 1)/2;
			
						this.game_field.coords = {'x': field_x, 'y': field_y};
						this.game_field.drawMaps();
					}
				});

				//TEMP
				const field_x = this.x - (this.game_field.field_size['width'] - 1)/2;
				const field_y = this.y - (this.game_field.field_size['height'] - 1)/2;	
				this.game_field.coords = {'x': field_x, 'y': field_y};

				return true;
			}
		}

		// hero tile
		else if (this.x == x && this.y == y) {
			if (this.mp - 20 < 0) return false; // not enough mp

			this.changeStat('mp', -20);
			this.changeStat('sp', 15);

			this.game_field.communicator.interactionWithHero(x, y);
			return true;
		}

		return false;
	}

	moveHero(x, y) {
		if (this.y == y) {
			if (this.x > x)
				this.direction = 'left';
			else
				this.direction = 'right';

			this.x = x;
		} else if (this.x == x) {
			if (this.y > y)
				this.direction = 'up';
			else
				this.direction = 'down';

			this.y = y;
		}

		return true;
	}

	changeStat(stat, value) {
		this[stat] += value;

		if (stat == 'hp' || stat == 'mp' || stat == 'sp')
			this[stat] = Math.max(Math.min(this[stat], this[stat + "Max"]), 0);

		if (stat == 'exp')
			this.checkLvlUp();
	}

	checkLvlUp() {
		while (this.exp >= this.needexp) {
			this.lvl++;
			this.exp -= this.needexp;
			this.needexp = this.lvl * 10;
		}
	}

	async updateStats() {
		const stats = await this.game_field.communicator.getHeroStats();
		this.stats = stats;
	}

	getStats(requestedStats) {
		let stats = {};

		for (let i = 0; i < requestedStats.length; i++) {
			const current_stat = requestedStats[i];
			stats[current_stat] = this[current_stat];
		}

		return stats;
	}
}