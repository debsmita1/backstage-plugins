import React from 'react';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { TektonResponseData } from '../../types/types';
import { useDebounceCallback } from '../../hooks/debounce';
import { useDeepCompareMemoize } from '../../hooks/useDeepCompareMemoize';

export const useTektonResourcesWatcher = (): {
  loaded: boolean;
  pipelinesData: TektonResponseData | undefined;
} => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [pipelinesData, setPipelinesData] = React.useState<
    TektonResponseData | undefined
  >();
  const tektonData = React.useContext(TektonResourcesContext);

  const updateResults = React.useCallback(
    async ({ watchResourcesData, loaded: resourcesLoaded, responseError }) => {
      if (resourcesLoaded) {
        setLoaded(true);
        if (!responseError && watchResourcesData) {
          setPipelinesData(watchResourcesData);
        }
      }
    },
    [setLoaded, setPipelinesData],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(tektonData);
  }, [debouncedUpdateResources, tektonData]);

  return useDeepCompareMemoize({ loaded, pipelinesData });
};
