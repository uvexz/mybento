'use client';

import React, { useState, useEffect } from 'react';
import {
    RiSettings3Line,
    RiUserSettingsLine,
    RiDatabase2Line,
    RiUserLine,
    RiLayoutGridLine,
    RiLinkM,
    RiBarChartBoxLine
} from '@remixicon/react';
import { useTranslations } from 'next-intl';
import GeneralSettings, { SiteSettings } from './admin/GeneralSettings';
import StorageSettings from './admin/StorageSettings';
import PermissionsSettings, { UserPermissions } from './admin/PermissionsSettings';
import AnalyticsDashboard from './admin/AnalyticsDashboard';

interface AdminStats {
    totalUsers: number;
    totalCards: number;
    totalShortLinks: number;
}

const AdminPanel: React.FC = () => {
    const t = useTranslations();
    const [activeTab, setActiveTab] = useState('analytics');
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
        maxPages: 3,
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
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 font-medium text-sm ${activeTab === 'analytics'
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <RiBarChartBoxLine size={18} />
                        {t('stats.title')}
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 font-medium text-sm ${activeTab === 'general'
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <RiSettings3Line size={18} />
                        {t('admin.generalSettings')}
                    </button>
                    <button
                        onClick={() => setActiveTab('storage')}
                        className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 font-medium text-sm ${activeTab === 'storage'
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <RiDatabase2Line size={18} />
                        {t('admin.storageSettings')}
                    </button>
                    <button
                        onClick={() => setActiveTab('permissions')}
                        className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 font-medium text-sm ${activeTab === 'permissions'
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <RiUserSettingsLine size={18} />
                        {t('admin.userPermissions')}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'analytics' && <AnalyticsDashboard />}

            {activeTab === 'general' && (
                <GeneralSettings
                    settings={settings}
                    setSettings={setSettings}
                    onSave={saveSettings}
                    saving={saving}
                />
            )}

            {activeTab === 'storage' && (
                <StorageSettings
                    settings={settings}
                    setSettings={setSettings}
                    onSave={saveSettings}
                    saving={saving}
                />
            )}

            {activeTab === 'permissions' && (
                <PermissionsSettings
                    permissions={permissions}
                    setPermissions={setPermissions}
                    onSave={savePermissions}
                    saving={saving}
                />
            )}
        </div>
    );
};

export default AdminPanel;
