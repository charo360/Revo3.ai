import React, { FC } from 'react';

interface ModuleProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

export const Module: FC<ModuleProps> = ({ icon, title, children }) => (
    <div className="sidebar-module">
        <div className="module-header">{icon} {title}</div>
        {children}
    </div>
);
