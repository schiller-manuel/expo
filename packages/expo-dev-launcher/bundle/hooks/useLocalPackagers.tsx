import * as React from 'react';

import { getLocalPackagersAsync, Packager } from '../functions/getLocalPackagersAsync';
import { sleepAsync } from '../functions/sleepAsync';
import { useIsMounted } from '../hooks/useIsMounted';
import { useUser } from '../hooks/useUser';
import * as DevLauncher from '../native-modules/DevLauncherInternal';
import { queryDevSessionsAsync } from '../native-modules/DevMenu';

type PollOptions = {
  pollAmount?: number;
  pollInterval?: number;
};

type PackagersContext = {
  packagers: Packager[];
  setPackagers: (packagers: Packager[]) => void;
};

const Context = React.createContext<PackagersContext | null>(null);

type LocalPackagersProviderProps = {
  children: React.ReactNode;
  initialPackagers?: Packager[];
};

export function LocalPackagersProvider({
  children,
  initialPackagers = [],
}: LocalPackagersProviderProps) {
  const [packagers, setPackagers] = React.useState<Packager[]>(initialPackagers);

  return <Context.Provider value={{ packagers, setPackagers }}>{children}</Context.Provider>;
}

export function useLocalPackagers() {
  const { packagers, setPackagers } = React.useContext(Context);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);

  const isMounted = useIsMounted();
  const { userData } = useUser();
  const isAuthenticated = userData != null;

  async function fetchPackagersAsync() {
    setIsFetching(true);

    let packagers = [];
    if (isAuthenticated) {
      const data = await queryDevSessionsAsync();
      packagers = JSON.parse(data).data;
    }
    if (!packagers || !packagers.length) {
      const deviceID = DevLauncher.installationID;
      const data = await queryDevSessionsAsync(deviceID);
      packagers = JSON.parse(data).data;
    }
    if ((!packagers || !packagers.length) && !DevLauncher.isDevice) {
      packagers = await getLocalPackagersAsync();
    }

    setPackagers(packagers);
    setIsFetching(false);
  }

  const pollAsync = React.useCallback(
    async ({ pollAmount = 5, pollInterval = 1000 }: PollOptions) => {
      setIsPolling(true);

      if (pollAmount > 0 && isMounted()) {
        await fetchPackagersAsync();
        await sleepAsync(pollInterval);
        pollAsync({ pollAmount: pollAmount - 1, pollInterval });
      }

      if (pollAmount === 0 && isMounted()) {
        setIsPolling(false);
      }
    },
    []
  );

  return {
    data: packagers,
    pollAsync,
    isFetching: isFetching || isPolling,
  };
}
