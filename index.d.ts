interface Peer {
        
    new (host: string, port: number) : Peer;
    
    connect() : Peer;        
    disconnect() : Peer;        
    sendRequest(request: {id?: any, method: string, params: Array<any>}) : Peer;
    
    on(event: string, eventHandler: ( (eventData?: any) => void ) ) : void; 
        
}
    
interface NetworkDiscovery {
    
    new () : NetworkDiscovery;
        
    init() : NetworkDiscovery;
    getPeer(index?: number) : Peer;
    getConnectedPeer(index?: number) : Promise<Peer>;
    sendRandomRequest(request: {id?: any, method: string, params: Array<any>}) : NetworkDiscovery;
        
    on(event: string, eventHandler: ( (eventData?: any) => void ) ) : void; 
        
}
    
declare var electrum: {
    Peer: Peer;
    NetworkDiscovery: NetworkDiscovery;
};

declare module "electrum" {
    export = electrum;
}
