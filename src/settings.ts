import joplin from "api";
import { SettingItemType } from "api/types";
import {
    CONFIG_HOST,
    CONFIG_TOKEN,
    CONFIG_FOLDER_ENABLED,
    CONFIG_TAG_PREFIX,
    CONFIG_TAG_PREFIX_REMOVE,
    CONFIG_TITLE_FILTER,
    CONFIG_VIEW,
} from "./consts";

export namespace settings {
    const SECTION = 'FeatureSettings';

    export async function register() {
        await joplin.settings.registerSection(SECTION, {
            label: "TimeTagger",
            iconName: "fas fa-hourglass-start",
        });

        let PLUGIN_SETTINGS = {};

        PLUGIN_SETTINGS[CONFIG_HOST] = {
            value: "https://your_timetagger.com",
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'Host',
            description: "TimeTagger host (require reload)",
        }

        PLUGIN_SETTINGS[CONFIG_TOKEN] = {
            value: "",
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'Token',
            description: "TimeTagger access token (require reload)",
        }

        PLUGIN_SETTINGS[CONFIG_VIEW] = {
            value: "panel",
            type: SettingItemType.String,
            section: SECTION,
            isEnum: true,
            public: true,
            label: "Panel or Toolbar",
            description: "(require reload)",
            options: {
              toolbar: "Toolbar",
              panel: "Panel",
            }
        }

        PLUGIN_SETTINGS[CONFIG_FOLDER_ENABLED] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Folder in record title',
            description: "Add folder to records title",
        }

        PLUGIN_SETTINGS[CONFIG_TAG_PREFIX] = {
            value: "tt.,tf",
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'Tag prefix',
            description: "Add all tags with this prefix to record title (separated with ,)",
        }

        PLUGIN_SETTINGS[CONFIG_TAG_PREFIX_REMOVE] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Remove prefix',
            description: "Remove prefix before pushing to timetagger",
        }

        PLUGIN_SETTINGS[CONFIG_TITLE_FILTER] = {
            value: "",
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'Title filter',
            description: "Remove regex from note title (separated with ,)",
        }

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}