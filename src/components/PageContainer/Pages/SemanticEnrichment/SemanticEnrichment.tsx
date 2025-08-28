import React, { useState, useEffect } from 'react';

/**
 * Maps a CSVW file's columns to the closest matching observable properties and units of measurement.
 * @param csvw The CSVW file object.
 * @param observableProperties List of available observable properties.
 * @param unitsOfMeasurement List of available units of measurement.
 * @returns Array of mapping objects for each column.
 */
function mapCsvwToMappings(
    csvw: CsvwFile,
    observableProperties: ObservableProperty[],
    unitsOfMeasurement: UnitOfMeasurement[]
) {
    return csvw.tableSchema.columns.map((col: any) => {
        // Try to match observable property by name or description
        const op =
            observableProperties.find(
                op =>
                    op.name.toLowerCase() === (col.name || '').toLowerCase() ||
                    (col.titles?.en &&
                        op.description &&
                        op.description.toLowerCase().includes(col.titles.en.toLowerCase()))
            ) || { name: '', url: '', description: '', datatype: '' };

        // Try to match unit of measurement by symbol or name
        let unit = { name: '', url: '', symbol: '' };
        const unitMeasure = col['http://purl.org/linked-data/sdmx/2009/attribute#unitMeasure'];
        if (unitMeasure) {
            unit =
                unitsOfMeasurement.find(
                    u =>
                        u.url === unitMeasure['@id'] ||
                        u.symbol === unitMeasure['http://qudt.org/schema/qudt#symbol'] ||
                        u.name === unitMeasure['rdfs:label']
                ) || { name: '', url: '', symbol: '' };
        }

        // Extract processing steps if present
        const processingSteps =
            (col['http://www.w3.org/ns/sosa/usedProcedure'] || []).map(
                (step: any) => step['@id']
            ) || [];

        return {
            observableProperty: op,
            unitOfMeasurement: unit,
            processingSteps,
            dataType: col.datatype || op.datatype || '',
        };
    });
}


interface ObservableProperty {
    name: string;
    url: string;
    description: string;
    datatype: string;
}

interface UnitOfMeasurement {
    name: string;
    url: string;
    symbol: string;
}

interface CsvwFile {
    url: string;
    tableSchema: {
        columns: object[];
    };
    dialect: {
        header: boolean;
    };
}


const SemanticEnrichment: React.FC = () => {
    const [headers, setHeaders] = useState<string[]>([]);
    const [mappings, setMappings] = useState<
        {
            observableProperty: ObservableProperty;
            unitOfMeasurement: UnitOfMeasurement;
            processingSteps: string[];
            dataType: string;
        }[]
    >([]);
    const [editExisting, setEditExisting] = useState<boolean>(false);
    const [observableProperties, setObservableProperties] = useState<ObservableProperty[]>([]);
    const [unitsOfMeasurement, setUnitsOfMeasurement] = useState<UnitOfMeasurement[]>([]);
    const [uploadedCsvw, setUploadedCsvw] = useState<CsvwFile | null>(null);

    useEffect(() => {
        setMappings(
            headers.map(() => ({
                observableProperty: { name: '', url: '', description: '', datatype: '' },
                unitOfMeasurement: { name: '', url: '', symbol: '' },
                processingSteps: [],
                dataType: '',
            }))
        );
    }, [headers]);

    useEffect(() => {
        fetchAllObservableProperties();
        fetchAllUnitsOfMeasurement();
        // eslint-disable-next-line
    }, []);

    async function fetchAllObservableProperties() {
        let data: ObservableProperty[] | null = JSON.parse(
            window.sessionStorage.getItem('observable-property') || 'null'
        );
        if (!data) {
            const response = await fetch(
                process.env.REACT_APP_AIRQUALITY_API_URL + 'observable-property'
            );
            data = await response.json();
            window.sessionStorage.setItem('observable-property', JSON.stringify(data));
        }
        setObservableProperties(data || []);
    }

    async function fetchAllUnitsOfMeasurement() {
        let data: UnitOfMeasurement[] | null = JSON.parse(
            window.sessionStorage.getItem('unit-of-measurement') || 'null'
        );
        if (!data) {
            const response = await fetch(
                process.env.REACT_APP_AIRQUALITY_API_URL + 'unit-of-measurement'
            );
            data = await response.json();
            window.sessionStorage.setItem('unit-of-measurement', JSON.stringify(data));
        }
        data = JSON.parse(window.sessionStorage.getItem('unit-of-measurement') || '[]');
        data?.unshift({ name: 'None', url: 'N/A', symbol: 'N/A' });
        setUnitsOfMeasurement(data || []);
    }

    const handleMappingChange = (
        idx: number,
        field: 'observableProperty' | 'unitOfMeasurement' | 'dataType',
        value: string
    ) => {
        setMappings(prev =>
            prev.map((mapping, i) =>
                i === idx ? { ...mapping, [field]: value } : mapping
            )
        );
    };

    const handleAddProcessingStep = (idx: number) => {
        setMappings(prev =>
            prev.map((mapping, i) =>
                i === idx
                    ? { ...mapping, processingSteps: [...mapping.processingSteps, ''] }
                    : mapping
            )
        );
    };

    const handleRemoveProcessingStep = (idx: number, stepIdx: number) => {
        setMappings(prev =>
            prev.map((mapping, i) =>
                i === idx
                    ? {
                            ...mapping,
                            processingSteps: mapping.processingSteps.filter((_, j) => j !== stepIdx),
                        }
                    : mapping
            )
        );
    };

    const handleProcessingStepChange = (idx: number, stepIdx: number, value: string) => {
        setMappings(prev =>
            prev.map((mapping, i) =>
                i === idx
                    ? {
                            ...mapping,
                            processingSteps: mapping.processingSteps.map((step, j) =>
                                j === stepIdx ? value : step
                            ),
                        }
                    : mapping
            )
        );
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        const newHeaders = text.split('\n')[0].split(',').map(h => h.trim());
        setHeaders(newHeaders);
    };

    const handleObservablePropertyChange = (idx: number, value: string) => {
        const selectedOp =
            observableProperties.find(op => op.name === value) || {
                name: '',
                url: '',
                description: '',
                datatype: '',
            };
        setMappings(prev =>
            prev.map((mapping, i) =>
                i === idx ? { ...mapping, observableProperty: selectedOp } : mapping
            )
        );
    };

    const handleUnitOfMeasurementChange = (idx: number, value: string) => {
        const selectedUnit =
            unitsOfMeasurement.find(unit => unit.name === value) || {
                name: '',
                url: '',
                symbol: '',
            };
        setMappings(prev =>
            prev.map((mapping, i) =>
                i === idx ? { ...mapping, unitOfMeasurement: selectedUnit } : mapping
            )
        );
    };

    const handleReset = () => {
        setHeaders([]);
        setMappings([]);
        (document.getElementById('csv-upload') as HTMLInputElement).value = '';
    };

    const handleDownload = () => {
        const csvw: CsvwFile = {
            url: 'http://www.w3.org/ns/csvw',
            tableSchema: {
                columns: headers.map((header, idx) => ({
                    name: header,
                    titles: {
                        en: mappings[idx]?.observableProperty?.description || '',
                    },
                    propertyUrl: mappings[idx]?.observableProperty.url || '',
                    datatype: mappings[idx]?.dataType || '',
                    ...(mappings[idx]?.unitOfMeasurement &&
                    mappings[idx]?.unitOfMeasurement.name !== 'None'
                        ? {
                                'http://purl.org/linked-data/sdmx/2009/attribute#unitMeasure': {
                                    '@id': mappings[idx]?.unitOfMeasurement.url || '',
                                    'rdfs:label': mappings[idx]?.unitOfMeasurement?.name || '',
                                    'http://qudt.org/schema/qudt#symbol':
                                        mappings[idx]?.unitOfMeasurement?.symbol || '',
                                },
                            }
                        : {}),
                    ...(mappings[idx]?.processingSteps.length > 0
                        ? {
                                'http://www.w3.org/ns/sosa/usedProcedure':
                                    mappings[idx]?.processingSteps.map(step => ({ '@id': step })) || [],
                            }
                        : {}),
                })),
            },
            dialect: {
                header: true,
            },
        };
        const blob = new Blob([JSON.stringify(csvw, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'annotated_csvw.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    // When observableProperties, unitsOfMeasurement, and uploadedCsvw are all loaded, set mappings
    useEffect(() => {
        if (uploadedCsvw && observableProperties.length > 0 && unitsOfMeasurement.length > 0 && editExisting) {
            const newMappings = mapCsvwToMappings(
                uploadedCsvw,
                observableProperties,
                unitsOfMeasurement
            );
            setMappings(newMappings);
            setEditExisting(false); // Reset editExisting to false after initial mapping
        }
    }, [editExisting,uploadedCsvw, observableProperties, unitsOfMeasurement]);

    return (
        <div className="page">
            <div className="p-8">
                <h1 className="page-section-title">Welcome 👋</h1>
                <h1 className="page-title">CSVW Annotator</h1>
                <div className="mt-8">
                    <label className="block mb-2 font-semibold" htmlFor="csv-upload">
                        Upload CSV File
                    </label>
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        className="mb-4"
                        onChange={handleFileUpload}
                    />
                    <label className="block mb-2 font-semibold" htmlFor="csvw-upload">
                        Upload Existing CSVW File (Optional)
                    </label>
                    <input
                        id="csvw-upload"
                        type="file"
                        accept=".json"
                        className="mb-4"
                        onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const text = await file.text();
                            const csvw: CsvwFile = JSON.parse(text);
                            setUploadedCsvw(csvw);
                            const newHeaders = csvw.tableSchema.columns.map((col: any) => col.name || '');
                            setHeaders(newHeaders);
                            setEditExisting(true);
                        }}
                    />
                    {headers.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border mt-4">
                                <thead>
                                    <tr>
                                        <th className="border px-2 py-1">Header</th>
                                        <th className="border px-2 py-1">Observable Property</th>
                                        <th className="border px-2 py-1">Unit of Measurement</th>
                                        <th className="border px-2 py-1">Processing Steps</th>
                                        <th className="border px-2 py-1">Datatype</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {headers.map((header, idx) => (
                                        <tr key={header}>
                                            <td className="border px-2 py-1">{header}</td>
                                            <td className="border px-2 py-1">
                                                <select
                                                    value={mappings[idx]?.observableProperty?.name || ''}
                                                    onChange={e => handleObservablePropertyChange(idx, e.target.value)}
                                                    className="w-full"
                                                    title={
                                                        mappings[idx]?.observableProperty
                                                            ? `Name: ${mappings[idx].observableProperty.name}\nDescription: ${mappings[idx].observableProperty.description}\nURL: ${mappings[idx].observableProperty.url}`
                                                            : ''
                                                    }
                                                >
                                                    <option value="">Select...</option>
                                                    {observableProperties.map(op => (
                                                        <option
                                                            key={op.name}
                                                            value={op.name}
                                                            title={`Name: ${op.name}\nDescription: ${op.description}\nURL: ${op.url}`}
                                                        >
                                                            {op.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="border px-2 py-1">
                                                <select
                                                    value={mappings[idx]?.unitOfMeasurement?.name || ''}
                                                    onChange={e =>
                                                        handleUnitOfMeasurementChange(idx, e.target.value)
                                                    }
                                                    className="w-full"
                                                >
                                                    <option value="">Select...</option>
                                                    {unitsOfMeasurement.map(unit => (
                                                        <option
                                                            key={unit.name}
                                                            value={unit.name}
                                                            title={`Name: ${unit.name}\nSymbol: ${unit.symbol}\nURL: ${unit.url}`}
                                                        >
                                                            {unit.name}
                                                            {unit.symbol && ` (${unit.symbol})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="border px-2 py-1">
                                                <div className="flex flex-col gap-2">
                                                    {mappings[idx]?.processingSteps?.map((step, stepIdx) => (
                                                        <div key={stepIdx} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={step}
                                                                onChange={e =>
                                                                    handleProcessingStepChange(idx, stepIdx, e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="text-red-500"
                                                                onClick={() => handleRemoveProcessingStep(idx, stepIdx)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="text-blue-500 mt-1"
                                                        onClick={() => handleAddProcessingStep(idx)}
                                                    >
                                                        Add Step
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="border px-2 py-1">
                                                <input
                                                    type="text"
                                                    value={mappings[idx]?.dataType}
                                                    onChange={e => handleMappingChange(idx, 'dataType', e.target.value)}
                                                    className="w-full"
                                                    placeholder="Select or type datatype"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={handleReset}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleDownload}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Download Annotated CSVW
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SemanticEnrichment;
