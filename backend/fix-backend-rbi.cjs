const fs = require('fs');

let seed = fs.readFileSync('prisma/seed.ts', 'utf8');
seed = seed.replace(/name: 'RBI'/g, "name: 'Kepeg'");
seed = seed.replace(/deptRBI/g, "deptKepeg");
fs.writeFileSync('prisma/seed.ts', seed);

let dash = fs.readFileSync('src/modules/dashboard/dashboard.controller.ts', 'utf8');
dash = dash.replace(/'RBI'/g, "'Kepeg'");
fs.writeFileSync('src/modules/dashboard/dashboard.controller.ts', dash);
