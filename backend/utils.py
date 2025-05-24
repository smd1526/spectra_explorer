import astropy.io.fits as fits
import pathlib

DATA_DIR = pathlib.Path(__file__).resolve().parent.joinpath('data')

def get_wave_flux(target_name):
	# backend/data/TEST0/log/par_table.fits
	bmc_file = DATA_DIR.joinpath(target_name, 'log', 'best_model_components.fits')
	if not bmc_file.exists():
		print('Unable to find component file: %s' % (str(bmc_file)))
		return None, None

	hdu = fits.open(bmc_file)
	data = hdu[1].data
	wave = [float(v) for v in data['WAVE']]
	flux = [float(v) for v in data['DATA']]

	return wave, flux
