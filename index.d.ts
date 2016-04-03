declare namespace electrum {
    
    export interface Peer {
        
        new (host: string, port: number) : Peer;
        
        connect() : Peer;        
        disconnect() : Peer;        
        sendRequest(request: {id?: any, method: string, params: Array<any>}) : Peer;
        
        on(event: string, eventHandler: ( (eventData?: any) => void ) ) : void; 
        
    }
    
    export interface NetworkDiscovery {
        
        init() : NetworkDiscovery;
        getPeer(index?: number) : Peer;
        sendRandomRequest(request: {id?: any, method: string, params: Array<any>}) : NetworkDiscovery;
        
        on(event: string, eventHandler: ( (eventData?: any) => void ) ) : void; 
        
    }
    
}

declare module "electrum" {
    export = electrum;
}