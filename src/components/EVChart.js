import { useEffect, useRef } from 'react';
import { DpiHelper } from 'scichart/Charting/Visuals/TextureManager/DpiHelper';
import {
    NumericAxis,
    SciChartSurface,
    StackedColumnCollection,
    StackedColumnRenderableSeries,
    XyDataSeries,
    ENumericFormat,
    LegendModifier,
    ELegendPlacement,
    ELegendOrientation,
} from 'scichart';

const initSciChart = async (divElementId, entityData, onClick) => {
    const fills = [
        '#B16214',
        '#B13507',
        '#578145',
        '#883039',
        '#4C6A9C',
    ];
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(divElementId);

    sciChartSurface.xAxes.add(
        new NumericAxis(wasmContext, {
            labelFormat: ENumericFormat.Decimal,
            labelPrecision: 0,
            autoTicks: false,
            majorDelta: 1,
            minorDelta: 10,
            drawMajorGridLines: false,
            drawMinorGridLines: false,
            drawMajorBands: false,
        })
    );
    sciChartSurface.yAxes.add(
        new NumericAxis(wasmContext, {
            labelPrecision: 0,
        })
    );

    const stackedColumnCollection = new StackedColumnCollection(wasmContext);
    // stackedColumnCollection.dataPointWidth = 1;

    Object.keys(entityData).forEach((entity, index) => {
        if (entity === 'Year') {
            return;
        }

        const xValues = entityData['Year'];
        const yValues = entityData[entity];
        const rendSeries = new StackedColumnRenderableSeries(wasmContext, {
            dataSeries: new XyDataSeries(wasmContext, { xValues, yValues, dataSeriesName: entity }),
            fill: fills[index % fills.length],
            strokeThickness: 0,
            opacity: 0.8,
            stackedGroupId: 'StackedGroupId',
        });
        stackedColumnCollection.add(rendSeries);
    });

    sciChartSurface.renderableSeries.add(stackedColumnCollection);

    sciChartSurface.chartModifiers.add(
        new LegendModifier({
            placement: ELegendPlacement.TopLeft,
            orientation: ELegendOrientation.Vertical,
            showLegend: true,
            showCheckboxes: true,
            showSeriesMarkers: true
        })
    );

    if (sciChartSurface.domCanvas2D) {
        sciChartSurface.domCanvas2D.addEventListener('mousedown', (mouseEvent) => {
            const premultipliedX = mouseEvent.offsetX * DpiHelper.PIXEL_RATIO;
            const premultipliedY = mouseEvent.offsetY * DpiHelper.PIXEL_RATIO;

            const hitTestResults = stackedColumnCollection.asArray()
                .map((stackedColumnRenderableSeries) => stackedColumnRenderableSeries.hitTestProvider.hitTest(
                    premultipliedX,
                    premultipliedY
                ))
                .find(({ isHit }) => isHit);

            onClick(hitTestResults);
        });
    }

    return { wasmContext, sciChartSurface, stackedColumnCollection };
};

function EVChart({ data, onClick }) {

    const sciChartSurfaceRef = useRef();

    useEffect(() => {
        const chartInitializationPromise = initSciChart('ev-chart', data, onClick).then(res => {
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
    }, [data, onClick]);

    return <div id="ev-chart" style={{ width: 800, height: 600, cursor: 'hover' }} />;
}

export default EVChart;
