/// <reference path="./chrome-sockets-tcp.d.ts" />

import {EventEmitter} from 'events';
import {Buffer} from 'buffer';
import {Util} from './util';

let peers: any = {};

if (typeof document === 'object') {
    document.addEventListener("deviceready", () => {
        chrome.sockets.tcp.onReceive.addListener((info) => {              
            let buffer = new Buffer( new Uint8Array(info.data));   
            
            if (peers[info.socketId] !== undefined) {          
                if (Util.isValidJSON(buffer.toString())) {
                    peers[info.socketId].onReceive(JSON.parse(buffer.toString()));
                    peers[info.socketId].emptyPartialMessage();
                } else if (peers[info.socketId].hasPartialMessage()) {
                    peers[info.socketId].addPartialMessage(buffer.toString().trim());            
                    if (Util.isValidJSON(peers[info.socketId].getPartialMessage())) {
                        peers[info.socketId].onReceive(JSON.parse(peers[info.socketId].getPartialMessage()));
                        peers[info.socketId].emptyPartialMessage();
                    }           
                } else {
                    peers[info.socketId].addPartialMessage(buffer.toString().trim());
                }            
            }
        });
        
        chrome.sockets.tcp.onReceiveError.addListener((info) => {
            if (peers[info.socketId] instanceof Peer) {
                peers[info.socketId].onError(info.resultCode);
            } else {
                chrome.sockets.tcp.close(info.socketId);
            }
            
        });            
        
    }, false);
}

const PEER_NETWORK_OPERATION_TIMEOUT_CODE: number = -8000;
const PEER_NETWORK_OPERATION_TIMEOUT: number      = 4500; 
const PEER_NETWORK_STATUS_CONNECTED: string       = 'connected';
const PEER_NETWORK_STATUS_DISCONNECTED: string    = 'disconnected';

export class Peer extends EventEmitter {
    
    private socketId: number;
    private status: string = PEER_NETWORK_STATUS_DISCONNECTED;
    private partialMessage: string = "";
    private timeoutOccured: boolean = false; // a timeout occured within a network operation

    getNetworkStatus() : string {
        return this.status;
    }
    
    getPartialMessage() : string {
        return this.partialMessage;
    }
    
    addPartialMessage(partialMessage: string) : string {
        this.partialMessage += partialMessage;
        return this.partialMessage;
    }
    
    emptyPartialMessage() : void {
        this.partialMessage = "";
    }
    
    hasPartialMessage() : boolean {
        return this.partialMessage.length > 0 ? true : false;
    }
    
    /**
     * host: hostname
     * port
     * secure, tells wether ssl or not
     */
    constructor(private host: string, private port: number, private secure: boolean = false) {
        super();
    }

    setTimeoutListener() : any {
        return setTimeout(() => {
            this.timeoutOccured = true;
            this.onError(PEER_NETWORK_OPERATION_TIMEOUT_CODE);
            console.error("timeout occured",this.host, this.port, this.secure);
        }, PEER_NETWORK_OPERATION_TIMEOUT);
    }

    clearTimeoutListener(timeoutId: any) {
        clearTimeout(timeoutId);
        this.timeoutOccured = false;
    }

    connected(timeoutId) : void {
        this.status = PEER_NETWORK_STATUS_CONNECTED;

        // if timeout occured, however after the timeout, for whatever reason a connection was established, disconnect!
        if (this.timeoutOccured) {
            this.disconnect();
        } else {
            this.emit(PEER_NETWORK_STATUS_CONNECTED);
            this.clearTimeoutListener(timeoutId);
        }    
    }
    
    connect() : Peer {
        chrome.sockets.tcp.create((createInfo) => {
            let timeoutId = this.setTimeoutListener();

            peers[createInfo.socketId] = this;
            this.socketId = createInfo.socketId;

            if (this.secure) { // TODO: there is a problem with self-signed certificates
                chrome.sockets.tcp.setPaused(createInfo.socketId, true, () => {
                    chrome.sockets.tcp.connect(createInfo.socketId,this.host,this.port,(result) => {
                        if (result === 0) { 
                            chrome.sockets.tcp.secure(createInfo.socketId, {tlsVersion: {min: 'ssl3', max: 'tls1.2'}}, (result) => {
                                if (result === 0) {
                                    this.connected(timeoutId);
                                } else {
                                    this.onError(result);
                                }
                            });                                      
                        } else {
                            this.onError(result);
                        }
                    });
                });
            } else {
                chrome.sockets.tcp.connect(createInfo.socketId,this.host,this.port,(result) => {
                    if (result === 0) {
                        this.connected(timeoutId);
                    } else {
                        this.onError(result);
                    }
                });
            }
        });
        
        return this;
    }
    
    disconnect() : Peer {
        if (this.status === PEER_NETWORK_STATUS_CONNECTED) {
            chrome.sockets.tcp.disconnect(this.socketId, () => {
                chrome.sockets.tcp.close(this.socketId);
                this.status = PEER_NETWORK_STATUS_DISCONNECTED;
                this.emit(PEER_NETWORK_STATUS_DISCONNECTED);
            });
        } else {
            chrome.sockets.tcp.close(this.socketId);
        }
                
        return this;
    }
    
    sendRequest(request: {id?: any, method: string, params: Array<any>}) : Peer {
        let timeoutId = this.setTimeoutListener();

        if (this.status === PEER_NETWORK_STATUS_CONNECTED) {
            let networkMessage = JSON.stringify(request) + "\n";
            let bufferedMessage = new Buffer(networkMessage);        
                            
            chrome.sockets.tcp.send(this.socketId, Util.transformToArrayBuffer(bufferedMessage), (sendInfo) => {
                this.clearTimeoutListener(timeoutId);
                this.emit('sent',sendInfo.resultCode);
            });
        }
        
        return this;
    }
        
    onReceive(response: any) {
        this.emit('response', response);
    }
    
    onError(errorCode: number) {
        this.emit('error',errorCode);
        this.disconnect();
    }
    
}
