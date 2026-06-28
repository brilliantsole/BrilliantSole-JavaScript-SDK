import { Server } from "./Server.ts";
declare class ServerManager {
    #private;
    static readonly shared: ServerManager;
    constructor();
    get servers(): Server[];
}
declare const _default: ServerManager;
export default _default;
