/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import type { LicenseType } from '@kbn/licensing-plugin/common/types';
import { DEFAULT_APP_CATEGORIES } from '@kbn/core/server';
import type {
  LicensingPluginSetup,
  LicensingApiRequestHandlerContext,
} from '@kbn/licensing-plugin/server';

import { APM_INDEX_SETTINGS_SAVED_OBJECT_TYPE } from '@kbn/apm-sources-access-plugin/server/saved_objects/apm_indices';
import { ApmRuleType, DEPRECATED_ALERTING_CONSUMERS } from '@kbn/rule-data-utils';
import { ALERTING_FEATURE_ID } from '@kbn/alerting-plugin/common';
import type { KibanaFeatureConfig } from '@kbn/features-plugin/common';
import { KibanaFeatureScope } from '@kbn/features-plugin/common';
import { APM_SERVER_FEATURE_ID } from '../common/rules/apm_rule_types';

const alertingFeatures = Object.values(ApmRuleType).map((ruleTypeId) => ({
  ruleTypeId,
  consumers: [APM_SERVER_FEATURE_ID, ALERTING_FEATURE_ID, ...DEPRECATED_ALERTING_CONSUMERS],
}));

export const APM_FEATURE: KibanaFeatureConfig = {
  id: APM_SERVER_FEATURE_ID,
  name: i18n.translate('xpack.apm.featureRegistry.apmFeatureName', {
    defaultMessage: 'APM and User Experience',
  }),
  order: 900,
  category: DEFAULT_APP_CATEGORIES.observability,
  scope: [KibanaFeatureScope.Spaces, KibanaFeatureScope.Security],
  app: [APM_SERVER_FEATURE_ID, 'ux', 'kibana'],
  catalogue: [APM_SERVER_FEATURE_ID],
  management: {
    insightsAndAlerting: ['triggersActions'],
  },
  alerting: alertingFeatures,
  // see x-pack/platform/plugins/shared/features/common/feature_kibana_privileges.ts
  privileges: {
    all: {
      app: [APM_SERVER_FEATURE_ID, 'ux', 'kibana'],
      api: [APM_SERVER_FEATURE_ID, 'apm_write', 'rac'],
      catalogue: [APM_SERVER_FEATURE_ID],
      savedObject: {
        all: [],
        read: [APM_INDEX_SETTINGS_SAVED_OBJECT_TYPE],
      },
      alerting: {
        alert: {
          all: alertingFeatures,
        },
        rule: {
          all: alertingFeatures,
        },
      },
      management: {
        insightsAndAlerting: ['triggersActions'],
      },
      ui: ['show', 'save', 'alerting:show', 'alerting:save'],
    },
    read: {
      app: [APM_SERVER_FEATURE_ID, 'ux', 'kibana'],
      api: [APM_SERVER_FEATURE_ID, 'rac'],
      catalogue: [APM_SERVER_FEATURE_ID],
      savedObject: {
        all: [],
        read: [APM_INDEX_SETTINGS_SAVED_OBJECT_TYPE],
      },
      alerting: {
        alert: {
          read: alertingFeatures,
        },
        rule: {
          read: alertingFeatures,
        },
      },
      management: {
        insightsAndAlerting: ['triggersActions'],
      },
      ui: ['show', 'alerting:show'],
    },
  },
  subFeatures: [
    {
      name: i18n.translate('xpack.apm.subFeatureRegistry.settings', {
        defaultMessage: 'Settings',
      }),
      privilegeGroups: [
        {
          groupType: 'independent',
          privileges: [
            {
              id: 'settings_save',
              name: i18n.translate('xpack.apm.subFeatureRegistry.modifySettings', {
                defaultMessage: 'Ability to modify settings',
              }),
              includeIn: 'all',
              savedObject: {
                all: [],
                read: [],
              },
              api: ['apm_settings_write'],
              ui: ['settings:save'],
            },
          ],
        },
      ],
    },
  ],
};

interface Feature {
  name: string;
  license: LicenseType;
}
type FeatureName = 'serviceMaps' | 'ml' | 'customLinks';
export const features: Record<FeatureName, Feature> = {
  serviceMaps: {
    name: 'APM service maps',
    license: 'platinum',
  },
  ml: {
    name: 'APM machine learning',
    license: 'platinum',
  },
  customLinks: {
    name: 'APM custom links',
    license: 'gold',
  },
};

export function registerFeaturesUsage({
  licensingPlugin,
}: {
  licensingPlugin: LicensingPluginSetup;
}) {
  Object.values(features).forEach(({ name, license }) => {
    licensingPlugin.featureUsage.register(name, license);
  });
}

export function notifyFeatureUsage({
  licensingPlugin,
  featureName,
}: {
  licensingPlugin: LicensingApiRequestHandlerContext;
  featureName: FeatureName;
}) {
  const feature = features[featureName];
  licensingPlugin.featureUsage.notifyUsage(feature.name);
}
