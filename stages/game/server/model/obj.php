<?php

class Obj {
	public function __construct($preset) {
		$this->name = $preset['name'];
		$values = $preset['values'];

		if ($values)
			$this->includeModules($values);
	}

	function includeModules($modules) {
		foreach ($modules as $module => $value) {
			$this->includeModule($module, $value);
		}
	}

	function includeModule($module, $values) {
		switch($module) {
			case 'solidness':
				if ($values) $this->solid = true;
				break;
			
			case 'collectability':
				foreach ($values as $submodule => $value) {
					switch($submodule) {
						case 'toInventory':
							//
							break;

						case 'toStat':
							$this->collectability = array('type' => 'toStat', 'stat' => $value['stat'], 'value' => $value['value']);
							break;
					}
				}

				break;
		}
	}
}