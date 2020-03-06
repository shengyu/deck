'use strict';

import { module } from 'angular';

import { Subject } from 'rxjs';

import { METRIC_SELECTOR_COMPONENT } from './metricSelector.component';
import { TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_ALARM_DIMENSIONSEDITOR_COMPONENT } from './dimensionsEditor.component';

export const TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_ALARM_ALARMCONFIGURER_COMPONENT =
  'spinnaker.tencentcloud.serverGroup.details.scalingPolicy.alarm.configurer';
export const name = TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_ALARM_ALARMCONFIGURER_COMPONENT;

module.exports = angular
  .module(TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_ALARM_ALARMCONFIGURER_COMPONENT, [
    TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_ALARM_DIMENSIONSEDITOR_COMPONENT,
    METRIC_SELECTOR_COMPONENT,
  ])
  .component('tencentCloudAlarmConfigurer', {
    bindings: {
      command: '=',
      modalViewState: '=',
      serverGroup: '<',
      boundsChanged: '&',
    },
    templateUrl: require('./alarmConfigurer.component.html'),
    controller: function() {
      this.statistics = ['AVERAGE', 'MAXIMUM', 'MINIMUM'];
      this.state = {
        units: null,
      };

      this.comparators = [
        { label: '>=', value: 'GREATER_THAN_OR_EQUAL_TO' },
        { label: '>', value: 'GREATER_THAN' },
        { label: '<=', value: 'LESS_THAN_OR_EQUAL_TO' },
        { label: '<', value: 'LESS_THAN' },
      ];

      this.periods = [
        { label: '1 minute', value: 60 },
        { label: '5 minutes', value: 60 * 5 },
        { label: '15 minutes', value: 60 * 15 },
        { label: '1 hour', value: 60 * 60 },
        { label: '4 hours', value: 60 * 60 * 4 },
        { label: '1 day', value: 60 * 60 * 24 },
      ];

      this.alarmUpdated = new Subject();

      this.thresholdChanged = () => {
        const source =
          this.modalViewState.comparatorBound === 'max' ? 'metricIntervalLowerBound' : 'metricIntervalUpperBound';
        if (this.command.step) {
          // always set the first step at the alarm threshold
          this.command.step.stepAdjustments[0][source] = this.command.alarm.threshold;
        }
        this.boundsChanged();
        this.alarmUpdated.next();
      };

      this.updateChart = () => this.alarmUpdated.next();

      this.alarmComparatorChanged = () => {
        const previousComparatorBound = this.modalViewState.comparatorBound;
        this.modalViewState.comparatorBound =
          this.command.alarm.comparisonOperator.indexOf('GREATER') === 0 ? 'max' : 'min';
        if (
          previousComparatorBound &&
          this.modalViewState.comparatorBound !== previousComparatorBound &&
          this.command.step
        ) {
          this.command.step.stepAdjustments = [{ adjustmentValue: 1 }];
          this.thresholdChanged();
        }
        this.alarmUpdated.next();
      };

      this.$onInit = () => {
        this.alarm = this.command.alarm;
        this.alarmComparatorChanged();
      };
    },
  });
