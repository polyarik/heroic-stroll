class Obj {
	constructor(preset) {
		this.name = preset['name'];
		const values = preset['values'];

		if (values)
			this.includeModules(values);
  	}

  	includeModules(modules) {
		for (let module in modules) {
			this.includeModule(module, modules[module]);
		}
	}

	includeModule(module, values) {
		switch(module) {
			case 'solidness':
				if (values) this.solid = true;
				break;
			
			case 'collectability':
				for (let submodule in values) {
					const value = values[submodule];

					switch(submodule) {
						case 'toInventory':
							//...
							break;

						case 'toStat':
							this.collectability = {'type': 'toStat', 'stat': value['stat'], 'value': value['value']};
							break;
					}
				}
				break;
		}
	}
}