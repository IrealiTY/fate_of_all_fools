describe('weaponDataRefresher.js', function() {

  const postal = require('postal');
  const fateBus = require('fateBus.js');

  describe('in response to "fate.weaponDataStale"', function() {

    it('should reach out for weapon data from our configured location', function() {
      spyOn(window, 'GM_xmlhttpRequest');
      spyOn(GM_config, 'get').and.returnValue('TEST_WEAPON_DATA_URL');
      postal.publish({topic:'fate.weaponDataStale'});
      expect(window.GM_xmlhttpRequest).toHaveBeenCalledWith(jasmine.objectContaining({
        method: 'GET',
        url: 'TEST_WEAPON_DATA_URL'
      }));
    });

    describe('when the data has changed', function() {
      it('should update weapon data and remove the header row', function() {
        spyOn(window, 'GM_xmlhttpRequest').and.callFake(function(details) {
          details.onload.call(this, {responseText: `TEST_LINE_1
TEST_LINE_2`});
        });
        spyOn(fateBus, 'publish');
        postal.publish({topic:'fate.weaponDataStale'});
        expect(fateBus.publish).toHaveBeenCalledWith(
          jasmine.any(Object),
          jasmine.objectContaining({
            topic:'fate.weaponDataFetched',
            data:'TEST_LINE_2'
          })
        );
      });
    });

    describe('when the data has not changed', function() {
      it('should not broadcast an update', function() {
        spyOn(window, 'GM_xmlhttpRequest').and.callFake(function(details) {
          details.onload.call(this, {responseText: '_'});
        });
        spyOn(fateBus, 'publish');
        postal.publish({topic:'fate.weaponDataStale'});
        postal.publish({topic:'fate.weaponDataStale'});
        const weaponBroadcasts = fateBus.publish.calls.allArgs().filter(function(callArguments) {
          return callArguments[1].topic === 'fate.weaponDataFetched';
        });
        expect(weaponBroadcasts.length).toBe(1);
      });
    });
  });

  describe('in response to "fate.init"', function() {
    it('should reach out for weapon data from our configured location', function() {
      spyOn(window, 'GM_xmlhttpRequest');
      spyOn(GM_config, 'get').and.returnValue('TEST_WEAPON_DATA_URL');
      postal.publish({topic:'fate.init'});
      expect(window.GM_xmlhttpRequest).toHaveBeenCalledWith(jasmine.objectContaining({
        method: 'GET',
        url: 'TEST_WEAPON_DATA_URL'
      }));
    });
  });

});