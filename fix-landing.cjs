const fs = require('fs');

let code = fs.readFileSync('src/pages/LandingTest.tsx', 'utf-8');
code = code.replace(/'\.\/process-motion'/g, "'./ProcessMotion'");
code = code.replace(/'use client';\n?/g, '');
code = code.replace(/import \{useState,useEffect\} from 'react';/, "import {useState,useEffect} from 'react';\nimport './LandingTest.css';");
fs.writeFileSync('src/pages/LandingTest.tsx', code, 'utf-8');

let code2 = fs.readFileSync('src/pages/ProcessMotion.tsx', 'utf-8');
code2 = code2.replace(/'use client';\n?/g, '');
fs.writeFileSync('src/pages/ProcessMotion.tsx', code2, 'utf-8');
