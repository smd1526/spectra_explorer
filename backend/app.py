import configparser
import json
from flask import Flask, request, jsonify
# from flask_cors import CORS
import pandas as pd

import utils

CONFIG_FILE = 'config.ini'
FILES = 'FILES'
TARGET_FILE = 'TARGET_FILE'

app = Flask(__name__)
# CORS(app)

target_data = None
config = configparser.ConfigParser()

@app.route('/api/spectrum', methods=['POST'])
def spectrum():
	data = json.loads(request.data)
	target = data['target']
	print('Getting spectrum for target: %s'%target)
	wave, flux = utils.get_wave_flux(target)
	return {'wave':wave,'flux':flux}


@app.route('/api/targets')
def targets():
	lines = target_data.columns.to_list()[1:]
	target_dict = {row.target:list(row[lines].values) for i,row in target_data.iterrows()}
	return {'lines':lines, 'targets':target_dict}


if __name__ == '__main__':
	config.read(CONFIG_FILE)

	if not target_data:
		if FILES not in config or TARGET_FILE not in config[FILES]:
			raise Exception('%s not set in config!'%TARGET_FILE)

		target_data = pd.read_csv(config[FILES][TARGET_FILE])

	app.run(port=5001)
