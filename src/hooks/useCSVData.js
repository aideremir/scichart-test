import { useEffect, useState } from 'react';
import Papa from 'papaparse';

const useCSVData = () => {
    const [data, setData] = useState(null);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);

    const transformData = (csvData) => {
        const entities = {};

        csvData.sort((a, b) => a.Year - b.Year).forEach((row) => {
            const entity = row.Entity;

            Object.keys(row).forEach((column) => {
                const value = row[column];

                if (column !== 'Entity' && column !== 'Code') {
                    if (!entities[entity]) {
                        entities[entity] = {};
                    }

                    if (!entities[entity][column]) {
                        entities[entity][column] = [];
                    }

                    entities[entity][column].push(value);
                }
            });
        });

        return entities;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('Fetching CSV data...');
                const response = await fetch('./data.csv');
                setLoading(false);
                const csv = await response.text();

                Papa.parse(csv, {
                    header: true,
                    dynamicTyping: true,
                    transform: (value) => (!value ? 0 : value),
                    complete: (result) => {
                        const transformedData = transformData(result.data);
                        setData(transformedData);
                        setCountries(Object.keys(transformedData).sort());
                    },
                    error: (error) => {
                        console.error('Error parsing CSV:', error);
                    },
                });
            } catch (error) {
                setLoading(false);
                console.error('Error fetching CSV data:', error);
            }
        };

        fetchData();

    }, []);

    return { data, loading, countries };
};

export default useCSVData;
