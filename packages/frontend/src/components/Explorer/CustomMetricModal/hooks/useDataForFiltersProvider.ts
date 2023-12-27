import { useParams } from 'react-router-dom';
import { useExplore } from '../../../../hooks/useExplore';
import { useProject } from '../../../../hooks/useProject';
import { useExplorerContext } from '../../../../providers/ExplorerProvider/useExplorerContext';
import { useFieldsWithSuggestions } from '../../FiltersCard/useFieldsWithSuggestions';

export const useDataForFiltersProvider = () => {
    const { projectUuid } = useParams<{ projectUuid: string }>();
    const project = useProject(projectUuid);

    const tableName = useExplorerContext(
        (context) => context.state.unsavedChartVersion.tableName,
    );

    const queryResults = useExplorerContext(
        (context) => context.queryResults.data,
    );

    const { data: exploreData } = useExplore(tableName);

    const additionalMetrics = useExplorerContext(
        (context) =>
            context.state.unsavedChartVersion.metricQuery.additionalMetrics,
    );

    const tableCalculations = useExplorerContext(
        (context) =>
            context.state.unsavedChartVersion.metricQuery.tableCalculations,
    );

    const fieldsWithSuggestions = useFieldsWithSuggestions({
        exploreData,
        queryResults,
        additionalMetrics,
        tableCalculations,
    });

    return {
        projectUuid,
        fieldsMap: fieldsWithSuggestions,
        startOfWeek: project.data?.warehouseConnection?.startOfWeek,
    };
};
