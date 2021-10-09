<?php

class Constants {
	public static function getMapInterpreter() {
		$mapInterpreter = array(
			'zones' => array(null => 0, 0 => 0, 1 => 'forest'),
			'ground' => array(null => 0, 0 => 0, 1 => 'grass', 2 => 'overgrownGrass'),
			'objects' => array(null => 0, 0 => 0, 1 => 'healthPotion', 2 => 'manaPotion', 3 => 'staminaPotion', 4 => 'stump', 5 => 'bush', 6 => 'tree')
		);

		return $mapInterpreter;
	}

	public static function getStaminaConsumption() {
		$staminaConsumption = array(
			'forest' => array(
				'grass' => 2,
				'overgrownGrass' => 5
			)
		);

		return $staminaConsumption;
	}

	public static function getObjPresets() {
		$healthPotion = array(
			'name' => 'healthPotion',
			'values' => array(
				'collectability' => array(
					'toStat' => array(
						'stat' => 'hp',
						'value' => 30
					)
				)
			)
		);

		$manaPotion = array(
			'name' => 'manaPotion',
			'values' => array(
				'collectability' => array(
					'toStat' => array(
						'stat' => 'mp',
						'value' => 30
					)
				)
			)
		);

		$staminaPotion = array(
			'name' => 'staminaPotion',
			'values' => array(
				'collectability' => array(
					'toStat' => array(
						'stat' => 'sp',
						'value' => 30
					)
				)
			)
		);

		$stump = array(
			'name' => 'stump',
			'values' => array(
				'solidness' => true
			)
		);

		$bush = array(
			'name' => 'bush'
		);

		$tree = array(
			'name' => 'tree',
			'values' => array(
				'solidness' => true
			)
		);

		$objPresets = array(
			'healthPotion' => $healthPotion,
			'manaPotion' => $manaPotion,
			'staminaPotion' => $staminaPotion,
			'stump' => $stump,
			'bush' => $bush,
			'tree' => $tree
		);

		return $objPresets;
	}
}