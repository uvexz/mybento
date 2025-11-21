import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingControlsProps {
    onAddCard: () => void;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({ onAddCard }) => {
    return (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center z-50 pointer-events-none">
            <div className="pointer-events-auto">
                {/* Floating Plus Button */}
                <button
                    onClick={onAddCard}
                    className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 hover:scale-105 transition-transform text-gray-800 group"
                    title="Add New Card"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default FloatingControls;
