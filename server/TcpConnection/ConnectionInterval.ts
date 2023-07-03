import { MBConnection } from './SoftwareModules/MBConnection';

type MakeConnection = (...args: any[]) => void;
type MakeConnectionParams = Parameters<MakeConnection>;
type Context = MBConnection;

export class ConnectionInterval {

  private intervalConnect: NodeJS.Timer;
  private makeConnection: MakeConnection;
  private makeConnectionParams?: MakeConnectionParams;

  constructor(ctx: Context, makeConnection: MakeConnection, params: MakeConnectionParams = []) {
    this.makeConnection = makeConnection.bind(ctx);
    this.makeConnectionParams = params;
  }

  public launchIntervalConnect() {
    if (this.intervalConnect) return;

    this.intervalConnect = setInterval(() => {
      this.makeConnection.call(this, ...this.makeConnectionParams)
    }, 5000);
  }

  public clearReconnectionInterval() {
    if (!this.intervalConnect) return;

    clearInterval(this.intervalConnect);
    this.intervalConnect = null;
  }
}