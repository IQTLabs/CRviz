import clonedeep from "lodash.clonedeep";

const getDataToExport = (datasets, keyFields, ignoredFields, controls) => {
	let exportData = {};

	if(datasets)
		exportData["datasets"] = sanitizeForExport(datasets);

	if(keyFields)
		exportData["keyFields"] = keyFields;

	if(ignoredFields)
		exportData["ignoredFields"] = ignoredFields;

	if(controls)
		exportData["controls"] = controls;

	return exportData;
}

const sanitizeForExport = (datasets) =>{
	let result = clonedeep(datasets);
	Object.keys(result).forEach((key) => {
		result[key].dataset.forEach((item) => {
			delete item.CRVIZ;
		});
	});
	return result;
}

export default getDataToExport;
export { getDataToExport };