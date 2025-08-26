import React, { useState, useEffect } from 'react';
// import add and remove icons from react-icons
import { FaPlus, FaMinus } from 'react-icons/fa';
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

interface SemanticEnricherProps {
    inputJson: CsvwFile | null;
    setState?: React.Dispatch<React.SetStateAction<any>>;
    state?: any;
    handleSubmit?: () => void;
}

const SemanticEnricher: React.FC<SemanticEnricherProps> = ({ inputJson, setState, state, handleSubmit }) => {
    const [headers, setHeaders] = useState<string[]>([]);
    const [mappings, setMappings] = useState<
        {
            observableProperty: ObservableProperty;
            unitOfMeasurement: UnitOfMeasurement;
            processingSteps: string[];
            dataType: string;
        }[]
    >([]);
    const [observableProperties, setObservableProperties] = useState<ObservableProperty[]>([]);
    const [unitsOfMeasurement, setUnitsOfMeasurement] = useState<UnitOfMeasurement[]>([]);



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

    const generateCsvwFile = () => {
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

        if (typeof setState === 'function') {
            setState((prev: any) => ({
                ...prev,
                sensor_metadata: JSON.stringify(csvw, null, 2),
            }));
        }
    };

    // When observableProperties, unitsOfMeasurement, and inputJson are all loaded, set headers and mappings
    useEffect(() => {
        console.log('Input JSON changed:', inputJson);
        if (inputJson && Object.keys(inputJson).length === 0) return;
        if (inputJson && observableProperties.length > 0 && unitsOfMeasurement.length > 0) {
            const newHeaders = inputJson.tableSchema.columns.map((col: any) => col.name || '');
            setHeaders(newHeaders);
            const newMappings = mapCsvwToMappings(
                inputJson,
                observableProperties,
                unitsOfMeasurement
            );
            setMappings(newMappings);
            console.log('Mappings set from inputJson:', newMappings);
        }
    }, [inputJson, observableProperties, unitsOfMeasurement]);

    return (
        <div className = "dark:text-white text-gray-900">
            <div className="mt-8">
                {(inputJson && Object.keys(inputJson).length === 0) && (
                    <div>
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
                    </div>
                )}

                {headers.length > 0 && (
                    <div className="overflow-x-auto">
                        <div className="rounded-lg shadow-lg overflow-hidden mt-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                            Header
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                            Observable Property
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                            Unit of Measurement
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                            Processing Steps
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                            Datatype
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {headers.map((header, idx) => (
                                        <tr key={header} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                            <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                {header}
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={mappings[idx]?.observableProperty?.name || ''}
                                                    onChange={e => handleObservablePropertyChange(idx, e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    title={
                                                        mappings[idx]?.observableProperty
                                                            ? `Name: ${mappings[idx].observableProperty.name}\nDescription: ${mappings[idx].observableProperty.description}\nURL: ${mappings[idx].observableProperty.url}`
                                                            : ''
                                                    }
                                                >
                                                    <option value="" className="bg-white dark:bg-gray-800 dark:text-white text-gray-900">Select...</option>
                                                    {observableProperties.map(op => (
                                                        <option
                                                            key={op.name}
                                                            value={op.name}
                                                            title={`Name: ${op.name}\nDescription: ${op.description}\nURL: ${op.url}`}
                                                            className="bg-white dark:bg-gray-800 dark:text-white text-gray-900"
                                                        >
                                                            {op.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={mappings[idx]?.unitOfMeasurement?.name || ''}
                                                    onChange={e =>
                                                        handleUnitOfMeasurementChange(idx, e.target.value)
                                                    }
                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                >
                                                    <option value="" className='bg-white dark:bg-gray-800 dark:text-white text-gray-900'>Select...</option>
                                                    {unitsOfMeasurement.map(unit => (
                                                        <option
                                                            key={unit.name}
                                                            value={unit.name}
                                                            title={`Name: ${unit.name}\nSymbol: ${unit.symbol}\nURL: ${unit.url}`}
                                                            className="bg-white dark:bg-gray-800 dark:text-white text-gray-900"
                                                        >
                                                            {unit.name}
                                                            {unit.symbol && ` (${unit.symbol})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col gap-2">
                                                    {mappings[idx]?.processingSteps?.map((step, stepIdx) => (
                                                        <div key={stepIdx} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={step}
                                                                onChange={e =>
                                                                    handleProcessingStepChange(idx, stepIdx, e.target.value)
                                                                }
                                                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded transition flex items-center"
                                                                onClick={() => handleRemoveProcessingStep(idx, stepIdx)}
                                                                title="Remove Step"
                                                            >
                                                                <FaMinus />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded transition mt-1 flex items-center"
                                                        onClick={() => handleAddProcessingStep(idx)}
                                                        title="Add Step"
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={mappings[idx]?.dataType}
                                                    onChange={e => handleMappingChange(idx, 'dataType', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    placeholder="Select or type datatype"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={handleReset}
                        className="dark:bg-gray-700 dark:hover:bg-gray-900 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Reset
                    </button>
                    <button
                        onClick={generateCsvwFile}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Save CSVW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SemanticEnricher;
