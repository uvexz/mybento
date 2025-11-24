import React from 'react';
import {
    RiGlobalLine,
    RiMailLine,
    RiKey2Line,
    RiUserLine,
    RiSave3Line
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

export interface SiteSettings {
    siteName: string;
    siteDescription: string;
    communityMode: boolean;
    r2Endpoint: string;
    r2AccessKeyId: string;
    r2SecretAccessKey: string;
    r2BucketName: string;
    r2PublicUrl: string;
    maxUploadSize: number;
    resendApiKey: string;
    emailFrom: string;
}

interface GeneralSettingsProps {
    settings: SiteSettings;
    setSettings: (settings: SiteSettings) => void;
    onSave: () => void;
    saving: boolean;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, setSettings, onSave, saving }) => {
    const t = useTranslations();

    return (
        <div className="space-y-6 py-2">
            {/* Site Information Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RiGlobalLine size={16} className="text-gray-500" />
                    Site Information
                </h3>
                <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                        <Label htmlFor="siteName" className="text-sm font-medium text-gray-700">
                            {t('admin.siteName')}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <RiGlobalLine />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="siteName"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                placeholder="mybento"
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="siteDescription" className="text-sm font-medium text-gray-700">
                            {t('admin.siteDescription')}
                        </Label>
                        <textarea
                            id="siteDescription"
                            value={settings.siteDescription}
                            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            rows={3}
                            placeholder={t('admin.siteDescriptionPlaceholder')}
                        />
                    </div>
                </div>
            </div>

            {/* Community Mode Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RiUserLine size={16} className="text-gray-500" />
                    Registration Settings
                </h3>
                <div className="pl-6">
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                        <input
                            type="checkbox"
                            id="communityMode"
                            checked={settings.communityMode}
                            onChange={(e) => setSettings({ ...settings, communityMode: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <div className="flex-1">
                            <Label htmlFor="communityMode" className="cursor-pointer font-medium text-gray-900">
                                {t('admin.communityMode')}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{t('admin.communityModeDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Settings Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RiMailLine size={16} className="text-gray-500" />
                    {t('admin.emailSettings')}
                </h3>
                <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                        <Label htmlFor="resendApiKey" className="text-sm font-medium text-gray-700">
                            {t('admin.resendApiKey')}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <RiKey2Line />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="resendApiKey"
                                type="password"
                                value={settings.resendApiKey}
                                onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                                placeholder="re_..."
                            />
                        </InputGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emailFrom" className="text-sm font-medium text-gray-700">
                            {t('admin.emailFrom')}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <RiMailLine />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="emailFrom"
                                type="email"
                                value={settings.emailFrom}
                                onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                                placeholder="noreply@yourdomain.com"
                            />
                        </InputGroup>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
                <Button onClick={onSave} disabled={saving} className="w-full">
                    <RiSave3Line size={18} className="mr-2" />
                    {saving ? t('common.loading') : t('common.save')}
                </Button>
            </div>
        </div>
    );
};

export default GeneralSettings;
