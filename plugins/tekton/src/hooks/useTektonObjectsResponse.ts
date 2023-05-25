import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';
import { TektonResourcesContextData } from '../types/types';
import { useAllWatchResources } from './useAllWatchResources';
import { useResourcesClusters } from './useResourcesClusters';

export const useTektonObjectsResponse = (
  watchedResource: string[],
): TektonResourcesContextData => {
  const { entity } = useEntity();
  const { kubernetesObjects, loading, error } = useKubernetesObjects(entity);
  const [selectedCluster, setSelectedCluster] = React.useState<number>(0);

  const watchResourcesData = useAllWatchResources(
    { kubernetesObjects, loading, error },
    selectedCluster,
    watchedResource,
  );
  const { clusters, errors: clusterErrors } = useResourcesClusters({
    kubernetesObjects,
    loading,
    error,
  });

  return {
    watchResourcesData,
    loaded: !loading,
    responseError: error,
    selectedClusterErrors: clusterErrors?.[selectedCluster] ?? [],
    clusters,
    selectedCluster,
    setSelectedCluster,
  };
};
