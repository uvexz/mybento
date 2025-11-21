'use client';

import { useState, useRef } from 'react';
import { RiDownloadLine, RiUploadLine, RiLoader4Line } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ExportImportButtons() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('/api/export');
            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mybento-export-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            const response = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Import failed');

            const result = await response.json();
            alert(`Successfully imported ${result.imported} cards!`);
            router.refresh();
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import data. Please check the file format.');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
            >
                {isExporting ? (
                    <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <RiDownloadLine className="w-4 h-4 mr-2" />
                )}
                Export
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
            >
                {isImporting ? (
                    <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <RiUploadLine className="w-4 h-4 mr-2" />
                )}
                Import
            </Button>

            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
            />
        </div>
    );
}
