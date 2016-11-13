import {NetworkPeer} from './network-peer';

// t=tcp, s:ssl, h:http, g:https
export const DEFAULT_PORTS = {'t': 50001, 's': 50002, 'h': 8081, 'g': 8082};

export class Util {
    
    static parsePeers(result: Array<any>, removeOnion: boolean = true) : Array<NetworkPeer> {
        let output = [];
        
        for (let peer of result) {           
            if (removeOnion && peer[1].search(/\.onion/) > 0) { // ignore onion peers
                continue;
            }
            
            let networkPeer = {
                host : peer[1] ,
                version : peer[2][0] ,
                pruningLevel : peer[2][1] ,
                ports : {}
            }
            
            let ports = {};
            for (let i = 2; i < peer[2].length; i++) {
                let type: string = peer[2][i].charAt(0);
                ports[type] = peer[2][i].length > 1 ? parseInt(peer[2][i].substr(1)) : DEFAULT_PORTS[type];
            }
            networkPeer.ports = ports;
            
            output.push(networkPeer);
        }
        
        return output;         
    }
    
    static isValidJSON(input: string) {
        try {
            JSON.parse(input);
        } catch (e) {
            return false;
        }
        
        return true;
    }
    
    static transformToArrayBuffer(buffer: Buffer) : ArrayBuffer {
        let output = new Uint8Array(buffer.length);
        
        for (let i = 0; i < output.length; i++) {
            output[i] = buffer[i];
        }
        
        return output.buffer;
    }
    
}