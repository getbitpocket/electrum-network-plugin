var exports = {};

describe('testing util functions', function() {

    var electrum = exports;
            
    var demoPeers = [
        ["fdkhv2bb7hqel2e7.onion", "fdkhv2bb7hqel2e7.onion", ["v1.0", "p10000", "t", "s"]] ,
        ["91.121.108.61", "electrum.xiro.co", ["v0.9", "p10000", "t", "s"]] ,
        ["188.122.91.11", "elec.luggs.co", ["v1.0", "p10000", "t80", "h81", "s443", "g"]]
    ];
                        
    it('should be valid/invalid json', function() {
        expect(electrum.Util.isValidJSON('{"hello":"world"}')).toBe(true);
        expect(electrum.Util.isValidJSON('[{"hello":"world"},{"hello2":')).toBe(false);        
    });
    
    it('should parse peers without onion domains', function() {
        var output = electrum.Util.parsePeers(demoPeers);
        
        expect(output.length).toBe(2);
        
        // general data
        expect(output[1].host).toEqual("elec.luggs.co");
        expect(output[1].version).toEqual("v1.0");  
        expect(output[1].pruningLevel).toEqual("p10000");    
        
        // ports  
        expect(output[1].ports.t).toBe(80);
        expect(output[1].ports.s).toBe(443);
        expect(output[1].ports.h).toBe(81);
        expect(output[1].ports.g).toBe(8082);        
    });
            
});