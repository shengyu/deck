import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { API } from '@spinnaker/core';
export interface ITencentCloudSnapshot {
  diskSize: string;
  diskType: string;
  diskUsage: 'SYSTEM_DISK' | 'DATA_DISK';
  snapshotId: string;
}
export interface ITencentCloudImage {
  accounts: string[];
  imgIds: {
    [region: string]: string[];
  };
  attributes: {
    createdTime?: string;
    creationDate?: string;
    snapshotSet?: ITencentCloudSnapshot[];
    osPlatform: string;
  };
  imageName: string;
  tags: {
    [tag: string]: string;
  };
  tagsByImageId: {
    [imageId: string]: ITencentCloudImage['tags'];
  };
}

export class TencentCloudImageReader {
  public findImages(params: { q: string; region?: string }): IPromise<ITencentCloudImage[]> {
    if (!params.q || params.q.length < 3) {
      return $q.when([{ message: 'Please enter at least 3 characters...', disabled: true }]) as any;
    }

    return API.one('images/find')
      .withParams({ ...params, provider: 'tencentcloud' })
      .get()
      .catch(() => [] as ITencentCloudImage[]);
  }

  public getImage(amiName: string, region: string, credentials: string): IPromise<ITencentCloudImage> {
    return API.one('images')
      .one(credentials)
      .one(region)
      .one(amiName)
      .withParams({ provider: 'tencentcloud' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => null as ITencentCloudImage);
  }
}
