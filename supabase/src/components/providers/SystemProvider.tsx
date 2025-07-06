import { CircularProgress } from "@mui/material";
import React, {
  Suspense,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { NavigationPanelContextProvider } from "../navigation/NavigationPanelContext";
import { AuthProvider } from "@/contexts/auth";

const SupabaseContext = createContext<any>(null);
const PowerSyncContext = createContext<any>(null);

export const useSupabase = () => useContext(SupabaseContext);
export const usePowerSync = () => useContext(PowerSyncContext);

export const SystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [connector, setConnector] = useState<any>(null);
  const [powerSync, setPowerSync] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initializePowerSync = async () => {
      try {
        // Dynamic imports to avoid SSR issues
        const { configureFts } = await import("@/utils/fts_setup");
        const { AppSchema } = await import("@/library/powersync/AppSchema");
        const { SupabaseConnector } = await import(
          "@/library/powersync/SupabaseConnector"
        );
        const { PowerSyncDatabase, createBaseLogger, LogLevel } = await import(
          "@powersync/web"
        );

        const newConnector = new SupabaseConnector();
        const newPowerSync = new PowerSyncDatabase({
          schema: AppSchema,
          database: {
            dbFilename: "example.db",
          },
        });

        const logger = createBaseLogger();
        logger.useDefaults(); // eslint-disable-line
        logger.setLevel(LogLevel.DEBUG);
        // For console testing purposes
        (window as any)._powersync = newPowerSync;

        await newPowerSync.init();
        const l = newConnector.registerListener({
          initialized: () => {},
          sessionStarted: () => {
            newPowerSync.connect(newConnector);
          },
        });

        await newConnector.init();

        // Demo using SQLite Full-Text Search with PowerSync.
        // See https://docs.powersync.com/usage-examples/full-text-search for more details
        await configureFts(newPowerSync);

        setConnector(newConnector);
        setPowerSync(newPowerSync);
        setIsLoading(false);

        return () => l?.();
      } catch (error) {
        console.error("Failed to initialize PowerSync:", error);
        setIsLoading(false);
      }
    };

    initializePowerSync();
  }, [isClient]);

  if (!isClient || isLoading) {
    return <CircularProgress />;
  }

  return (
    <Suspense fallback={<CircularProgress />}>
      <PowerSyncContext.Provider value={powerSync}>
        <SupabaseContext.Provider value={connector}>
          <AuthProvider>
            <NavigationPanelContextProvider>
              {children}
            </NavigationPanelContextProvider>
          </AuthProvider>
        </SupabaseContext.Provider>
      </PowerSyncContext.Provider>
    </Suspense>
  );
};

export default SystemProvider;
