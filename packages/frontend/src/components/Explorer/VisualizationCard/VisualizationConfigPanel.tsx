import { assertUnreachable, ChartType } from '@lightdash/common';
import { FC, memo } from 'react';
import BigNumberConfigPanel from '../../VisualizationConfigs/BigNumberConfig';
import ChartConfigPanel from '../../VisualizationConfigs/ChartConfigPanel';
import CustomVisualizationConfigPanel from '../../VisualizationConfigs/ChartConfigPanel/CustomVisConfigTabs';
import PieConfigPanel from '../../VisualizationConfigs/PieChartConfig';
import TableConfigPanel from '../../VisualizationConfigs/TableConfigPanel';

const VisualizationConfigPanel: FC<
    React.PropsWithChildren<{ chartType: ChartType }>
> = memo(({ chartType }) => {
    switch (chartType) {
        case ChartType.BIG_NUMBER:
            return <BigNumberConfigPanel />;
        case ChartType.TABLE:
            return <TableConfigPanel />;
        case ChartType.CARTESIAN:
            return <ChartConfigPanel />;
        case ChartType.PIE:
            return <PieConfigPanel />;
        case ChartType.CUSTOM:
            return <CustomVisualizationConfigPanel />;
        default:
            return assertUnreachable(
                chartType,
                `Chart type ${chartType} not supported`,
            );
    }
});

export default VisualizationConfigPanel;
