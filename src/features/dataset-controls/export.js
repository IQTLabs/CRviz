const getDataToExport = (datasets, keyFields, ignoredFields, controls) => {
	let exportData = {};

	if(datasets)
		exportData["datasets"] = datasets;

	if(keyFields)
		exportData["keyFields"] = keyFields;

	if(ignoredFields)
		exportData["ignoredFields"] = ignoredFields;

	if(controls)
		exportData["controls"] = controls;

	return exportData;
}

export default getDataToExport;
export { getDataToExport };