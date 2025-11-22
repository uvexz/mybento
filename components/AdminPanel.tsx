'use client';

import React, { useState, useEffect } from 'react';
import { 
    RiSettings3Line, 
    RiUserSettingsLine, 
    RiSave3Line, 
    RiGlobalLine, 
    RiMailLine, 
    RiDatabase2Line, 
    RiKey2Line, 
    RiImageLine, 
    RiLinkM, 
    RiLayoutGridLine,
    RiUserLine
} from '@remixicon/react';
import { Button } from './ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './ui/input-group';
import { Label } from './ui/label';
import { useTranslations } from 'next-intl';

interface AdminStats {
    totalUsers: number;
    totalCards: number;
    totalShortLinks: number;
}

interface SiteSettings {
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

interface UserPermissions {
    canUploadImages: boolean;
    maxImages: number;
    maxShortLinks: number;
    maxCards: number;
}

const AdminPanel: React.FC = () => {
    const t = useTranslations();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [settings, setSettings] = useState<SiteSettings>({
        siteName: '',
        siteDescription: '',
        communityMode: false,
        r2Endpoint: '',
        r2AccessKeyId: '',
        r2SecretAccessKey: '',
        r2BucketName: '',
        r2PublicUrl: '',
        maxUploadSize: 5,
        resendApiKey: '',
        emailFrom: '',
    });
    const [permissions, setPermissions] = useState<UserPermissions>({
        canUploadImages: true,
        maxImages: 50,
        maxShortLinks: 100,
        maxCards: 50,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, settingsRes, permissionsRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/settings'),
                fetch('/api/admin/permissions'),
            ]);

            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
            if (settingsRes.ok) {
                setSettings(await settingsRes.json());
            }
            if (permissionsRes.ok) {
                setPermissions(await permissionsRes.json());
            }
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                alert(t('common.success'));
            } else {
                alert(t('common.error'));
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert(t('common.error'));
        } finally {
            setSaving(false);
        }
    };

    const savePermissions = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(permissions),
            });

            if (res.ok) {
                alert(t('common.success'));
            } else {
                alert(t('common.error'));
            }
        } catch (error) {
            console.error('Failed to save permissions:', error);
            alert(t('common.error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-xl border border-blue-200/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <RiUserLine size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-blue-700">{stats.totalUsers}</div>
                        </div>
                        <div className="text-sm font-medium text-blue-600">{t('admin.totalUsers')}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-xl border border-green-200/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500 rounded-lg">
                                <RiLayoutGridLine size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-green-700">{stats.totalCards}</div>
                        </div>
                        <div className="text-sm font-medium text-green-600">{t('admin.totalCards')}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 rounded-xl border border-purple-200/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500 rounded-lg">
                                <RiLinkM size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-purple-700">{stats.totalShortLinks}</div>
                        </div>
                        <div className="text-sm font-medium text-purple-600">{t('admin.totalShortLinks')}</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 font-medium text-sm ${
                            activeTab === 'general'
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <RiSettings3Line size={18} />
                        {t('admin.generalSettings')}
                    </button>
                    <button
                        onClick={() => setActiveTab('storage')}
                        className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 font-medium text-sm ${
                            activeTab === 'storage'
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <RiDatabase2Line size={18} />
                        {t('admin.storageSettings')}
                    </button>
                    <button
                        onClick={() => setActiveTab('permissions')}
                        className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 font-medium text-sm ${
                            activeTab === 'permissions'
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <RiUserSettingsLine size={18} />
                        {t('admin.userPermissions')}
                    </button>
                </div>
            </div>

            {/* General Settings Tab */}
            {activeTab === 'general' && (
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
                        <Button onClick={saveSettings} disabled={saving} className="w-full">
                            <RiSave3Line size={18} className="mr-2" />
                            {saving ? t('common.loading') : t('common.save')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Storage Settings Tab */}
            {activeTab === 'storage' && (
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
                        <Button onClick={saveSettings} disabled={saving} className="w-full">
                            <RiSave3Line size={18} className="mr-2" />
                            {saving ? t('common.loading') : t('common.save')}
                        </Button>
                    </div>
                </div>
            )}

            {/* User Permissions Tab */}
            {activeTab === 'permissions' && (
                <div className="space-y-6 py-2">
                    {/* Info Banner */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-4 rounded-xl border border-yellow-200/50">
                        <p className="text-sm text-yellow-800 flex items-start gap-2">
                            <RiUserSettingsLine size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{t('admin.permissionsInfo')}</span>
                        </p>
                    </div>

                    {/* Upload Permissions Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <RiImageLine size={16} className="text-gray-500" />
                            Image Upload Permissions
                        </h3>
                        <div className="space-y-4 pl-6">
                            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="canUploadImages"
                                    checked={permissions.canUploadImages}
                                    onChange={(e) => setPermissions({ ...permissions, canUploadImages: e.target.checked })}
                                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                                />
                                <div className="flex-1">
                                    <Label htmlFor="canUploadImages" className="cursor-pointer font-medium text-gray-900">
                                        {t('admin.canUploadImages')}
                                    </Label>
                                    <p className="text-sm text-gray-600 mt-1">{t('admin.canUploadImagesDesc')}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxImages" className="text-sm font-medium text-gray-700">
                                    {t('admin.maxImages')}
                                </Label>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <InputGroupText>
                                            <RiImageLine />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="maxImages"
                                        type="number"
                                        min="0"
                                        value={permissions.maxImages}
                                        onChange={(e) => setPermissions({ ...permissions, maxImages: parseInt(e.target.value) || 0 })}
                                    />
                                </InputGroup>
                                <p className="text-xs text-gray-500 mt-1.5">{t('admin.maxImagesDesc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Limits Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <RiLayoutGridLine size={16} className="text-gray-500" />
                            Content Limits
                        </h3>
                        <div className="space-y-4 pl-6">
                            <div className="space-y-2">
                                <Label htmlFor="maxCards" className="text-sm font-medium text-gray-700">
                                    {t('admin.maxCards')}
                                </Label>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <InputGroupText>
                                            <RiLayoutGridLine />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="maxCards"
                                        type="number"
                                        min="1"
                                        value={permissions.maxCards}
                                        onChange={(e) => setPermissions({ ...permissions, maxCards: parseInt(e.target.value) || 1 })}
                                    />
                                </InputGroup>
                                <p className="text-xs text-gray-500 mt-1.5">{t('admin.maxCardsDesc')}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxShortLinks" className="text-sm font-medium text-gray-700">
                                    {t('admin.maxShortLinks')}
                                </Label>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <InputGroupText>
                                            <RiLinkM />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="maxShortLinks"
                                        type="number"
                                        min="0"
                                        value={permissions.maxShortLinks}
                                        onChange={(e) => setPermissions({ ...permissions, maxShortLinks: parseInt(e.target.value) || 0 })}
                                    />
                                </InputGroup>
                                <p className="text-xs text-gray-500 mt-1.5">{t('admin.maxShortLinksDesc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-gray-200">
                        <Button onClick={savePermissions} disabled={saving} className="w-full">
                            <RiSave3Line size={18} className="mr-2" />
                            {saving ? t('common.loading') : t('common.save')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
