const ctx = require.context(__dirname, true, /\.template\.html$/);

ctx.keys().forEach(ctx);
