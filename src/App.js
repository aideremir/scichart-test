import {
    SciChartSurface,
    libraryVersion,
} from 'scichart';
import useCSVData from './hooks/useCSVData';
import EVChart from './components/EVChart';
import {useEffect, useState} from 'react';
import './App.css';
import DetailsChart from './components/DetailsChart';

SciChartSurface.configure({
    dataUrl: `https://cdn.jsdelivr.net/npm/scichart@${libraryVersion}/_wasm/scichart2d.data`,
    wasmUrl: `https://cdn.jsdelivr.net/npm/scichart@${libraryVersion}/_wasm/scichart2d.wasm`
});

function App() {
    const [entity, setEntity] = useState('World');
    const [detailsChartData, setDetailsChartData] = useState(null);
    const [detailsYear, setDetailsYear] = useState(null);
    const { data, loading, countries } = useCSVData(entity);

    const chartClickHandler = (clickedData) => {
        if (clickedData === undefined) {
            setDetailsChartData(null);
            setDetailsYear(null);

            return;
        }
        const yearData = {x: [], y: []};

        Object.keys(data[entity]).forEach((key ) => {
            if (key === 'Year') {
                return;
            }
            yearData.x.push(key);
            yearData.y.push(data[entity][key][clickedData['dataSeriesIndex']]);
        });

        setDetailsYear(data[entity].Year[clickedData['dataSeriesIndex']]);
        setDetailsChartData(yearData);

        console.log(yearData);
    }

    useEffect(() => {
        setDetailsChartData(undefined);
    }, [entity]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!data) {
        return <div>Error fetching data</div>;
    }

    return (
        <div className="App">
            <div className="container">
                <div className="card">
                    <EVChart data={data[entity]} onClick={chartClickHandler} />
                </div>
                <div className="card">
                    <select value={entity} onChange={(e) => setEntity(e.target.value)}>
                        {
                            countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))
                        }
                    </select>
                </div>
            </div>
            {
                detailsChartData && detailsYear && (
                    <div className="details-chart card">
                        <h2>Details for {entity} for {detailsYear} </h2>
                        <DetailsChart data={detailsChartData} />
                    </div>
                )
            }
        </div>
    );
}

export default App;
