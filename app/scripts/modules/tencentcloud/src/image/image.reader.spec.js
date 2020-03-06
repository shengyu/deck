'use strict';

import { API } from '@spinnaker/core';

import { TencentCloudImageReader } from './image.reader';

describe('Service: Tencent Cloud Image Reader', function() {
  let service, $http, scope;

  beforeEach(
    window.inject(function($httpBackend, $rootScope) {
      service = new TencentCloudImageReader();
      $http = $httpBackend;
      scope = $rootScope.$new();
    }),
  );

  afterEach(function() {
    $http.verifyNoOutstandingRequest();
    $http.verifyNoOutstandingExpectation();
  });

  describe('findImages', function() {
    let query = 'abc',
      region = 'ap-guangzhou';

    function buildQueryString() {
      return API.baseUrl + '/images/find?provider=tencentcloud&q=' + query + '&region=' + region;
    }

    it('queries gate when 3 characters are supplied', function() {
      let result = null;

      $http.when('GET', buildQueryString()).respond(200, [{ success: true }]);

      service.findImages({ provider: 'tencentcloud', q: query, region: region }).then(function(results) {
        result = results;
      });

      $http.flush();

      expect(result.length).toBe(1);
      expect(result[0].success).toBe(true);
    });

    it('queries gate when more than 3 characters are supplied', function() {
      let result = null;

      query = 'abcd';

      $http.when('GET', buildQueryString()).respond(200, [{ success: true }]);

      let promise = service.findImages({ provider: 'tencentcloud', q: query, region: region });

      promise.then(function(results) {
        result = results;
      });

      $http.flush();

      expect(result.length).toBe(1);
      expect(result[0].success).toBe(true);
    });

    it('returns a message prompting user to enter more characters when less than 3 are supplied', function() {
      query = 'ab';

      let result = null;

      service.findImages({ provider: 'tencentcloud', q: query, region: region }).then(function(results) {
        result = results;
      });

      scope.$digest();

      expect(result.length).toBe(1);
      expect(result[0].message).toBe('Please enter at least 3 characters...');
    });

    it('returns an empty array when server errors', function() {
      query = 'abc';
      let result = null;

      $http.when('GET', buildQueryString()).respond(404, {});

      service.findImages({ provider: 'tencentcloud', q: query, region: region }).then(function(results) {
        result = results;
      });

      $http.flush();

      expect(result.length).toBe(0);
    });
  });

  describe('getImage', function() {
    let imageName = 'abc',
      region = 'us-west-1',
      credentials = 'test';

    function buildQueryString() {
      return [API.baseUrl, 'images', credentials, region, imageName].join('/') + '?provider=tencentcloud';
    }

    it('returns null if server returns 404 or an empty list', function() {
      let result = 'not null';

      $http.when('GET', buildQueryString()).respond(404, {});

      service.getImage(imageName, region, credentials).then(function(results) {
        result = results;
      });

      $http.flush();

      expect(result).toBe(null);

      result = 'not null';

      $http.when('GET', buildQueryString()).respond(200, []);

      service.getImage(imageName, region, credentials).then(function(results) {
        result = results;
      });

      $http.flush();

      expect(result).toBe(null);
    });
  });
});
