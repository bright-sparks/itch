
import os from "./os";

// TODO: better typing?
import {IStartTaskOpts} from "../types";
import {ICheckResult, INeed} from "./sandbox/types";

export interface IWithinData {
  /** absolute path to temporary .app bundle used for sandboxing */
  fakeApp: string;
}

export interface IWithinCallback {
  (data: IWithinData): void;
}

export interface IInstallResult {
  errors: Error[];
}

export interface ISandbox {
  check(): Promise<ICheckResult>;
  install(opts: IStartTaskOpts, needs: INeed[]): Promise<IInstallResult>;
  within(opts: IStartTaskOpts, cb: IWithinCallback): void;
}

export default require(`./sandbox/${os.platform()}`) as ISandbox;
