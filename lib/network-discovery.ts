import {Peer} from './peer';
import {EventEmitter} from 'events';
import {NetworkPeer} from './network-peer'
import {Util} from './util';

// https://github.com/spesmilo/electrum/blob/master/lib/network.py#L47
// default server to bootstrap to electrum nodes
const DEFAULT_SERVERS: Array<NetworkPeer> = [    
    {
        host: 'erbium1.sytes.net',
        ports: {'t': 50001, 's': 50002}
    } ,
    {
        host: 'ecdsa.net',
        ports: {'t': 50001, 's': 110}
    } ,
    {
        host : 'electrum0.electricnewyear.net',
        ports: {'t':50001, 's':50002}
    } ,
    {
        host : 'elec.luggs.co' ,
        ports: {'t':80, 's':443}   
    } ,
    {
        host : 'electrum.online' ,
        ports : {'t':50001, 's':50002}
    }    
];
        
    /*

    'VPS.hsmiths.com':{'t':'50001', 's':'50002'},
    'ELECTRUM.jdubya.info':{'t':'50001', 's':'50002'},
    'electrum.no-ip.org':{'t':'50001', 's':'50002', 'g':'443'},
    'us.electrum.be':DEFAULT_PORTS,
    'bitcoins.sk':{'t':'50001', 's':'50002'},
    'electrum.petrkr.net':{'t':'50001', 's':'50002'},
    'electrum.dragonzone.net':DEFAULT_PORTS,
    'Electrum.hsmiths.com':{'t':'8080', 's':'995'},
    'electrum3.hachre.de':{'t':'50001', 's':'50002'},
    'btc.smsys.me':{'t':'110', 's':'995'},
    */

export class NetworkDiscovery extends EventEmitter {
    
    private activePeers: Array<NetworkPeer> = [];
    private ready: boolean = false;
    
    getActivePeers() : Array<any> {
        return this.activePeers;
    }
        
    constructor() {
        super();       
    }
    
    retrievePeers(peerServer: string, port: number) : Promise<any> {       
        let peer = new Peer(peerServer, port);
        peer.connect();
        
        return new Promise<any>((resolve, reject) => {               
            peer.on('connected', () => {
                peer.sendRequest({
                    id: 1 ,
                    method: 'server.peers.subscribe' ,
                    params: []
                });
                
                peer.on('response', (response) => {
                    resolve(response);
                    peer.disconnect();
                });
            });
        
            peer.on('error',() => {
                reject();
            });            
        });              
    }
    
    discoverPeers(serverIndex: number = 0) : NetworkDiscovery {        
        this.retrievePeers(DEFAULT_SERVERS[serverIndex].host, DEFAULT_SERVERS[serverIndex].ports.t)
            .then((response) => {
                this.activePeers = Util.parsePeers(response.result);
                this.ready = true;
                this.emit('peers:discovered',this.activePeers);
            })
            .catch(() => {
                if (serverIndex < DEFAULT_SERVERS.length) {
                    this.emit('peers:inactive',DEFAULT_SERVERS[serverIndex]);
                    this.discoverPeers(serverIndex++);                    
                } else {
                    this.emit('peers:error'); // no active default peer
                }
            });         
            
        return this;
    }
    
    init() : NetworkDiscovery {
        return this.discoverPeers();
    }
    
    /**
     * If index is < 0 a random peer is selected
     */
    getPeer(index: number = -1) : Peer {
        if (index < 0 || index >= this.activePeers.length) {
            index = Math.round(Math.random()*this.activePeers.length);
        }                
        return new Peer(this.activePeers[index].host,this.activePeers[index].ports.t);
    }
        
    sendRandomRequest(request: {id?: any, method: string, params: Array<any>}) : NetworkDiscovery {
        let peer = this.getPeer();
        peer.connect();
        
        peer.on('connected', () => {
            peer.sendRequest(request);
            peer.once('response', (response) => {
                this.emit('peers:response', response);                
                peer.disconnect();
            });                    
        });
        
        peer.on('error', () => {
            this.sendRandomRequest(request); 
        });        
        
        return this;
    }
                
}