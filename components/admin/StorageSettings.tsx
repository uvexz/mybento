import React from 'react';
import {
    RiDatabase2Line,
    RiKey2Line,
    RiGlobalLine,
    RiImageLine,
    RiSave3Line
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { SiteSettings } from './GeneralSettings';

interface StorageSettingsProps {
    settings: SiteSettings;
    setSettings: (settings: SiteSettings) => void;
    onSave: () => void;
    saving: boolean;
}

const StorageSettings: React.FC<StorageSettingsProps> = ({ settings, setSettings, onSave, saving }) => {
    const t = useTranslations();

    return (
        <div className="space-y-6 py-2">
            {/* Info Banner */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                    <RiDatabase2Line size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{t('admin.storageInfo')}</span>
                </p>
                <p className="text-xs text-blue-700 mt-2 ml-6">
                    Endpoint format: https://&lt;account-id&gt;.r2.cloudflarestorage.com
                </p>
            </div>

            {/* R2 Configuration Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RiDatabase2Line size={16} className="text-gray-500" />
                    Cloudflare R2 Configuration
                </h3>
                <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                        <Label htmlFor="r2Endpoint" className="text-sm font-medium text-gray-700">
                            {t('admin.r2Endpoint')}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <RiDatabase2Line />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="r2Endpoint"
                                value={settings.r2Endpoint}
                                onChange={(e) => setSettings({ ...settings, r2Endpoint: e.target.value })}
                                placeholder="https://your-account-id.r2.cloudflarestorage.com"
                            />
                        </InputGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="r2AccessKeyId" className="text-sm font-medium text-gray-700">
                                {t('admin.r2AccessKeyId')}
                            </Label>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>
                                        <RiKey2Line />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="r2AccessKeyId"
                                    value={settings.r2AccessKeyId}
                                    onChange={(e) => setSettings({ ...settings, r2AccessKeyId: e.target.value })}
                                    placeholder="Access Key ID"
                                />
                            </InputGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="r2SecretAccessKey" className="text-sm font-medium text-gray-700">
                                {t('admin.r2SecretAccessKey')}
                            </Label>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>
                                        <RiKey2Line />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="r2SecretAccessKey"
                                    type="password"
                                    value={settings.r2SecretAccessKey}
                                    onChange={(e) => setSettings({ ...settings, r2SecretAccessKey: e.target.value })}
                                    placeholder="Secret Access Key"
                                />
                            </InputGroup>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="r2BucketName" className="text-sm font-medium text-gray-700">
                                {t('admin.r2BucketName')}
                            </Label>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>
                                        <RiDatabase2Line />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="r2BucketName"
                                    value={settings.r2BucketName}
                                    onChange={(e) => setSettings({ ...settings, r2BucketName: e.target.value })}
                                    placeholder="mybento"
                                />
                            </InputGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="r2PublicUrl" className="text-sm font-medium text-gray-700">
                                {t('admin.r2PublicUrl')}
                            </Label>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>
                                        <RiGlobalLine />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="r2PublicUrl"
                                    value={settings.r2PublicUrl}
                                    onChange={(e) => setSettings({ ...settings, r2PublicUrl: e.target.value })}
                                    placeholder="https://your-public-domain.com"
                                />
                            </InputGroup>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Limits Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RiImageLine size={16} className="text-gray-500" />
                    Upload Limits
                </h3>
                <div className="pl-6">
                    <div className="space-y-2">
                        <Label htmlFor="maxUploadSize" className="text-sm font-medium text-gray-700">
                            {t('admin.maxUploadSize')}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <RiImageLine />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="maxUploadSize"
                                type="number"
                                min="1"
                                max="50"
                                value={settings.maxUploadSize}
                                onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) || 5 })}
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupText className="font-medium">MB</InputGroupText>
                            </InputGroupAddon>
                        </InputGroup>
                        <p className="text-xs text-gray-500 mt-1.5">{t('admin.maxUploadSizeDesc')}</p>
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

export default StorageSettings;
