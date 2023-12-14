import { useEffect, useRef } from 'react';
import {
    NumericAxis,
    SciChartSurface,
    FastColumnRenderableSeries, TextLabelProvider, CategoryAxis, XyDataSeries,
} from 'scichart';


const initSciChart = async (divElementId, data) => {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(divElementId);

    const labelProvider = new TextLabelProvider({
        labels: data.x
    });

    const xAxis = new CategoryAxis(wasmContext, { id: 'XCategory', labelProvider, hideOverlappingLabels: false });
    const yAxis = new NumericAxis(wasmContext, {
        id: 'YNumeric',
    });

    sciChartSurface.xAxes.add(xAxis);
    sciChartSurface.yAxes.add(yAxis);

    const columnSeries = new FastColumnRenderableSeries(wasmContext, {
        xAxisId: xAxis.id,
        yAxisId: yAxis.id,
    });

    sciChartSurface.renderableSeries.add(columnSeries);

    const dataSeries = new XyDataSeries(wasmContext);
    dataSeries.appendRange([0, 1, 2, 3, 4], data.y);
    columnSeries.dataSeries = dataSeries;

    return { wasmContext, sciChartSurface };
};

function DetailsChart({ data }) {

    const sciChartSurfaceRef = useRef();

    useEffect(() => {
        const chartInitializationPromise = initSciChart('details-chart', data).then(res => {
            sciChartSurfaceRef.current = res.sciChartSurface;
        });

        return () => {
            // check if chart is already initialized
            if (sciChartSurfaceRef.current) {
                sciChartSurfaceRef.current.delete();
                return;
            }

            // else postpone deletion
            chartInitializationPromise.then(() => {
                sciChartSurfaceRef.current.delete();
            });
        };
    }, [data]);

    return <div id="details-chart" style={{ width: 800, height: 600 }} />;
}

export default DetailsChart;
