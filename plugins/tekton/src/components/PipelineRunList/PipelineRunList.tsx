import React from 'react';
import { EmptyState, InfoCard, Progress } from '@backstage/core-components';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ClusterErrors } from '../../types/types';
import { Table } from '../Table/Table';
import { ClusterSelector, ErrorPanel } from '../common';
import { PipelineRunHeader } from './PipelineRunHeader';
import { SortByDirection } from '../../hooks/useTableData';

type WrapperInfoCardProps = {
  allErrors?: ClusterErrors;
};

const WrapperInfoCard = ({
  children,
  allErrors,
}: React.PropsWithChildren<WrapperInfoCardProps>) => (
  <>
    {allErrors && allErrors.length > 0 && <ErrorPanel allErrors={allErrors} />}
    <InfoCard title="Pipeline Runs" subheader={<ClusterSelector />}>
      {children}
    </InfoCard>
  </>
);

const PipelineRunList = () => {
  const { loaded, responseError, watchResourcesData, selectedClusterErrors } =
    React.useContext(TektonResourcesContext);

  const allErrors: ClusterErrors = [
    ...(responseError ? [{ message: responseError }] : []),
    ...(selectedClusterErrors ?? []),
  ];

  if (!loaded && !responseError)
    return (
      <div data-testid="tekton-progress">
        <Progress />
      </div>
    );

  if (
    loaded &&
    !responseError &&
    !watchResourcesData?.pipelineruns?.data?.length
  ) {
    return (
      <WrapperInfoCard allErrors={allErrors}>
        <EmptyState missing="data" title="No Pipeline Runs found" />
      </WrapperInfoCard>
    );
  }
  return (
    <WrapperInfoCard allErrors={allErrors}>
      <Table
        tableData={watchResourcesData?.pipelineruns?.data || []}
        columns={PipelineRunHeader}
        defaultSortField="status.startTime"
        defaultSortOrder={SortByDirection.desc}
      />
    </WrapperInfoCard>
  );
};

export default PipelineRunList;
