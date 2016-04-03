export interface NetworkPeer {
    host: string;
    ports: {t: number, s?: number, h?: number, g?: number};
    pruningLevel?: string;
    version?: string;
    hiddenService?:boolean; // onion domain
};