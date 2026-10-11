import React from 'react';
import { createRoot } from 'react-dom/client';
import Voyage from '../js/Pages/Voyage';
import Docs from '../js/Pages/Docs';
import '../css/app.css';

const parameters = new URLSearchParams(window.location.search);
const section = parameters.get('docs');
const sections = ['getting-started', 'modules', 'slipstream-kits'];

createRoot(document.getElementById('app')).render(
    section
        ? <Docs section={sections.includes(section) ? section : 'getting-started'}
            edition={parameters.get('edition') === 'php' ? 'php' : 'js'}
            moduleName={parameters.get('name') ?? 'Ideas'} standalone />
        : <Voyage edition="js" notes={[]} standalone />,
);
