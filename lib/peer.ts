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
            console.log("error happend");
            peers[info.socketId].onError(info.resultCode);
        });            
        
    }, false);
}


const PEER_NETWORK_STATUS_CONNECTED: string    = 'connected';
const PEER_NETWORK_STATUS_DISCONNECTED: string = 'disconnected';

export class Peer extends EventEmitter {
    
    private socketId: number;
    private status: string = PEER_NETWORK_STATUS_DISCONNECTED;
    private partialMessage: string = "";
        
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
    
    constructor(private host: string, private port: number) {
        super();
    }
    
    connect() {
        chrome.sockets.tcp.create((createInfo) => {            
            peers[createInfo.socketId] = this;
            this.socketId = createInfo.socketId;
            
            chrome.sockets.tcp.connect(createInfo.socketId,this.host,this.port,(result) => {
                if (result === 0) {
                    this.status = PEER_NETWORK_STATUS_CONNECTED;
                    this.emit(PEER_NETWORK_STATUS_CONNECTED);
                } else {
                    this.onError(result);
                }
            });          
        });
        
        return this;
    }
    
    disconnect() {
        if (this.status === PEER_NETWORK_STATUS_CONNECTED) {
            chrome.sockets.tcp.disconnect(this.socketId, () => {
                chrome.sockets.tcp.close(this.socketId);
                this.status = PEER_NETWORK_STATUS_DISCONNECTED;
                this.emit(PEER_NETWORK_STATUS_DISCONNECTED);
            });
        }
                
        return this;
    }
    
    sendRequest(request: {id?: any, method: string, params: Array<any>}) {
        if (this.status === PEER_NETWORK_STATUS_CONNECTED) {
            let networkMessage = JSON.stringify(request) + "\n";
            let bufferedMessage = new Buffer(networkMessage);        
                            
            chrome.sockets.tcp.send(this.socketId, Util.transformToArrayBuffer(bufferedMessage), (sendInfo) => {
                this.emit('sent',sendInfo.resultCode);
            });
        }
    }
        
    onReceive(response: any) {
        this.emit('response', response);
    }
    
    onError(errorCode: number) {
        this.emit('error',errorCode);
        this.disconnect();
    }
    
}
